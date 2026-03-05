#!/usr/bin/env python3
"""
Script de récupération des factures impayées depuis PostgreSQL
et intégration dans Parse Server (dev.parse.markidiags.com)

Ce script implémente le workflow décrit dans workflow_impayes_specification.md

Peut être exécuté en ligne de commande ou via l'API Flask.
"""

import os
from dotenv import load_dotenv
from decimal import Decimal

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

import logging
import json
import sys
from datetime import datetime, timedelta, date
from typing import Any, Dict, List, Optional, Union

import psycopg2
import requests


# Configuration du logging
logging.basicConfig(
    level=logging.INFO,  # Remis à INFO
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("populate_impayes.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()

# Variable globale pour stocker le workflow en cours (pour l'API)
_current_workflow = None


def json_serializer(obj):
    """Convertir les objets non sérialisables en JSON"""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, date):
        return obj.isoformat()
    elif isinstance(obj, str) and obj.count('-') >= 2:  # Vérifier si c'est une date en string
        try:
            # Essayer de parser les dates au format YYYY-MM-DD HH:MM:SS
            if len(obj) > 10:
                dt = datetime.strptime(obj, "%Y-%m-%d %H:%M:%S")
                return dt.isoformat()
            else:
                dt = datetime.strptime(obj, "%Y-%m-%d").date()
                return dt.isoformat()
        except ValueError:
            pass  # Si ce n'est pas une date valide, garder la string
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


def generate_invoice_url(impaye_data: Dict[str, Any]) -> str:
    """Générer l'URL de la facture selon la formule spécifiée"""
    try:
        # Extraire les champs nécessaires
        datepiece = impaye_data.get('datepiece')
        refpiece = impaye_data.get('refpiece', '')
        
        if not datepiece or not refpiece:
            logger.warning(f"Champs manquants pour générer l'URL: datepiece={datepiece}, refpiece={refpiece}")
            return ""
        
        # Parser la date
        if isinstance(datepiece, str):
            if len(datepiece) > 10:
                dt = datetime.strptime(datepiece, "%Y-%m-%d %H:%M:%S")
            else:
                dt = datetime.strptime(datepiece, "%Y-%m-%d")
        elif isinstance(datepiece, datetime):
            dt = datepiece
        elif isinstance(datepiece, dict) and '__type' in datepiece and datepiece.get('__type') == 'Date':
            # Cas des dates venant de Parse
            date_str = datepiece.get('iso', '')
            if date_str:
                # Parser la date ISO (ex: "2026-01-21T00:00:00.000Z")
                date_str = date_str.replace('Z', '+00:00')  # Gérer le timezone
                dt = datetime.fromisoformat(date_str.replace('T', ' ').split('.')[0])
            else:
                logger.warning(f"Date ISO vide: {datepiece}")
                return ""
        else:
            logger.warning(f"Format de date non supporté: {type(datepiece)}")
            return ""
        
        # Extraire l'année
        year = dt.strftime("%Y")
        
        # Extraire le mois en français et le nettoyer
        month_names = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 
                      'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre']
        month_name = month_names[dt.month - 1]
        
        # Nettoyer le mois (remove accents, lowercase)
        import unicodedata
        month_clean = unicodedata.normalize('NFD', month_name)
        month_clean = ''.join(c for c in month_clean if unicodedata.category(c) != 'Mn')
        month_clean = month_clean.lower()
        
        # Nettoyer la référence
        ref_clean = refpiece.replace(" ", "_")
        
        # Construire l'URL
        invoice_url = f"/ADN/Reporting/Gco/Piece/{year}/{month_clean}/{ref_clean}/standard/{refpiece} (GCO PI FA).pdf"
        
        return invoice_url
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération de l'URL: {e}")
        return ""


class PostgreSQLConnector:
    """Classe pour gérer la connexion à PostgreSQL"""

    def __init__(self):
        self.connection = None
        self.cursor = None

    def connect(self):
        """Établir la connexion à la base de données PostgreSQL"""
        try:
            self.connection = psycopg2.connect(
                host=os.getenv("DB_HOST"),
                database=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                port=os.getenv("DB_PORT"),
            )
            self.cursor = self.connection.cursor()
            logger.info("Connexion à PostgreSQL établie avec succès")
            return True
        except Exception as e:
            logger.error(f"Erreur de connexion à PostgreSQL: {e}")
            return False

    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Exécuter une requête SQL et retourner les résultats"""
        try:
            if params:
                self.cursor.execute(query, params)
            else:
                self.cursor.execute(query)

            # Récupérer les noms des colonnes
            columns = [desc[0] for desc in self.cursor.description]

            # Récupérer les résultats
            results = self.cursor.fetchall()

            # Convertir en liste de dictionnaires
            return [dict(zip(columns, row)) for row in results]
        except Exception as e:
            logger.error(f"Erreur lors de l'exécution de la requête: {e}")
            return []

    def close(self):
        """Fermer la connexion à la base de données"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
            logger.info("Connexion à PostgreSQL fermée")


class ParseServerConnector:
    """Classe pour gérer la connexion à Parse Server"""

    def __init__(self):
        self.base_url = os.getenv("PARSE_SERVER_URL")
        self.app_id = os.getenv("PARSE_APP_ID")
        self.master_key = os.getenv("PARSE_MASTER_KEY")
        self.headers = {
            "X-Parse-Application-Id": self.app_id,
            "X-Parse-Master-Key": self.master_key,
            "Content-Type": "application/json",
        }

    def get_existing_impayes(self) -> List[Dict[str, Any]]:
        """Récupérer les entrées existantes dans la classe Impayes"""
        try:
            url = f"{self.base_url}/classes/Impayes"
            params = {"limit": 999999}

            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()

            data = response.json()
            return data.get("results", [])
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des impayés existants: {e}")
            return []

    def get_existing_contact(self, contact_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Récupérer un contact existant ou None"""
        try:
            # Construire la requête de recherche
            search_criteria = {
                "nom": contact_data.get("nom"),
                "typePersonne": contact_data.get("typePersonne")
            }
            
            # Si c'est une personne physique, ajouter le prénom
            if contact_data.get("typePersonne") == 'P':
                search_criteria["prenom"] = contact_data.get("prenom")
            
            # Si disponible, ajouter l'email pour une recherche plus précise
            if contact_data.get("email"):
                search_criteria["email"] = contact_data.get("email")
            
            url = f"{self.base_url}/classes/Contacts"
            params = {
                "where": json.dumps(search_criteria),
                "limit": 1
            }

            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()

            data = response.json()
            results = data.get("results", [])
            return results[0] if results else None
        except Exception as e:
            logger.error(f"Erreur lors de la recherche du contact: {e}")
            return None

    def create_contact(self, contact_data: Dict[str, Any]) -> Optional[str]:
        """Créer un nouveau contact et retourner son objectId"""
        try:
            url = f"{self.base_url}/classes/Contacts"
            
            # Préparer les données du contact
            contact_to_create = {
                "nom": contact_data.get("nom"),
                "typePersonne": contact_data.get("typePersonne"),
                "email": contact_data.get("email"),
                "telephoneMobile": contact_data.get("telephoneMobile"),
                "telephoneFixe": contact_data.get("telephoneFixe"),
                "adresse": contact_data.get("adresse"),
                "codePostal": contact_data.get("codePostal"),
                "ville": contact_data.get("ville")
            }
            
            # Ajouter le prénom si c'est une personne physique
            if contact_data.get("typePersonne") == 'P':
                contact_to_create["prenom"] = contact_data.get("prenom")
            
            logger.debug(f"Création du contact: {json.dumps(contact_to_create, indent=2)}")
            
            response = requests.post(url, headers=self.headers, json=contact_to_create)
            response.raise_for_status()
            
            result = response.json()
            return result.get("objectId")
        except Exception as e:
            logger.error(f"Erreur lors de la création du contact: {e}")
            return None

    def create_impaye(self, data: Dict[str, Any]) -> bool:
        """Créer une nouvelle entrée dans la classe Impayes"""
        try:
            url = f"{self.base_url}/classes/Impayes"
            logger.debug(f"Envoi des données à Parse: {json.dumps(data, default=json_serializer, indent=2)}")
            
            response = requests.post(url, headers=self.headers, json=data)
            
            if response.status_code != 201:
                logger.error(f"Erreur HTTP {response.status_code}: {response.text}")
                logger.error(f"Données envoyées: {json.dumps(data, default=json_serializer, indent=2)}")
                return False
                
            response.raise_for_status()
            logger.debug(f"Réponse Parse: {response.json()}")
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la création de l'impayé: {e}")
            return False

    def update_impaye_url(self, impaye_id: str, invoice_url: str) -> bool:
        """Mettre à jour l'URL de la facture pour un impayé existant"""
        try:
            url = f"{self.base_url}/classes/Impayes/{impaye_id}"
            data = {"invoice_url": invoice_url}
            
            response = requests.put(url, headers=self.headers, json=data)
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour de l'URL pour {impaye_id}: {e}")
            return False

    def batch_create_impayes(self, data_list: List[Dict[str, Any]]) -> int:
        """Créer plusieurs entrées dans la classe Impayes en une seule requête"""
        try:
            url = f"{self.base_url}/batch"
            
            # Préparer les données en les sérialisant correctement
            serialized_data_list = []
            for data in data_list:
                serialized_data = {}
                for key, value in data.items():
                    try:
                        # Utiliser json.dumps puis json.loads pour convertir les objets non sérialisables
                        serialized_value = json.loads(json.dumps(value, default=json_serializer))
                        serialized_data[key] = serialized_value
                    except (TypeError, ValueError) as e:
                        logger.warning(f"Impossible de sérialiser la valeur pour la clé {key}: {e}")
                        serialized_data[key] = str(value) if value is not None else None
                serialized_data_list.append(serialized_data)
            
            requests_data = {
                "requests": [
                    {"method": "POST", "path": "/classes/Impayes", "body": data}
                    for data in serialized_data_list
                ]
            }

            response = requests.post(url, headers=self.headers, json=requests_data)
            response.raise_for_status()

            results = response.json()
            success_count = sum(1 for result in results if result.get("success"))
            logger.info(
                f"Création en batch terminée: {success_count}/{len(data_list)} réussis"
            )
            return success_count
        except Exception as e:
            logger.error(f"Erreur lors de la création en batch des impayés: {e}")
            return 0


class ImpayesFilter:
    """Classe pour appliquer les filtres aux factures impayées"""

    @staticmethod
    def apply_filters(data: Dict[str, Any], filters: Dict[str, Any]) -> bool:
        """Appliquer les filtres à un enregistrement"""
        if not filters:
            return True

        # Filtre par payeur_type
        if (
            "payeur_type" in filters
            and data.get("payeur_type") != filters["payeur_type"]
        ):
            return False

        # Filtre par idDossier
        if "idDossier" in filters and str(data.get("idDossier")) != str(
            filters["idDossier"]
        ):
            return False

        # Filtre par idStatut
        if "idStatut" in filters and str(data.get("idStatut")) != str(
            filters["idStatut"]
        ):
            return False

        # Filtre par contactPlace
        if (
            "contactPlace" in filters
            and data.get("contactPlace") != filters["contactPlace"]
        ):
            return False

        # Filtre par reference
        if "reference" in filters and data.get("reference") != filters["reference"]:
            return False

        # Filtre par referenceExterne
        if (
            "referenceExterne" in filters
            and data.get("referenceExterne") != filters["referenceExterne"]
        ):
            return False

        # Filtre par numero
        if "numero" in filters and data.get("numero") != filters["numero"]:
            return False

        # Filtre par codePostal
        if "codePostal" in filters and data.get("codePostal") != filters["codePostal"]:
            return False

        # Filtre par ville
        if "ville" in filters and data.get("ville") != filters["ville"]:
            return False

        # Filtre par acquerur_nom
        if (
            "acquerur_nom" in filters
            and data.get("acquerur_nom") != filters["acquerur_nom"]
        ):
            return False

        # Filtre par globalSearch (recherche dans plusieurs champs)
        if "globalSearch" in filters:
            search_term = str(filters["globalSearch"]).lower()
            fields_to_search = [
                data.get("reference"),
                data.get("referenceExterne"),
                data.get("numero"),
                data.get("adresse"),
                data.get("codePostal"),
                data.get("ville"),
                data.get("acquerur_nom"),
                data.get("acquerur_email"),
                data.get("apporteur_affaire_nom"),
                data.get("payeur_nom"),
                data.get("proprietaire_nom"),
                data.get("commentaire_dossier"),
            ]

            matches_search = any(
                field and search_term in str(field).lower()
                for field in fields_to_search
            )

            if not matches_search:
                return False

        return True


class ImpayesWorkflow:
    """Classe principale pour exécuter le workflow de récupération des factures impayées"""

    def __init__(
        self,
        filters: Optional[Dict[str, Any]] = None,
        global_search: Optional[str] = None,
    ):
        self.filters = filters or {}
        if global_search:
            self.filters["globalSearch"] = global_search

        self.postgres = PostgreSQLConnector()
        self.parse_server = ParseServerConnector()

    def run(self) -> bool:
        """Exécuter le workflow complet"""
        logger.info("Début du workflow de récupération des factures impayées")

        try:
            # Étape 1: Connexion à PostgreSQL
            if not self.postgres.connect():
                return False

            # Étape 2: Exécution de la requête SQL complexe
            impayes_data = self._fetch_impayes_from_postgres()
            if not impayes_data:
                logger.info("Aucune facture impayée trouvée")
                return True

            logger.info(
                f"{len(impayes_data)} factures impayées récupérées depuis PostgreSQL"
            )

            # Étape 3: Application des filtres
            filtered_data = self._apply_filters(impayes_data)
            logger.info(f"{len(filtered_data)} factures après application des filtres")

            # Étape 4: Récupération des entrées existantes depuis Parse
            existing_impayes = self.parse_server.get_existing_impayes()
            logger.info(
                f"{len(existing_impayes)} impayés existants récupérés depuis Parse"
            )

            # Étape 5: Comparaison des données
            new_impayes = self._find_new_impayes(filtered_data, existing_impayes)
            logger.info(f"{len(new_impayes)} nouvelles factures à ajouter")

            # Étape 5b: Mettre à jour les URLs des factures existantes
            if existing_impayes:
                url_update_count = 0
                for existing_impaye in existing_impayes:
                    # Générer l'URL pour la facture existante
                    invoice_url = generate_invoice_url(existing_impaye)
                    if invoice_url and not existing_impaye.get('invoice_url'):
                        impaye_id = existing_impaye.get('objectId')
                        if impaye_id and self.parse_server.update_impaye_url(impaye_id, invoice_url):
                            url_update_count += 1
                
                logger.info(f"{url_update_count} URLs de factures mises à jour")

            # Étape 6: Envoi des données à Parse
            if new_impayes:
                success_count = 0
                
                for impaye_data in new_impayes:
                    # Sérialiser les données avant l'envoi
                    serialized_data = {}
                    
                    # Générer l'URL de la facture
                    invoice_url = generate_invoice_url(impaye_data)
                    if invoice_url:
                        serialized_data['invoice_url'] = invoice_url
                    
                    for key, value in impaye_data.items():
                        try:
                            # Traitement spécial pour les champs de date
                            if key.startswith('date') or key in ['createdat', 'updatedat']:
                                if isinstance(value, str) and value.count('-') >= 2:
                                    # Convertir les dates en timestamp Unix pour Parse
                                    try:
                                        if len(value) > 10:
                                            dt = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
                                        else:
                                            dt = datetime.strptime(value, "%Y-%m-%d")
                                        serialized_data[key] = {"__type": "Date", "iso": dt.isoformat()}
                                    except ValueError:
                                        serialized_data[key] = value
                                elif isinstance(value, (datetime, date)):
                                    # Convertir directement les objets datetime/date
                                    serialized_data[key] = {"__type": "Date", "iso": value.isoformat()}
                                else:
                                    serialized_value = json.loads(json.dumps(value, default=json_serializer))
                                    serialized_data[key] = serialized_value
                            else:
                                serialized_value = json.loads(json.dumps(value, default=json_serializer))
                                serialized_data[key] = serialized_value
                        except (TypeError, ValueError) as e:
                            logger.warning(f"Impossible de sérialiser la valeur pour la clé {key}: {e}")
                            serialized_data[key] = str(value) if value is not None else None
                    
                    # Créer ou récupérer les contacts pour payeur et apporteur
                    payeur_contact_id = self._create_or_get_contact(impaye_data, "payeur")
                    apporteur_contact_id = self._create_or_get_contact(impaye_data, "apporteur")
                    
                    # Ajouter les pointeurs aux données sérialisées
                    if payeur_contact_id:
                        serialized_data['payeur_pointer'] = {
                            "__type": "Pointer",
                            "className": "Contacts",
                            "objectId": payeur_contact_id
                        }
                        
                        # Gérer les relations pour les contacts de type morale
                        self._handle_morale_relations(impaye_data, payeur_contact_id)
                    
                    if apporteur_contact_id:
                        serialized_data['apporteur_pointer'] = {
                            "__type": "Pointer",
                            "className": "Contacts",
                            "objectId": apporteur_contact_id
                        }
                    
                    if self.parse_server.create_impaye(serialized_data):
                        success_count += 1
                
                logger.info(
                    f"{success_count} factures impayées ajoutées avec succès à Parse"
                )
            else:
                logger.info("Aucune nouvelle facture à ajouter")

            return True

        except Exception as e:
            logger.error(f"Erreur lors de l'exécution du workflow: {e}")
            return False
        finally:
            self.postgres.close()
            logger.info("Workflow terminé")

    def _fetch_impayes_from_postgres(self) -> List[Dict[str, Any]]:
        """Récupérer les factures impayées depuis PostgreSQL"""
        query = """
        SELECT
          -- Champs Pièce
          p."nfacture" AS "nfacture",
          TO_CHAR(p."datepiece", 'YYYY-MM-DD HH24:MI:SS') AS "datepiece",
          p."totalhtnet" AS "totalhtnet",
          p."totalttcnet" AS "totalttcnet",
          p."resteapayer" AS "resteapayer",
          p."facturesoldee" AS "facturesoldee",
          p."commentaire" AS "commentaire_piece",
          p."refpiece" AS "refpiece",

          -- Champs Dossier
          d."idDossier" AS "idDossier",
          d."idStatut" AS "idStatut",
          s."intitule" AS "statut_intitule",
          d."contactPlace" AS "contactPlace",
          d."reference" AS "reference",
          d."referenceExterne" AS "referenceExterne",
          d."numero" AS "numero",
          d."idEmployeIntervention" AS "idEmployeIntervention",
          d."commentaire" AS "commentaire_dossier",
          d."adresse" AS "adresse",
          d."cptAdresse" AS "cptAdresse",
          d."codePostal" AS "codePostal",
          d."ville" AS "ville",
          d."numeroLot" AS "numeroLot",
          d."etage" AS "etage",
          d."entree" AS "entree",
          d."escalier" AS "escalier",
          d."porte" AS "porte",
          d."numVoie" AS "numVoie",
          d."cptNumVoie" AS "cptNumVoie",
          d."typeVoie" AS "typeVoie",
          d."dateDebutMission" AS "dateDebutMission",
          COALESCE(e."prenom" || ' ' || e."nom", '') AS "employe_intervention",

          -- Acquéreur
          MAX(CASE WHEN role."intitule" = 'Acquéreur' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "acquerur_nom",
          MAX(CASE WHEN role."intitule" = 'Acquéreur' THEN iloc."email" END) AS "acquerur_email",
          MAX(CASE WHEN role."intitule" = 'Acquéreur' THEN iloc."telephoneMobile" END) AS "acquerur_telephone",

          -- Apporteur d'affaire
          MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN
            CASE
              WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
              ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
            END
          END) AS "apporteur_affaire_nom",
          MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN iloc."email" END) AS "apporteur_affaire_email",
          MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN iloc."telephoneMobile" END) AS "apporteur_affaire_telephone",
          MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN iloc."typePersonne" END) AS "apporteur_affaire_typePersonne",
          MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN
            CASE
              WHEN ilocContact."typePersonne" = 'M' THEN ilocContact."nom"
              ELSE COALESCE(ilocContact."nom" || ' ' || ilocContact."prenom", ilocContact."nom", ilocContact."prenom")
            END
          END) AS "apporteur_affaire_contact_nom",
          MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN ilocContact."email" END) AS "apporteur_affaire_contact_email",

          -- Donneur d'ordre
          MAX(CASE WHEN role."intitule" = 'Donneur d''ordre' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "donneur_ordre_nom",
          MAX(CASE WHEN role."intitule" = 'Donneur d''ordre' THEN iloc."email" END) AS "donneur_ordre_email",
          MAX(CASE WHEN role."intitule" = 'Donneur d''ordre' THEN iloc."telephoneMobile" END) AS "donneur_ordre_telephone",

          -- Locataire entrant
          MAX(CASE WHEN role."intitule" = 'Locataire entrant' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "locataire_entrant_nom",
          MAX(CASE WHEN role."intitule" = 'Locataire entrant' THEN iloc."email" END) AS "locataire_entrant_email",
          MAX(CASE WHEN role."intitule" = 'Locataire entrant' THEN iloc."telephoneMobile" END) AS "locataire_entrant_telephone",

          -- Locataire sortant
          MAX(CASE WHEN role."intitule" = 'Locataire sortant' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "locataire_sortant_nom",
          MAX(CASE WHEN role."intitule" = 'Locataire sortant' THEN iloc."email" END) AS "locataire_sortant_email",
          MAX(CASE WHEN role."intitule" = 'Locataire sortant' THEN iloc."telephoneMobile" END) AS "locataire_sortant_telephone",

          -- Notaire
          MAX(CASE WHEN role."intitule" = 'Notaire' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "notaire_nom",
          MAX(CASE WHEN role."intitule" = 'Notaire' THEN iloc."email" END) AS "notaire_email",
          MAX(CASE WHEN role."intitule" = 'Notaire' THEN iloc."telephoneMobile" END) AS "notaire_telephone",

          -- Payeur
          MAX(CASE WHEN role."intitule" = 'Payeur' THEN
            CASE
              WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
              ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
            END
          END) AS "payeur_nom",
          MAX(CASE WHEN role."intitule" = 'Payeur' THEN iloc."email" END) AS "payeur_email",
          MAX(CASE WHEN role."intitule" = 'Payeur' THEN iloc."telephoneMobile" END) AS "payeur_telephone",
          MAX(CASE WHEN role."intitule" = 'Payeur' THEN iloc."typePersonne" END) AS "payeur_typePersonne",
          MAX(CASE WHEN role."intitule" = 'Payeur' THEN
            CASE
              WHEN ilocContact."typePersonne" = 'M' THEN ilocContact."nom"
              ELSE COALESCE(ilocContact."nom" || ' ' || ilocContact."prenom", ilocContact."nom", ilocContact."prenom")
            END
          END) AS "payeur_contact_nom",
          MAX(CASE WHEN role."intitule" = 'Payeur' THEN ilocContact."email" END) AS "payeur_contact_email",

          -- Propriétaire
          MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN
            CASE
              WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
              ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
            END
          END) AS "proprietaire_nom",
          MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN iloc."email" END) AS "proprietaire_email",
          MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN iloc."telephoneMobile" END) AS "proprietaire_telephone",
          MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN iloc."typePersonne" END) AS "proprietaire_typePersonne",
          MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN
            CASE
              WHEN ilocContact."typePersonne" = 'M' THEN ilocContact."nom"
              ELSE COALESCE(ilocContact."nom" || ' ' || ilocContact."prenom", ilocContact."nom", ilocContact."prenom")
            END
          END) AS "proprietaire_contact_nom",
          MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN ilocContact."email" END) AS "proprietaire_contact_email",

          -- Syndic
          MAX(CASE WHEN role."intitule" = 'Syndic' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "syndic_nom",
          MAX(CASE WHEN role."intitule" = 'Syndic' THEN iloc."email" END) AS "syndic_email",
          MAX(CASE WHEN role."intitule" = 'Syndic' THEN iloc."telephoneMobile" END) AS "syndic_telephone",

          -- Calcul du type de payeur
          CASE
            WHEN MAX(CASE WHEN role."intitule" = 'Payeur' THEN
              CASE
                WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
                ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
              END
            END) = MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN
              CASE
                WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
                ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
              END
            END)
            THEN 'Propriétaire'
            WHEN MAX(CASE WHEN role."intitule" = 'Payeur' THEN
              CASE
                WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
                ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
              END
            END) = MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN
              CASE
                WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
                ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
              END
            END)
            THEN 'Apporteur d''affaire'
            ELSE 'Autre'
          END AS "payeur_type"

        FROM
          "public"."(GCO) GcoPiece" p
        LEFT JOIN
          "public"."(GCO) GcoPieceMetier" pm ON p."idpiece" = pm."idpiece"
        LEFT JOIN
          "public"."(ADN_DIAG) Dossier" d ON pm."idmetier" = d."idDossier"
        LEFT JOIN
          "public"."(ADN_RG)Employe" e ON d."idEmployeIntervention" = e."idEmploye"
        LEFT JOIN
          "public"."(ADN_DIAG) StatutDossier" s ON d."idStatut" = s."idStatut"
        LEFT JOIN
          "public"."(ADN_DIAG) DossierInterlocuteur" di ON d."idDossier" = di."idDossier"
        LEFT JOIN
          "public"."(ADN_RG)Interlocuteur" iloc ON di."idInterlocuteur" = iloc."idInterlocuteur"
        LEFT JOIN
          "public"."(ADN_RG)Interlocuteur" ilocContact ON di."idContact" = ilocContact."idInterlocuteur"
        LEFT JOIN
          "public"."(ADN_DIAG) RoleInterlocuteurDossier" role ON di."idRole" = role."idRole"

        WHERE
          (p."nfacture" IS NOT NULL)
          AND (
            p."datepiece" >= (
              CAST(CAST((NOW() + INTERVAL '-300000 day') AS date) AS timestamptz) + INTERVAL '-7 day'
            )
          )
          AND (
            p."datepiece" < (
              CAST(CAST(NOW() AS date) AS timestamptz) + INTERVAL '-7 day'
            )
          )
          AND (p."facturesoldee" = FALSE)
          AND (p."resteapayer" > 0)
          AND (p."valide" = TRUE)
          AND EXISTS (
            SELECT 1
            FROM "public"."(ADN_DIAG) DossierInterlocuteur" di2
            LEFT JOIN "public"."(ADN_DIAG) RoleInterlocuteurDossier" role2 ON di2."idRole" = role2."idRole"
            WHERE di2."idDossier" = d."idDossier"
            AND role2."intitule" = 'Payeur'
          )

        GROUP BY
          p."nfacture",
          p."datepiece",
          p."totalhtnet",
          p."totalttcnet",
          p."resteapayer",
          p."facturesoldee",
          p."commentaire",
          p."refpiece",
          d."idDossier",
          d."idStatut",
          s."intitule",
          d."contactPlace",
          d."reference",
          d."referenceExterne",
          d."numero",
          d."idEmployeIntervention",
          d."commentaire",
          d."adresse",
          d."cptAdresse",
          d."codePostal",
          d."ville",
          d."numeroLot",
          d."etage",
          d."entree",
          d."escalier",
          d."porte",
          d."numVoie",
          d."cptNumVoie",
          d."typeVoie",
          d."dateDebutMission",
          COALESCE(e."prenom" || ' ' || e."nom", '')
        ORDER BY p."datepiece" DESC
        """

        return self.postgres.execute_query(query)

    def _apply_filters(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Appliquer les filtres aux données"""
        filtered_data = []

        for item in data:
            if ImpayesFilter.apply_filters(item, self.filters):
                # Ajouter le champ valide
                item["valide"] = True
                filtered_data.append(item)
            else:
                # Ajouter le champ valide même pour les items filtrés
                item["valide"] = False

        return filtered_data

    def _find_new_impayes(
        self, new_data: List[Dict[str, Any]], existing_data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Trouver les nouvelles factures à ajouter"""
        # Créer un ensemble des clés existantes (nfacture, idDossier)
        existing_keys = set(
            (item.get("nfacture"), item.get("idDossier")) for item in existing_data
        )

        # Filtrer les nouvelles données pour ne garder que celles qui n'existent pas
        new_impayes = []
        for item in new_data:
            key = (item.get("nfacture"), item.get("idDossier"))
            if key not in existing_keys and item.get("valide", False):
                new_impayes.append(item)

        return new_impayes

    def _create_or_get_contact(self, impaye_data: Dict[str, Any], contact_type: str) -> Optional[str]:
        """Créer ou récupérer un contact et retourner son objectId"""
        # Déterminer les champs à utiliser selon le type de contact
        if contact_type == "payeur":
            nom_field = "payeur_nom"
            email_field = "payeur_email"
            telephone_field = "payeur_telephone"
            type_personne_field = "payeur_typePersonne"
        elif contact_type == "apporteur":
            nom_field = "apporteur_affaire_nom"
            email_field = "apporteur_affaire_email"
            telephone_field = "apporteur_affaire_telephone"
            type_personne_field = "apporteur_affaire_typePersonne"
        else:
            return None
        
        # Extraire les données du contact
        nom = impaye_data.get(nom_field)
        if not nom:
            return None
        
        # Déterminer le type de personne et extraire les informations
        type_personne = impaye_data.get(type_personne_field, 'P')  # Par défaut: Particulier
        
        # Préparer les données du contact
        contact_data = {
            "nom": nom,
            "typePersonne": type_personne,
            "email": impaye_data.get(email_field),
            "telephoneMobile": impaye_data.get(telephone_field),
            # Ajouter d'autres champs si disponibles
            "adresse": impaye_data.get("adresse"),
            "codePostal": impaye_data.get("codePostal"),
            "ville": impaye_data.get("ville")
        }
        
        # Pour les personnes physiques, extraire le prénom si présent dans le nom
        if type_personne == 'P' and ' ' in nom:
            parts = nom.rsplit(' ', 1)
            if len(parts) == 2:
                contact_data["prenom"] = parts[0]
                contact_data["nom"] = parts[1]
        
        # Vérifier si le contact existe déjà
        existing_contact = self.parse_server.get_existing_contact(contact_data)
        if existing_contact:
            logger.info(f"Contact {contact_type} existant trouvé: {existing_contact.get('objectId')}")
            return existing_contact.get('objectId')
        
        # Créer un nouveau contact
        new_contact_id = self.parse_server.create_contact(contact_data)
        if new_contact_id:
            logger.info(f"Nouveau contact {contact_type} créé: {new_contact_id}")
            return new_contact_id
        else:
            logger.warning(f"Échec de la création du contact {contact_type}")
            return None

    def _handle_morale_relations(self, impaye_data: Dict[str, Any], contact_id: str) -> None:
        """Gérer les relations pour les contacts de type morale"""
        # Vérifier si le contact est de type morale (M)
        payeur_type = impaye_data.get("payeur_typePersonne")
        if payeur_type != 'M':
            return
        
        # Pour les contacts de type morale, nous devons gérer les relations
        # avec les contacts associés (personnes physiques liées à cette morale)
        
        # Récupérer les informations des contacts associés
        payeur_contact_nom = impaye_data.get("payeur_contact_nom")
        payeur_contact_email = impaye_data.get("payeur_contact_email")
        
        if payeur_contact_nom:
            # Créer ou récupérer le contact associé
            contact_associe_data = {
                "nom": payeur_contact_nom,
                "typePersonne": "P",  # Personne physique
                "email": payeur_contact_email,
                "telephoneMobile": impaye_data.get("payeur_telephone"),
                "adresse": impaye_data.get("adresse"),
                "codePostal": impaye_data.get("codePostal"),
                "ville": impaye_data.get("ville")
            }
            
            # Extraire le prénom si présent
            if ' ' in payeur_contact_nom:
                parts = payeur_contact_nom.rsplit(' ', 1)
                if len(parts) == 2:
                    contact_associe_data["prenom"] = parts[0]
                    contact_associe_data["nom"] = parts[1]
            
            # Vérifier si le contact associé existe déjà
            existing_associe = self.parse_server.get_existing_contact(contact_associe_data)
            if not existing_associe:
                # Créer le contact associé
                new_associe_id = self.parse_server.create_contact(contact_associe_data)
                if new_associe_id:
                    logger.info(f"Nouveau contact associé créé pour la morale: {new_associe_id}")
                    
                    # Mettre à jour le contact morale pour ajouter la relation
                    self._update_contact_with_relation(contact_id, new_associe_id, "contact_associe")

    def _update_contact_with_relation(self, contact_id: str, related_contact_id: str, relation_type: str) -> bool:
        """Mettre à jour un contact pour ajouter une relation"""
        try:
            url = f"{self.parse_server.base_url}/classes/Contacts/{contact_id}"
            
            # Préparer les données de mise à jour
            update_data = {
                relation_type: {
                    "__type": "Pointer",
                    "className": "Contacts",
                    "objectId": related_contact_id
                }
            }
            
            response = requests.put(url, headers=self.parse_server.headers, json=update_data)
            response.raise_for_status()
            
            logger.info(f"Relation {relation_type} ajoutée au contact {contact_id}")
            return True
        except Exception as e:
            logger.error(f"Erreur lors de l'ajout de la relation {relation_type}: {e}")
            return False


def execute(params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Fonction d'exécution pour l'API Flask

    Args:
        params (dict): Paramètres passés via l'API
                      Exemple: {"filters": {...}, "global_search": "terme"}

    Returns:
        dict: Résultat de l'exécution au format JSON
    """
    global _current_workflow

    result = {
        "status": "success",
        "message": "Workflow de récupération des factures impayées",
        "data": {},
        "timestamp": datetime.now().isoformat(),
    }

    try:
        # Extraire les paramètres
        filters = {}
        global_search = None
        debug = False

        if params:
            if isinstance(params, str):
                # Cas où les paramètres sont passés comme une chaîne JSON
                try:
                    params = json.loads(params)
                except json.JSONDecodeError:
                    params = {}

            filters = params.get("filters", {})
            global_search = params.get("global_search")
            debug = params.get("debug", False)

        if debug:
            logger.setLevel(logging.DEBUG)

        logger.info(f"Exécution du workflow via API avec paramètres: {params}")

        # Créer et exécuter le workflow
        _current_workflow = ImpayesWorkflow(
            filters=filters, global_search=global_search
        )
        success = _current_workflow.run()

        if success:
            result["message"] = "Workflow exécuté avec succès"
            result["data"] = {
                "status": "completed",
                "filters_applied": filters,
                "global_search_used": global_search is not None,
            }
        else:
            result["status"] = "error"
            result["message"] = "Le workflow a échoué"

    except Exception as e:
        result["status"] = "error"
        result["message"] = f"Erreur lors de l'exécution: {str(e)}"
        result["data"] = {"error_details": str(e)}
        logger.error(f"Erreur dans execute(): {e}")

    return result


def main():
    """Fonction principale pour exécuter le script"""
    # Récupérer les arguments de la ligne de commande
    import argparse

    parser = argparse.ArgumentParser(description="Récupération des factures impayées")
    parser.add_argument(
        "--filters", type=str, help="Fichier JSON contenant les filtres"
    )
    parser.add_argument("--global-search", type=str, help="Terme de recherche global")
    parser.add_argument(
        "--debug", action="store_true", help="Mode debug avec plus de logs"
    )

    args = parser.parse_args()

    if args.debug:
        logger.setLevel(logging.DEBUG)

    # Créer et exécuter le workflow
    workflow = ImpayesWorkflow(filters={}, global_search=args.global_search)
    success = workflow.run()

    if not success:
        logger.error("Le workflow a échoué")
        sys.exit(1)

    logger.info("Workflow terminé avec succès")
    sys.exit(0)


if __name__ == "__main__":
    main()

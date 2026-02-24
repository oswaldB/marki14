#!/usr/bin/env python3
"""
Script pour générer automatiquement les relances pour les impayés
qui ont une séquence mais pas encore de relances créées.

Ce script doit être exécuté régulièrement via le scheduler pour créer
des relances pour les nouveaux impayés qui ont été associés à des séquences automatiques.
"""

import os
from dotenv import load_dotenv
import logging
import json
import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import requests

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("peupler_relances.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()


class ParseRelanceConnector:
    """Classe pour gérer la connexion à Parse Server pour les relances"""

    def __init__(self):
        self.base_url = os.getenv("PARSE_SERVER_URL")
        self.app_id = os.getenv("PARSE_APP_ID")
        self.master_key = os.getenv("PARSE_MASTER_KEY")
        self.headers = {
            "X-Parse-Application-Id": self.app_id,
            "X-Parse-Master-Key": self.master_key,
            "Content-Type": "application/json",
        }
        self.variable_pattern = re.compile(r'\[\[(.*?)\]\]')

    def get_impayes_with_sequence(self) -> List[Dict[str, Any]]:
        """Récupérer les impayés qui ont une séquence mais pas de relances"""
        try:
            url = f"{self.base_url}/classes/Impayes"
            params = {
                "where": json.dumps({
                    "sequence": {"$exists": True},
                    "sequenceIsAutomatic": True
                }),
                "include": "sequence",
                "limit": 999999
            }

            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()

            return response.json().get("results", [])
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des impayés: {e}")
            return []

    def get_sequence_actions(self, sequence_id: str) -> List[Dict[str, Any]]:
        """Récupérer les actions d'une séquence"""
        try:
            # Les actions sont stockées directement dans l'objet sequence
            url = f"{self.base_url}/classes/Sequences/{sequence_id}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()

            sequence_data = response.json()
            return sequence_data.get("actions", [])
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des actions: {e}")
            return []

    def get_existing_relances(self, impaye_id: str) -> List[Dict[str, Any]]:
        """Récupérer les relances existantes pour un impayé"""
        try:
            url = f"{self.base_url}/classes/Relances"
            params = {
                "where": json.dumps({
                    "impaye": {
                        "__type": "Pointer",
                        "className": "Impayes",
                        "objectId": impaye_id
                    }
                }),
                "limit": 999999
            }

            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()

            return response.json().get("results", [])
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des relances existantes: {e}")
            return []

    def create_relance(self, relance_data: Dict[str, Any]) -> bool:
        """Créer une nouvelle relance"""
        try:
            url = f"{self.base_url}/classes/Relances"
            response = requests.post(url, headers=self.headers, json=relance_data)
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la création de la relance: {e}")
            logger.error(f"Données: {json.dumps(relance_data, indent=2)}")
            return False

    def replace_variables(self, template: str, variables: Dict[str, Any]) -> str:
        """Remplacer les variables [[var]] par leurs valeurs"""
        if not template:
            return ""

        def replacer(match):
            var_name = match.group(1)
            # Gérer les variables imbriquées (ex: client.nom)
            keys = var_name.split('.')
            value = variables
            for key in keys:
                if isinstance(value, dict):
                    value = value.get(key, None)
                else:
                    value = getattr(value, key, None)
                if value is None:
                    return f'[[{var_name}]]'
            return str(value)

        return self.variable_pattern.sub(replacer, template)

    def get_impaye_variables(self, impaye: Dict[str, Any]) -> Dict[str, Any]:
        """Extraire toutes les variables disponibles d'un impayé"""
        variables = {}
        for key, value in impaye.items():
            # Ignorer les champs système et les objets complexes
            if key.startswith('_') or key in ['createdAt', 'updatedAt', 'ACL', 'sequence']:
                continue
            if value is not None:
                variables[key] = value
        return variables

    def calculate_due_date(self, delai: int, unite: str = 'days') -> str:
        """Calculer la date d'échéance"""
        if unite == 'days':
            return (datetime.now() + timedelta(days=delai)).isoformat()
        elif unite == 'weeks':
            return (datetime.now() + timedelta(weeks=delai)).isoformat()
        else:
            return (datetime.now() + timedelta(days=delai)).isoformat()

    def get_destinataire(self, impaye: Dict[str, Any], action_type: str) -> str:
        """Déterminer le destinataire en fonction du type d'action"""
        if action_type == 'email':
            return impaye.get('payeur_email') or impaye.get('acquerur_email') or ''
        elif action_type == 'sms':
            return impaye.get('payeur_telephone') or impaye.get('acquerur_telephone') or ''
        else:
            # Pour les lettres, utiliser l'adresse
            adresse = []
            if impaye.get('adresse'):
                adresse.append(impaye['adresse'])
            if impaye.get('codePostal') and impaye.get('ville'):
                adresse.append(f"{impaye['codePostal']} {impaye['ville']}")
            return ' '.join(adresse) if adresse else ''


def peupler_relances() -> bool:
    """Fonction principale pour générer les relances"""
    logger.info("Début de la génération des relances")

    connector = ParseRelanceConnector()

    try:
        # 1. Récupérer les impayés avec séquence automatique
        impayes = connector.get_impayes_with_sequence()
        logger.info(f"Trouvé {len(impayes)} impayés avec séquence automatique")

        total_relances = 0

        for impaye in impayes:
            impaye_id = impaye.get('objectId')
            if not impaye_id:
                logger.warning("Impayé sans objectId, ignoré")
                continue

            # 2. Vérifier si des relances existent déjà
            existing_relances = connector.get_existing_relances(impaye_id)
            if existing_relances:
                logger.debug(f"Impayé {impaye_id} a déjà {len(existing_relances)} relances")
                continue

            # 3. Récupérer la séquence et ses actions
            sequence = impaye.get('sequence')
            if not sequence:
                logger.warning(f"Impayé {impaye_id} n'a pas de séquence valide")
                continue

            sequence_id = sequence.get('objectId')
            actions = connector.get_sequence_actions(sequence_id)
            if not actions:
                logger.debug(f"Séquence {sequence_id} n'a pas d'actions")
                continue

            # 4. Extraire les variables de l'impayé
            variables = connector.get_impaye_variables(impaye)

            # 5. Créer une relance pour chaque action
            for action in actions:
                if not action.get('isActive', True):
                    continue

                # Remplacer les variables dans le template
                sujet = connector.replace_variables(action.get('subject', ''), variables)
                contenu = connector.replace_variables(action.get('message', ''), variables)

                # Déterminer le destinataire
                destinataire = connector.get_destinataire(impaye, action.get('type', 'email'))

                # Créer la relance
                relance_data = {
                    "impaye": {
                        "__type": "Pointer",
                        "className": "Impayes",
                        "objectId": impaye_id
                    },
                    "sequence": {
                        "__type": "Pointer",
                        "className": "Sequences",
                        "objectId": sequence_id
                    },
                    "actionId": action.get('id', ''),
                    "type": action.get('type', 'email'),
                    "statut": "pending",
                    "sujet": sujet,
                    "contenu": contenu,
                    "destinataire": destinataire,
                    "dateEcheance": connector.calculate_due_date(action.get('delai', 1), action.get('unite', 'days')),
                    "essais": 0,
                    "variablesUtilisees": variables
                }

                if connector.create_relance(relance_data):
                    total_relances += 1
                    logger.info(f"Relance créée pour impayé {impaye_id}, action {action.get('id')}")
                else:
                    logger.error(f"Échec de la création de relance pour impayé {impaye_id}")

        logger.info(f"Génération terminée: {total_relances} relances créées")
        return True

    except Exception as e:
        logger.error(f"Erreur lors de la génération des relances: {e}")
        return False


def execute(params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Fonction d'exécution pour l'API Flask"""
    result = {
        "status": "success",
        "message": "Génération des relances",
        "timestamp": datetime.now().isoformat(),
    }

    try:
        success = peupler_relances()

        if success:
            result["message"] = "Relances générées avec succès"
        else:
            result["status"] = "error"
            result["message"] = "Échec de la génération des relances"

    except Exception as e:
        result["status"] = "error"
        result["message"] = f"Erreur: {str(e)}"

    return result


if __name__ == "__main__":
    result = execute()
    print(json.dumps(result, indent=2))
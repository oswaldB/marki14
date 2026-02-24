#!/usr/bin/env python3
"""
Script pour créer la classe Relances dans Parse Server

Ce script doit être exécuté une seule fois pour initialiser la structure
de la classe Relances qui sera utilisée pour stocker les relances générées.
"""

import os
from dotenv import load_dotenv
import requests
import json
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("create_relances_class.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()


def create_relances_class():
    """Créer la classe Relances avec son schéma"""
    base_url = os.getenv("PARSE_SERVER_URL")
    headers = {
        "X-Parse-Application-Id": os.getenv("PARSE_APP_ID"),
        "X-Parse-Master-Key": os.getenv("PARSE_MASTER_KEY"),
        "Content-Type": "application/json",
    }

    # Définition du schéma de la classe Relances
    schema = {
        "className": "Relances",
        "fields": {
            "impaye": {"type": "Pointer", "targetClass": "Impayes"},
            "sequence": {"type": "Pointer", "targetClass": "Sequences"},
            "actionId": {"type": "String"},
            "type": {"type": "String"},
            "statut": {"type": "String"},
            "contenu": {"type": "String"},
            "sujet": {"type": "String"},
            "destinataire": {"type": "String"},
            "dateEcheance": {"type": "Date"},
            "dateEnvoi": {"type": "Date"},
            "essais": {"type": "Number"},
            "resultat": {"type": "String"},
            "variablesUtilisees": {"type": "Object"}
        },
        "indexes": {
            "impaye_sequence": {"impaye": 1, "sequence": 1},
            "statut_date": {"statut": 1, "dateEcheance": 1}
        }
    }

    try:
        logger.info("Tentative de création de la classe Relances...")
        
        # Vérifier si la classe existe déjà
        check_url = f"{base_url}/schemas/Relances"
        check_response = requests.get(check_url, headers=headers)
        
        if check_response.status_code == 200:
            logger.info("La classe Relances existe déjà")
            return True
        
        # Créer la classe
        response = requests.post(f"{base_url}/schemas", headers=headers, json=schema)
        response.raise_for_status()
        
        logger.info("Classe Relances créée avec succès")
        logger.info(f"Réponse: {response.json()}")
        return True
        
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 400 and "already exists" in str(e):
            logger.info("La classe Relances existe déjà")
            return True
        else:
            logger.error(f"Erreur HTTP lors de la création de la classe: {e}")
            logger.error(f"Réponse: {e.response.text}")
            return False
    except Exception as e:
        logger.error(f"Erreur lors de la création de la classe: {e}")
        return False


def verify_class_permissions():
    """Vérifier et configurer les permissions de la classe Relances"""
    base_url = os.getenv("PARSE_SERVER_URL")
    headers = {
        "X-Parse-Application-Id": os.getenv("PARSE_APP_ID"),
        "X-Parse-Master-Key": os.getenv("PARSE_MASTER_KEY"),
        "Content-Type": "application/json",
    }

    try:
        # Définir les permissions par défaut
        permissions = {
            "find": {"requiresAuthentication": True},
            "get": {"requiresAuthentication": True},
            "create": {"requiresAuthentication": True},
            "update": {"requiresAuthentication": True},
            "delete": {"requiresAuthentication": True},
            "addField": {"requiresMasterKey": True},
            "protectedFields": {
                "*": {"requiresMasterKey": True}
            }
        }

        url = f"{base_url}/schemas/Relances"
        response = requests.put(url, headers=headers, json={"classLevelPermissions": permissions})
        response.raise_for_status()
        
        logger.info("Permissions configurées avec succès pour la classe Relances")
        return True
        
    except Exception as e:
        logger.error(f"Erreur lors de la configuration des permissions: {e}")
        return False


def main():
    """Fonction principale"""
    logger.info("Début de la création de la classe Relances")
    
    try:
        # Créer la classe
        if create_relances_class():
            # Configurer les permissions
            if not verify_class_permissions():
                logger.warning("La configuration des permissions a échoué, mais la classe a été créée")
            logger.info("Processus terminé avec succès")
            return True
        else:
            logger.error("La création de la classe a échoué")
            return False
            
    except Exception as e:
        logger.error(f"Erreur inattendue: {e}")
        return False


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
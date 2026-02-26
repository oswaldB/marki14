#!/usr/bin/env python3
"""
Script pour créer la classe PaymentLink dans Parse Server

Ce script doit être exécuté une seule fois pour initialiser la structure
de la classe PaymentLink qui sera utilisée pour stocker les liens de paiement.
"""

import json
import logging
import os

import requests
from dotenv import load_dotenv

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("create_paymentlink_class.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()


def create_paymentlink_class():
    """Créer la classe PaymentLink avec son schéma"""
    base_url = os.getenv("PARSE_SERVER_URL")
    headers = {
        "X-Parse-Application-Id": os.getenv("PARSE_APP_ID"),
        "X-Parse-Master-Key": os.getenv("PARSE_MASTER_KEY"),
        "Content-Type": "application/json",
    }

    # Définition du schéma de la classe PaymentLink
    schema = {
        "className": "PaymentLink",
        "fields": {
            "url": {"type": "String", "required": True},
            "name": {"type": "String"},
            "description": {"type": "String"},
            "createdAt": {"type": "Date"},
            "updatedAt": {"type": "Date"},
            "ACL": {"type": "ACL"},
        },
        "classLevelPermissions": {
            "find": {"*": True},
            "get": {"*": True},
            "create": {"*": True},
            "update": {"*": True},
            "delete": {"*": True},
            "addField": {"*": True},
            "protectedFields": {"*": []},
        },
    }

    try:
        # Vérifier si la classe existe déjà
        check_url = f"{base_url}/schemas/PaymentLink"
        check_response = requests.get(check_url, headers=headers)

        if check_response.status_code == 200:
            logger.info("La classe PaymentLink existe déjà.")
            return

        # Créer la classe
        create_url = f"{base_url}/schemas"
        response = requests.post(create_url, headers=headers, data=json.dumps(schema))

        if response.status_code == 201:
            logger.info("Classe PaymentLink créée avec succès.")
        else:
            logger.error(
                f"Échec de la création de la classe PaymentLink: {response.text}"
            )

    except Exception as e:
        logger.error(f"Erreur lors de la création de la classe PaymentLink: {str(e)}")


def add_class_level_permissions():
    """Configurer les permissions au niveau de la classe"""
    base_url = os.getenv("PARSE_SERVER_URL")
    headers = {
        "X-Parse-Application-Id": os.getenv("PARSE_APP_ID"),
        "X-Parse-Master-Key": os.getenv("PARSE_MASTER_KEY"),
        "Content-Type": "application/json",
    }

    permissions = {
        "find": {"*": True},
        "get": {"*": True},
        "create": {"*": True},
        "update": {"*": True},
        "delete": {"*": True},
        "addField": {"*": True},
        "protectedFields": {"*": []},
    }

    try:
        url = f"{base_url}/schemas/PaymentLink"
        response = requests.put(
            url,
            headers=headers,
            data=json.dumps({"classLevelPermissions": permissions}),
        )

        if response.status_code == 200:
            logger.info(
                "Permissions configurées avec succès pour la classe PaymentLink."
            )
        else:
            logger.error(f"Échec de la configuration des permissions: {response.text}")

    except Exception as e:
        logger.error(f"Erreur lors de la configuration des permissions: {str(e)}")


if __name__ == "__main__":
    logger.info("Début de la création de la classe PaymentLink...")
    create_paymentlink_class()
    add_class_level_permissions()
    logger.info("Processus terminé.")

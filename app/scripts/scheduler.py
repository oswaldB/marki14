#!/usr/bin/env python3
"""
Script de planification pour appeler les routes de peuplement automatique
- populateImpayes toutes les heures à 00:03
- populateSequences toutes les heures à 00:10
- getImpayesColumns toutes les heures à 00:00
- peuplerRelances toutes les heures à 00:15
"""

import schedule
import time
import requests
from datetime import datetime
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("scheduler.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

def call_populate_impayes():
    """Appelle la route Flask /script/populateImpayes"""
    url = "https://dev.markidiags.com/script/populateImpayes"
    try:
        response = requests.post(url)
        if response.status_code == 200:
            logger.info(f"[{datetime.now()}] populateImpayes appelé avec succès : {response.json()}")
        else:
            logger.error(f"[{datetime.now()}] Erreur lors de l'appel de populateImpayes : {response.status_code}")
    except Exception as e:
        logger.error(f"[{datetime.now()}] Erreur lors de l'appel de populateImpayes : {e}")

def call_populate_sequences():
    """Appelle la route Flask /script/populateSequences"""
    url = "https://dev.markidiags.com/script/populateSequences"
    try:
        response = requests.post(url)
        if response.status_code == 200:
            logger.info(f"[{datetime.now()}] populateSequences appelé avec succès : {response.json()}")
        else:
            logger.error(f"[{datetime.now()}] Erreur lors de l'appel de populateSequences : {response.status_code}")
    except Exception as e:
        logger.error(f"[{datetime.now()}] Erreur lors de l'appel de populateSequences : {e}")


def call_peupler_relances():
    """Appelle la route Flask /script/peuplerRelances"""
    url = "https://dev.markidiags.com/script/peuplerRelances"
    try:
        response = requests.post(url)
        if response.status_code == 200:
            logger.info(f"[{datetime.now()}] peuplerRelances appelé avec succès : {response.json()}")
        else:
            logger.error(f"[{datetime.now()}] Erreur lors de l'appel de peuplerRelances : {response.status_code}")
    except Exception as e:
        logger.error(f"[{datetime.now()}] Erreur lors de l'appel de peuplerRelances : {e}")


def call_get_impayes_columns():
    """Appelle la route Flask /script/getImpayesColumns"""
    url = "https://dev.markidiags.com/script/getImpayesColumns"
    try:
        response = requests.post(url)
        if response.status_code == 200:
            logger.info(f"[{datetime.now()}] getImpayesColumns appelé avec succès : {response.json()}")
        else:
            logger.error(f"[{datetime.now()}] Erreur lors de l'appel de getImpayesColumns : {response.status_code}")
    except Exception as e:
        logger.error(f"[{datetime.now()}] Erreur lors de l'appel de getImpayesColumns : {e}")

def schedule_jobs():
    """Planifie l'exécution des routes de peuplement automatique"""
    # Planifie getImpayesColumns toutes les heures à 00:00
    schedule.every().hour.at(":00").do(call_get_impayes_columns)
    
    # Planifie populateImpayes toutes les heures à 00:03
    schedule.every().hour.at(":03").do(call_populate_impayes)
    
    # Planifie populateSequences toutes les heures à 00:10
    schedule.every().hour.at(":10").do(call_populate_sequences)
    
    # Planifie peuplerRelances toutes les heures à 00:15
    schedule.every().hour.at(":15").do(call_peupler_relances)

    logger.info("Planificateur démarré. getImpayesColumns à 00:00, populateImpayes à 00:03, populateSequences à 00:10, peuplerRelances à 00:15...")

    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    schedule_jobs()
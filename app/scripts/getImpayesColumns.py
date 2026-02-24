#!/usr/bin/env python3
"""
Script pour récupérer toutes les colonnes de la classe Parse Impayes
et les sauvegarder dans un fichier JSON.

Ce script peut être exécuté en ligne de commande ou via l'API Flask.
Il récupère la structure de la classe Impayes depuis Parse Server et
sauvegarde les noms des colonnes dans /static/configs/variables.json
"""

import os
import json
import logging
from dotenv import load_dotenv
from datetime import datetime
from typing import Dict, List, Any
import requests

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("get_impayes_columns.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)


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

    def get_schema(self, class_name: str = "Impayes") -> Dict[str, Any]:
        """Récupérer le schéma d'une classe Parse"""
        try:
            url = f"{self.base_url}/schemas/{class_name}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            schema_data = response.json()
            logger.info(f"Schéma récupéré avec succès pour la classe {class_name}")
            logger.debug(f"Structure du schéma: {json.dumps(schema_data, indent=2)}")
            return schema_data
        except requests.exceptions.RequestException as e:
            logger.error(f"Erreur lors de la récupération du schéma: {e}")
            return {}

    def get_sample_data(self, class_name: str = "Impayes", limit: int = 1) -> List[Dict[str, Any]]:
        """Récupérer un échantillon de données pour identifier les colonnes"""
        try:
            url = f"{self.base_url}/classes/{class_name}"
            params = {"limit": limit}
            
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            results = data.get("results", [])
            logger.info(f"Échantillon de données récupéré avec succès pour la classe {class_name}")
            return results
        except requests.exceptions.RequestException as e:
            logger.error(f"Erreur lors de la récupération des données: {e}")
            return []


def get_impayes_columns() -> List[str]:
    """Récupérer toutes les colonnes de la classe Impayes"""
    connector = ParseServerConnector()
    
    # Essayer d'abord de récupérer le schéma
    schema = connector.get_schema("Impayes")
    
    # Vérifier la structure du schéma
    if schema:
        logger.info(f"Structure du schéma: {list(schema.keys())}")
        # Essayer différentes structures possibles
        if "fields" in schema:
            # Structure attendue: schema["fields"]
            fields = schema["fields"]
            logger.info(f"Type de fields: {type(fields)}")
            if isinstance(fields, dict):
                columns = list(fields.keys())
                logger.info(f"Colonnes récupérées depuis le schéma: {len(columns)} colonnes")
                return columns
            else:
                logger.warning(f"fields n'est pas un dict: {type(fields)}")
        elif "results" in schema and len(schema["results"]) > 0:
            # Structure alternative: schema["results"][0]["fields"]
            first_result = schema["results"][0]
            if "fields" in first_result and isinstance(first_result["fields"], dict):
                columns = list(first_result["fields"].keys())
                logger.info(f"Colonnes récupérées depuis results[0].fields: {len(columns)} colonnes")
                return columns
        elif hasattr(schema, 'keys'):
            # Si schema est un dict mais sans structure attendue, essayer de trouver les champs
            logger.warning(f"Structure de schéma inattendue: {list(schema.keys())}")
    
    # Si le schéma n'est pas disponible ou structure inattendue, essayer avec un échantillon de données
    logger.warning("Impossible de récupérer le schéma ou structure inattendue, tentative avec un échantillon de données...")
    sample_data = connector.get_sample_data("Impayes", limit=1)
    
    if sample_data and len(sample_data) > 0:
        # Extraire les clés du premier objet
        columns = list(sample_data[0].keys())
        logger.info(f"Colonnes récupérées depuis un échantillon: {len(columns)} colonnes")
        return columns
    
    logger.error("Impossible de récupérer les colonnes de la classe Impayes")
    return []


def save_columns_to_json(columns: List[str], output_path: str = "../static/configs/variables.json") -> bool:
    """Sauvegarder les colonnes dans un fichier JSON"""
    try:
        # Créer le répertoire si nécessaire
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Créer la structure JSON
        output_data = {
            "columns": columns,
            "timestamp": datetime.now().isoformat(),
            "source": "Parse Server - Impayes class",
            "count": len(columns)
        }
        
        # Écrire le fichier JSON
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Colonnes sauvegardées avec succès dans {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"Erreur lors de la sauvegarde du fichier JSON: {e}")
        return False


def execute(params: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Fonction principale exécutée par le blueprint Flask
    
    Args:
        params: Paramètres optionnels (non utilisés pour ce script)
        
    Returns:
        Dict: Résultat de l'exécution avec status, message, et données
    """
    try:
        logger.info("Début de l'exécution du script getImpayesColumns")
        import traceback
        
        # Récupérer les colonnes
        try:
            columns = get_impayes_columns()
            logger.info(f"Colonnes récupérées: {len(columns)} colonnes")
            logger.info(f"Type de columns: {type(columns)}")
            if columns:
                logger.info(f"Premières colonnes: {columns[:3]}")
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des colonnes: {e}")
            return {
                "status": "error",
                "message": f"Erreur lors de la récupération des colonnes: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
        
        if not columns:
            return {
                "status": "error",
                "message": "Aucune colonne récupérée",
                "columns": [],
                "timestamp": datetime.now().isoformat()
            }
        
        # Sauvegarder dans le fichier JSON
        output_path = params.get("output_path", "../static/configs/variables.json") if params else "../static/configs/variables.json"
        logger.info(f"Chemin de sortie: {output_path}")
        logger.info(f"Nombre de colonnes à sauvegarder: {len(columns)}")
        logger.info(f"Premières colonnes: {columns[:5] if len(columns) > 5 else columns}")
        
        try:
            logger.info("Appel de save_columns_to_json...")
            success = save_columns_to_json(columns, output_path)
            logger.info(f"save_columns_to_json retourné: {success}")
        except Exception as e:
            logger.error(f"Erreur dans save_columns_to_json: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return {
                "status": "error",
                "message": f"Erreur dans save_columns_to_json: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
        
        if not success:
            return {
                "status": "error",
                "message": "Colonnes récupérées mais sauvegarde échouée",
                "columns": columns,
                "timestamp": datetime.now().isoformat()
            }
        
        return {
            "status": "success",
            "message": f"{len(columns)} colonnes récupérées et sauvegardées avec succès",
            "columns": columns,
            "output_path": output_path,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erreur lors de l'exécution du script: {e}")
        logger.error(f"Traceback complet:\n{traceback.format_exc()}")
        return {
            "status": "error",
            "message": f"Erreur lors de l'exécution: {str(e)}",
            "error_details": str(e),
            "traceback": traceback.format_exc(),
            "timestamp": datetime.now().isoformat()
        }


if __name__ == "__main__":
    """Exécution en ligne de commande"""
    result = execute()
    print(json.dumps(result, indent=2, ensure_ascii=False))

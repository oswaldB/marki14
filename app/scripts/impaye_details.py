"""
Script pour récupérer les détails d'un impayé spécifique
"""
import json
import requests
import os
from datetime import datetime

def execute(params=None):
    """
    Fonction d'exécution pour récupérer les détails d'un impayé
    
    Args:
        params (dict): Paramètres contenant l'ID de l'impayé
                      Exemple: {"impaye_id": "objectId"}
    
    Returns:
        dict: Résultat avec les détails de l'impayé et son historique d'actions
    """
    result = {
        "status": "success",
        "message": "Récupération des détails de l'impayé",
        "data": {},
        "timestamp": datetime.now().isoformat(),
    }
    
    try:
        # Récupérer l'ID de l'impayé depuis les paramètres
        if not params or 'impaye_id' not in params:
            result["status"] = "error"
            result["message"] = "ID de l'impayé manquant"
            return result
            
        impaye_id = params['impaye_id']
        
        # Configuration Parse Server
        PARSE_SERVER_URL = os.getenv("PARSE_SERVER_URL")
        PARSE_APP_ID = os.getenv("PARSE_APP_ID")
        PARSE_MASTER_KEY = os.getenv("PARSE_MASTER_KEY")
        
        headers = {
            "X-Parse-Application-Id": PARSE_APP_ID,
            "X-Parse-Master-Key": PARSE_MASTER_KEY,
            "Content-Type": "application/json",
        }
        
        # Récupérer les détails de l'impayé depuis Parse
        response = requests.get(f"{PARSE_SERVER_URL}/classes/Impayes/{impaye_id}",
                              headers=headers,
                              params={'include': 'payeur_pointer,apporteur_pointer'})
        
        if response.status_code != 200:
            result["status"] = "error"
            result["message"] = f"Erreur lors de la récupération de l'impayé: {response.status_code}"
            return result
            
        impaye_data = response.json()
        
        # Récupérer l'historique des actions pour cet impayé
        actions_response = requests.get(f"{PARSE_SERVER_URL}/classes/Actions",
                                      headers=headers,
                                      params={
                                          'where': json.dumps({"impaye_id": impaye_id}),
                                          'include': 'sequence,emailTemplate',
                                          'order': '-createdAt'
                                      })
        
        actions_data = []
        if actions_response.status_code == 200:
            actions_data = actions_response.json().get('results', [])
        
        # Combiner les données
        result["data"] = {
            'impaye': impaye_data,
            'actions': actions_data
        }
        
        result["message"] = "Détails de l'impayé récupérés avec succès"
        
    except Exception as e:
        result["status"] = "error"
        result["message"] = f"Erreur lors de la récupération des détails: {str(e)}"
        result["data"] = {"error_details": str(e)}
    
    return result
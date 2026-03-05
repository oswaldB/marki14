"""
Script pour récupérer tous les impayés et apports d'affaires d'un contact
"""
import json
import requests
import os
from datetime import datetime

def execute(params=None):
    """
    Fonction d'exécution pour récupérer les impayés d'un contact
    
    Args:
        params (dict): Paramètres contenant l'ID du contact
                      Exemple: {"contact_id": "objectId"}
    
    Returns:
        dict: Résultat avec les impayés du contact
    """
    result = {
        "status": "success",
        "message": "Récupération des impayés du contact",
        "data": {},
        "timestamp": datetime.now().isoformat(),
    }
    
    try:
        # Récupérer l'ID du contact depuis les paramètres
        if not params or 'contact_id' not in params:
            result["status"] = "error"
            result["message"] = "ID du contact manquant"
            return result
            
        contact_id = params['contact_id']
        
        # Configuration Parse Server
        PARSE_SERVER_URL = os.getenv("PARSE_SERVER_URL")
        PARSE_APP_ID = os.getenv("PARSE_APP_ID")
        PARSE_MASTER_KEY = os.getenv("PARSE_MASTER_KEY")
        
        headers = {
            "X-Parse-Application-Id": PARSE_APP_ID,
            "X-Parse-Master-Key": PARSE_MASTER_KEY,
            "Content-Type": "application/json",
        }
        
        # Récupérer les informations du contact
        contact_response = requests.get(f"{PARSE_SERVER_URL}/classes/Contacts/{contact_id}",
                                      headers=headers)
        
        if contact_response.status_code != 200:
            result["status"] = "error"
            result["message"] = f"Erreur lors de la récupération du contact: {contact_response.status_code}"
            return result
            
        contact_data = contact_response.json()
        
        # Récupérer les impayés où ce contact est payeur
        impayes_as_payeur = []
        impayes_response = requests.get(f"{PARSE_SERVER_URL}/classes/Impayes",
                                        headers=headers,
                                        params={
                                            'where': json.dumps({
                                                "payeur_pointer": {
                                                    "__type": "Pointer",
                                                    "className": "Contacts",
                                                    "objectId": contact_id
                                                }
                                            }),
                                            'include': 'payeur_pointer,apporteur_pointer'
                                        })
        
        if impayes_response.status_code == 200:
            impayes_as_payeur = impayes_response.json().get('results', [])
        
        # Récupérer les impayés où ce contact est apporteur d'affaires
        impayes_as_apporteur = []
        apporteur_response = requests.get(f"{PARSE_SERVER_URL}/classes/Impayes",
                                        headers=headers,
                                        params={
                                            'where': json.dumps({
                                                "apporteur_pointer": {
                                                    "__type": "Pointer",
                                                    "className": "Contacts",
                                                    "objectId": contact_id
                                                }
                                            }),
                                            'include': 'payeur_pointer,apporteur_pointer'
                                        })
        
        if apporteur_response.status_code == 200:
            impayes_as_apporteur = apporteur_response.json().get('results', [])
        
        # Combiner les résultats
        result["data"] = {
            'contact': contact_data,
            'impayes_as_payeur': impayes_as_payeur,
            'impayes_as_apporteur': impayes_as_apporteur
        }
        
        result["message"] = "Impayés du contact récupérés avec succès"
        
    except Exception as e:
        result["status"] = "error"
        result["message"] = f"Erreur lors de la récupération des données: {str(e)}"
        result["data"] = {"error_details": str(e)}
    
    return result
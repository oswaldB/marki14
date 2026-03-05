from flask import request, jsonify
from datetime import datetime
import json
import requests
import os

def execute(params=None):
    """
    Script pour archiver plusieurs factures impayées
    
    Args:
        params (dict): Paramètres contenant les IDs des impayés à archiver
                      Exemple: {"impaye_ids": ["id1", "id2"]}
    
    Returns:
        dict: Résultat de l'archivage
    """
    result = {
        "status": "success",
        "message": "Archivage des factures impayées",
        "data": {},
        "timestamp": datetime.now().isoformat(),
    }
    
    try:
        # Récupérer les IDs des impayés depuis les paramètres
        if not params or 'impaye_ids' not in params:
            result["status"] = "error"
            result["message"] = "Aucune facture spécifiée"
            return result
            
        impaye_ids = params['impaye_ids']
        if not impaye_ids or len(impaye_ids) == 0:
            result["status"] = "error"
            result["message"] = "Aucune facture spécifiée"
            return result
        
        # Configuration Parse Server
        PARSE_SERVER_URL = os.getenv("PARSE_SERVER_URL")
        PARSE_APP_ID = os.getenv("PARSE_APP_ID")
        PARSE_MASTER_KEY = os.getenv("PARSE_MASTER_KEY")
        
        headers = {
            "X-Parse-Application-Id": PARSE_APP_ID,
            "X-Parse-Master-Key": PARSE_MASTER_KEY,
            "Content-Type": "application/json",
        }
        
        # Mettre à jour le statut des factures en base de données
        archived_count = 0
        for impaye_id in impaye_ids:
            url = f"{PARSE_SERVER_URL}/classes/Impayes/{impaye_id}"
            
            # Mettre à jour le statut à "archived"
            update_data = {
                "statut": "archived",
                "facturesoldee": True
            }
            
            response = requests.put(url, headers=headers, json=update_data)
            
            if response.status_code == 200:
                archived_count += 1
            else:
                # Log l'erreur mais continuer avec les autres
                continue
        
        result["data"] = {
            "archived_count": archived_count,
            "total_attempted": len(impaye_ids)
        }
        result["message"] = f"{archived_count}/{len(impaye_ids)} facture(s) archivée(s) avec succès"
        
    except Exception as e:
        result["status"] = "error"
        result["message"] = f"Erreur lors de l'archivage: {str(e)}"
        result["data"] = {"error_details": str(e)}
    
    return result
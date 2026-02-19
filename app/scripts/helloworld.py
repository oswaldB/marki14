#!/usr/bin/env python3
"""
Script Hello World - Exemple de script pour le blueprint /script/

Ce script démontre la structure de base pour les scripts exécutables
via le blueprint Flask. Il retourne simplement un message "Hello World".
"""

from datetime import datetime


def execute(params=None):
    """
    Exécute le script Hello World

    Args:
        params (dict, optional): Paramètres optionnels pour le script
                                Format attendu: {"name": "nom_personnalisé"}
                                Si aucun nom n'est fourni, utilise "World"

    Returns:
        dict: Résultat du script avec status, message et timestamp
              Format: {
                  "status": "success"|"error",
                  "message": "Message de résultat",
                  "data": { ... },  # Données supplémentaires
                  "timestamp": "ISO_format_timestamp"
              }
    """
    try:
        # Valeurs par défaut
        name = "World"

        # Si des paramètres sont fournis, extraire le nom
        if params and isinstance(params, dict) and "name" in params:
            name = params["name"]

        # Créer le résultat
        result = {
            "status": "success",
            "message": f"Hello, {name}!",
            "data": {
                "greeting": f"Hello, {name}!",
                "timestamp": datetime.now().isoformat(),
                "script": "helloworld",
                "params_received": bool(params),
            },
            "timestamp": datetime.now().isoformat(),
        }

        return result

    except Exception as e:
        return {
            "status": "error",
            "message": f"Erreur dans helloworld.py: {str(e)}",
            "data": {"error": str(e), "timestamp": datetime.now().isoformat()},
            "timestamp": datetime.now().isoformat(),
        }

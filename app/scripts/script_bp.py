"""
Script Blueprint - Gestion des routes pour l'exécution des scripts

Ce blueprint fournit une interface REST pour exécuter des scripts Python
situés dans le dossier app/scripts/. Il permet d'appeler des scripts
avec des paramètres et retourne les résultats au format JSON.
"""

import importlib
import os

# Ajouter le dossier app au path pour les imports dynamiques
import sys
from datetime import datetime

from flask import Blueprint, jsonify, request

sys.path.insert(0, os.path.dirname(__file__))

# Créer le blueprint
script_bp = Blueprint("script_bp", __name__, url_prefix="/script")


@script_bp.route("/<script_name>", methods=["POST", "GET"])
def execute_script(script_name):
    """
    Exécute un script spécifique

    Args:
        script_name (str): Nom du script à exécuter (sans l'extension .py)

    Returns:
        Response: Réponse JSON avec le résultat de l'exécution du script

    Exemple d'utilisation:
        POST /script/helloworld
        Content-Type: application/json

        {
            "name": "John"
        }

        Réponse:
        {
            "status": "success",
            "message": "Hello, John!",
            "data": { ... },
            "timestamp": "..."
        }
    """
    try:
        # Vérifier que le script existe et est autorisé
        # Exclure les fichiers qui ne sont pas des scripts exécutables
        if script_name in ["script_bp"]:
            return jsonify(
                {
                    "status": "error",
                    "message": f"Le script '{script_name}' n'est pas exécutable",
                    "available_scripts": get_available_scripts(),
                    "timestamp": datetime.now().isoformat(),
                }
            ), 400

        script_path = f"scripts.{script_name}"

        # Vérifier que le fichier existe physiquement
        script_file = os.path.join(os.path.dirname(__file__), f"{script_name}.py")
        if not os.path.exists(script_file):
            return jsonify(
                {
                    "status": "error",
                    "message": f"Script '{script_name}' introuvable",
                    "available_scripts": get_available_scripts(),
                    "timestamp": datetime.now().isoformat(),
                }
            ), 404

        # Importer le module dynamiquement
        script_module = importlib.import_module(script_path)

        # Vérifier que le module a une fonction execute
        if not hasattr(script_module, "execute"):
            return jsonify(
                {
                    "status": "error",
                    "message": f"Le script '{script_name}' n'a pas de fonction execute()",
                    "timestamp": datetime.now().isoformat(),
                }
            ), 400

        # Extraire les paramètres de la requête
        params = None
        if request.method == "POST":
            if request.is_json:
                params = request.get_json()
            else:
                params = request.form.to_dict() if request.form else None
        elif request.method == "GET":
            params = request.args.to_dict() if request.args else None

        # Exécuter le script
        execute_func = getattr(script_module, "execute")
        result = execute_func(params)

        # S'assurer que le résultat a le format attendu
        if not isinstance(result, dict):
            result = {
                "status": "error",
                "message": "Format de réponse invalide du script",
                "data": {"raw_response": str(result)},
                "timestamp": datetime.now().isoformat(),
            }

        # Ajouter des métadonnées si non présentes
        if "timestamp" not in result:
            result["timestamp"] = datetime.now().isoformat()

        return jsonify(result), 200

    except ImportError as e:
        return jsonify(
            {
                "status": "error",
                "message": f"Erreur d'import du script: {str(e)}",
                "available_scripts": get_available_scripts(),
                "timestamp": datetime.now().isoformat(),
            }
        ), 400

    except Exception as e:
        return jsonify(
            {
                "status": "error",
                "message": f"Erreur lors de l'exécution du script: {str(e)}",
                "error_details": str(e),
                "timestamp": datetime.now().isoformat(),
            }
        ), 500


@script_bp.route("/list", methods=["GET"])
def list_scripts():
    """
    Liste tous les scripts disponibles

    Returns:
        Response: Liste des scripts disponibles avec leurs descriptions
    """
    scripts = get_available_scripts(detailed=True)

    return jsonify(
        {
            "status": "success",
            "message": f"{len(scripts)} scripts disponibles",
            "scripts": scripts,
            "timestamp": datetime.now().isoformat(),
        }
    ), 200


def get_available_scripts(detailed=False):
    """
    Récupère la liste des scripts disponibles dans le dossier scripts/

    Args:
        detailed (bool): Si True, retourne des informations détaillées

    Returns:
        list: Liste des scripts disponibles
    """
    scripts_dir = os.path.dirname(__file__)

    if not os.path.exists(scripts_dir):
        return []

    scripts = []

    for filename in os.listdir(scripts_dir):
        if filename.endswith(".py") and not filename.startswith("_"):
            script_name = filename[:-3]  # Enlever l'extension .py

            # Exclure les fichiers qui ne sont pas des scripts exécutables
            if script_name in ["script_bp"]:
                continue

            if detailed:
                try:
                    # Essayer d'importer pour obtenir la docstring
                    script_module = importlib.import_module(f"{script_name}")
                    docstring = getattr(script_module, "__doc__", "Aucune description")

                    scripts.append(
                        {
                            "name": script_name,
                            "description": docstring.strip()
                            if docstring
                            else "Aucune description",
                            "file": filename,
                        }
                    )
                except Exception:
                    scripts.append(
                        {
                            "name": script_name,
                            "description": "Impossible de charger la description",
                            "file": filename,
                        }
                    )
            else:
                scripts.append(script_name)

    return scripts

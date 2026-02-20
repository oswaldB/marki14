# scripts/script_bp.py
"""
Blueprint pour les scripts dynamiques
Conforme aux règles de développement du projet
"""

from flask import Blueprint, request, jsonify, current_app
import importlib
import os

script_bp = Blueprint('script', __name__, url_prefix='/script')

@script_bp.route('/<script_name>', methods=['GET', 'POST'])
def script_route(script_name):
    """
    Route dynamique pour exécuter des scripts
    """
    try:
        # Construire le chemin du module
        module_name = f"scripts.{script_name}"
        
        # Importer le module dynamiquement
        try:
            module = importlib.import_module(module_name)
        except ImportError:
            return jsonify({
                'success': False,
                'error': f'Script {script_name} non trouvé'
            }), 404
        
        # Vérifier si le module a une fonction handle_request
        if hasattr(module, 'handle_request'):
            result = module.handle_request(request)
            return result
        else:
            return jsonify({
                'success': False,
                'error': f'Le script {script_name} n\'a pas de fonction handle_request'
            }), 400
            
    except Exception as e:
        current_app.logger.error(f"Erreur dans le script {script_name}: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Erreur interne: {str(e)}'
        }), 500

# Route spécifique pour l'historique des emails
@script_bp.route('/emailHistory', methods=['GET'])
def email_history_route():
    """
    Route pour gérer les requêtes liées à l'historique des emails
    """
    try:
        action = request.args.get('action')
        
        if action == 'fetchEmailHistory':
            return handle_fetch_email_history()
        elif action == 'getDiffForField':
            return handle_get_diff_for_field()
        else:
            return jsonify({
                'success': False,
                'error': 'Action non valide'
            }), 400
            
    except Exception as e:
        current_app.logger.error(f"Erreur dans email_history_route: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Erreur interne: {str(e)}'
        }), 500

def handle_fetch_email_history():
    """
    Gère la récupération de l'historique des emails
    """
    # Dans une implémentation réelle, cela appellerait Parse Server
    # Pour cette démo, nous retournons des données mockées
    
    email_id = request.args.get('emailId')
    limit = int(request.args.get('limit', 20))
    
    if not email_id:
        return jsonify({
            'success': False,
            'error': 'emailId requis'
        }), 400
    
    # Données mockées pour la démonstration
    mock_history = [
        {
            'objectId': 'hist1',
            'user': {
                'objectId': 'user1',
                'username': 'Jean Dupont'
            },
            'changes': {
                'subject': {
                    'old': 'Réunion',
                    'new': 'Réunion d\'équipe'
                },
                'recipients': {
                    'added': ['manager@entreprise.com']
                }
            },
            'timestamp': '2024-10-15T09:30:00Z'
        },
        {
            'objectId': 'hist2',
            'user': {
                'objectId': 'user2',
                'username': 'Marie Martin'
            },
            'changes': {
                'body': {
                    'old': 'Bonjour,\n\nLa réunion est prévue demain.',
                    'new': 'Bonjour l\'équipe,\n\nLa réunion aura lieu demain à 14h.'
                }
            },
            'timestamp': '2024-10-14T16:45:00Z'
        }
    ]
    
    return jsonify({
        'success': True,
        'history': mock_history[:limit]
    })

def handle_get_diff_for_field():
    """
    Gère la récupération des différences pour un champ
    """
    history_id = request.args.get('historyId')
    field = request.args.get('field')
    
    if not history_id or not field:
        return jsonify({
            'success': False,
            'error': 'historyId et field requis'
        }), 400
    
    # Données mockées pour la démonstration
    if field == 'body':
        diff_data = {
            'before': 'Bonjour,\n\nLa réunion est prévue demain.',
            'after': 'Bonjour l\'équipe,\n\nLa réunion aura lieu demain à 14h.',
            'diffHtml': '''
                <div class="body-diff">
                    <div class="diff-removed">Bonjour,</div>
                    <div class="diff-added">Bonjour l'équipe,</div>
                    <div class="diff-common"></div>
                    <div class="diff-removed">La réunion est</div>
                    <div class="diff-added">La réunion aura lieu</div>
                    <div class="diff-common"> prévue demain.</div>
                    <div class="diff-added"> à 14h.</div>
                </div>
            '''
        }
    else:
        diff_data = {
            'before': 'Réunion',
            'after': 'Réunion d\'équipe',
            'diffHtml': '''
                <div class="diff-container">
                    <div class="diff-old">Réunion</div>
                    <div class="diff-arrow">→</div>
                    <div class="diff-new">Réunion d'équipe</div>
                </div>
            '''
        }
    
    return jsonify({
        'success': True,
        'diff': diff_data
    })
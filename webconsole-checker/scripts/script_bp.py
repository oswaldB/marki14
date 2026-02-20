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

# Route spécifique pour la vérification des factures
@script_bp.route('/invoiceVerification', methods=['GET', 'POST'])
def invoice_verification_route():
    """
    Route pour gérer les requêtes liées à la vérification des fichiers de facture
    """
    try:
        action = request.args.get('action') if request.method == 'GET' else request.form.get('action')
        
        if action == 'checkInvoiceFile':
            return handle_check_invoice_file()
        elif action == 'generateDownloadLink':
            return handle_generate_download_link()
        elif action == 'verifyAndGenerateLink':
            return handle_verify_and_generate_link()
        else:
            return jsonify({
                'success': False,
                'error': 'Action non valide'
            }), 400
            
    except Exception as e:
        current_app.logger.error(f"Erreur dans invoice_verification_route: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Erreur interne: {str(e)}'
        }), 500

# Route spécifique pour l'envoi d'emails avec factures
@script_bp.route('/invoiceEmail', methods=['GET', 'POST'])
def invoice_email_route():
    """
    Route pour gérer les requêtes liées à l'envoi d'emails avec factures
    """
    try:
        action = request.args.get('action') if request.method == 'GET' else request.form.get('action')
        
        if action == 'checkInvoiceFile':
            return handle_check_invoice_file()
        elif action == 'generateDownloadLink':
            return handle_generate_download_link()
        elif action == 'sendInvoiceEmail':
            return handle_send_invoice_email()
        else:
            return jsonify({
                'success': False,
                'error': 'Action non valide'
            }), 400
            
    except Exception as e:
        current_app.logger.error(f"Erreur dans invoice_email_route: {str(e)}")
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

# Handlers pour la vérification des factures
def handle_check_invoice_file():
    """
    Gère la vérification de l'existence d'un fichier de facture
    """
    invoice_id = request.args.get('invoiceId')
    file_extension = request.args.get('fileExtension')
    
    if not invoice_id or not file_extension:
        return jsonify({
            'success': False,
            'error': 'invoiceId et fileExtension sont requis'
        }), 400
    
    # Données mockées pour la démonstration
    # Dans une vraie implémentation, cela appellerait le service FTP
    if invoice_id == 'INV-2023-001' and file_extension == 'pdf':
        result = {
            'exists': True,
            'filePath': f'/invoices/{invoice_id}.{file_extension}',
            'error': None
        }
    else:
        result = {
            'exists': False,
            'filePath': None,
            'error': 'Fichier non trouvé'
        }
    
    return jsonify({
        'success': True,
        'result': result
    })

def handle_generate_download_link():
    """
    Gère la génération d'un lien de téléchargement
    """
    file_path = request.args.get('filePath')
    
    if not file_path:
        return jsonify({
            'success': False,
            'error': 'filePath requis'
        }), 400
    
    # Données mockées pour la démonstration
    # Dans une vraie implémentation, cela générerait un vrai token
    token = 'mock-token-' + file_path.replace('/', '-')
    download_link = f'/api/download?token={token}&file={file_path}'
    
    return jsonify({
        'success': True,
        'downloadLink': download_link,
        'expiresAt': '2024-12-31T23:59:59Z'
    })

def handle_verify_and_generate_link():
    """
    Gère le processus complet de vérification et génération de lien
    """
    invoice_id = request.args.get('invoiceId')
    file_extension = request.args.get('fileExtension')
    
    if not invoice_id or not file_extension:
        return jsonify({
            'success': False,
            'error': 'invoiceId et fileExtension sont requis'
        }), 400
    
    # Vérification du fichier
    check_result = handle_check_invoice_file().get_json()
    
    if not check_result['success'] or not check_result['result']['exists']:
        return jsonify({
            'success': False,
            'error': check_result['result']['error'],
            'errorType': 'FILE_NOT_FOUND'
        }), 404
    
    # Génération du lien
    generate_result = handle_generate_download_link().get_json()
    
    return jsonify({
        'success': True,
        'downloadLink': generate_result['downloadLink'],
        'expiresAt': generate_result['expiresAt'],
        'filePath': check_result['result']['filePath']
    })

# Handlers pour l'envoi d'emails avec factures
def handle_send_invoice_email():
    """
    Gère l'envoi d'un email avec facture
    """
    invoice_id = request.args.get('invoiceId')
    recipient_email = request.args.get('recipientEmail')
    recipient_name = request.args.get('recipientName')
    email_subject = request.args.get('emailSubject', f'Votre facture {invoice_id}')
    
    if not invoice_id or not recipient_email or not recipient_name:
        return jsonify({
            'success': False,
            'error': 'invoiceId, recipientEmail et recipientName sont requis'
        }), 400
    
    # Dans une implémentation réelle, cela appellerait le service Parse
    # Pour cette démo, nous simulons le processus
    
    # Vérifier si la facture existe (simulation)
    if invoice_id == 'INV-2023-001':
        # Facture trouvée - générer un lien et envoyer l'email
        token = 'mock-token-' + invoice_id
        download_link = f'/api/download?token={token}&file=/invoices/{invoice_id}.pdf'
        expires_at = '2024-12-31T23:59:59Z'
        
        return jsonify({
            'success': True,
            'emailId': 'email-' + invoice_id,
            'downloadLink': download_link,
            'expiresAt': expires_at
        })
    else:
        # Facture non trouvée - envoyer un email de notification
        return jsonify({
            'success': False,
            'error': 'Facture non trouvée',
            'errorType': 'FILE_NOT_FOUND'
        }), 404
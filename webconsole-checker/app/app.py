#!/usr/bin/env python3
"""
Application Flask principale pour le webconsole-checker
Conforme aux règles de développement du projet
"""

from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

# Configuration de base
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-webconsole-checker')
app.config['JSON_AS_ASCII'] = False

# Routes principales
@app.route('/')
def index():
    """Page d'accueil"""
    return render_template('index.html')

@app.route('/styleguide')
def styleguide():
    """Guide de style"""
    return render_template('styleguide.html')

@app.route('/components')
def components():
    """Page des composants"""
    return render_template('components.html')

@app.route('/icons')
def icons():
    """Page des icônes"""
    return render_template('icons-regular.html')

# Routes pour la gestion des emails
@app.route('/email/<email_id>')
def email_details(email_id):
    """Page de détails d'un email"""
    return render_template('email-details.html', email_id=email_id)

@app.route('/email/<email_id>/history')
def email_history(email_id):
    """Page d'historique des modifications d'un email"""
    return render_template('email-history.html', email_id=email_id)

# Routes pour l'administration
@app.route('/admin/configurations')
def admin_configurations():
    """Page de configuration administrative"""
    return render_template('admin-configurations.html')

# Blueprint pour les scripts (à importer et enregistrer)
try:
    from scripts.script_bp import script_bp
    app.register_blueprint(script_bp, url_prefix='/script')
except ImportError:
    print("Avertissement: Le blueprint des scripts n'est pas disponible")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
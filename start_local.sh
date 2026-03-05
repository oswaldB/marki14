#!/bin/bash

echo "Démarrage du serveur Flask en local..."
echo "==========================================="

# Aller dans le dossier app
cd "$(dirname "$0")/app" || exit

# Créer l'environnement virtuel si nécessaire
if [ ! -d "venv" ]; then
    echo "Création de l'environnement virtuel Python..."
    python3 -m venv venv
fi

# Activer l'environnement virtuel
source venv/bin/activate

# Installer les dépendances
echo "Installation des dépendances Flask..."
pip install flask flask-livereload flask-cors apscheduler python-dotenv psycopg2-binary

# Lancer Flask en mode développement
echo "Lancement du serveur Flask..."
echo "==========================================="
echo "Accessible à : http://0.0.0.0:5000"
echo "Arrêter avec Ctrl+C"
echo "==========================================="

FLASK_ENV=development
python3 app.py

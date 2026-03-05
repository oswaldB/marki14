@echo off
echo Démarrage du serveur Flask en local...
echo ===========================================

cd /d "%~dp0app"

if not exist "venv" (
    echo Création de l'environnement virtuel Python...
    python -m venv venv
)

call venv\Scripts\activate.bat

echo Installation des dépendances Flask...
pip install flask flask-livereload flask-cors apscheduler python-dotenv psycopg2-binary

echo Lancement du serveur Flask...
echo ===========================================
echo Accessible à : http://localhost:5000
echo Arrêter avec Ctrl+C
echo ===========================================

set FLASK_ENV=development
python app.py

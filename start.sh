#!/bin/bash

echo "🚀 Démarrage du serveur Marki..."
echo "==========================================="

# Démarrer les conteneurs Docker
echo "Démarrage des conteneurs Docker..."
docker compose up -d
sleep 5

# Vérifier que les conteneurs sont bien démarrés
echo "Vérification des conteneurs Docker..."
docker ps -a

# Démarrer le serveur Flask
echo "Démarrage du serveur Flask..."
cd app || exit

# Vérifier si l'environnement virtuel existe
if [ ! -d "venv" ]; then
    echo "Création de l'environnement virtuel Python..."
    python3 -m venv venv
fi

# Activer l'environnement virtuel et installer les dépendances
source venv/bin/activate
if ! pip show flask &> /dev/null; then
    echo "Installation des dépendances Flask..."
    pip install flask flask-livereload flask-cors apscheduler python-dotenv psycopg2-binary
fi

# Lancer le serveur Flask en arrière-plan
echo "Lancement du serveur Flask..."
python app.py &

# Retourner au répertoire racine
cd ..

sleep 3

echo "✅ Le serveur Marki et tous les composants ont été démarrés."
echo "==========================================="
echo "Le serveur Flask est accessible à : http://0.0.0.0:5000"
echo "Les conteneurs Docker sont en cours d'exécution"
echo "==========================================="

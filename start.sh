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

# Démarrer le serveur Fastify
echo "Démarrage du serveur Fastify..."
cd back/fastify-server || exit
echo "Installation des dépendances Fastify..."
npm install

echo "Lancement du serveur Fastify..."
npm start &
cd ../..
sleep 3

# Démarrer le frontend Astro
echo "Démarrage du frontend Astro..."
cd front || exit
echo "Installation des dépendances Astro..."
npm install

echo "Lancement du frontend Astro..."
npm run dev &
cd ..
sleep 5

echo "✅ Le serveur Marki et tous les composants ont été démarrés."
echo "==========================================="
echo "Le frontend est accessible à : http://localhost:5000"
echo "Le serveur Fastify est accessible à : http://localhost:3000"
echo "Parse Dashboard est accessible à : http://localhost:4040"
echo "==========================================="
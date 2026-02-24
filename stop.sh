#!/bin/bash

<<<<<<< Updated upstream
echo "🛑 Arrêt du serveur Marki..."
echo "==========================================="

# Arrêter le serveur Flask
echo "Arrêt du serveur Flask..."
pkill -f "app.py" 2>/dev/null || true
pkill -f ":5000" 2>/dev/null || true
=======
echo "🛑 Arrêt du serveur Fastify et des processus associés..."
echo "==========================================="

# Arrêter le script arthuro.sh
echo "Arrêt du script arthuro.sh..."
pkill -f "arthuro.sh" 2>/dev/null || true
sleep 1

# Arrêter uniquement le serveur Fastify
echo "Arrêt du serveur Fastify..."
pkill -f "index.js" 2>/dev/null || true
pkill -f ":3000" 2>/dev/null || true
sleep 1

# Arrêter les processus Astro
echo "Arrêt des processus Astro..."
pkill -f "astro" 2>/dev/null || true
>>>>>>> Stashed changes
sleep 1

# Arrêter les conteneurs Docker
echo "Arrêt des conteneurs Docker..."
docker compose down 2>/dev/null || true
sleep 2

echo "✅ Tous les services ont été arrêtés."
echo "==========================================="

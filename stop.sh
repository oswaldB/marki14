#!/bin/bash

echo "🛑 Arrêt du serveur Marki..."
echo "==========================================="

# Arrêter le serveur Flask
echo "Arrêt du serveur Flask..."
pkill -f "app.py" 2>/dev/null || true
pkill -f ":5000" 2>/dev/null || true
sleep 1

# Arrêter les conteneurs Docker
echo "Arrêt des conteneurs Docker..."
docker compose down 2>/dev/null || true
sleep 2

echo "✅ Tous les services ont été arrêtés."
echo "==========================================="

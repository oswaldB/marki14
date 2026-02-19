#!/bin/bash

echo "🛑 Arrêt du serveur Fastify..."
echo "==========================================="

# Arrêter le processus arthuro.sh
echo "Arrêt du processus arthuro.sh..."
pkill -f "arthuro.sh" 2>/dev/null || true
sleep 1

# Arrêter uniquement le serveur Fastify
echo "Arrêt du serveur Fastify..."
pkill -f "index.js" 2>/dev/null || true
pkill -f ":3000" 2>/dev/null || true
sleep 1

# Arrêter les processus Vite
echo "Arrêt des processus Vite..."
pkill -f "vite" 2>/dev/null || true
sleep 1

# Arrêter les conteneurs Docker
echo "Arrêt des conteneurs Docker..."
docker compose down 2>/dev/null || true
sleep 2

echo "✅"

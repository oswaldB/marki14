#!/bin/bash

echo "🛑 Arrêt du serveur Fastify..."
echo "==========================================="

# Arrêter uniquement le serveur Fastify
echo "Arrêt du serveur Fastify..."
pkill -f "index.js" 2>/dev/null || true
pkill -f ":3000" 2>/dev/null || true
sleep 1

# Arrêter les processus Astro
echo "Arrêt des processus Astro..."
pkill -f "astro" 2>/dev/null || true
sleep 1

# Arrêter les conteneurs Docker
echo "Arrêt des conteneurs Docker..."
docker compose down 2>/dev/null || true
sleep 2

# Tuer les processus Docker restants
echo "Nettoyage des processus Docker..."
pkill -f "docker" 2>/dev/null || true
sleep 1

echo "✅ Le serveur Fastify et les processus associés ont été arrêtés."
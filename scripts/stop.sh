#!/bin/bash

echo "🛑 Arrêt de tous les serveurs et processus..."
echo "============================================"

# Arrêter les processus Node.js (Parse Server, Fastify, etc.)
echo "Arrêt des processus Node.js..."
pkill -f "node" 2>/dev/null || true
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

# Tuer les processus restants si nécessaire
echo "Nettoyage final..."
pkill -9 -f "node" 2>/dev/null || true
pkill -9 -f "astro" 2>/dev/null || true
pkill -9 -f "docker" 2>/dev/null || true

echo "✅ Tous les serveurs et processus ont été arrêtés."

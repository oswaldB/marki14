#!/bin/bash

# Trouver et tuer les processus astro dev
pids=$(pgrep -f "astro dev")
if [ -n "$pids" ]; then
    echo "Arrêt des processus astro dev..."
    kill $pids
    sleep 2
    # Forcer l'arrêt si nécessaire
    pids_after=$(pgrep -f "astro dev")
    if [ -n "$pids_after" ]; then
        kill -9 $pids_after
    fi
fi

# Trouver et tuer les processus docker compose
docker_pids=$(pgrep -f "docker compose")
if [ -n "$docker_pids" ]; then
    echo "Arrêt des processus docker compose..."
    kill $docker_pids
    sleep 2
    # Forcer l'arrêt si nécessaire
    docker_pids_after=$(pgrep -f "docker compose")
    if [ -n "$docker_pids_after" ]; then
        kill -9 $docker_pids_after
    fi
fi

# Arrêter les conteneurs docker
echo "Arrêt des conteneurs docker..."
docker compose down

echo "Tous les processus ont été arrêtés."
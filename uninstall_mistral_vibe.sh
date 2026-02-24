#!/bin/bash

# Script pour désinstaller Mistral Vibe

# Vérifier si le script est exécuté en tant que root (nécessaire pour certaines opérations)
if [ "$(id -u)" -ne 0 ]; then
    echo "Ce script doit être exécuté en tant que root. Utilisez 'sudo'."
    exit 1
fi

echo "Début de la désinstallation de Mistral Vibe..."

# Étape 1: Désinstaller via pip
echo "Désinstallation via pip..."
if pip show mistral-vibe &> /dev/null; then
    pip uninstall mistral-vibe -y
    echo "Mistral Vibe a été désinstallé via pip."
else
    echo "Mistral Vibe n'est pas installé via pip."
fi

# Étape 2: Supprimer les fichiers manuels
echo "Suppression des fichiers manuels..."
if [ -d "$HOME/.vibe" ]; then
    rm -rf "$HOME/.vibe"
    echo "Dossier Mistral Vibe (~/.vibe) supprimé."
else
    echo "Aucun dossier Mistral Vibe trouvé à ~/.vibe."
fi

# Étape 3: Nettoyer les fichiers de configuration
echo "Nettoyage des fichiers de configuration..."
if [ -d "$HOME/.mistral_vibe" ]; then
    rm -rf "$HOME/.mistral_vibe"
    echo "Fichiers de configuration utilisateur supprimés."
else
    echo "Aucun fichier de configuration utilisateur trouvé."
fi

if [ -d "/etc/mistral_vibe" ]; then
    rm -rf /etc/mistral_vibe
    echo "Fichiers de configuration système supprimés."
else
    echo "Aucun fichier de configuration système trouvé."
fi

# Étape 4: Vérifier les résidus
echo "Vérification des résidus..."
RESIDUAL_FILES=$(find ~ -name "*mistral*" -type f 2>/dev/null)
if [ -z "$RESIDUAL_FILES" ]; then
    echo "Aucun fichier résiduel trouvé."
else
    echo "Fichiers résiduels trouvés :"
    echo "$RESIDUAL_FILES"
    read -p "Souhaitez-vous supprimer ces fichiers ? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        find ~ -name "*mistral*" -type f -delete
        echo "Fichiers résiduels supprimés."
    fi
fi

# Étape 5: Vérifier les processus
echo "Vérification des processus..."
if pgrep -f "mistral" > /dev/null; then
    echo "Des processus Mistral Vibe sont toujours en cours d'exécution. Arrêt..."
    pkill -f "mistral"
    echo "Processus arrêtés."
else
    echo "Aucun processus Mistral Vibe en cours d'exécution."
fi

echo "Désinstallation de Mistral Vibe terminée."
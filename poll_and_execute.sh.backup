#!/bin/bash

# URLs
GET_URL="https://n8n.stedzstudio.com/webhook/55d8dd78-0af8-47c2-83e5-12e34e7e7de5"
POST_URL="https://n8n.stedzstudio.com/webhook/83a6a321-5d93-4faa-94e8-dafad0f4c9e9"

# Fonction pour appeler l'URL et traiter la réponse
process_webhook() {
    # Appel GET à l'URL
    response=$(curl -s "$GET_URL")
    
    # Vérification si la réponse est valide
    if [ -z "$response" ]; then
        echo "Erreur: Aucune réponse reçue"
        return 1
    fi
    
    # Extraction des valeurs action et id
    action=$(echo "$response" | jq -r '.action')
    id=$(echo "$response" | jq -r '.id')
    
    # Vérification si les valeurs sont présentes
    if [ -z "$action" ] || [ -z "$id" ]; then
        echo "Erreur: Réponse JSON invalide"
        return 1
    fi
    
    echo "Action prête"
    
    # Exécution de la commande vibe
    echo "Exécution de la commande: vibe -p "
    vibe -p "$action" --output streaming
    sleep 10
    vibe -p "commit"
    
    # Vérification du statut de la commande
    if [ $? -eq 0 ]; then
        echo "Commande exécutée avec succès"
        
        # Appel POST à la deuxième URL avec l'ID
        echo "Envoi de l'ID $id à $POST_URL"
        curl -s -X POST "$POST_URL" -H "Content-Type: application/json" -d "{\"id\": \"$id\"}"
        
        if [ $? -eq 0 ]; then
            echo "ID envoyé avec succès"
        else
            echo "Erreur: Échec de l'envoi de l'ID"
        fi
    else
        echo "Erreur: Échec de l'exécution de la commande vibe"
    fi
}

# Boucle principale
while true; do
    echo "Appel à l'URL: $GET_URL"
    process_webhook
    
    # Attente d'une minute avant le prochain appel
    sleep 60
 done
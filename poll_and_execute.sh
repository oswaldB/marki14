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

    # Création du fichier fiche-implementation-id.md
    fiche_file="${id}-fiche-user-story.md"
    implementation_file="${id}-ficher-implementation.md"
    echo "Création du fichier: $fiche_file"
    echo "$action" > "$fiche_file"

    # Exécution de la commande vibe avec le fichier créé
    echo "Exécution de la commande: travail preparatoir"
    vibe -p "Ton role est de créer  $implementation_file à destination des développeurs. Tu assures que les users stories que tu reçoies sont conforme à la réalité du projet. Après avoir effectué le travail preparatoire, tu crée un fichier $implementation_file dans le quel tu défins une todo liste de toutes les actions à faire dans chacun des fichiers pour développer ce use case. Important tu suis les guides et le modèle data que tu as dans data-model.md" --output streaming
    sleep 10
    vibe -p "Ton role est de vérifier que l $implementation_file à destination des développeurs respecte bien tous les précepts des guides. Si non, tu corriges." --output streaming
    sleep 10
    echo "Appel à l'URL: $GET_URL"
    process_webhook
    vibe -p "Développe : $implementation_file. Après chaque développement met à jour la fiche d'implémentation " --output streaming
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
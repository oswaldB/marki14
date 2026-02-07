#!/bin/bash
# call_populateRelanceSequence.sh - Script shell pour appeler l'API Parse
# Appelle la fonction populateRelanceSequence avec l'ID de séquence uIu3bFRuix

echo "************************************************************************"
echo "Appel de populateRelanceSequence"
echo "Pour la séquence uIu3bFRuix"
echo "************************************************************************"
echo ""

# Configuration
APPLICATION_ID="marki"
SERVER_URL="https://dev.parse.markidiags.com"
SEQUENCE_ID="uIu3bFRuix"
SESSION_TOKEN="r:399ca1bfd1dc6472fa594c4758427baa"
REST_API_KEY="Careless7-Gore4-Guileless0-Jogger5-Clubbed9"

# Vérifier si curl est installé
echo "Vérification de curl..."
if ! command -v curl &> /dev/null; then
    echo "ERREUR: curl n'est pas installé"
    echo "Veuillez installer curl avec: sudo apt-get install curl (Debian/Ubuntu)"
    echo "ou: sudo yum install curl (CentOS/RHEL)"
    exit 1
fi

echo "curl est installé, version:"
curl --version | head -n 1
echo ""

# Appeler l'API Parse Cloud Function
echo "Appel de la fonction populateRelanceSequence..."
echo "URL: $SERVER_URL/functions/populateRelanceSequence"
echo "Paramètres: {\"idSequence\": \"$SEQUENCE_ID\"}"
echo ""

RESPONSE=$(curl -s -X POST \
  -H "X-Parse-Application-Id: $APPLICATION_ID" \
  -H "X-Parse-REST-API-Key: $REST_API_KEY" \
  -H "X-Parse-Session-Token: $SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"idSequence\": \"$SEQUENCE_ID\"}" \
  "$SERVER_URL/functions/populateRelanceSequence")

# Vérifier si la requête a réussi
if [ $? -ne 0 ]; then
    echo "ERREUR: La requête curl a échoué"
    exit 1
fi

# Afficher la réponse
echo "Réponse brute:"
echo "$RESPONSE"
echo ""

# Essayer de parser la réponse JSON pour un affichage plus lisible
if command -v jq &> /dev/null; then
    echo "Analyse de la réponse avec jq..."
    echo ""
    
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success // "false"')
    MESSAGE=$(echo "$RESPONSE" | jq -r '.message // "Aucun message"')
    PROCESSED=$(echo "$RESPONSE" | jq -r '.processed // "0"')
    CREATED=$(echo "$RESPONSE" | jq -r '.created // "0"')
    UPDATED=$(echo "$RESPONSE" | jq -r '.updated // "0"')
    
    echo "Résultats:"
    echo "- Succès: $SUCCESS"
    echo "- Message: $MESSAGE"
    echo "- Impayés traités: $PROCESSED"
    echo "- Relances créées: $CREATED"
    echo "- Relances mises à jour: $UPDATED"
else
    echo "jq n'est pas installé, affichage de la réponse brute"
    echo "Pour une meilleure analyse, installez jq: sudo apt-get install jq"
fi

echo ""
echo "************************************************************************"
echo "Appel terminé!"
echo "************************************************************************"
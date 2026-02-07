# Script shell pour appeler populateRelanceSequence

Ce script utilise curl pour appeler directement l'API REST de Parse Server et exécuter la fonction `populateRelanceSequence` avec l'ID de séquence `uIu3bFRuix`.

## Fichier inclus

- `call_populateRelanceSequence.sh` - Script shell principal

## Configuration

Le script est configuré avec les paramètres suivants :
- **Application ID**: `marki`
- **Server URL**: `https://dev.parse.markidiags.com/parse`
- **Sequence ID**: `uIu3bFRuix`
- **Session Token**: `r:399ca1bfd1dc6472fa594c4758427baa`
- **REST API Key**: `Careless7-Gore4-Guileless0-Jogger5-Clubbed9`

> ⚠️ **Important**: Le token de session et la clé REST API sont nécessaires pour l'authentification. Si ces informations expirent ou deviennent invalides, vous devrez les mettre à jour dans le script.

## Prérequis

1. **curl** installé (généralement préinstallé sur Linux/Mac)
2. **jq** installé (optionnel, pour une meilleure analyse des résultats)
3. Accès internet pour atteindre le serveur Parse

## Installation des prérequis

### Sur Debian/Ubuntu:
```bash
sudo apt-get update
sudo apt-get install curl jq
```

### Sur CentOS/RHEL:
```bash
sudo yum install curl jq
```

### Sur Mac (si curl n'est pas installé):
```bash
brew install curl jq
```

## Utilisation

1. Rendez le script exécutable (déjà fait, mais si besoin):
```bash
chmod +x call_populateRelanceSequence.sh
```

2. Exécutez le script:
```bash
./call_populateRelanceSequence.sh
```

## Sortie attendue

Le script affichera:
1. Les informations de configuration
2. La réponse brute de l'API
3. Si jq est installé, une analyse structurée des résultats

Exemple de sortie réussie:
```
============================================
Appel de populateRelanceSequence
Pour la séquence uIu3bFRuix
============================================

Vérification de curl...
curl est installé, version: curl 7.68.0

Appel de la fonction populateRelanceSequence...
URL: https://dev.parse.markidiags.com/parse/functions/populateRelanceSequence
Paramètres: {"idSequence": "uIu3bFRuix"}

Réponse brute:
{"success":true,"message":"Relances peuplées avec succès","processed":5,"created":3,"updated":2}

Analyse de la réponse avec jq...

Résultats:
- Succès: true
- Message: Relances peuplées avec succès
- Impayés traités: 5
- Relances créées: 3
- Relances mises à jour: 2

============================================
Appel terminé!
============================================
```

## Personnalisation

Pour utiliser un autre ID de séquence ou token:
1. Modifiez le fichier `call_populateRelanceSequence.sh`
2. Changez les variables correspondantes:
   - `SEQUENCE_ID` pour l'ID de la séquence
   - `SESSION_TOKEN` pour le token d'authentification
   - `REST_API_KEY` pour la clé REST API
   - `APPLICATION_ID` ou `SERVER_URL` si nécessaire

## Résolution des problèmes

### Erreur: "unauthorized"
Vérifiez que le token de session et la clé REST API sont valides et n'ont pas expiré. Vous pouvez obtenir de nouvelles informations d'authentification en vous connectant via l'API Parse.

### Erreur: curl n'est pas installé
Installez curl comme indiqué dans la section "Installation des prérequis".

### Erreur: La requête curl a échoué
- Vérifiez votre connexion internet
- Assurez-vous que l'URL du serveur Parse est correcte
- Vérifiez que le serveur Parse est accessible

### Pour voir plus de détails sur l'erreur
Modifiez temporairement le script en remplaçant `-s` par `-v` dans la commande curl pour voir les détails de la requête.

## Notes de sécurité

⚠️ **Important**: Le token de session et la clé REST API sont sensibles. Ne partagez pas ce script avec des personnes non autorisées et ne le commitez pas dans des dépôts publics.
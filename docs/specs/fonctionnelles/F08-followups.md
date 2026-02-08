# F08 : Peuplement des Relances à partir des Impayés

## Contexte
Automatiser la création et la gestion des relances (follow-ups) pour les impayés en fonction des séquences de relance définies. Ce processus permet de planifier et exécuter automatiquement les communications avec les débiteurs selon les stratégies configurées.

## Acteurs
- **Système automatisé** : Exécution des relances selon les séquences
- **Gestionnaires de recouvrement** : Surveillance et ajustement
- **Responsables financiers** : Analyse des performances
- **Administrateurs** : Configuration et maintenance

## Fonctionnalités Clés

### 1. Génération des Relances
- **Création automatique** : Basée sur les séquences actives
- **Planification** : Selon les délais configurés
- **Personnalisation** : Contenu adapté à chaque impayé
- **Optimisation** : Utilisation des meilleures pratiques

### 2. Gestion des Relances
- **Suivi** : État de chaque relance
- **Historique** : Journal des communications
- **Statistiques** : Performances et métriques
- **Alertes** : Notifications pour les actions requises

### 3. Types de Relances
- **Relances simples** : Un impayé par relance
- **Relances groupées** : Plusieurs impayés pour un même payeur
- **Relances automatisées** : Déclenchées par le système
- **Relances manuelles** : Initiées par les utilisateurs

### 4. Intégration avec les Séquences
- **Mappage** : Association relances-séquences
- **Synchronisation** : Mise à jour en temps réel
- **Validation** : Vérification des règles
- **Exécution** : Déclenchement selon le planning

### 5. Reporting et Analyse
- **Tableaux de bord** : Vue d'ensemble des relances
- **Métriques** : Taux de succès et performances
- **Export** : Données pour analyse externe
- **Alertes** : Notifications pour les anomalies

## Critères d'Acceptation

### Fonctionnel
- Génération automatique des relances
- Association correcte avec les séquences
- Planification selon les délais
- Personnalisation du contenu
- Suivi complet des relances

### Performance
- Génération de 100 relances < 10 secondes
- Pas de blocage du système
- Optimisé pour les grands volumes
- Gestion efficace des erreurs

### UX/UI
- Visualisation claire des relances
- Filtres et tris fonctionnels
- Export des données
- Notifications en temps réel

### Sécurité
- Validation des données
- Protection contre les injections
- Gestion sécurisée des erreurs
- Audit des actions

### Robustesse
- Gestion des erreurs de génération
- Fallback pour les échecs
- Validation des résultats
- Résistant aux manipulations

## Cas d'Usage

### Cas 1: Génération automatique pour une séquence
1. Système détecte une séquence active
2. Identifie les impayés associés
3. Génère les relances selon les actions
4. Planifie les envois selon les délais
5. Met à jour l'état des relances

### Cas 2: Relances groupées pour un payeur
1. Système identifie plusieurs impayés pour un payeur
2. Génère une relance groupée
3. Personnalise le contenu
4. Planifie l'envoi
5. Met à jour les états

### Cas 3: Exécution des relances planifiées
1. Système vérifie les relances planifiées
2. Filtre les relances à envoyer
3. Génère le contenu final
4. Envoie les communications
5. Met à jour les états

### Cas 4: Surveillance et ajustement
1. Utilisateur accède au tableau de bord
2. Visualise les relances en cours
3. Ajuste les paramètres si nécessaire
4. Relance la génération
5. Vérifie les résultats

## Exemples de Données

### Structure d'une Relance
```json
{
  "objectId": "rel123",
  "impayeId": "imp456",
  "sequenceId": "seq789",
  "actionIndex": 0,
  "emailSubject": "Rappel - Facture FACT-001 impayée",
  "emailBody": "Bonjour Monsieur Dupont,...",
  "emailTo": "client@example.com",
  "emailCc": "responsable@example.com",
  "sendDate": "2024-03-01T09:00:00Z",
  "isSent": false,
  "sentAt": null,
  "isMultiple": false,
  "multipleImpayesCount": 0,
  "generatedBy": "system",
  "createdAt": "2024-02-20T14:30:00Z",
  "updatedAt": "2024-02-20T14:30:00Z"
}
```

### Relance Groupée
```json
{
  "objectId": "rel456",
  "impayeId": "imp789", // Premier impayé du groupe
  "sequenceId": "seq123",
  "actionIndex": 1,
  "emailSubject": "Rappel - 3 factures impayées pour un montant total de 4500,00 €",
  "emailBody": "Bonjour Monsieur Dupont,\n\nNous vous rappelons que 3 de vos factures sont impayées:\n- FACT-001: 1500,00 €\n- FACT-002: 2000,00 €\n- FACT-003: 1000,00 €\n\nMontant total: 4500,00 €\n\nMerci de régulariser...",
  "emailTo": "client@example.com",
  "isMultiple": true,
  "multipleImpayesCount": 3,
  "multipleImpayesIds": "imp789,imp790,imp791",
  "sendDate": "2024-03-05T09:00:00Z",
  "isSent": false
}
```

### Statistiques de Relances
```json
{
  "totalRelances": 42,
  "relancesEnvoyees": 12,
  "relancesPlanifiees": 30,
  "tauxSucces": 0.75,
  "moyenneDelai": 3.2,
  "relancesParSequence": {
    "seq123": 15,
    "seq456": 27
  },
  "performanceParType": {
    "email": {
      "tauxOuverture": 0.85,
      "tauxReponse": 0.60
    },
    "sms": {
      "tauxOuverture": 0.95,
      "tauxReponse": 0.45
    }
  }
}
```

## Priorité et Complexité
- **Priorité**: Élevée
- **Complexité**: Élevée
- **Effort estimé**: 24-32 heures
- **Dépendances**: Parse SDK, Email Service, AI Service
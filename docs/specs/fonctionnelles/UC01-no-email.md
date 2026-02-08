# UC01 : Gestion des Impayés sans Email

## Contexte
Gérer les impayés pour lesquels aucune adresse email n'est disponible, en proposant des solutions alternatives pour le recouvrement et en permettant la mise à jour des informations de contact.

## Acteurs
- **Gestionnaires de recouvrement** : Identification et traitement
- **Service client** : Mise à jour des informations
- **Responsables financiers** : Décision sur les actions alternatives

## Use Case Principal

### Scénario Nominal
1. **Identification** : Le système identifie les impayés sans email
2. **Notification** : Notification aux gestionnaires
3. **Actions alternatives** : Proposition de solutions (SMS, courrier, appel)
4. **Mise à jour** : Possibilité de mettre à jour l'email
5. **Suivi** : Historique des actions entreprises

### Scénario Alternatif
1. **Aucune solution** : Si aucune alternative n'est possible
2. **Escalade** : Transmission aux responsables
3. **Archivage** : Si aucune action n'est possible

## Fonctionnalités Clés

### 1. Identification Automatique
- **Filtrage** : Détection des impayés sans email
- **Notification** : Alertes pour les gestionnaires
- **Liste dédiée** : Vue spécifique des impayés sans email

### 2. Actions Alternatives
- **SMS** : Envoi de messages texte
- **Courrier** : Génération de lettres
- **Appel** : Intégration avec système téléphonique
- **Autres** : Solutions personnalisées

### 3. Mise à Jour des Informations
- **Formulaire** : Interface de mise à jour
- **Validation** : Vérification des emails
- **Historique** : Traçabilité des modifications

### 4. Reporting et Suivi
- **Tableau de bord** : Vue des impayés sans email
- **Statistiques** : Taux de résolution
- **Export** : Données pour analyse

## Critères d'Acceptation

### Fonctionnel
- Identification correcte des impayés sans email
- Proposition d'actions alternatives
- Mise à jour des informations fonctionnelle
- Suivi complet des actions

### Performance
- Identification < 1 seconde
- Chargement de la liste < 2 secondes
- Mise à jour < 500ms

### UX/UI
- Interface claire pour les actions
- Feedback visuel pour les mises à jour
- Messages d'erreur compréhensibles

### Sécurité
- Validation des emails mis à jour
- Protection des données
- Audit des modifications

## Exemples de Données

### Impayé sans Email
```json
{
  "objectId": "imp123",
  "nfacture": "FACT-001",
  "payeur_nom": "Dupont Jean",
  "payeur_email": null,
  "payeur_telephone": "+33123456789",
  "resteapayer": 1500.00,
  "statut": "sans_email",
  "actions_alternatives": [
    {
      "type": "sms",
      "statut": "envoyé",
      "date": "2024-02-20"
    },
    {
      "type": "appel",
      "statut": "planifié",
      "date": "2024-02-22"
    }
  ],
  "dernière_tentative": "2024-02-20",
  "notes": "Client contacté par téléphone, promesse de fournir un email"
}
```

### Action Alternative
```json
{
  "impayeId": "imp123",
  "type": "sms",
  "contenu": "Bonjour, votre facture FACT-001 est impayée. Montant: 1500€. Merci de régulariser.",
  "destinataire": "+33123456789",
  "statut": "envoyé",
  "date": "2024-02-20T10:30:00Z",
  "resultat": "success"
}
```

## Priorité et Complexité
- **Priorité** : Moyenne
- **Complexité** : Moyenne
- **Effort estimé** : 8-12 heures
- **Dépendances** : Parse SDK, SMS Service, Email Service
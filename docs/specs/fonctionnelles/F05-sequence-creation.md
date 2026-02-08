# F05 : Création de Séquences de Relance

## Contexte
Permettre aux utilisateurs de créer des séquences de relance personnalisées pour automatiser le processus de recouvrement des impayés. Les séquences définissent une série d'actions (principalement des emails) qui seront exécutées selon un calendrier prédéfini.

## Acteurs
- **Gestionnaires de recouvrement** : Création des séquences selon les politiques de l'entreprise
- **Responsables financiers** : Définition des stratégies de relance
- **Administrateurs** : Configuration des séquences système

## Fonctionnalités Clés

### 1. Création Basique
- **Formulaire de création** : Interface intuitive
- **Champs obligatoires** : Nom de la séquence
- **Champs optionnels** : Description, type
- **Validation en temps réel** : Feedback immédiat
- **Prévisualisation** : Aperçu avant sauvegarde

### 2. Types de Séquences
- **Séquence Normale** : Manuel, pour cas spécifiques
- **Séquence Automatique** : Appliquée automatiquement selon des règles
- **Séquence Hybride** : Combinaison des deux approches

### 3. Paramètres Avancés
- **Statut initial** : Active ou inactive
- **Visibilité** : Privée ou partagée
- **Catégorisation** : Par type de client, montant, etc.
- **Priorité** : Niveau d'urgence

### 4. Gestion des Actions
- **Ajout d'actions** : Interface dédiée
- **Types d'actions** : Email, SMS, notification
- **Planification** : Délais entre les actions
- **Personnalisation** : Contenu dynamique
- **Ordre** : Réorganisation par glisser-déposer

### 5. Intégration AI
- **Génération automatique** : Suggestions basées sur l'historique
- **Optimisation** : Recommandations pour améliorer les taux de succès
- **Analyse** : Prédiction des performances

## Critères d'Acceptation

### Fonctionnel
- Création réussie avec tous les champs valides
- Validation appropriée des entrées
- Persistence des données
- Intégration avec le système existant
- Feedback utilisateur clair

### Performance
- Temps de création < 1 seconde
- Temps de sauvegarde < 500ms
- Pas de blocage de l'interface
- Chargement des options < 300ms

### UX/UI
- Interface intuitive et responsive
- Guidage utilisateur clair
- Messages d'erreur compréhensibles
- Design cohérent avec l'application
- Accessibilité complète

### Sécurité
- Validation côté client et serveur
- Protection contre les injections
- Gestion sécurisée des erreurs
- Audit des actions

### Robustesse
- Gestion des erreurs réseau
- Fallback pour les données manquantes
- Validation des entrées
- Résistant aux manipulations

## Cas d'Usage

### Cas 1: Création d'une séquence normale
1. Utilisateur clique sur "Créer séquence"
2. Sélectionne "Type: Normal"
3. Remplit le nom et la description
4. Ajoute des actions manuellement
5. Configure les délais
6. Sauvegarde la séquence
7. Reçoit confirmation

### Cas 2: Création d'une séquence automatique
1. Utilisateur clique sur "Créer séquence"
2. Sélectionne "Type: Automatique"
3. Définir les règles d'application
4. Configure les conditions
5. Ajoute des actions automatisées
6. Active la séquence
7. Système applique automatiquement

### Cas 3: Création avec assistance AI
1. Utilisateur clique sur "Créer séquence"
2. Sélectionne "Génération AI"
3. Définir les paramètres (type de client, ton)
4. AI génère une séquence suggérée
5. Utilisateur révise et ajuste
6. Sauvegarde la séquence

### Cas 4: Création rapide
1. Utilisateur clique sur "Créer séquence"
2. Utilise un template prédéfini
3. Personnalise les éléments clés
4. Sauvegarde rapidement
5. Déploiement immédiat

## Exemples de Données

### Séquence de Base
```json
{
  "nom": "Relance Standard Particulier",
  "description": "Séquence de relance pour les clients particuliers avec délais progressifs",
  "type": "normal",
  "isActif": true,
  "isAuto": false,
  "categorie": "particulier",
  "priorite": "moyenne",
  "actions": [
    {
      "type": "email",
      "delai": 0,
      "sujet": "Rappel courtois - Facture [[nfacture]]",
      "contenu": "Bonjour [[payeur_nom]],...",
      "expediteur": "comptable@example.com"
    },
    {
      "type": "email",
      "delai": 7,
      "sujet": "Second rappel - Facture [[nfacture]]",
      "contenu": "Bonjour [[payeur_nom]],...",
      "expediteur": "comptable@example.com"
    }
  ],
  "createdAt": "2024-02-20T10:00:00Z",
  "createdBy": "user123"
}
```

### Paramètres de Génération AI
```json
{
  "typeClient": "particulier",
  "ton": "professionnel",
  "niveauUrgence": "moyen",
  "nombreEtapes": 5,
  "delaiMax": 30,
  "langue": "fr",
  "devise": "EUR",
  "inclureJuridique": false
}
```

## Priorité et Complexité
- **Priorité**: Haute (fonctionnalité core)
- **Complexité**: Moyenne
- **Effort estimé**: 12-16 heures
- **Dépendances**: Parse SDK, Alpine.js, AI Service
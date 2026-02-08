# F09 : Affichage des Impayés par Payeur

## Contexte
Fournir une vue consolidée des impayés regroupés par payeur pour permettre une gestion efficace des recouvrements. Cette fonctionnalité permet aux utilisateurs de visualiser l'ensemble des factures impayées pour chaque client et d'appliquer des actions groupées.

## Acteurs
- **Gestionnaires de recouvrement** : Gestion quotidienne des impayés
- **Responsables financiers** : Analyse des risques par client
- **Service client** : Communication avec les payeurs
- **Comptables** : Suivi des soldes et reporting

## Fonctionnalités Clés

### 1. Vue Groupée par Payeur
- **Regroupement automatique** : Tous les impayés d'un même payeur
- **Affichage hiérarchique** : Payeur → Liste des impayés
- **Informations consolidées** : Solde total, nombre de factures
- **Statistiques** : Délai moyen, montant total

### 2. Filtres et Tris
- **Filtres avancés** : Par type de payeur, montant, délai
- **Tris multiples** : Par montant, date, délai
- **Recherche globale** : Dans tous les champs
- **Filtres rapides** : Prédéfini pour les cas courants

### 3. Actions Groupées
- **Application de séquences** : À tous les impayés d'un payeur
- **Communication groupée** : Email unique pour plusieurs factures
- **Mise à jour massive** : Statut, commentaires
- **Export des données** : Pour analyse externe

### 4. Détails des Impayés
- **Informations complètes** : Montant, date, référence
- **Historique** : Communications et actions
- **Documents associés** : Factures PDF, contrats
- **Notes et commentaires** : Suivi des interactions

### 5. Visualisation et Reporting
- **Tableaux de bord** : Vue d'ensemble par payeur
- **Graphiques** : Répartition des montants et délais
- **Export** : Formats CSV, Excel, PDF
- **Partage** : Rapports avec d'autres utilisateurs

## Critères d'Acceptation

### Fonctionnel
- Regroupement correct des impayés par payeur
- Affichage des informations consolidées
- Filtres et tris fonctionnels
- Actions groupées opérationnelles
- Export des données valide

### Performance
- Chargement initial < 2 secondes
- Filtrage et tri < 500ms
- Export des données < 3 secondes
- Pas de blocage de l'interface

### UX/UI
- Interface intuitive et responsive
- Navigation fluide entre les groupes
- Visualisation claire des données
- Feedback visuel pour les actions
- Design cohérent

### Sécurité
- Accès contrôlé aux données
- Protection des informations sensibles
- Gestion sécurisée des erreurs
- Audit des actions

### Robustesse
- Gestion des erreurs de chargement
- Fallback pour les données manquantes
- Validation des entrées
- Résistant aux manipulations

## Cas d'Usage

### Cas 1: Visualisation des impayés d'un payeur
1. Utilisateur accède à la vue "Groupé par payeur"
2. Système affiche la liste des payeurs
3. Utilisateur sélectionne un payeur
4. Système affiche tous les impayés du payeur
5. Informations consolidées affichées

### Cas 2: Application d'une séquence groupée
1. Utilisateur sélectionne un payeur
2. Clique sur "Appliquer une séquence"
3. Sélectionne une séquence dans la liste
4. Système applique la séquence à tous les impayés
5. Confirmation affichée

### Cas 3: Export des données pour analyse
1. Utilisateur filtre les payeurs
2. Clique sur "Exporter"
3. Sélectionne le format (CSV, Excel)
4. Système génère le fichier
5. Fichier téléchargé

### Cas 4: Communication groupée
1. Utilisateur sélectionne un payeur
2. Clique sur "Envoyer un email groupé"
3. Système génère un email avec tous les impayés
4. Utilisateur personnalise le message
5. Email envoyé au payeur

## Exemples de Données

### Structure d'un Groupe de Payeur
```json
{
  "payeurId": "pay123",
  "payeurNom": "Dupont Jean",
  "payeurEmail": "jean.dupont@example.com",
  "payeurType": "particulier",
  "payeurTelephone": "+33123456789",
  "payeurAdresse": "1 rue de la Paix, 75000 Paris",
  "impayes": [
    {
      "impayeId": "imp456",
      "nfacture": "FACT-001",
      "montant": 1500.00,
      "devise": "EUR",
      "dateEcheance": "2024-01-15",
      "joursRetard": 30,
      "sequenceId": "seq789",
      "sequenceNom": "Relance Standard",
      "statut": "en_cours",
      "dernièreAction": "2024-02-10"
    },
    {
      "impayeId": "imp789",
      "nfacture": "FACT-002",
      "montant": 2500.00,
      "devise": "EUR",
      "dateEcheance": "2024-01-20",
      "joursRetard": 25,
      "sequenceId": "seq789",
      "sequenceNom": "Relance Standard",
      "statut": "en_cours",
      "dernièreAction": "2024-02-10"
    }
  ],
  "soldeTotal": 4000.00,
  "nombreImpayes": 2,
  "delaiMoyen": 27.5,
  "dernièreCommunication": "2024-02-10",
  "notes": "Client contacté par téléphone le 10/02"
}
```

### Statistiques Consolidées
```json
{
  "payeurId": "pay123",
  "statistiques": {
    "soldeTotal": 4000.00,
    "nombreImpayes": 2,
    "delaiMoyen": 27.5,
    "delaiMax": 30,
    "montantMoyen": 2000.00,
    "montantMax": 2500.00,
    "premierImpaye": "2024-01-15",
    "dernierImpaye": "2024-01-20",
    "joursDepuisPremier": 35,
    "tauxRecouvrement": 0.0
  },
  "historique": [
    {
      "date": "2024-02-10",
      "action": "email",
      "utilisateur": "user123",
      "resultat": "envoyé"
    },
    {
      "date": "2024-02-05",
      "action": "appel",
      "utilisateur": "user456",
      "resultat": "sans réponse"
    }
  ]
}
```

### Paramètres de Filtre
```json
{
  "typePayeur": ["particulier", "professionnel"],
  "montantMin": 1000.00,
  "delaiMin": 30,
  "statut": ["en_cours", "à_reparer"],
  "dateDebut": "2024-01-01",
  "dateFin": "2024-02-28",
  "tri": "montant",
  "ordre": "desc",
  "recherche": "Dupont"
}
```

## Priorité et Complexité
- **Priorité**: Moyenne à Élevée
- **Complexité**: Moyenne
- **Effort estimé**: 12-16 heures
- **Dépendances**: Parse SDK, Alpine.js, Tailwind CSS
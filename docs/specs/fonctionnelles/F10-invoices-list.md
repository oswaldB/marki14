# F10 : Affichage des Impayés en Liste

## Contexte
Fournir une vue détaillée et flexible de tous les impayés sous forme de liste, permettant aux utilisateurs de visualiser, filtrer, trier et gérer individuellement chaque facture impayée. Cette vue complète l'affichage groupé en offrant une granularité plus fine pour les opérations individuelles.

## Acteurs
- **Gestionnaires de recouvrement** : Gestion individuelle des impayés
- **Comptables** : Vérification et validation des factures
- **Service client** : Résolution des litiges
- **Responsables financiers** : Analyse détaillée des impayés

## Fonctionnalités Clés

### 1. Liste Détaillée des Impayés
- **Affichage tabulaire** : Toutes les informations en un coup d'œil
- **Colonnes personnalisables** : Adaptation aux besoins utilisateur
- **Pagination** : Gestion des grands volumes de données
- **Recherche instantanée** : Filtre rapide sur tous les champs

### 2. Filtres et Tris Avancés
- **Filtres multiples** : Combinaison de plusieurs critères
- **Tris complexes** : Par plusieurs colonnes
- **Filtres rapides** : Prédéfini pour les cas courants
- **État des filtres** : Persistance de la configuration

### 3. Gestion Individuelle
- **Actions rapides** : Menu contextuel pour chaque impayé
- **Édition en ligne** : Modification directe des champs
- **Historique** : Journal des actions pour chaque impayé
- **Notes** : Ajout de commentaires et annotations

### 4. Visualisation et Export
- **Vues personnalisées** : Sauvegarde des configurations
- **Export flexible** : Formats CSV, Excel, PDF
- **Graphiques intégrés** : Visualisation des tendances
- **Partage** : Lien vers des vues spécifiques

### 5. Intégration avec les Workflows
- **Application de séquences** : Association directe
- **Génération de relances** : Création depuis la liste
- **Communication** : Envoi d'emails individuels
- **Suivi** : Mise à jour des statuts

## Critères d'Acceptation

### Fonctionnel
- Affichage correct de tous les impayés
- Filtres et tris fonctionnels
- Actions individuelles opérationnelles
- Export des données valide
- Intégration avec les workflows

### Performance
- Chargement initial < 1.5 secondes
- Pagination fluide < 300ms
- Filtrage instantané < 200ms
- Export des données < 2 secondes

### UX/UI
- Interface intuitive et responsive
- Navigation fluide dans la liste
- Feedback visuel pour les actions
- Design cohérent avec l'application
- Accessibilité complète

### Sécurité
- Accès contrôlé aux données
- Protection des informations sensibles
- Gestion sécurisée des erreurs
- Audit des actions individuelles

### Robustesse
- Gestion des erreurs de chargement
- Fallback pour les données manquantes
- Validation des entrées
- Résistant aux manipulations

## Cas d'Usage

### Cas 1: Recherche et filtrage d'impayés
1. Utilisateur accède à la liste des impayés
2. Applique un filtre par montant (> 1000€)
3. Trie les résultats par date décroissante
4. Utilise la recherche pour trouver un numéro de facture
5. Sélectionne un impayé pour plus de détails

### Cas 2: Application d'une séquence individuelle
1. Utilisateur identifie un impayé sans séquence
2. Ouvre le menu d'actions
3. Sélectionne "Appliquer une séquence"
4. Choisit une séquence dans la liste
5. Confirme l'application
6. Vérifie que la séquence est appliquée

### Cas 3: Export pour analyse externe
1. Utilisateur filtre les impayés selon des critères
2. Sélectionne les colonnes à exporter
3. Choisit le format (Excel)
4. Lance l'export
5. Télécharge le fichier généré
6. Ouvre le fichier pour vérification

### Cas 4: Mise à jour en masse
1. Utilisateur filtre les impayés à mettre à jour
2. Sélectionne plusieurs impayés
3. Applique une action groupée
4. Vérifie les modifications
5. Sauvegarde les changements

## Exemples de Données

### Structure d'un Impayé en Liste
```json
{
  "objectId": "imp123",
  "nfacture": "FACT-001",
  "payeur_nom": "Dupont Jean",
  "payeur_email": "jean.dupont@example.com",
  "payeur_type": "particulier",
  "payeur_telephone": "+33123456789",
  "resteapayer": 1500.00,
  "totalttcnet": 1800.00,
  "totalhtnet": 1500.00,
  "datepiece": "2024-01-15",
  "reference": "REF-001",
  "sequence_id": "seq456",
  "sequence_name": "Relance Standard",
  "sequence_is_automatic": false,
  "statut": "en_cours",
  "dateDebutMission": "2023-12-01",
  "apporteur_nom": "Agence XYZ",
  "adresse": "1 rue de la Paix, 75000 Paris",
  "dernièreAction": "2024-02-10T14:30:00Z",
  "notes": "Client contacté, promesse de paiement",
  "historique": [
    {
      "date": "2024-02-10",
      "action": "email",
      "utilisateur": "user123",
      "resultat": "envoyé"
    }
  ]
}
```

### Configuration de la Liste
```json
{
  "colonnesVisibles": [
    "nfacture",
    "payeur_nom",
    "resteapayer",
    "datepiece",
    "joursRetard",
    "sequence_name",
    "statut"
  ],
  "colonnesOrdre": [
    "nfacture",
    "payeur_nom",
    "resteapayer",
    "datepiece",
    "joursRetard",
    "sequence_name",
    "statut"
  ],
  "tri": {
    "colonne": "datepiece",
    "direction": "desc"
  },
  "filtres": {
    "montantMin": 1000,
    "delaiMin": 30,
    "statut": ["en_cours"],
    "recherche": "Dupont"
  },
  "pagination": {
    "page": 1,
    "parPage": 50
  }
}
```

### Paramètres d'Export
```json
{
  "format": "excel",
  "colonnes": [
    "nfacture",
    "payeur_nom",
    "payeur_email",
    "resteapayer",
    "datepiece",
    "joursRetard",
    "sequence_name",
    "statut",
    "notes"
  ],
  "filtres": {
    "dateDebut": "2024-01-01",
    "dateFin": "2024-02-28",
    "statut": ["en_cours", "à_reparer"]
  },
  "tri": {
    "colonne": "resteapayer",
    "direction": "desc"
  },
  "nomFichier": "impayes_2024_02_20"
}
```

## Priorité et Complexité
- **Priorité**: Moyenne
- **Complexité**: Moyenne
- **Effort estimé**: 10-14 heures
- **Dépendances**: Parse SDK, Alpine.js, Tailwind CSS
# F04 : Affichage et Gestion des Séquences

## Contexte
Permettre aux utilisateurs de visualiser, créer, modifier et gérer les séquences de relance automatisées pour le recouvrement des impayés. Les séquences définissent les étapes et le timing des communications avec les débiteurs.

## Acteurs
- **Gestionnaires de recouvrement** : Création et gestion des séquences
- **Responsables financiers** : Surveillance et optimisation des séquences
- **Administrateurs** : Configuration avancée et maintenance

## Fonctionnalités Clés

### 1. Liste des Séquences
- **Affichage en grille** : Vue responsive des séquences
- **Cartes informatives** : Aperçu des propriétés clés
- **Filtrage** : Par type, statut, date de création
- **Tri** : Par nom, date, nombre d'actions
- **Recherche** : Fonctionnalité de recherche globale

### 2. Détails des Séquences
- **Informations de base** : Nom, description, type
- **Statut** : Active/Inactive avec toggle
- **Type** : Normale vs Automatique
- **Actions** : Liste des étapes de la séquence
- **Statistiques** : Nombre d'actions, dernière exécution

### 3. Création de Séquences
- **Formulaire de création** : Nom, description, type
- **Validation** : Champs obligatoires et format
- **Types de séquences** : Normale ou automatique
- **État initial** : Active par défaut
- **Feedback** : Confirmation de création

### 4. Gestion des Séquences
- **Modification** : Édition des propriétés
- **Activation/Désactivation** : Toggle de statut
- **Duplication** : Création de copies
- **Suppression** : Avec confirmation
- **Export** : Format JSON/CSV (futur)

### 5. Actions des Séquences
- **Visualisation** : Liste des étapes
- **Création** : Ajout de nouvelles actions
- **Modification** : Édition des actions existantes
- **Réorganisation** : Changement d'ordre
- **Suppression** : Retrait d'actions

## Critères d'Acceptation

### Fonctionnel
- Affichage correct de toutes les séquences
- Création réussie avec validation
- Modification et suppression fonctionnelles
- Filtrage et tri opérationnels
- Persistence des données

### Performance
- Chargement initial < 1 seconde
- Création/modification < 500ms
- Affichage des détails < 300ms
- Pas de blocage de l'UI

### UX/UI
- Interface intuitive et responsive
- Feedback visuel pour toutes les actions
- Messages d'erreur clairs
- Design cohérent avec l'application
- Accessibilité complète

### Sécurité
- Validation côté client et serveur
- Protection contre les injections
- Gestion sécurisée des erreurs
- Audit des actions sensibles

### Robustesse
- Gestion des erreurs réseau
- Fallback pour les données manquantes
- Validation des entrées
- Résistant aux manipulations

## Cas d'Usage

### Cas 1: Création d'une nouvelle séquence
1. Utilisateur clique sur "Créer une séquence"
2. Remplit le formulaire (nom, description)
3. Sélectionne le type (normale/automatique)
4. Clique sur "Créer"
5. Système valide et sauvegarde
6. Redirection vers la liste
7. Nouvelle séquence apparaît dans la liste

### Cas 2: Visualisation des détails
1. Utilisateur clique sur une séquence
2. Page de détails s'affiche
3. Informations de base affichées
4. Liste des actions visible
5. Statistiques disponibles

### Cas 3: Modification d'une séquence
1. Utilisateur ouvre les détails
2. Clique sur "Modifier"
3. Modifie les champs nécessaires
4. Sauvegarde les changements
5. Confirmation affichée

### Cas 4: Suppression d'une séquence
1. Utilisateur sélectionne une séquence
2. Clique sur "Supprimer"
3. Confirmation demandée
4. Suppression effectuée
5. Liste mise à jour

## Exemples de Données

### Structure d'une Séquence
```json
{
  "objectId": "seq123",
  "nom": "Relance Standard",
  "description": "Séquence de relance pour les clients particuliers",
  "isActif": true,
  "isAuto": false,
  "actions": [
    {
      "type": "email",
      "delay": 0,
      "subject": "Rappel - Facture [[nfacture]] impayée",
      "message": "Bonjour [[payeur_nom]],...",
      "senderEmail": "comptable@example.com"
    },
    {
      "type": "email",
      "delay": 7,
      "subject": "Second rappel - Facture [[nfacture]]",
      "message": "Bonjour [[payeur_nom]],...",
      "senderEmail": "comptable@example.com"
    }
  ],
  "createdAt": "2024-02-20T10:00:00Z",
  "updatedAt": "2024-02-20T14:30:00Z",
  "lastRun": null
}
```

### Action de Séquence
```json
{
  "type": "email",
  "delay": 5,
  "subject": "Rappel urgent - Facture [[nfacture]]",
  "senderEmail": "comptable@example.com",
  "cc": "responsable@example.com",
  "message": "Bonjour [[payeur_nom]],\n\nVotre facture...",
  "isMultipleImpayes": false
}
```

## Priorité et Complexité
- **Priorité**: Haute (fonctionnalité core)
- **Complexité**: Moyenne à Élevée
- **Effort estimé**: 20-24 heures
- **Dépendances**: Parse SDK, Alpine.js, Tailwind CSS
# F03 : Composant Dock Mobile

## Contexte
Fournir une navigation mobile optimisée pour les petits écrans avec un dock rétractable qui offre un accès rapide aux fonctionnalités principales tout en maximisant l'espace d'affichage du contenu.

## Acteurs
- **Utilisateurs mobiles** : Navigation principale sur smartphones et tablettes
- **Utilisateurs occasionnels** : Découverte intuitive des fonctionnalités
- **Utilisateurs avancés** : Accès rapide aux sections fréquentes

## Fonctionnalités Clés

### 1. Dock Rétractable
- **État rétracté** : Barre fine en bas d'écran (12px de haut)
- **État étendu** : Menu complet avec icônes et labels
- **Animation fluide** : Transition douce entre états
- **Indicateur visuel** : Barre indicative pour encourager l'interaction

### 2. Gestion d'État
- **Persistence** : Mémorisation de l'état dans localStorage
- **Initialisation** : Chargement de l'état précédent
- **Synchronisation** : Mise à jour en temps réel
- **Événements** : Notification des changements d'état

### 3. Contenu du Dock
- **Items de navigation** : Accès aux sections principales
- **Icônes + Labels** : Identification claire des fonctionnalités
- **Feedback visuel** : Indication de la section active
- **Scroll horizontal** : Si trop d'items pour l'écran

### 4. Interactions
- **Toggle manuel** : Bouton pour étendre/rétracter
- **Geste tactile** : Glisser pour étendre (futur)
- **Clique externe** : Fermeture automatique
- **Navigation clavier** : Accessibilité complète

### 5. Intégration avec le Layout
- **Padding dynamique** : Ajustement du contenu principal
- **Événements personnalisés** : Communication avec le layout
- **Responsive** : Adaptation aux différentes tailles d'écran
- **Performance** : Pas d'impact sur les performances globales

## Critères d'Acceptation

### Fonctionnel
- Dock rétractable fonctionnel sur mobile
- Persistence de l'état entre les pages
- Navigation fluide entre les sections
- Intégration transparente avec le layout
- Accessibilité complète (clavier, lecteurs d'écran)

### Performance
- Temps d'animation < 300ms
- Pas de reflow layout pendant les transitions
- Impact mémoire minimal
- Optimisé pour 60 FPS

### UX/UI
- Design cohérent avec l'application
- Animations naturelles et fluides
- Feedback visuel pour toutes les interactions
- Indicateur clair pour l'interaction
- Adapté à toutes les tailles d'écran mobile

### Accessibilité
- Navigation clavier complète
- Tous les éléments ont des labels
- Contraste suffisant
- Compatible avec les lecteurs d'écran
- Pas de pièges au clavier

### Robustesse
- Gestion des erreurs de rendu
- Fallback pour les navigateurs anciens
- Dégradation gracieuse
- Résistant aux manipulations DOM

## Cas d'Usage

### Cas 1: Première utilisation
1. Utilisateur arrive sur l'application mobile
2. Dock rétracté en bas d'écran
3. Indicateur visuel clignote légèrement
4. Utilisateur clique sur l'indicateur
5. Dock s'étend avec les options
6. Utilisateur explore les fonctionnalités

### Cas 2: Navigation régulière
1. Utilisateur a déjà utilisé l'application
2. Dock dans l'état précédent (étendu)
3. Utilisateur clique sur "Séquences"
4. Dock se rétracte automatiquement
5. Page des séquences s'affiche
6. Contenu principal ajuste son padding

### Cas 3: Changement de page
1. Utilisateur navigue vers une nouvelle page
2. Dock maintient son état (étendu/rétracté)
3. Contenu principal ajuste son padding
4. Pas de saut visuel désagréable
5. Expérience fluide et cohérente

### Cas 4: Navigation clavier
1. Utilisateur appuie sur Tab
2. Focus se déplace vers le bouton toggle
3. Appuie sur Entrée pour étendre
4. Navigue entre les items avec Tab
5. Appuie sur Échap pour rétracter

## Exemples de Données

### État du Dock (localStorage)
```json
{
  "isCollapsed": false,
  "lastInteraction": "2024-02-20T14:30:00Z",
  "preferredState": "expanded"
}
```

### Structure des Items du Dock
```json
{
  "items": [
    {
      "id": "dashboard",
      "label": "Dashboard",
      "icon": "LayoutDashboard",
      "route": "/dashboard",
      "isActive": false
    },
    {
      "id": "invoices",
      "label": "Factures",
      "icon": "List",
      "route": "/impayes/list",
      "isActive": true
    },
    {
      "id": "sequences",
      "label": "Séquences",
      "icon": "LayoutGrid",
      "route": "/sequences",
      "isActive": false
    },
    {
      "id": "followups",
      "label": "Relances",
      "icon": "Send",
      "route": "/relances",
      "isActive": false
    },
    {
      "id": "settings",
      "label": "Paramètres",
      "icon": "Settings",
      "route": "/settings",
      "isActive": false
    }
  ]
}
```

### Événement de Changement d'État
```json
{
  "type": "dock-state-changed",
  "detail": {
    "collapsed": false,
    "timestamp": "2024-02-20T14:30:00.123Z"
  }
}
```

## Priorité et Complexité
- **Priorité**: Moyenne (amélioration UX mobile)
- **Complexité**: Faible à Moyenne
- **Effort estimé**: 6-8 heures
- **Dépendances**: Alpine.js, Tailwind CSS, Lucide Icons
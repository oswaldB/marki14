# F02 : Menu Latéral et Navigation

## Contexte
Fournir une navigation intuitive et responsive pour accéder aux différentes sections de l'application Marki14, avec une expérience optimisée pour desktop et mobile.

## Acteurs
- **Utilisateurs authentifiés** : Accès complet à toutes les sections
- **Utilisateurs mobiles** : Navigation optimisée pour petits écrans
- **Administrateurs** : Accès aux sections de configuration

## Fonctionnalités Clés

### 1. Navigation Desktop
- **Double Sidebar Layout** : Icônes seulement + menu complet
- **Menu hiérarchique** : Sections expansibles/collapsibles
- **État persistant** : Mémorisation de l'état ouvert/fermé
- **Indicateurs visuels** : Badges et états pour les sections

### 2. Navigation Mobile
- **Dock rétractable** : Menu accessible en bas d'écran
- **Icônes avec labels** : Navigation claire sur mobile
- **Gestion tactile** : Optimisé pour les écrans tactiles
- **Animations fluides** : Transitions douces

### 3. Sections de Navigation
- **Dashboard** : Vue d'ensemble
- **Impayés** : Sous-menu avec plusieurs vues
  - Vue Factures
  - Groupé par payeur
  - Vue Séquence
  - Vue par Acteur
  - À réparer
- **Séquences** : Gestion des séquences de relance
- **Relances** : Suivi des follow-ups
- **Paramètres** : Configuration globale

### 4. Gestion d'État
- **Persistence locale** : Stockage dans localStorage
- **Synchronisation** : État cohérent entre onglets
- **Performance** : Chargement rapide même avec beaucoup d'items

### 5. Accessibilité
- **Navigation clavier** : Complète
- **ARIA attributes** : Pour les lecteurs d'écran
- **Contraste** : Respect des standards WCAG
- **Focus visible** : Pour tous les éléments interactifs

## Critères d'Acceptation

### Fonctionnel
- Navigation fluide entre toutes les sections
- État persistant entre les recharges
- Menu mobile fonctionnel et ergonomique
- Sous-menus expansibles pour les sections
- Indicateurs visuels pour les sections actives

### Performance
- Temps de rendu < 300ms
- Pas de reflow layout pendant les animations
- Chargement différé des sous-menus
- Optimisé pour 60 FPS sur mobile

### UX/UI
- Design cohérent avec la charte graphique
- Animations fluides et naturelles
- Feedback visuel pour toutes les interactions
- Adapté à toutes les tailles d'écran
- Navigation intuitive et discoverable

### Accessibilité
- Navigation clavier complète
- Tous les éléments ont des labels
- Contraste suffisant pour tous les textes
- Compatible avec les lecteurs d'écran
- Pas de pièges au clavier

### Robustesse
- Gestion des erreurs de rendu
- Fallback pour les navigateurs anciens
- Dégradation gracieuse si JavaScript désactivé
- Résistant aux manipulations DOM

## Cas d'Usage

### Cas 1: Navigation desktop standard
1. Utilisateur arrive sur l'application
2. Menu latéral s'affiche avec icônes
3. Utilisateur clique sur "Impayés"
4. Sous-menu s'expande avec les options
5. Utilisateur sélectionne "Groupé par payeur"
6. Contenu principal se met à jour

### Cas 2: Navigation mobile avec dock
1. Utilisateur arrive sur mobile
2. Dock rétracté en bas d'écran
3. Utilisateur clique sur l'icône menu
4. Dock s'expande avec les options
5. Utilisateur sélectionne "Séquences"
6. Dock se rétracte automatiquement
7. Page des séquences s'affiche

### Cas 3: Persistence de l'état
1. Utilisateur ouvre le menu "Impayés"
2. Ferme l'onglet ou recharge la page
3. Retourne sur l'application
4. Menu "Impayés" reste ouvert
5. État restauré depuis localStorage

### Cas 4: Navigation clavier
1. Utilisateur appuie sur Tab
2. Focus se déplace entre les éléments
3. Appuie sur Entrée pour sélectionner
4. Appuie sur Échap pour fermer les sous-menus
5. Navigation complète sans souris

## Exemples de Données

### État du Menu (localStorage)
```json
{
  "isImpayesOpen": true,
  "isSettingsOpen": false,
  "activeSection": "impayes",
  "activeSubSection": "by-payer"
}
```

### Structure des Items de Menu
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
      "id": "impayes",
      "label": "Impayés",
      "icon": "BanknoteX",
      "route": "/impayes",
      "isActive": true,
      "isOpen": true,
      "subItems": [
        {
          "id": "list",
          "label": "Vue Factures",
          "route": "/impayes/list",
          "isActive": false
        },
        {
          "id": "by-payer",
          "label": "Groupé par payeur",
          "route": "/impayes/",
          "isActive": true
        }
      ]
    }
  ]
}
```

## Priorité et Complexité
- **Priorité**: Haute (navigation critique)
- **Complexité**: Moyenne
- **Effort estimé**: 12-16 heures
- **Dépendances**: Alpine.js, Tailwind CSS, Lucide Icons
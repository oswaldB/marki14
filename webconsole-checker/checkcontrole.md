# Règles de Développement - checkcontrole.md

Date: 2024-02-20
Projet: webconsole-checker

## Règles de Développement à Respecter

### 1. CSS - TailwindCSS uniquement
**Règle**: Aucune classe CSS maison, uniquement du TailwindCSS
- Tous les styles doivent utiliser les classes utilitaires TailwindCSS
- Aucun fichier CSS personnalisé ne doit être créé
- Interdiction d'utiliser des styles inline ou des balises `<style>`

### 2. Couleur principale
**Règle**: La couleur principale est le sky-500
- Utiliser `sky-500` comme couleur principale dans toute l'application
- Cohérence requise pour les boutons, liens et éléments d'interface principaux

### 3. JavaScript - Alpine.js uniquement
**Règle**: Aucun JavaScript vanille, uniquement du Alpine.js
- Tout le code JavaScript doit utiliser Alpine.js
- Les fichiers state.js doivent utiliser le pattern `alpine:init`
- Interdiction d'utiliser du JavaScript vanille ou jQuery

### 4. Structure des fichiers state.js
**Règle**: Chaque fichier HTML a son équivalent en pageState.js
- Pour chaque template HTML, il doit exister un fichier state.js correspondant
- Exemple: `login.html` → `loginState.js`

### 5. Pattern des fichiers state.js
**Règle**: Tous les fichiers pageState.js commencent par le pattern requis
```javascript
document.addEventListener('alpine:init', () => {
  Alpine.data('nomPageState', () => ({
    // ...
  }))
})
```

### 6. Intégration des scripts state.js
**Règle**: Les fichiers HTML appellent leur fichier state.js en bas de page
```html
{% block scripts %}
<script src="{{ url_for('static', filename='js/templates/.../nompage/nompageState.js') }}"></script>
{% endblock %}
```

### 7. Interdiction des :key=
**Règle**: Aucun :key= autorisé
- Ne pas utiliser l'attribut `:key=` dans les templates
- Utiliser des alternatives pour la gestion des clés

### 8. Appels Parse REST
**Règle**: Tous les appels à Parse en REST doivent utiliser axios.instance parseAxios
- Utiliser `Alpine.store('parseAxios')` pour les appels Parse
- Le fichier parseAxios.js doit être configuré et disponible

### 9. Pas de surcharge de parseAxios
**Règle**: Pas d'utils, librairies ou de méthodes pour surcharger parseAxios
- parseAxios doit être utilisé directement sans surcharge
- Interdiction de créer des wrappers ou extensions

### 10. Appels Parse serveur
**Règle**: Pas d'appels à parse serveur en passant par les routes flask sauf pour /script/
- Les appels Parse doivent être faits via Alpine.js
- Le blueprint /script/ doit être utilisé pour les scripts serveur

### 11. Icônes - lineIcons
**Règle**: Toutes les icônes sont en lineIcons - couleur sky-900
- Utiliser uniquement des icônes de la bibliothèque lineIcons
- Couleur standard: `sky-900`
- Le fichier `/app/templates/icons-regular.html` doit exister

### 12. Pack gratuit uniquement
**Règle**: Toutes les icônes sont dans le pack gratuit de lineIcons
- Pas d'icônes premium
- Pas d'autres bibliothèques d'icônes (lucid, svg, etc.)

### 13. Définition des routes
**Règle**: Toutes les routes sont bien définies dans app.py
- Toutes les routes de l'application doivent être définies dans app.py
- Chaque route doit avoir son handler correspondant

### 14. Vérification des routes
**Règle**: L'outil check_routes.js doit être utilisé et ses résultats analysés
- Les résultats doivent être organisés dans `console-web-error/`
- Deux sous-répertoires:
  - `error/`: pour les routes avec erreurs critiques
  - `clear/`: pour les routes sans erreurs bloquantes

### 15. Scripts individuels
**Règle**: Il existe un script par script dans le folder scripts/
- Chaque script doit être dans un fichier séparé
- Le dossier scripts/ doit contenir:
  - `__init__.py`
  - `script_bp.py`
  - Les scripts individuels (ex: `helloworld.py`)

### 16. Blueprint /script/
**Règle**: Le blueprint /script/ importe tous les scripts et gère les routes
- `script_bp.py` doit gérer l'exécution dynamique des scripts
- Le blueprint doit être enregistré dans app.py

### 17. Appels frontaux
**Règle**: Les scripts sont appelés par le front avec Axios
- Les templates doivent utiliser axios pour appeler les scripts
- Pas d'appels directs ou de formulaires traditionnels

### 18. Bases de templates
**Règle**: Tous les fichiers HTML utilisent un base approprié
- Pages sans authentification: utiliser `base.html`
- Pages avec authentification: utiliser `base-app.html`
- Exemples:
  - `index.html`, `login.html` → `base.html`
  - `dashboard.html`, `admin-configurations.html` → `base-app.html`

## Procédure de Vérification

1. Exécuter `check_routes.js` pour vérifier toutes les routes
2. Analyser les résultats et classer dans `console-web-error/`
3. Vérifier la conformité avec chaque règle ci-dessus
4. Documenter les écarts dans `verification_report.md`
5. Corriger les problèmes identifiés

## Maintenance

- Mettre à jour ce document si de nouvelles règles sont ajoutées
- Vérifier régulièrement la conformité du projet
- Documenter toutes les exceptions ou dérogations
# Agents

Il est important de commiter à chaque étape pour suivre les modifications et faciliter le travail collaboratif.

> **Note** : Si vous travaillez sur de la documentation ou des spécifications techniques, consultez le guide [@guide_documentation_technique.md](.claude/guide_documentation_technique.md) pour des directives détaillées.

## Guide pour la Construction de Composants Alpine.js

### Règles Générales
- **Pas de `:key`** : Ne pas utiliser l'attribut `:key` dans les boucles `x-for`. Alpine.js gère automatiquement les clés internes.
- **Font Awesome** : Utiliser uniquement Font Awesome pour les icônes. Ne pas mélanger avec d'autres bibliothèques d'icônes.

### Structure d'un Composant Alpine.js

#### 1. Description
La section **Description** doit expliquer le rôle du composant. Elle doit inclure :
- Le but principal du composant.
- Le contexte d'utilisation.
- Les technologies ou bibliothèques utilisées (ex: Alpine.js, Font Awesome).

**Exemple** :
```markdown
## Description
Ce composant est responsable de l'affichage de la liste des impayés groupés par facture. Il gère également les états de chargement, les erreurs, et l'affichage d'un message lorsque aucun résultat n'est trouvé. Le composant utilise Alpine.js pour la réactivité et s'appuie sur le store global `impayesStore` pour la gestion des données.
```

#### 2. Comportement
La section **Comportement** doit détailler le fonctionnement interne du composant. Elle doit inclure :
- Les états possibles et leur gestion.
- Les interactions avec d'autres composants ou stores.
- Les flux de données.

**Exemple** :
```markdown
## Comportement
- **Affichage conditionnel** : Le composant affiche la liste des impayés uniquement si les données sont chargées et qu'il n'y a pas d'erreur. Sinon, il affiche un message de chargement ou d'erreur.
- **Groupement des données** : Les impayés sont regroupés par facture, et chaque groupe est rendu via le composant `impayes-group-card.html`.
- **Gestion des états** : Utilise `x-show` pour contrôler l'affichage en fonction de l'état du store (`isLoading`, `error`, etc.).
```

#### 3. ASCII Render (pour les composants visuels)
Pour les composants qui ont un rendu visuel, inclure deux représentations ASCII de l'interface utilisateur :
1. **Avec des données mockées** : Montre à quoi ressemble le composant avec des données réalistes.
2. **Avec les noms des variables** : Montre les variables ou propriétés utilisées pour chaque élément de l'interface.

**Exemple** :
```markdown
## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  [ ]  📄  Facture #INV-001                                   |
|       Client: Société XYZ                                     |
|       Montant: 1 250,00 €  │  Reste: 1 250,00 €              |
|       Date: 15/03/2024  │  Dossier: D-2024-001              |
|       📍 123 Rue de la Paix, 75000 Paris                     |
|                                                               |
|  ⚠️  Retard max: 30 jours                                     |
|                                                               |
|  [Voir la facture] [Détails]                                   |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  [ ]  📄  {{ group.refpiece }}                               |
|       Client: {{ group.client }}                               |
|       Montant: {{ group.totalttcnet }}  │  Reste: {{ group.resteapayer }}|
|       Date: {{ group.datepiece }}  │  Dossier: {{ group.numero }}  |
|       📍  {{ group.adresse }}                                |
|                                                               |
|  ⚠️  Retard max: {{ group.maxDaysLate }} jours                |
|                                                               |
|  [Voir la facture] [Détails]                                   |
+---------------------------------------------------------------+
```
```

#### 4. Props (pour les composants)
La section **Props** doit lister toutes les propriétés utilisées par le composant, avec leur type et leur description.

**Exemple** :
```markdown
## Props
- **$store.impayesStore.isLoading** : État de chargement des données.
- **$store.impayesStore.error** : État d'erreur lors du chargement des données.
- **$store.impayesStore.getGroupedData()** : Retourne les données des impayés groupées par facture.
- **$store.impayesStore.getFilteredData()** : Retourne les données filtrées des impayés.
```

#### 5. Fonctions
La section **Fonctions** doit détailler chaque fonction ou méthode exposée par le composant ou le module. Chaque fonction doit être documentée avec :
- Une description détaillée.
- Les paramètres avec leurs types et descriptions.
- Le type de retour.
- Un exemple d'utilisation.

**Exemple** :
```markdown
## Fonctions

### Affichage des impayés
@description Affiche la liste des impayés groupés par facture en utilisant les données du store. Cette fonction utilise une boucle `x-for` pour itérer sur les groupes d'impayés retournés par `getGroupedData()` et inclut le composant `impayes-group-card.html` pour chaque groupe. L'affichage est conditionnel et dépend des états `isLoading` et `error` du store.
@param {Array} groups - Tableau de groupes d'impayés retourné par `getGroupedData()`. Chaque groupe contient un identifiant unique et une liste d'impayés.
@returns {void} - Affiche les groupes d'impayés dans l'interface utilisateur.
@example
<!-- Exemple d'utilisation dans un template HTML -->
<div x-show="!$store.impayesStore.isLoading && !$store.impayesStore.error">
    <template x-for="(group, groupKey) in $store.impayesStore.getGroupedData()">
        {% include 'components/impayes/impayes-group-card.html' %}
    </template>
</div>
```

#### 6. Dépendances
La section **Dépendances** doit lister toutes les dépendances du composant ou du module, avec une brève description de leur rôle.

**Exemple** :
```markdown
## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`).
- **impayesStore** : Store global pour la gestion des données des impayés.
- **impayes-group-card.html** : Composant inclus pour l'affichage des groupes d'impayés.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.
```

#### 7. Exemples d'utilisation
La section **Exemples d'utilisation** doit fournir des exemples concrets d'utilisation du composant ou du module dans différents contextes.

**Exemple** :
```markdown
## Exemples d'utilisation
- Ce composant est généralement inclus dans les pages principales de l'application pour afficher la liste des impayés.
- Il peut être utilisé en combinaison avec des filtres pour affiner les résultats.
```

### Bonnes Pratiques

#### 1. Soyez précis
- Décrivez chaque fonction et propriété avec suffisamment de détails pour qu'un développeur junior puisse l'implémenter sans ambiguïté.
- Incluez des exemples de code pour illustrer l'utilisation.

#### 2. Soyez exhaustif
- Documentez tous les paramètres, types de retour, et états possibles.
- Mentionnez les erreurs possibles et leur gestion.

#### 3. Soyez cohérent
- Utilisez un format cohérent pour toutes les sections et sous-sections.
- Maintenez une structure uniforme pour faciliter la lecture et la compréhension.

#### 4. Utilisez des exemples concrets
- Fournissez des exemples de code qui montrent comment utiliser le composant ou la fonctionnalité dans un contexte réel.
- Incluez des cas d'usage courants et des scénarios d'erreur.

#### 5. Mettez à jour la documentation
- Assurez-vous que la documentation est toujours à jour avec le code.
- Revoyez et mettez à jour la documentation à chaque modification du code.

## Documentation du Processus de Développement

### Introduction
Ce document décrit le processus de développement pour transformer une idée de feature en une implémentation validée. Le processus est structuré en plusieurs étapes pour assurer une progression claire et méthodique.

### Étapes du Processus

#### 1. Idée de Feature → Use Cases
- **Description** : Transformer une idée en plusieurs cas d'utilisation concrets.
- **Outils** :
  - **Markdown** : Fichier `feature_idee.md` pour décrire l'idée.
  - **Diagrammes** : Utiliser `mermaid` ou `plantuml` pour visualiser les flux.

#### 2. Tests des Use Cases
- **Description** : Définir des tests pour valider chaque use case.
- **Outils** :
  - **Fichiers de test** : `test_use_case_*.py` (ou `.js` selon le langage).
  - **Frameworks de test** : `pytest`, `jest`, ou `unittest`.

#### 3. Impacts sur le Shadow App
- **Description** : Identifier les modifications nécessaires dans le `shadow_app`.
- **Outils** :
  - **Git** : Branches dédiées pour isoler les changements.
  - **Documentation** : Fichier `impacts_shadow_app.md` pour lister les modifications.

#### 4. Tests pour le Shadow App
- **Description** : Écrire des tests pour valider les impacts.
- **Outils** :
  - **Fichiers de test** : `test_shadow_app_*.py`.
  - **Mocking** : Utiliser `unittest.mock` ou `pytest-mock`.

#### 5. Fichier d'Implémentation
- **Description** : Supprimer les fichiers concernés et les recoder à partir du `shadow_app`.
- **Outils** :
  - **Script de migration** : `migrate_feature.sh` pour automatiser la suppression et la recréation.
  - **Git** : Commit atomique pour chaque fichier modifié.

#### 6. Exécution des Tests
- **Description** : Lancer les tests pour valider l'implémentation.
- **Outils** :
  - **CI/CD** : Intégration avec GitHub Actions ou GitLab CI.
  - **Rapports** : Génération de rapports avec `pytest --html=report.html`.

#### 7. Fiche de Test Utilisateur
- **Description** : Créer une checklist pour les tests utilisateurs.
- **Outils** :
  - **Markdown** : Fichier `test_utilisateur.md` avec des cases à cocher.
  - **Outils de suivi** : Tableau Trello ou GitHub Issues pour suivre les validations.

#### 8. Validation Finale
- **Description** : Validation par un utilisateur ou un responsable.
- **Outils** :
  - **Pull Request** : Utiliser GitHub/GitLab pour la revue de code.
  - **Documentation** : Mettre à jour la documentation finale dans `docs/`.

### Structure des Fichiers Proposée
```
specs/
├── features/
│   ├── feature_idee.md
│   ├── use_cases/
│   │   ├── use_case_1.md
│   │   └── test_use_case_1.py
│   ├── impacts_shadow_app.md
│   ├── test_shadow_app.py
│   ├── migrate_feature.sh
│   └── test_utilisateur.md
└── docs/
    └── processus_developpement.md
```

### Conclusion
Ce processus assure une progression structurée et méthodique des idées aux implémentations validées. Chaque étape est documentée et testée pour garantir la qualité et la cohérence du code.

## Conclusion
En suivant ce guide, vous serez en mesure de créer des composants Alpine.js conformes aux standards du projet. Une bonne documentation technique est essentielle pour la maintenance et l'évolution du projet.
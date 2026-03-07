# Agents

Il est important de commiter à chaque étape pour suivre les modifications et faciliter le travail collaboratif.

> **Note** : Si vous travaillez sur de la documentation ou des spécifications techniques, consultez le guide [@guide_documentation_technique.md](.claude/guide_documentation_technique.md) pour des directives détaillées.

## Hard Rules

1. **COMMIT OBLIGATOIRE AVANT ET APRES TOUTES MODIFICATIONS** : Chaque modification doit être committée avant et après pour assurer un suivi clair et faciliter le travail collaboratif.

2. **Utilisation exclusive de Font Awesome** : Toutes les icônes doivent provenir de Font Awesome. Aucune autre bibliothèque d'icônes n'est autorisée.

3. **Templates Jinja** : Pour l'utilisation des templates Jinja, seules les directives `include` et `extends` sont autorisées. Les boucles et les conditions (`if`) doivent être évitées.

4. **Alpine.js** : L'utilisation de `:key` est strictement interdite dans Alpine.js. Les clés sont gérées automatiquement.

5. **Structure des fichiers** :
   - Les fichiers manipulés sont souvent lourds et doivent être découpés en sous-partials (composants).
   - Un partial/composant Alpine.js doit toujours suivre cette structure :
     ```html
     <div x-data="" x-init="Alpine.data('')">
       <!-- HTML -->
     </div>
     <script>
       document.addEventListener('alpine:init', () => {
         Alpine.data('', () => ({
           // Logique Alpine.js
         }));
       });
     </script>
     ```
   - Les stores sont utilisés comme miroir des données dans Parse avec des manipulations supplémentaires.
   - Les pages doivent également suivre cette structure : HTML en haut et `Alpine.Data()` en bas.

6. **Appels à la base de données** : Utilisez `axiosParse` pour tous les appels à la base de données. Les scripts sont réservés aux opérations ad-hoc et spécifiques, pas pour le CRUD de base.

7. **TU CODES ET COMMENTE LE CODE EN ANGLAIS** même si l'interface est en français.

8. **Communication entre composants** : Toute la communication entre les composants doit se faire uniquement via les stores. Aucune utilisation d'événements navigateur (browser events) n'est autorisée.

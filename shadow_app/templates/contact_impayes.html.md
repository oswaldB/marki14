# Documentation Technique : contact_impayes.html

## Description
Ce template est responsable de l'affichage de la liste des contacts associés aux impayés. Il permet de visualiser les contacts et leurs informations, ainsi que de filtrer ou trier les données.

## Comportement
- **Affichage conditionnel** : Affiche la liste des contacts uniquement si les données sont chargées et qu'il n'y a pas d'erreur.
- **Gestion des états** : Utilise `x-show` pour contrôler l'affichage en fonction de l'état du store (`isLoading`, `error`, etc.).
- **Filtrage et tri** : Permet de filtrer et trier les contacts en fonction de différents critères.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  📞 Contacts Associés                                        |
|  +---------------------------------------------------------+  |
|  |  👤 Jean Dupont                                          |  |
|  |  📧 jean.dupont@example.com                              |  |
|  |  📞 +33 1 23 45 67 89                                   |  |
|  +---------------------------------------------------------+  |
|  |  👤 Marie Martin                                         |  |
|  |  📧 marie.martin@example.com                             |  |
|  |  📞 +33 6 12 34 56 78                                   |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  📞 Contacts Associés                                        |
|  +---------------------------------------------------------+  |
|  |  👤 {{ contact.name }}                                    |  |
|  |  📧 {{ contact.email }}                                  |  |
|  |  📞 {{ contact.phone }}                                  |  |
|  +---------------------------------------------------------+  |
|  |  👤 {{ contact.name }}                                    |  |
|  |  📧 {{ contact.email }}                                  |  |
|  |  📞 {{ contact.phone }}                                  |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Props
- **$store.contactStore.isLoading** : État de chargement des données.
- **$store.contactStore.error** : État d'erreur lors du chargement des données.
- **$store.contactStore.getContacts()** : Retourne la liste des contacts.

## Fonctions

### Affichage des contacts
@description Affiche la liste des contacts en utilisant les données du store. Utilise une boucle `x-for` pour itérer sur les contacts et affiche leurs informations.
@param {Array} contacts - Tableau de contacts retourné par `getContacts()`.
@returns {void} - Affiche les contacts dans l'interface utilisateur.
@example
<!-- Exemple d'utilisation dans un template HTML -->
<div x-show="!$store.contactStore.isLoading && !$store.contactStore.error">
    <template x-for="contact in $store.contactStore.getContacts()">
        <div class="contact-card">
            <span x-text="contact.name"></span>
            <span x-text="contact.email"></span>
            <span x-text="contact.phone"></span>
        </div>
    </template>
</div>

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`).
- **impayesStore** : Store global pour la gestion des données des impayés (chargé depuis `base-app.html`).
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce template est utilisé pour afficher les contacts associés aux impayés.
- Il peut être inclus dans les pages de détails des impayés ou des clients.

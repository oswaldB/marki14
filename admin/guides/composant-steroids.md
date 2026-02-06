# Guide : Créer un Composant "Steroids" avec Astro et Alpine.js

Un composant "steroids" est un composant autonome qui intègre son propre store Alpine.js pour gérer son état de manière réactive. Ce guide explique comment créer un tel composant, en utilisant l'exemple du `DrawerX` que nous avons développé.

---

## Table des Matières
1. [Prérequis](#prérequis)
2. [Structure du Composant](#structure-du-composant)
3. [Création du Store Alpine.js](#création-du-store-alpinejs)
4. [Intégration du Store dans le Composant](#intégration-du-store-dans-le-composant)
5. [Utilisation du Composant dans une Page](#utilisation-du-composant-dans-une-page)
6. [Communication entre Composants](#communication-entre-composants)
7. [Bonnes Pratiques](#bonnes-pratiques)

---

## Prérequis
- Un projet Astro configuré avec Alpine.js.
- Connaissance de base d'Astro et d'Alpine.js.

---

## Structure du Composant

Un composant "steroids" est structuré comme suit :

```astro
---
// src/components/NomDuComposant.astro
---
<script is:inline>
  // Initialisation du store Alpine.js
  document.addEventListener('alpine:init', () => {
    Alpine.store('nomDuStore', {
      // État du store
      etat1: valeur1,
      etat2: valeur2,
      
      // Méthodes du store
      methode1() {
        // Logique de la méthode
      },
      methode2() {
        // Logique de la méthode
      }
    });
    console.log('Store nomDuStore initialisé avec succès !');
  });
</script>

<!-- Template du composant -->
<div x-data>
  <!-- Utilisation du store -->
  <button @click="$store.nomDuStore.methode1()">Action</button>
  <div x-show="$store.nomDuStore.etat1">Contenu conditionnel</div>
</div>
```

---

## Création du Store Alpine.js

Le store Alpine.js est initialisé directement dans le composant avec `Alpine.store`. Cela permet de centraliser l'état et les méthodes du composant.

### Exemple de Store

```javascript
Alpine.store('drawerX', {
  isOpen: false,
  data: null,
  
  toggle() {
    this.isOpen = !this.isOpen;
  },
  
  openWithData(data) {
    this.data = data;
    this.isOpen = true;
  },
  
  close() {
    this.isOpen = false;
  }
});
```

### Points Clés
- **État** : Les propriétés du store (`isOpen`, `data`, etc.) représentent l'état du composant.
- **Méthodes** : Les méthodes du store (`toggle`, `openWithData`, etc.) permettent de modifier l'état.
- **Réactivité** : Les modifications de l'état sont automatiquement répercutées dans le template grâce à Alpine.js.

---

## Intégration du Store dans le Composant

Le store est utilisé dans le template du composant avec la syntaxe `$store.nomDuStore`.

### Exemple d'Intégration

```html
<div x-data>
  <button @click="$store.drawerX.toggle()">Ouvrir/Fermer</button>
  <div x-show="$store.drawerX.isOpen">
    <h3>Titre du Drawer</h3>
    <template x-if="$store.drawerX.data">
      <p>Données : <span x-text="$store.drawerX.data.propriete"></span></p>
    </template>
  </div>
</div>
```

### Points Clés
- **`x-data`** : Active Alpine.js sur l'élément pour permettre l'utilisation des directives.
- **`x-show`** : Affiche ou masque un élément en fonction de l'état du store.
- **`x-text`** : Affiche dynamiquement le contenu d'une propriété du store.

---

## Utilisation du Composant dans une Page

Le composant est importé et utilisé dans une page Astro comme suit :

### Exemple d'Utilisation

```astro
---
import NomDuComposant from '../components/NomDuComposant.astro';
---

<NomDuComposant client:load />
```

### Points Clés
- **`client:load`** : Hydrate le composant côté client pour permettre la réactivité.
- **Props** : Si nécessaire, des props peuvent être passées au composant pour initialiser son état.

---

## Communication entre Composants

Pour communiquer entre composants, utilisez des événements Alpine.js ou le store partagé.

### Exemple avec Événements

```html
<!-- Composant A : Émet un événement -->
<button @click="$dispatch('evenement-personnalise', { data: 'valeur' })">
  Déclencher l'événement
</button>

<!-- Composant B : Écoute l'événement -->
<div @evenement-personnalise.window="$store.nomDuStore.methode($event.detail.data)">
  <!-- Contenu -->
</div>
```

### Exemple avec Store Partagé

```javascript
// Dans un composant
Alpine.store('nomDuStore').methode(data);

// Dans un autre composant
<div x-show="$store.nomDuStore.etat">Contenu réactif</div>
```

---

## Bonnes Pratiques

1. **Noms de Store Uniques** : Utilisez des noms de store uniques pour éviter les conflits.
2. **État Minimal** : Gardez l'état du store minimal et pertinent pour le composant.
3. **Méthodes Claires** : Nommez les méthodes de manière claire et descriptive.
4. **Logs de Debug** : Utilisez `console.log` pour déboguer l'initialisation et les interactions.
5. **Documentation** : Documentez le store et les méthodes pour faciliter la maintenance.

---

## Exemple Complet : DrawerX

Voici un exemple complet du composant `DrawerX` que nous avons développé :

### Composant `DrawerX.astro`

```astro
---
// src/components/DrawerX.astro
---
<script is:inline>
  document.addEventListener('alpine:init', () => {
    Alpine.store('drawerX', {
      isOpen: false,
      data: null,
      
      toggle() {
        this.isOpen = !this.isOpen;
      },
      
      openWithData(data) {
        this.data = data;
        this.isOpen = true;
      },
      
      close() {
        this.isOpen = false;
      }
    });
    console.log('Store drawerX initialisé avec succès !');
  });
</script>

<div x-data>
  <div x-show="$store.drawerX.isOpen" @click.away="$store.drawerX.close()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded-lg">
      <h3 class="text-lg font-bold">DrawerX</h3>
      <template x-if="$store.drawerX.data">
        <p>Coucou <span x-text="$store.drawerX.data.firstname"></span>!</p>
      </template>
      <button @click="$store.drawerX.close()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Fermer</button>
    </div>
  </div>
</div>
```

### Utilisation dans `index.astro`

```astro
---
import DrawerX from '../components/DrawerX.astro';
---

<div x-data="{
  state: { firstname: 'toto' },
  openDrawerWithData() {
    Alpine.store('drawerX').openWithData(this.state);
  }
}">
  <button @click="Alpine.store('drawerX').toggle()">Ouvrir le drawer</button>
  <button @click="openDrawerWithData()">Ouvrir avec données</button>
  <DrawerX client:load />
</div>
```

---

## Conclusion

Les composants "steroids" avec Astro et Alpine.js permettent de créer des composants autonomes et réactifs, faciles à maintenir et à réutiliser. En suivant ce guide, vous devriez être en mesure de créer vos propres composants "steroids" et de les intégrer dans vos projets Astro.

Pour plus d'informations, consultez la [documentation d'Alpine.js](https://alpinejs.dev/) et la [documentation d'Astro](https://docs.astro.build/).
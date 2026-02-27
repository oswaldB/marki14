# Stores Alpine.js pour Marki Application

Ce dossier contient les stores Alpine.js centralisés pour gérer l'état global de l'application.

## Stores Disponibles

### 1. sequenceStore.js

**Fonctionnalité** : Gestion complète des séquences de relance

**Fonctionnalités principales** :
- Chargement des séquences depuis Parse Server
- Création, modification et suppression de séquences
- Gestion des actions associées aux séquences
- Chargement des impayés associés et des profils SMTP
- Gestion d'état (chargement, erreurs)

**Utilisation** :
```javascript
// Accéder au store
const sequenceStore = Alpine.store('sequence');

// Charger toutes les séquences
await sequenceStore.loadSequences();

// Charger une séquence spécifique
await sequenceStore.loadSequence('sequenceId');

// Créer une nouvelle séquence
await sequenceStore.createSequence({ nom: 'Nouvelle séquence', description: 'Description' });
```

### 2. variablesStore.js

**Fonctionnalité** : Gestion des variables disponibles pour les templates

**Fonctionnalités principales** :
- Chargement des variables depuis variables.json
- Recherche et filtrage des variables
- Copie des variables dans le presse-papiers
- Gestion d'état (chargement, erreurs)

**Utilisation** :
```javascript
// Accéder au store
const variablesStore = Alpine.store('variables');

// Charger les variables
await variablesStore.loadVariables();

// Rechercher des variables
variablesStore.setSearchTerm('client');

// Accéder aux variables filtrées
const filteredVars = variablesStore.filteredVariables;

// Copier une variable dans le presse-papiers
variablesStore.copyVariable('client_nom');
```

### 3. paymentLinksStore.js

**Fonctionnalité** : Gestion des liens de paiement

**Fonctionnalités principales** :
- Chargement des liens de paiement depuis Parse Server
- Ajout de nouveaux liens de paiement
- Sélection et gestion des liens actifs
- Génération de variables pour les liens
- Copie des liens et variables dans le presse-papiers
- Gestion d'état (chargement, erreurs)

**Utilisation** :
```javascript
// Accéder au store
const paymentLinksStore = Alpine.store('paymentLinks');

// Charger les liens de paiement
await paymentLinksStore.loadPaymentLinks();

// Ajouter un nouveau lien
const newLink = await paymentLinksStore.addPaymentLink({
  name: 'Paiement CB',
  url: 'https://payment.example.com/cb',
  description: 'Paiement par carte bancaire'
});

// Sélectionner un lien
paymentLinksStore.selectLink('https://payment.example.com/cb');

// Copier une variable de lien dans le presse-papiers
paymentLinksStore.copyPaymentLinkVariable(link);
```

## Intégration dans les Composants

Les stores sont automatiquement chargés via le fichier `index.js` et disponibles dans tous les composants Alpine.js.

**Exemple d'utilisation dans un composant** :
```html
<div x-data="{
    get variablesStore() {
        return Alpine.store('variables');
    },
    
    get paymentLinksStore() {
        return Alpine.store('paymentLinks');
    },
    
    async init() {
        await this.variablesStore.loadVariables();
        await this.paymentLinksStore.loadPaymentLinks();
    }
}">
    <!-- Utilisation des données du store -->
    <template x-for="variable in variablesStore.filteredVariables">
        <div x-text="variable"></div>
    </template>
</div>
```

## Avantages de l'Architecture Store

1. **Centralisation** : Toutes les données et logiques liées sont au même endroit
2. **Réutilisabilité** : Les stores peuvent être utilisés par plusieurs composants
3. **Maintenabilité** : Plus facile à maintenir et à faire évoluer
4. **Consistance** : État global cohérent à travers l'application
5. **Testabilité** : Plus facile à tester de manière isolée

## Bonnes Pratiques

- Toujours utiliser les stores pour les données partagées entre composants
- Éviter de dupliquer la logique métier dans les composants
- Utiliser les méthodes du store plutôt que d'accéder directement aux données
- Appeler `resetStore()` lorsque nécessaire pour réinitialiser l'état
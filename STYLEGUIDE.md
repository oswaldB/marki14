# Style Guide Marki

Guide des couleurs, composants et conventions de design pour l'application Marki.

## Table des matières
- [Palettes de couleurs](#palettes-de-couleurs)
- [Composants UI](#composants-ui)
  - [Boutons](#boutons)
  - [Cards](#cards)
  - [Liste de Cards](#liste-de-cards)
  - [Formulaires](#formulaires)
  - [DataTable](#datatable)
  - [Drawer](#drawer)
  - [Alertes](#alertes)
  - [Badges](#badges)
  - [Icônes Lucide](#icônes-lucide)

## Palettes de couleurs

### Couleur primaire
- **Primary**: #007ACE
- Couleur principale de la marque

### Couleurs secondaires
- **Secondary 1**: #00BDCF
- Couleur d'accentuation
- **Secondary 2**: #003BCF
- Couleur profonde

### Couleurs fonctionnelles
- **Success**: #00CF9B
- Actions réussies
- **Info**: #4597CF
- Informations
- **Accent**: #0700CF
- Éléments d'accentuation

## Composants UI

### Boutons

```html
<button class="bg-[#007ACE] text-white px-4 py-2 rounded-md hover:bg-[#006BCE] transition-colors">
  Bouton Principal
</button>

<button class="bg-[#00BDCF] text-white px-4 py-2 rounded-md hover:bg-[#00ADC0] transition-colors">
  Bouton Secondaire
</button>

<button class="bg-[#00CF9B] text-white px-4 py-2 rounded-md hover:bg-[#00BE8A] transition-colors">
  Bouton Succès
</button>

<button class="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
  Bouton Neutre
</button>

<button class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
  Bouton Danger
</button>
```

### Cards

#### Card simple
```html
<div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
  <h4 class="text-lg font-medium text-gray-900 mb-2">Card Simple</h4>
  <p class="text-gray-600 text-sm mb-4">Contenu de la card avec une description courte.</p>
  <button class="bg-[#007ACE] text-white px-3 py-1 rounded text-sm hover:bg-[#006BCE]">
    Action
  </button>
</div>
```

#### Card avec icône
```html
<div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
  <div class="flex items-start">
    <div class="flex-shrink-0 mr-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[#007ACE]">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    </div>
    <div>
      <h4 class="text-lg font-medium text-gray-900 mb-2">Card avec Icône</h4>
      <p class="text-gray-600 text-sm">Utilisation d'icônes Lucide pour enrichir le contenu.</p>
    </div>
  </div>
</div>
```

#### Card avec badge
```html
<div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
  <div class="flex items-start justify-between">
    <div>
      <h4 class="text-lg font-medium text-gray-900 mb-2">Card avec Badge</h4>
      <p class="text-gray-600 text-sm">Contenu avec indication de statut.</p>
    </div>
    <span class="bg-[#00CF9B] text-white text-xs font-medium px-2 py-1 rounded-full">
      Actif
    </span>
  </div>
</div>
```

### Liste de Cards

```html
<div class="space-y-4">
  <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
    <div class="flex items-center">
      <div class="w-10 h-10 bg-[#007ACE] rounded-full flex items-center justify-center mr-3">
        <span class="text-white font-medium text-sm">1</span>
      </div>
      <div>
        <h4 class="font-medium text-gray-900">Élément de liste 1</h4>
        <p class="text-sm text-gray-600">Description courte</p>
      </div>
    </div>
    <div class="flex items-center">
      <button class="text-[#007ACE] hover:text-[#006BCE] mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </button>
      <button class="text-gray-400 hover:text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12" y2="16"/>
        </svg>
      </button>
    </div>
  </div>
</div>
```

### Formulaires

```html
<div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm max-w-md">
  <form class="space-y-4">
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Adresse Email</label>
      <input type="email" id="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent" placeholder="votre@email.com">
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
      <input type="password" id="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent" placeholder="••••••••">
    </div>

    <div>
      <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
      <select id="role" name="role" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent">
        <option value="">Sélectionnez un rôle</option>
        <option value="admin">Administrateur</option>
        <option value="user">Utilisateur</option>
        <option value="guest">Invité</option>
      </select>
    </div>

    <div class="flex items-center">
      <input type="checkbox" id="remember" name="remember" class="h-4 w-4 text-[#007ACE] focus:ring-[#007ACE] border-gray-300 rounded">
      <label for="remember" class="ml-2 block text-sm text-gray-700">Se souvenir de moi</label>
    </div>

    <button type="submit" class="w-full bg-[#007ACE] text-white py-2 px-4 rounded-md hover:bg-[#006BCE] transition-colors focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:ring-offset-2">
      Soumettre
    </button>
  </form>
</div>
```

### DataTable

```html
<div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ID
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Nom
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Email
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Rôle
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Statut
          </th>
          <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">John Doe</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">john@example.com</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Admin</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#00CF9B] text-white">
              Actif
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button class="text-[#007ACE] hover:text-[#006BCE] mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
            <button class="text-red-500 hover:text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Drawer

```html
<div x-show="openDrawer" @click.away="openDrawer = false" class="fixed inset-0 overflow-hidden z-50">
  <div class="absolute inset-0 overflow-hidden">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="openDrawer = false"></div>

    <!-- Drawer content -->
    <div class="fixed inset-y-0 right-0 pl-10 max-w-full flex">
      <div class="relative w-screen max-w-md">
        <!-- Close button -->
        <div class="absolute top-0 left-0 -ml-8 pt-4 pr-2 flex sm:-ml-10 sm:pr-4">
          <button @click="openDrawer = false" class="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white">
            <span class="sr-only">Fermer le panel</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Drawer body -->
        <div class="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
          <div class="px-4 sm:px-6">
            <div class="flex items-start justify-between">
              <h2 class="text-lg font-medium text-gray-900" id="slide-over-title">
                Titre du Drawer
              </h2>
            </div>
          </div>
          <div class="mt-6 relative flex-1 px-4 sm:px-6">
            <!-- Contenu du drawer -->
            <div class="space-y-6">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Section 1</h3>
                <p class="mt-1 text-sm text-gray-600">Contenu de la première section du drawer.</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-900">Section 2</h3>
                <p class="mt-1 text-sm text-gray-600">Contenu de la deuxième section avec plus de détails.</p>
              </div>
            </div>
          </div>
          <div class="border-t border-gray-200 px-4 py-4 sm:px-6">
            <button @click="openDrawer = false" class="w-full bg-[#007ACE] text-white py-2 px-4 rounded-md hover:bg-[#006BCE] transition-colors">
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Alertes

#### Alerte succès
```html
<div class="bg-[#00CF9B] bg-opacity-20 border border-[#00CF9B] rounded-md p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-[#00CF9B]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3">
      <p class="text-sm font-medium text-[#00CF9B]">Succès</p>
      <p class="text-sm text-gray-700">Votre action a été effectuée avec succès.</p>
    </div>
  </div>
</div>
```

#### Alerte erreur
```html
<div class="bg-red-50 border border-red-200 rounded-md p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3">
      <p class="text-sm font-medium text-red-800">Erreur</p>
      <p class="text-sm text-red-700">Une erreur est survenue. Veuillez réessayer.</p>
    </div>
  </div>
</div>
```

### Badges

```html
<span class="bg-[#007ACE] text-white text-xs font-medium px-3 py-1 rounded-full">Primary</span>
<span class="bg-[#00BDCF] text-white text-xs font-medium px-3 py-1 rounded-full">Secondary</span>
<span class="bg-[#00CF9B] text-white text-xs font-medium px-3 py-1 rounded-full">Success</span>
<span class="bg-yellow-500 text-white text-xs font-medium px-3 py-1 rounded-full">Warning</span>
<span class="bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full">Danger</span>
<span class="bg-gray-500 text-white text-xs font-medium px-3 py-1 rounded-full">Neutral</span>
```

### Icônes Lucide

L'application utilise la bibliothèque d'icônes Lucide pour une interface cohérente et moderne.

Exemples d'icônes couramment utilisées:
- Home
- Edit
- Delete
- More (menu)
- Message
- User
- Location
- CheckCircle2

Les icônes sont utilisées avec la couleur principale (#007ACE) pour une intégration harmonieuse avec le design global.
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commandes de développement

```bash
# Démarrer Flask en local (Linux/Mac)
./start_local.sh

# Démarrer Flask en local (Windows)
start_local.bat

# Démarrer avec Docker (Parse + MongoDB + Flask)
./start.sh
./stop.sh
```

Flask tourne sur `http://localhost:5000`. Pas de build step pour le CSS/JS — Tailwind et Alpine.js sont chargés via CDN.

## Architecture

Application de gestion de relances de factures impayées pour l'entreprise ADTI.

**Backend :** Flask (Python) + Parse Server (REST API MongoDB)
**Frontend :** Alpine.js 3.x + Tailwind CSS (CDN) — aucun bundler
**Base de données :** Parse Server (MongoDB) + PostgreSQL
**IA :** Ollama (mistral) pour la génération des emails de relance

### Flux de données principal

```
Flask (app.py) → routes HTML → templates Jinja2
                              → Alpine.js state (alpines/*.js)
                              → parseAxios → Parse Server REST API
                              → flaskAxios → /script/* endpoints
```

Les scripts Python (`app/scripts/*.py`) sont invoqués via `POST /script/<nom>` et doivent exposer une fonction `execute(params)`.

### Routes Flask principales

| Route | Template |
|---|---|
| `/impayes` | `impayes2.html` |
| `/sequences` | `sequences.html` |
| `/sequence/<id>` | `sequence_manual.html` |
| `/sequence/<id>/3` | `sequence_id_3.html` |
| `/settings/profil-smtp` | `settings_profil_smtp.html` |

## Composants Alpine.js — Doctrine

### Structure d'un composant

Chaque composant est un fichier `.html` autonome : **HTML en haut, `<script>` en bas**.
Il est placé dans `app/templates/components/` (ou dans un sous-dossier par page si besoin).

```html
<!-- app/templates/components/nomPage/monComposant.html -->
<div x-data="monComposant">
    <button @click="toggle">...</button>
    <div x-show="open">...</div>
</div>

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('monComposant', () => ({
            open: false,

            toggle() {
                this.open = !this.open
            }
        }))
    })
</script>
```

### Intégration dans une page

Les composants sont inclus via Jinja2. Les pages suivent la même règle : HTML en haut, `<script>` en bas.

```html
{% extends "base-app.html" %}
{% block content %}

<!-- HTML de la page -->
<div>
    {% include 'components/nomPage/monComposant.html' %}
</div>

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('maPage', () => ({
            // état propre à la page
        }))
    })
</script>
{% endblock %}
```

### Organisation des dossiers

```
templates/
  components/
    sequences/        ← composants propres à la page sequences
    impayes/          ← composants propres à la page impayes
    email-action-editor.html
    variables-panel-alpine.html
    _notifications.html
```

### Pattern store global (Alpine.store)

Pour l'état partagé entre composants — voir `app/static/js/stores/sequenceStore.js`.

### Panneau latéral (remplace les modaux)

Aucune modale bloquante (sauf confirmations de suppression). Tout panneau de formulaire doit utiliser ce pattern :

```html
<div
    x-show="panneauOuvert"
    x-transition:enter="transition ease-out duration-300"
    x-transition:enter-start="translate-x-full"
    x-transition:enter-end="translate-x-0"
    x-transition:leave="transition ease-in duration-200"
    x-transition:leave-start="translate-x-0"
    x-transition:leave-end="translate-x-full"
    class="fixed inset-y-0 right-0 w-[480px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col overflow-y-auto"
>
    <header class="border-b border-gray-200 p-4 flex justify-between items-center">
        <p class="text-lg font-semibold">Titre</p>
        <button @click="panneauOuvert = false" class="text-gray-400 hover:text-gray-600">
            <i class="fa-regular fa-times text-xl"></i>
        </button>
    </header>
    <section class="p-4 flex-1">
        <!-- contenu -->
    </section>
    <footer class="border-t border-gray-200 p-4">
        <!-- boutons -->
    </footer>
</div>
```

Largeurs usuelles : 480px (formulaires), 640px (tableaux), 720px (PDF viewer).

### Notifications

```javascript
Alpine.store('notifications').add({ type: 'success', message: 'Sauvegardé' });
// types: success | error | warning | info
```

## Parse Server

URL : `https://parse.markidiags.com/parse/`
App ID : `adti`

Classes principales : `Impayes`, `Sequences`, `Relances`, `SMTPProfile`, `PaymentLink`

```javascript
// Lecture
const res = await parseAxios.get('/classes/Sequences', { params: { where: JSON.stringify({ isArchived: { $ne: true } }) } });

// Création
await parseAxios.post('/classes/Sequences', { nom: '...', isActif: true });

// Mise à jour
await parseAxios.put(`/classes/Sequences/${objectId}`, { nom: '...' });
```

## Templates

- `base-app.html` : layout avec sidebar + notifications. Tous les écrans métier étendent ce template.
- `templates/components/` : composants inclus via `{% include %}`.
- Les icônes sont Font Awesome (`fa-regular fa-...`).
- Couleur principale : `bg-marki-primary` / `text-marki-primary` = `#007ACE`.

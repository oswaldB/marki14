# Layouts

## Base Layout

### File
- **`/templates/layouts/base_layout.html`**

### Description
The base layout provides the basic structure for all pages, including the header, footer, and main content area. It is used for public pages like the login and registration pages.

### Components
- **Header**: Contains the logo and navigation links.
- **Footer**: Contains copyright information and links to legal pages.
- **Main Content**: The main content area where page-specific content is rendered.

### Example
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}{% endblock %}</title>
    <link rel="stylesheet" href="/static/css/styles.css">
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
</head>
<body>
    <header>
        <div class="container">
            <div class="logo">Logo</div>
            <nav>
                <a href="/">Accueil</a>
                <a href="/login">Connexion</a>
                <a href="/register">Inscription</a>
            </nav>
        </div>
    </header>
    
    <main>
        {% block content %}{% endblock %}
    </main>
    
    <footer>
        <div class="container">
            <p>&copy; 2023 Mon Application. Tous droits réservés.</p>
            <nav>
                <a href="/legal">Mentions légales</a>
                <a href="/privacy">Politique de confidentialité</a>
            </nav>
        </div>
    </footer>
    
    <script src="/static/js/scripts.js"></script>
</body>
</html>
```

## Dashboard Layout

### File
- **`/templates/layouts/dashboard_layout.html`**

### Description
The dashboard layout provides the structure for dashboard pages, including the header, sidebar, and main content area. It is used for private pages like the dashboard and invoice management pages.

### Components
- **Header**: Contains the logo, user profile, and navigation links.
- **Sidebar**: Contains links to different sections of the application.
- **Main Content**: The main content area where page-specific content is rendered.

### Example
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}{% endblock %}</title>
    <link rel="stylesheet" href="/static/css/styles.css">
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
</head>
<body>
    <header>
        <div class="container">
            <div class="logo">Logo</div>
            <nav>
                <a href="/dashboard">Tableau de bord</a>
                <a href="/profile">Profil</a>
                <a href="/logout">Déconnexion</a>
            </nav>
        </div>
    </header>
    
    <div class="container">
        <aside class="sidebar">
            <nav>
                <a href="/import-invoices">Importer des factures</a>
                <a href="/manage-invoices">Gérer les factures</a>
                <a href="/manage-contacts">Gérer les contacts</a>
                <a href="/email-sequences">Séquences d'emails</a>
                <a href="/dynamic-variables">Variables dynamiques</a>
                <a href="/assign-sequences">Attribuer des séquences</a>
                <a href="/payment-link">Lien de paiement</a>
                <a href="/smtp-profiles">Profils SMTP</a>
                <a href="/ai-generation">Génération IA</a>
                <a href="/contacts-without-email">Contacts sans email</a>
                <a href="/assignment-rules">Règles d'attribution</a>
                <a href="/reminder-calendar">Calendrier de relances</a>
                <a href="/send-emails">Envoyer des emails</a>
                <a href="/invoice-pdf">Factures PDF</a>
                <a href="/details-page">Page de détails</a>
                <a href="/authentication">Authentification</a>
                <a href="/update-status">Mettre à jour le statut</a>
                <a href="/error-management">Gestion des erreurs</a>
                <a href="/multiple-contacts-invoices">Factures avec contacts multiples</a>
            </nav>
        </aside>
        
        <main>
            {% block content %}{% endblock %}
        </main>
    </div>
    
    <footer>
        <div class="container">
            <p>&copy; 2023 Mon Application. Tous droits réservés.</p>
            <nav>
                <a href="/legal">Mentions légales</a>
                <a href="/privacy">Politique de confidentialité</a>
            </nav>
        </div>
    </footer>
    
    <script src="/static/js/scripts.js"></script>
</body>
</html>
```

## Verification
Ensure all layouts are defined and follow the naming conventions.
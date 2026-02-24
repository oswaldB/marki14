// indexState.js - État pour la page d'accueil
document.addEventListener('alpine:init', () => {
  Alpine.data('indexState', () => ({
    // État initial
    pageTitle: 'Bienvenue sur Marki',
    pageDescription: 'Plateforme de diagnostic et de gestion',
    
    // Méthodes
    initialize() {
      console.log('Index page state initialized');
    },
    
    // Données réactives
    features: [
      {
        title: 'Diagnostic avancé',
        description: 'Outils de diagnostic complets pour vos applications',
        icon: 'lni lni-stats-up'
      },
      {
        title: 'Gestion centralisée',
        description: 'Tableau de bord unifié pour toutes vos données',
        icon: 'lni lni-dashboard'
      },
      {
        title: 'Sécurité renforcée',
        description: 'Protection complète de vos données sensibles',
        icon: 'lni lni-shield'
      }
    ]
  }))
});
// public/js/pages/login/state-main.js
import { createAuthModule } from './auth.js';

document.addEventListener('alpine:init', () => {
  // Créer les modules
  const authModule = createAuthModule();
  
  // Initialiser le state principal en fusionnant les modules
  Alpine.state('login', {
    ...authModule,
    
    // Propriétés spécifiques à la page login
    pageTitle: 'Connexion',
    
    init() {
      console.log('State de la page login initialisé');
      
      // Vérifier si l'utilisateur est déjà connecté
      if (this.isAuthenticated) {
        this.redirectToDashboard();
      }
    }
  });
  
  // Initialiser le state
  Alpine.state('login').init();
});
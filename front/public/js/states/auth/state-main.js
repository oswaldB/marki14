/**
 * Point d'entrée principal pour le state d'authentification
 * Fusionne tous les modules liés à l'authentification
 */

import { createAuthModule } from './auth-module';

document.addEventListener('alpine:init', () => {
  // Créer le state d'authentification en fusionnant tous les modules
  Alpine.state('auth', {
    ...createAuthModule(),
    
    // Propriétés spécifiques au state d'authentification
    authInitialized: false,
    
    /**
     * Initialise le state d'authentification
     */
    init() {
      console.log('Auth state initialization started');
      this.initAuth();
      this.authInitialized = true;
      console.log('Auth state initialized. Authenticated:', this.isAuthenticated);
    }
  });
  
  // Initialiser le state
  Alpine.state('auth').init();
});
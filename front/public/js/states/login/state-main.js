/**
 * State principal pour la page de login
 * Fusionne tous les modules
 * @module login/state-main
 */

import { createAuthModule } from './auth';
import { createUiModule } from './ui';

document.addEventListener('alpine:init', () => {
  // Créer les modules
  const authModule = createAuthModule();
  const uiModule = createUiModule();

  // Initialiser le state principal
  Alpine.state('login', {
    // Fusionner les modules
    ...authModule,
    ...uiModule,

    /**
     * Initialisation du state
     */
    init() {
      console.log('Login state initialized');

      // Vérifier si l'utilisateur est déjà connecté
      const token = localStorage.getItem('parseToken') || sessionStorage.getItem('parseToken');
      if (token) {
        console.log('User already authenticated, redirecting...');
        this.redirectAfterLogin();
      }
    }
  });

  // Initialiser le state
  Alpine.state('login').init();
});
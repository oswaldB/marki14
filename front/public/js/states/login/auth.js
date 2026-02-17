/**
 * Module d'authentification Parse
 * @module login/auth
 */

import parseApi from '../../../utils/parse-api';

/**
 * Crée le module d'authentification
 * @returns {Object} Le module d'authentification
 */
export function createAuthModule() {
  return {
    /**
     * Identifiant utilisateur
     * @type {string}
     */
    username: '',

    /**
     * Mot de passe
     * @type {string}
     */
    password: '',

    /**
     * Option "Se souvenir de moi"
     * @type {boolean}
     */
    rememberMe: false,

    /**
     * Visibilité du mot de passe
     * @type {boolean}
     */
    showPassword: false,

    /**
     * Basculer la visibilité du mot de passe
     */
    togglePasswordVisibility() {
      console.log('Toggling password visibility');
      this.showPassword = !this.showPassword;
    },

    /**
     * Connexion utilisateur via Parse REST API
     * @returns {Promise<void>}
     */
    async login() {
      console.log('Login attempt for:', this.username);
      this.clearError();
      this.setLoading(true);

      try {
        // Validation des champs
        if (!this.username || !this.password) {
          throw new Error('Identifiant et mot de passe requis');
        }

        // Appel Parse REST API pour la connexion
        const response = await parseApi.get('/login', {
          params: {
            username: this.username,
            password: this.password
          }
        });

        console.log('Login successful:', response.data);

        // Stockage du token selon l'option "Se souvenir de moi"
        const storage = this.rememberMe ? localStorage : sessionStorage;
        storage.setItem('parseToken', response.data.sessionToken);
        storage.setItem('userId', response.data.objectId);

        // Redirection
        this.redirectAfterLogin();

      } catch (error) {
        console.error('Login failed:', error);
        const errorMessage = error.response?.data?.error || 
                           'Identifiant ou mot de passe incorrect';
        this.showError(errorMessage);
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Redirection après connexion réussie
     */
    redirectAfterLogin() {
      const urlParams = new URL(window.location.href);
      const redirectUrl = urlParams.searchParams.get('redirect') || '/dashboard';
      console.log('Redirecting to:', redirectUrl);
      window.location.href = redirectUrl;
    }
  };
}
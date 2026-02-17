/**
 * Module UI pour la gestion des états visuels
 * @module login/ui
 */

/**
 * Crée le module UI pour la page de login
 * @returns {Object} Le module UI
 */
export function createUiModule() {
  return {
    /**
     * État de chargement
     * @type {boolean}
     */
    loading: false,

    /**
     * Message d'erreur
     * @type {string|null}
     */
    error: null,

    /**
     * Affiche une erreur
     * @param {string} message - Message d'erreur
     */
    showError(message) {
      console.error('Login error:', message);
      this.error = message;
    },

    /**
     * Efface l'erreur
     */
    clearError() {
      this.error = null;
    },

    /**
     * Active/désactive l'état de chargement
     * @param {boolean} isLoading - État de chargement
     */
    setLoading(isLoading) {
      console.log('Loading state:', isLoading);
      this.loading = isLoading;
    }
  };
}
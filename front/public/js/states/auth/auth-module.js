/**
 * Module d'authentification pour la gestion des tokens Parse
 * Gère le stockage et la récupération des tokens d'authentification
 */

export function createAuthModule() {
  return {
    // État initial
    token: null,
    userId: null,
    rememberMe: false,
    
    /**
     * Initialise le module d'authentification
     * Charge le token depuis le stockage approprié
     */
    initAuth() {
      console.log('Initializing auth module');
      
      // Vérifier d'abord dans localStorage (si "Se souvenir de moi" était coché)
      const localToken = localStorage.getItem('parseToken');
      const localUserId = localStorage.getItem('userId');
      
      if (localToken && localUserId) {
        this.token = localToken;
        this.userId = localUserId;
        this.rememberMe = true;
        console.log('Auth token loaded from localStorage');
      } else {
        // Sinon vérifier dans sessionStorage
        const sessionToken = sessionStorage.getItem('parseToken');
        const sessionUserId = sessionStorage.getItem('userId');
        
        if (sessionToken && sessionUserId) {
          this.token = sessionToken;
          this.userId = sessionUserId;
          this.rememberMe = false;
          console.log('Auth token loaded from sessionStorage');
        }
      }
    },
    
    /**
     * Stocke le token et les informations utilisateur
     * @param {string} token - Le token Parse
     * @param {string} userId - L'ID de l'utilisateur
     * @param {boolean} remember - Si true, utilise localStorage, sinon sessionStorage
     */
    storeAuth(token, userId, remember = false) {
      console.log('Storing auth token, remember:', remember);
      
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('parseToken', token);
      storage.setItem('userId', userId);
      
      // Mettre à jour l'état
      this.token = token;
      this.userId = userId;
      this.rememberMe = remember;
      
      // Nettoyer l'autre stockage
      if (remember) {
        sessionStorage.removeItem('parseToken');
        sessionStorage.removeItem('userId');
      } else {
        localStorage.removeItem('parseToken');
        localStorage.removeItem('userId');
      }
    },
    
    /**
     * Supprime les informations d'authentification
     */
    clearAuth() {
      console.log('Clearing auth information');
      
      localStorage.removeItem('parseToken');
      localStorage.removeItem('userId');
      sessionStorage.removeItem('parseToken');
      sessionStorage.removeItem('userId');
      
      // Réinitialiser l'état
      this.token = null;
      this.userId = null;
      this.rememberMe = false;
    },
    
    /**
     * Vérifie si l'utilisateur est authentifié
     * @returns {boolean}
     */
    get isAuthenticated() {
      return !!this.token && !!this.userId;
    },
    
    /**
     * Retourne le type de stockage utilisé
     * @returns {string}
     */
    get storageType() {
      return this.rememberMe ? 'localStorage' : 'sessionStorage';
    },
    
    /**
     * Récupère le token actuel
     * @returns {string|null}
     */
    getToken() {
      return this.token;
    },
    
    /**
     * Récupère l'ID utilisateur actuel
     * @returns {string|null}
     */
    getUserId() {
      return this.userId;
    }
  };
}
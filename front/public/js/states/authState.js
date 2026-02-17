/**
 * État Alpine.js global pour la gestion de l'authentification
 * Gère la vérification d'authentification et la redirection
 */

if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    Alpine.store('auth', {
      // État initial
      isAuthenticated: false,
      user: null,
      checkingAuth: true,

      /**
       * Vérifie l'état d'authentification de l'utilisateur
       * @param {boolean} requireAuth - Si true, redirige si non authentifié
       * @param {string} currentPath - Chemin actuel pour la redirection
       * @returns {Promise<boolean>} True si authentifié
       */
      async checkAuth(requireAuth = false, currentPath = '/') {
        console.log('Vérification de l\'authentification...');
        this.checkingAuth = true;
        
        try {
          // Récupération du token
          const authData = JSON.parse(localStorage.getItem('parseAuth')) ||
                          JSON.parse(sessionStorage.getItem('parseAuth'));
          
          if (authData && authData.parseToken) {
            // Vérification du token via Parse REST API
            const isValid = await this.validateToken(authData.parseToken);
            
            if (isValid) {
              this.isAuthenticated = true;
              this.user = { id: authData.userId };
              console.log('Utilisateur authentifié:', this.user);
              return true;
            } else {
              // Token invalide, suppression
              this.clearAuthData();
              if (requireAuth) {
                this.redirectToLogin(currentPath);
              }
              return false;
            }
          } else {
            // Pas de token trouvé
            if (requireAuth) {
              this.redirectToLogin(currentPath);
            }
            return false;
          }
        } catch (error) {
          console.error('Erreur lors de la vérification d\'authentification:', error);
          this.clearAuthData();
          if (requireAuth) {
            this.redirectToLogin(currentPath);
          }
          return false;
        } finally {
          this.checkingAuth = false;
        }
      },

      /**
       * Valide un token auprès de Parse REST API
       * @param {string} sessionToken - Token de session à valider
       * @returns {Promise<boolean>} True si le token est valide
       */
      async validateToken(sessionToken) {
        try {
          const response = await axios.get(
            'https://dev.parse.markidiags.com/parse/users/me',
            {
              headers: {
                'X-Parse-Application-Id': 'marki',
                'X-Parse-REST-API-Key': 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9',
                'X-Parse-Session-Token': sessionToken
              }
            }
          );
          
          console.log('Token valide pour l\'utilisateur:', response.data.username);
          return true;
        } catch (error) {
          console.error('Token invalide:', error.response?.data || error.message);
          return false;
        }
      },

      /**
       * Redirige vers la page de login avec paramètre de redirection
       * @param {string} redirectPath - Chemin vers lequel rediriger après login
       */
      redirectToLogin(redirectPath) {
        console.log('Redirection vers login avec redirect:', redirectPath);
        window.location.href = `/login?redirect=${encodeURIComponent(redirectPath)}`;
      },

      /**
       * Déconnecte l'utilisateur
       */
      logout() {
        console.log('Déconnexion de l\'utilisateur');
        this.clearAuthData();
        this.isAuthenticated = false;
        this.user = null;
        window.location.href = '/login';
      },

      /**
       * Supprime les données d'authentification
       */
      clearAuthData() {
        console.log('Suppression des données d\'authentification');
        localStorage.removeItem('parseAuth');
        sessionStorage.removeItem('parseAuth');
      },

      /**
       * Initialisation du store
       */
      init() {
        console.log('Store auth initialisé');
        // Vérification initiale si nécessaire
        if (window.location.pathname !== '/login') {
          this.checkAuth(false);
        }
      }
    });
    
    // Initialisation automatique
    Alpine.store('auth').init();
  });
}
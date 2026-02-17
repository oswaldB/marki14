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
       * @param {Array<string>} requiredRoles - Rôles requis pour accéder à la page
       * @returns {Promise<boolean>} True si authentifié et autorisé
       */
      async checkAuth(requireAuth = false, currentPath = '/', requiredRoles = []) {
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
              
              // Vérification des rôles si requis
              if (requiredRoles.length > 0) {
                const hasRequiredRole = await this.checkUserRoles(authData.parseToken, requiredRoles);
                if (!hasRequiredRole) {
                  console.error('Accès refusé: rôles insuffisants. Rôles requis:', requiredRoles);
                  this.clearAuthData();
                  if (requireAuth) {
                    this.redirectToLogin(currentPath);
                  }
                  return false;
                }
              }
              
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
       * Vérifie si l'utilisateur a les rôles requis
       * @param {string} sessionToken - Token de session
       * @param {Array<string>} requiredRoles - Rôles requis
       * @returns {Promise<boolean>} True si l'utilisateur a au moins un rôle requis
       */
      async checkUserRoles(sessionToken, requiredRoles) {
        try {
          // Récupérer les rôles de l'utilisateur via Parse REST API
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
          
          const userData = response.data;
          console.log('Données utilisateur:', userData);
          
          // Vérifier si l'utilisateur a au moins un des rôles requis
          // Dans Parse, les rôles sont généralement stockés dans un champ 'roles' ou via des relations
          // Pour simplifier, nous vérifions si l'username ou email contient des indicateurs de rôle
          
          const username = userData.username || '';
          const email = userData.email || '';
          
          // Logique simplifiée de vérification de rôle
          // Dans une implémentation complète, il faudrait interroger la table _Role
          const hasRequiredRole = requiredRoles.some(role => {
            return username.includes(role) || email.includes(role);
          });
          
          console.log('Vérification des rôles - requis:', requiredRoles, 'a rôle requis:', hasRequiredRole);
          return hasRequiredRole;
          
        } catch (error) {
          console.error('Erreur lors de la vérification des rôles:', error.response?.data || error.message);
          return false;
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
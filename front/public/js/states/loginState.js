/**
 * État Alpine.js pour la page de login
 * Gère l'authentification et la redirection paramétrée
 */

if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    Alpine.data('loginState', () => ({
      // État initial
      username: '',
      password: '',
      rememberMe: false,
      loading: false,
      error: null,

      /**
       * Gère la soumission du formulaire de connexion
       * @returns {Promise<void>}
       */
      async handleLogin() {
        try {
          this.loading = true;
          this.error = null;
          
          // Defensive checks
          if (!window.Alpine || !window.Alpine.store) {
            throw new Error('Alpine.js not properly initialized');
          }
          
          const authStore = window.Alpine.store('auth');
          if (!authStore) {
            throw new Error('Auth store not available');
          }
          
          // Appel à l'API Parse pour l'authentification
          const response = await this.loginToParse();
          
          if (response && response.sessionToken) {
            // Stockage du token et redirection
            this.storeAuthToken(response.sessionToken, response.objectId);
            this.redirectAfterLogin();
          } else {
            throw new Error('Réponse d\'authentification invalide');
          }
        } catch (error) {
          console.error('Erreur de connexion:', error);
          this.error = this.getErrorMessage(error);
        } finally {
          this.loading = false;
        }
      },

      /**
       * Authentification via Parse REST API
       * @returns {Promise<Object>} Objet contenant sessionToken et objectId
       */
      async loginToParse() {
        try {
          // Defensive checks
          if (!this.username || !this.password) {
            throw new Error('Username and password are required');
          }
          
          console.log('Appel à Parse REST API pour authentification');
          
          const response = await axios.post(
            'https://dev.parse.markidiags.com/parse/login',
            {
              username: this.username,
              password: this.password
            },
            {
              headers: {
                'X-Parse-Application-Id': 'marki',
                'X-Parse-REST-API-Key': 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9',
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('Authentification réussie:', response.data);
          return {
            sessionToken: response.data.sessionToken,
            objectId: response.data.objectId
          };
        } catch (error) {
          console.error('Erreur Parse API:', error.response?.data || error.message);
          throw error;
        }
      },

      /**
       * Stocke le token d'authentification
       * @param {string} sessionToken - Token de session Parse
       * @param {string} userId - ID de l'utilisateur
       */
      storeAuthToken(sessionToken, userId) {
        try {
          // Defensive checks
          if (!sessionToken || !userId) {
            console.warn('Invalid auth token or user ID');
            return;
          }
          
          const authData = {
            parseToken: sessionToken,
            userId: userId
          };
          
          console.log('Stockage du token:', {
            storageType: this.rememberMe ? 'localStorage' : 'sessionStorage',
            authData: authData
          });
          
          if (this.rememberMe) {
            localStorage.setItem('parseAuth', JSON.stringify(authData));
          } else {
            sessionStorage.setItem('parseAuth', JSON.stringify(authData));
          }
        } catch (error) {
          console.error('Error storing auth token:', error);
        }
      },

      /**
       * Redirige après une connexion réussie
       * @returns {void}
       */
      redirectAfterLogin() {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const redirect = urlParams.get('redirect');
          
          if (redirect && this.isSafeUrl(redirect)) {
            window.location.href = redirect;
          } else {
            window.location.href = '/dashboard';
          }
        } catch (error) {
          console.error('Error in redirect:', error);
          window.location.href = '/dashboard';
        }
      },

      /**
       * Vérifie si une URL est sécurisée pour la redirection
       * @param {string} url - URL à vérifier
       * @returns {boolean} True si l'URL est sécurisée
       */
      isSafeUrl(url) {
        try {
          // Defensive check
          if (!url || typeof url !== 'string') {
            return false;
          }
          
          return url.startsWith('/');
        } catch (e) {
          console.error('Error checking URL safety:', e);
          return false;
        }
      },

      /**
       * Extrait un message d'erreur compréhensible
       * @param {Error} error - Objet d'erreur
       * @returns {string} Message d'erreur utilisateur
       */
      getErrorMessage(error) {
        try {
          // Defensive check
          if (!error) {
            return 'An unknown error occurred';
          }
          
          if (error.message) {
            if (error.message.includes('Invalid username/password')) {
              return 'Identifiant ou mot de passe incorrect';
            }
            if (error.message.includes('network')) {
              return 'Erreur réseau. Veuillez vérifier votre connexion.';
            }
          }
          
          if (error.response) {
            switch (error.response.status) {
              case 401:
                return 'Identifiant ou mot de passe incorrect';
              case 404:
                return 'Utilisateur non trouvé';
              case 400:
                return 'Requête invalide';
              default:
                return `Erreur serveur (${error.response.status})`;
            }
          }
          
          return 'Erreur de connexion. Veuillez réessayer.';
        } catch (error) {
          console.error('Error getting error message:', error);
          return 'Une erreur est survenue lors de la connexion.';
        }
      },

      /**
       * Initialisation du composant
       */
      init() {
        try {
          console.log('Composant loginState initialisé');
          
          // Vérification si l'utilisateur est déjà connecté
          const existingAuth = localStorage.getItem('parseAuth') || sessionStorage.getItem('parseAuth');
          
          if (existingAuth) {
            try {
              const authData = JSON.parse(existingAuth);
              if (authData && authData.parseToken) {
                console.log('Utilisateur déjà connecté, redirection vers dashboard');
                window.location.href = '/dashboard';
              }
            } catch (error) {
              console.error('Error parsing existing auth data:', error);
            }
          }
        } catch (error) {
          console.error('Error in login state init:', error);
        }
      }
    }));
  });
}
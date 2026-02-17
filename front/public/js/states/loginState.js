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
        console.log('Tentative de connexion avec:', this.username);
        
        this.loading = true;
        this.error = null;
        
        try {
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
          this.loading = false;
        }
      },

      /**
       * Authentification via Parse REST API
       * @returns {Promise<Object>} Objet contenant sessionToken et objectId
       */
      async loginToParse() {
        console.log('Appel à Parse REST API pour authentification');
        
        try {
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
      },

      /**
       * Redirige après une connexion réussie
       * @returns {void}
       */
      redirectAfterLogin() {
        // Récupération du paramètre 'redirect' depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || '/dashboard';
        
        console.log('Redirection vers:', redirectUrl);
        
        // Validation de l'URL de redirection pour éviter les attaques XSS
        if (this.isSafeUrl(redirectUrl)) {
          window.location.href = redirectUrl;
        } else {
          console.warn('URL de redirection non sécurisée, utilisation de la valeur par défaut');
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
          const parsedUrl = new URL(url, window.location.origin);
          
          // Vérifier que l'URL est relative ou sur le même domaine
          return (
            parsedUrl.origin === window.location.origin ||
            url.startsWith('/')
          );
        } catch (e) {
          return false;
        }
      },

      /**
       * Extrait un message d'erreur compréhensible
       * @param {Error} error - Objet d'erreur
       * @returns {string} Message d'erreur utilisateur
       */
      getErrorMessage(error) {
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
        } else if (error.message) {
          return error.message;
        }
        return 'Erreur de connexion. Veuillez réessayer.';
      },

      /**
       * Initialisation du composant
       */
      init() {
        console.log('Composant loginState initialisé');
        
        // Vérification si l'utilisateur est déjà connecté
        const existingAuth = localStorage.getItem('parseAuth') || sessionStorage.getItem('parseAuth');
        if (existingAuth) {
          console.log('Utilisateur déjà connecté, redirection vers dashboard');
          window.location.href = '/dashboard';
        }
      }
    }));
  });
}
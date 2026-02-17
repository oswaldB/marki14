/**
 * État Alpine.js pour la page de login
 * Gère la connexion utilisateur et la redirection
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
        
        try {
          this.loading = true;
          this.error = null;
          
          // Récupérer le paramètre redirect de l'URL
          const urlParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlParams.get('redirect') || '/dashboard';
          
          console.log('URL de redirection:', redirectUrl);
          
          // Appeler l'API de connexion
          const response = await this.loginWithParse(this.username, this.password);
          
          console.log('Connexion réussie:', response);
          
          // Stocker le token selon la préférence utilisateur
          this.storeAuthToken(response, this.rememberMe);
          
          // Rediriger vers l'URL spécifiée
          window.location.href = redirectUrl;
          
        } catch (error) {
          console.error('Erreur de connexion:', error);
          this.error = this.getErrorMessage(error);
          this.loading = false;
        }
      },
      
      /**
       * Connexion via Parse REST API
       * @param {string} username - Identifiant utilisateur
       * @param {string} password - Mot de passe
       * @returns {Promise<Object>} - Réponse de l'API avec le token
       */
      async loginWithParse(username, password) {
        console.log('Appel à Parse REST API pour:', username);
        
        const response = await axios.post('/parse/login', {
          username: username,
          password: password
        }, {
          headers: {
            'X-Parse-Application-Id': 'marki',
            'X-Parse-Javascript-Key': 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9',
            'Content-Type': 'application/json'
          }
        });
        
        return response.data;
      },
      
      /**
       * Stocke le token d'authentification
       * @param {Object} authData - Données d'authentification
       * @param {boolean} remember - Si true, utilise localStorage, sinon sessionStorage
       */
      storeAuthToken(authData, remember) {
        const storage = remember ? localStorage : sessionStorage;
        
        console.log('Stockage du token dans:', remember ? 'localStorage' : 'sessionStorage');
        
        storage.setItem('parseToken', authData.sessionToken);
        storage.setItem('userId', authData.objectId);
        storage.setItem('username', this.username);
        
        // Stocker également dans sessionStorage pour les sessions courtes
        sessionStorage.setItem('parseToken', authData.sessionToken);
        sessionStorage.setItem('userId', authData.objectId);
      },
      
      /**
       * Récupère un message d'erreur compréhensible
       * @param {Error} error - Erreur capturée
       * @returns {string} - Message d'erreur utilisateur
       */
      getErrorMessage(error) {
        console.error('Détails de l\'erreur:', error.response?.data || error.message);
        
        if (error.response) {
          switch (error.response.status) {
            case 401:
              return 'Identifiant ou mot de passe incorrect';
            case 404:
              return 'Utilisateur non trouvé';
            case 500:
              return 'Erreur serveur, veuillez réessayer plus tard';
            default:
              return error.response.data.error || 'Erreur de connexion';
          }
        }
        
        return 'Erreur réseau, veuillez vérifier votre connexion';
      },
      
      /**
       * Initialisation du composant
       */
      init() {
        console.log('Composant loginState initialisé');
        
        // Vérifier si l'utilisateur est déjà connecté
        const token = localStorage.getItem('parseToken') || sessionStorage.getItem('parseToken');
        
        if (token) {
          console.log('Utilisateur déjà connecté, redirection vers dashboard');
          window.location.href = '/dashboard';
        }
      }
    }));
  });
}
// Gestion d'état pour la page de login avec Alpine.js
document.addEventListener('alpine:init', () => {
  Alpine.data('loginState', () => ({
    username: '',
    password: '',
    remember: false,
    isLoading: false,
    error: '',
    
    // Validation du formulaire
    validateForm() {
      if (!this.username) return 'Identifiant obligatoire';
      if (!this.password) return 'Mot de passe obligatoire';
      return '';
    },
    
    // Gestion des erreurs Parse
    getErrorMessage(code) {
      const messages = {
        101: 'Identifiant ou mot de passe incorrect',
        200: 'Session expirée',
        201: 'Mot de passe requis',
        202: 'Nom d\'utilisateur requis',
        default: 'Erreur de connexion'
      };
      return messages[code] || messages.default;
    },
    
    // Gestion du login
    async handleLogin() {
      const validationError = this.validateForm();
      if (validationError) {
        this.error = validationError;
        return;
      }
      
      this.isLoading = true;
      this.error = '';
      
      try {
        // Vérifier que Parse REST est disponible
        if (typeof window.ParseRest === 'undefined' || !window.PARSE_AUTH_CONFIG) {
          throw new Error('Parse REST non configuré');
        }
        
        // Connexion avec Parse REST API
        const response = await axios.post(
          `${window.PARSE_AUTH_CONFIG.serverUrl}/login`,
          {
            username: this.username,
            password: this.password
          },
          {
            headers: {
              'X-Parse-Application-Id': window.PARSE_AUTH_CONFIG.appId,
              'X-Parse-REST-API-Key': window.PARSE_AUTH_CONFIG.restApiKey,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const user = response.data;
        const sessionToken = user.sessionToken;
        
        // Gestion de la session selon l'option "Se souvenir de moi"
        if (this.remember) {
          // Session persistante - stockage en localStorage
          localStorage.setItem('parseSessionToken', sessionToken);
          console.log('🔐 Session persistante stockée en localStorage');
        } else {
          // Session temporaire - stockage en sessionStorage
          sessionStorage.setItem('parseSessionToken', sessionToken);
          console.log('🔐 Session temporaire stockée en sessionStorage');
        }
        
        console.log('🔐 Connexion réussie:', user.username);
        
        // Redirection vers le dashboard
        window.location.href = '/dashboard';
        
      } catch (error) {
        console.error('❌ Erreur de connexion:', error);
        const errorCode = error.response?.data?.code || 'default';
        this.error = this.getErrorMessage(errorCode);
      } finally {
        this.isLoading = false;
      }
    },
    
    // Pour les tests: remplir avec les credentials par défaut
    fillWithTestCredentials() {
      this.username = 'oswald';
      this.password = 'coucou';
    }
  }));
});
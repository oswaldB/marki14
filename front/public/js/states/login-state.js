/**
 * État Alpine.js pour la page de login
 * @namespace loginState
 */
document.addEventListener('alpine:init', () => {
  Alpine.data('loginState', () => ({
    // État du formulaire
    username: '',
    password: '',
    rememberMe: false,
    loading: false,
    error: null,
    
    /**
     * Effectue la connexion de l'utilisateur
     * @async
     * @function login
     * @memberof loginState
     * @returns {Promise<void>}
     */
    async login() {
      console.log('Tentative de connexion avec:', this.username);
      
      this.loading = true;
      this.error = null;
      
      try {
        // Import sécurisé de la configuration Parse
        let parseConfig;
        try {
          parseConfig = await import('/public/js/config/parse-config.js');
        } catch (importError) {
          console.error('Échec du chargement de parse-config:', importError);
          this.error = 'Configuration non disponible';
          this.loading = false;
          return;
        }
        
        const { parseApi, handleParseError } = parseConfig;
        
        // Appel à l'API d'authentification Parse REST
        const response = await parseApi.post('/login', {
          username: this.username,
          password: this.password
        });
        
        console.log('Connexion réussie:', response.data);
        
        // Stockage du token selon le choix "Se souvenir de moi"
        const storage = this.rememberMe ? localStorage : sessionStorage;
        storage.setItem('parseSessionToken', response.data.sessionToken);
        
        // Redirection selon le paramètre 'redirect' ou par défaut
        const redirectUrl = new URL(window.location).searchParams.get('redirect') || '/dashboard';
        console.log('Redirection vers:', redirectUrl);
        window.location.href = redirectUrl;
        
      } catch (error) {
        console.error('Erreur de connexion:', error.response?.data || error.message);
        this.error = handleParseError(error);
      } finally {
        this.loading = false;
      }
    }
  }));
});
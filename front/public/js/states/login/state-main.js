/**
 * State principal pour la page de login
 * Utilise l'API traditionnelle d'Alpine.js (compatible avec Alpine.js 3.x)
 * @module login/state-main
 */

document.addEventListener('alpine:init', () => {
  // Définir le composant login directement sur window pour qu'il soit accessible
  window.loginState = function() {
    return {
      // Propriétés d'authentification
      username: '',
      password: '',
      rememberMe: false,
      showPassword: false,
      
      // Propriétés UI
      loading: false,
      error: null,

      // Méthodes d'authentification
      togglePasswordVisibility() {
        console.log('Toggling password visibility');
        this.showPassword = !this.showPassword;
      },

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
          const response = await axios.get('https://dev.parse.markidiags.com/parse/login', {
            params: {
              username: this.username,
              password: this.password
            },
            headers: {
              'X-Parse-Application-Id': 'marki',
              'X-Parse-REST-API-Key': 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9'
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

      redirectAfterLogin() {
        const urlParams = new URL(window.location.href);
        const redirectUrl = urlParams.searchParams.get('redirect') || '/dashboard';
        console.log('Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      },

      // Méthodes UI
      showError(message) {
        console.error('Login error:', message);
        this.error = message;
      },

      clearError() {
        this.error = null;
      },

      setLoading(isLoading) {
        console.log('Loading state:', isLoading);
        this.loading = isLoading;
      },

      // Initialisation
      init() {
        console.log('Login state initialized');

        // Vérifier si l'utilisateur est déjà connecté
        const token = localStorage.getItem('parseToken') || sessionStorage.getItem('parseToken');
        if (token) {
          console.log('User already authenticated, redirecting...');
          this.redirectAfterLogin();
        }
      }
    };
  };

  // Initialiser le state lorsque Alpine est prêt
  document.addEventListener('DOMContentLoaded', () => {
    if (window.loginState) {
      const loginComponent = window.loginState();
      loginComponent.init();
    }
  });
});
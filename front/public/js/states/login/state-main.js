import { createAuthModule } from './auth';

document.addEventListener('alpine:init', () => {
  /**
   * State principal pour la page de login
   * @typedef {Object} LoginState
   * @property {string} pageTitle - Titre de la page
   * @property {Function} init - Initialise le state
   * @property {Function} handleSubmit - Gère la soumission du formulaire
   */
  Alpine.state('login', {
    ...createAuthModule(),
    
    // Propriétés spécifiques à la page
    pageTitle: 'Connexion',
    
    /**
     * Initialise le state de la page login
     * Vérifie si l'utilisateur est déjà connecté et redirige si nécessaire
     */
    init() {
      console.log('State de la page login initialisé');
      
      // Vérifier si l'utilisateur est déjà connecté
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        console.log('Utilisateur déjà connecté - Redirection vers dashboard');
        const redirectUrl = new URL(window.location).searchParams.get('redirect') || '/dashboard';
        window.location.href = redirectUrl;
      }
    },
    
    /**
     * Gère la soumission du formulaire de login
     * @param {Event} e - Événement de soumission du formulaire
     */
    handleSubmit(e) {
      e.preventDefault();
      console.log('Formulaire soumis - Validation:', this.isFormValid);
      
      if (this.isFormValid) {
        this.login();
      }
    }
  });
  
  // Initialiser le state
  Alpine.state('login').init();
});
/**
 * Module d'authentification pour la page de login
 * @returns {Object} Le module d'authentification
 */
export function createAuthModule() {
  return {
    // State
    username: '',
    password: '',
    rememberMe: false,
    loading: false,
    error: null,
    
    // Getters
    get isFormValid() {
      return this.username.length > 0 && this.password.length > 0;
    },
    
    // Actions
    async login() {
      console.log('Début du processus de login - Username:', this.username);
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
            rememberMe: this.rememberMe
          })
        });
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Échec de l\'authentification');
        }
        
        // Stockage du token selon le choix utilisateur
        const storage = this.rememberMe ? localStorage : sessionStorage;
        storage.setItem('authToken', JSON.stringify(data.token));
        
        console.log('Token stocké dans', this.rememberMe ? 'localStorage' : 'sessionStorage');
        console.log('Redirection vers:', data.redirectUrl);
        
        // Redirection
        window.location.href = data.redirectUrl;
        
      } catch (error) {
        console.error('Erreur lors du login:', error.message);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    clearError() {
      this.error = null;
    }
  };
}
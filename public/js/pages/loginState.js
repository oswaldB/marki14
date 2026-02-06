/**
 * État Alpine.js pour la page de connexion
 * Gère la logique de connexion et l'état du formulaire
 */


document.addEventListener('alpine:init', () => {
  Alpine.data('loginState', () => ({
  email: '',
  password: '',
  remember: false,
  isLoading: false,
  error: '',
  
  /**
   * Gère la soumission du formulaire de connexion
   */
  async handleLogin() {
    this.isLoading = true;
    this.error = '';
    
    try {
      // Vérification de la validité du formulaire
      if (!this.email || !this.password) {
        throw new Error('Veuillez remplir tous les champs.');
      }
      
      // Login direct avec Parse SDK
      const user = await Parse.User.logIn(this.email, this.password);
      
      // Sauvegarder le token dans sessionStorage ou localStorage selon "Se souvenir de moi"
      if (this.remember) {
        localStorage.setItem('parseSessionToken', user.getSessionToken());
        console.log('✅ Token sauvegardé dans localStorage');
      } else {
        sessionStorage.setItem('parseSessionToken', user.getSessionToken());
        console.log('✅ Token sauvegardé dans sessionStorage');
      }
      
      console.log('✅ Connexion réussie:', user.get('username'));
      
      // Redirection
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect') || '/dashboard';
      window.location.href = decodeURIComponent(redirect);
      
    } catch (err) {
      console.error('❌ Erreur de connexion:', err);
      this.error = this.getErrorMessage(err);
      this.isLoading = false;
      
      // Focus sur le champ email en cas d'erreur
      setTimeout(() => {
        document.querySelector('input[type="text"]').focus();
      }, 100);
    }
  },
  
  /**
   * Retourne un message d'erreur utilisateur à partir de l'erreur Parse
   * @param {Error} err - L'erreur Parse
   * @returns {string} Message d'erreur utilisateur
   */
  getErrorMessage(err) {
    if (!err) return 'Une erreur inconnue est survenue.';
    
    const errorCode = err.code;
    const errorMessage = err.message;
    
    // Messages d'erreur spécifiques
    const errorMessages = {
      101: 'Email ou mot de passe incorrect.',
      200: 'L\'email est requis.',
      201: 'Le mot de passe est requis.',
      202: 'Le nom d\'utilisateur est requis.',
      203: 'L\'email est déjà utilisé.',
      204: 'Le nom d\'utilisateur est déjà utilisé.',
      205: 'L\'email est invalide.',
      default: 'Email ou mot de passe incorrect.'
    };
    
    return errorMessages[errorCode] || errorMessages.default;
  }
}));

/**
 * Vérifie si l'utilisateur est déjà connecté au chargement de la page
 */
document.addEventListener('DOMContentLoaded', () => {
  // Vérifier d'abord dans localStorage, puis dans sessionStorage
  const sessionToken = localStorage.getItem('parseSessionToken') || sessionStorage.getItem('parseSessionToken');
  
  if (sessionToken) {
    Parse.User.become(sessionToken).then((user) => {
      // Sauvegarder le token après restauration réussie
      if (localStorage.getItem('parseSessionToken')) {
        localStorage.setItem('parseSessionToken', user.getSessionToken());
        console.log('✅ Session restaurée depuis localStorage');
      } else {
        sessionStorage.setItem('parseSessionToken', user.getSessionToken());
        console.log('✅ Session restaurée depuis sessionStorage');
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect') || '/dashboard';
      window.location.href = decodeURIComponent(redirect);
    }).catch(() => {
      // Token invalide, on le supprime des deux endroits
      localStorage.removeItem('parseSessionToken');
      sessionStorage.removeItem('parseSessionToken');
    });
  }
});
});
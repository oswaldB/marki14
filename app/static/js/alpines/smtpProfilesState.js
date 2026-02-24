// smtpProfilesState.js - État pour les profils SMTP
document.addEventListener('alpine:init', () => {
  Alpine.data('smtpProfilesState', () => ({
    profiles: [],
    isLoading: false,
    error: null,
    
    async loadProfiles() {
      this.isLoading = true;
      this.error = null;
      
      try {
        console.log('Chargement des profils SMTP');
        this.profiles = [];
      } catch (error) {
        this.error = 'Erreur lors du chargement des profils';
        console.error('Erreur:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }))
});
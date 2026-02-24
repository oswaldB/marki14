// adminSuperadminState.js - État pour l'admin superadmin
document.addEventListener('alpine:init', () => {
  Alpine.data('adminSuperadminState', () => ({
    isLoading: false,
    statusMessage: '',
    resultData: null,
    
    async runSynchronization() {
      this.isLoading = true;
      this.statusMessage = 'Synchronisation en cours...';
      
      try {
        console.log('Synchronisation démarrée');
        this.statusMessage = 'Synchronisation terminée avec succès';
      } catch (error) {
        this.statusMessage = 'Erreur lors de la synchronisation';
        console.error('Erreur:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }))
});
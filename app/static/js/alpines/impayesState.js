// impayesState.js - État pour les impayés
document.addEventListener('alpine:init', () => {
  Alpine.data('impayesState', () => ({
    impayes: [],
    isLoading: false,
    error: null,
    searchTerm: '',
    
    async refreshData() {
      this.isLoading = true;
      this.error = null;
      
      try {
        console.log('Rafraîchissement des données impayés');
        this.impayes = [];
      } catch (error) {
        this.error = 'Erreur lors du rafraîchissement';
        console.error('Erreur:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    filterImpayes() {
      console.log('Filtrage avec:', this.searchTerm);
    }
  }))
});
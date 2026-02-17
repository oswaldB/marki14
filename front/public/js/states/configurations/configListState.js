/**
 * État Alpine.js pour la page de liste des configurations
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('configListState', () => ({
    // État initial
    configurations: [],
    filteredConfigurations: [],
    searchQuery: '',
    statusFilter: '',
    currentPage: 1,
    itemsPerPage: 10,
    loading: false,
    error: null,

    // Getters
    get totalConfigurations() {
      return this.filteredConfigurations.length;
    },

    // Méthodes du cycle de vie
    init() {
      console.log('Initialisation du state configListState');
      this.loadConfigurations();
    },

    /**
     * Charge les configurations depuis Parse
     */
    async loadConfigurations() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('/api/configurations');
        if (!response.ok) throw new Error('Failed to load configurations');

        const data = await response.json();
        this.configurations = data;
        this.filteredConfigurations = data;
        this.applyFilters();
      } catch (error) {
        console.error('Error loading configurations:', error);
        this.error = 'Failed to load configurations. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Applique les filtres aux configurations
     */
    applyFilters() {
      let filtered = [...this.configurations];

      // Filtre par recherche
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(config =>
          config.name.toLowerCase().includes(query) ||
          config.dbConfig.database.toLowerCase().includes(query) ||
          config.description.toLowerCase().includes(query)
        );
      }

      // Filtre par statut
      if (this.statusFilter) {
        filtered = filtered.filter(config => config.status === this.statusFilter);
      }

      this.filteredConfigurations = filtered;
      this.currentPage = 1;
    },

    /**
     * Rafraîchit la liste des configurations
     */
    refreshConfigurations() {
      this.loadConfigurations();
    },

    /**
     * Navigue vers la page de création
     */
    navigateTo(path) {
      window.location.href = path;
    },

    /**
     * Navigue vers la page d'édition
     * @param {string} configId - L'ID de la configuration
     */
    editConfig(configId) {
      window.location.href = `/admin/configurations/${configId}/edit`;
    },

    /**
     * Teste une configuration
     * @param {string} configId - L'ID de la configuration
     */
    async testConfig(configId) {
      try {
        const response = await fetch(`/api/configurations/${configId}/test`, {
          method: 'POST'
        });

        const result = await response.json();
        
        if (response.ok) {
          alert(`Test réussi: ${result.message}`);
        } else {
          alert(`Test échoué: ${result.error}`);
        }
      } catch (error) {
        console.error('Error testing configuration:', error);
        alert('Failed to test configuration');
      }
    },

    /**
     * Supprime une configuration
     * @param {string} configId - L'ID de la configuration
     */
    async deleteConfig(configId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette configuration?')) return;

      try {
        const response = await fetch(`/api/configurations/${configId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          this.loadConfigurations();
          alert('Configuration supprimée avec succès');
        } else {
          const errorData = await response.json();
          alert(`Failed to delete: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error deleting configuration:', error);
        alert('Failed to delete configuration');
      }
    },

    /**
     * Pagination - Page précédente
     */
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    /**
     * Pagination - Page suivante
     */
    nextPage() {
      if (this.currentPage * this.itemsPerPage < this.totalConfigurations) {
        this.currentPage++;
      }
    }
  }));
});
// variablesStore.js - Store centralisé pour la gestion des variables
// Ce store gère le chargement et la gestion des variables disponibles depuis variables.json

document.addEventListener('alpine:init', () => {
  Alpine.store('variables', {
    // ============================================
    // ÉTAT INITIAL
    // ============================================

    // Liste complète des variables disponibles
    variables: [],

    // Variables filtrées pour la recherche
    filteredVariables: [],

    // État de chargement et d'erreur
    isLoading: false,
    error: null,

    // Terme de recherche actuel
    searchTerm: '',

    // ============================================
    // MÉTHODES PRINCIPALES
    // ============================================

    /**
     * Charge les variables depuis le fichier variables.json
     */
    async loadVariables() {
      this.isLoading = true;
      this.error = null;

      try {
        console.log('Chargement des variables depuis variables.json');
        const response = await fetch('/static/configs/variables.json');

        if (!response.ok) {
          throw new Error('Fichier variables.json introuvable');
        }

        const data = await response.json();
        this.variables = data.columns || [];
        this.filteredVariables = [...this.variables];

        console.log('Variables chargées:', this.variables.length);
        return this.variables;

      } catch (error) {
        this.error = 'Erreur lors du chargement des variables: ' + error.message;
        console.error('Erreur:', error);
        this.variables = [];
        this.filteredVariables = [];
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Met à jour les variables filtrées en fonction du terme de recherche
     */
    updateFilteredVariables() {
      if (!this.searchTerm) {
        this.filteredVariables = [...this.variables];
      } else {
        this.filteredVariables = this.variables.filter(variable =>
          variable.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      }
    },

    /**
     * Met à jour le terme de recherche et filtre les variables
     * @param {string} term - Terme de recherche
     */
    setSearchTerm(term) {
      this.searchTerm = term;
      this.updateFilteredVariables();
    },

    /**
     * Copie une variable dans le presse-papiers
     * @param {string} variable - Variable à copier
     */
    copyVariable(variable) {
      const variableWithBrackets = `[[${variable}]]`;
      navigator.clipboard.writeText(variableWithBrackets)
        .then(() => {
          console.log(`Variable ${variableWithBrackets} copiée dans le presse-papiers`);
          return true;
        })
        .catch(err => {
          console.error('Échec de la copie:', err);
          return false;
        });
    },

    /**
     * Réinitialise l'état du store
     */
    resetStore() {
      this.variables = [];
      this.filteredVariables = [];
      this.isLoading = false;
      this.error = null;
      this.searchTerm = '';
      console.log('Store variables réinitialisé');
    }
  });
});
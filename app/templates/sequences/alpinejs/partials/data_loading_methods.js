// Rafraîchir les données
async refreshData() {
    this.isLoading = true;
    this.error = null;
    
    try {
        // Attendre que parseAxios soit disponible
        let parseAxios = Alpine.store('parseAxios');
        
        // Si parseAxios n'est pas disponible, attendre un peu et réessayer
        if (!parseAxios) {
            await new Promise(resolve => setTimeout(resolve, 200));
            parseAxios = Alpine.store('parseAxios');
        }
        
        if (!parseAxios) {
            throw new Error('parseAxios n\'est pas disponible');
        }
        
        // Appel à l'API Parse pour récupérer les plans de relance
        const response = await parseAxios.get('/classes/Sequences?limit=1000&order=-createdAt&include=actions');
        this.sequences = response.data.results || [];
        this.filteredSequences = [...this.sequences];
        this.filterSequences();
        
    } catch (error) {
        console.error('Erreur lors du chargement des plans de relance:', error);
        this.error = 'Impossible de charger les données des plans de relance.';
    } finally {
        this.isLoading = false;
    }
},
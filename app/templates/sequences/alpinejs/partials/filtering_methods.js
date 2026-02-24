// Filtrer les plans de relance
filterSequences() {
    if (!this.sequences || !Array.isArray(this.sequences)) {
        this.filteredSequences = [];
        return;
    }
    
    let filtered = [...this.sequences];
    
    // Filtrer par terme de recherche
    if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        filtered = filtered.filter(sequence => {
            return sequence.nom && sequence.nom.toLowerCase().includes(searchLower);
        });
    }
    
    // Filtrer par type
    if (this.selectedType) {
        const isAuto = this.selectedType === 'automatic';
        filtered = filtered.filter(sequence => sequence.isAuto === isAuto);
    }
    
    // Filtrer par statut
    if (this.selectedStatus) {
        const isActive = this.selectedStatus === 'true';
        filtered = filtered.filter(sequence => sequence.isActif === isActive);
    }
    
    this.filteredSequences = filtered;
    this.currentPage = 1; // Réinitialiser la pagination
},
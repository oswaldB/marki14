// Supprimer un plan de relance
deleteSequence(sequence) {
    this.sequenceToDelete = sequence;
    this.deleteConfirmOpen = true;
},

// Confirmer la suppression
async confirmDelete() {
    if (!this.sequenceToDelete) {
        return;
    }
    
    try {
        let parseAxios = Alpine.store('parseAxios');
        
        if (!parseAxios) {
            throw new Error('parseAxios n\'est pas disponible');
        }
        
        await parseAxios.delete(`/classes/Sequences/${this.sequenceToDelete.objectId}`);
        
        // Fermer la popup
        this.deleteConfirmOpen = false;
        this.sequenceToDelete = null;
        
        // Rafraîchir les données
        await this.refreshData();
        
    } catch (error) {
        console.error('Erreur lors de la suppression du plan de relance:', error);
        this.error = 'Impossible de supprimer le plan de relance.';
    }
},

// Annuler la suppression
cancelDelete() {
    this.deleteConfirmOpen = false;
    this.sequenceToDelete = null;
},
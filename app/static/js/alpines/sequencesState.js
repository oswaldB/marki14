// sequencesState.js - État pour les séquences
document.addEventListener('alpine:init', () => {
  Alpine.data('sequencesState', () => ({
    sequences: [],
    filteredSequences: [],
    paginatedSequences: [],
    searchTerm: '',
    selectedType: '',
    selectedStatus: '',
    itemsPerPage: 10,
    currentPage: 1,
    isLoading: false,
    error: null,
    drawerOpen: false,
    editingSequence: false,
    currentSequence: {
      nom: '',
      description: '',
      isAuto: false,
      isActif: true,
      actions: []
    },
    deleteConfirmOpen: false,
    sequenceToDelete: null,
    
    async loadSequences() {
      this.isLoading = true;
      this.error = null;
      
      try {
        console.log('Chargement des séquences');
        const parseAxios = this.getParseAxios();
        const response = await parseAxios.get('/classes/Sequences');
        
        this.sequences = response.data.results.map(seq => ({
          objectId: seq.objectId,
          nom: seq.nom || 'Séquence sans nom',
          description: seq.description || '',
          isAuto: seq.isAuto || false,
          isActif: seq.isActif || true,
          actions: seq.actions || [],
          createdAt: seq.createdAt || new Date().toISOString()
        }));
        
        this.filterSequences();
      } catch (error) {
        this.error = 'Erreur lors du chargement des séquences';
        console.error('Erreur:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    getParseAxios() {
      const parseAxios = Alpine.store("parseAxios");
      if (!parseAxios) {
        throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
      }
      return parseAxios;
    },
    
    filterSequences() {
      this.filteredSequences = this.sequences.filter(sequence => {
        // Filter by search term
        const matchesSearch = this.searchTerm === '' ||
          (sequence.nom && sequence.nom.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (sequence.description && sequence.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
        
        // Filter by type
        const matchesType = this.selectedType === '' ||
          (this.selectedType === 'manual' && !sequence.isAuto) ||
          (this.selectedType === 'auto' && sequence.isAuto);
        
        // Filter by status
        const matchesStatus = this.selectedStatus === '' ||
          sequence.isActif.toString() === this.selectedStatus;
        
        return matchesSearch && matchesType && matchesStatus;
      });
      
      this.currentPage = 1; // Reset to first page when filtering
      this.updatePagination();
    },
    
    updatePagination() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.paginatedSequences = this.filteredSequences.slice(startIndex, endIndex);
    },
    
    openCreateDrawer() {
      this.editingSequence = false;
      this.currentSequence = {
        nom: '',
        description: '',
        isAuto: false,
        isActif: true,
        actions: []
      };
      this.drawerOpen = true;
    },
    
    openEditDrawer(sequence) {
      this.editingSequence = true;
      this.currentSequence = {...sequence};
      this.drawerOpen = true;
    },
    
    closeDrawer() {
      this.drawerOpen = false;
    },
    
    async saveSequence() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const parseAxios = this.getParseAxios();
        
        if (this.editingSequence) {
          // Update existing sequence
          console.log('Mise à jour de la séquence:', this.currentSequence);
          await parseAxios.put(`/classes/Sequences/${this.currentSequence.objectId}`, {
            nom: this.currentSequence.nom,
            description: this.currentSequence.description,
            isAuto: this.currentSequence.isAuto,
            isActif: this.currentSequence.isActif,
            actions: this.currentSequence.actions
          });
          
          // Mettre à jour localement
          const index = this.sequences.findIndex(s => s.objectId === this.currentSequence.objectId);
          if (index !== -1) {
            this.sequences[index] = {...this.currentSequence};
          }
        } else {
          // Create new sequence
          console.log('Création de la séquence:', this.currentSequence);
          const response = await parseAxios.post('/classes/Sequences', {
            nom: this.currentSequence.nom,
            description: this.currentSequence.description,
            isAuto: this.currentSequence.isAuto,
            isActif: this.currentSequence.isActif,
            actions: this.currentSequence.actions
          });
          
          this.sequences.push({
            ...this.currentSequence,
            objectId: response.data.objectId,
            createdAt: response.data.createdAt || new Date().toISOString()
          });
        }
        
        this.filterSequences();
        this.closeDrawer();
      } catch (error) {
        this.error = 'Erreur lors de l\'enregistrement de la séquence';
        console.error('Erreur:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    deleteSequence(sequence) {
      this.sequenceToDelete = sequence;
      this.deleteConfirmOpen = true;
    },
    
    async confirmDelete() {
      if (!this.sequenceToDelete) return;
      
      this.isLoading = true;
      this.error = null;
      
      try {
        console.log('Suppression de la séquence:', this.sequenceToDelete.objectId);
        const parseAxios = this.getParseAxios();
        await parseAxios.delete(`/classes/Sequences/${this.sequenceToDelete.objectId}`);
        
        this.sequences = this.sequences.filter(s => s.objectId !== this.sequenceToDelete.objectId);
        this.filterSequences();
        this.cancelDelete();
      } catch (error) {
        this.error = 'Erreur lors de la suppression de la séquence';
        console.error('Erreur:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    cancelDelete() {
      this.deleteConfirmOpen = false;
      this.sequenceToDelete = null;
    },
    
    async duplicateSequence(sequence) {
      try {
        const parseAxios = this.getParseAxios();
        const response = await parseAxios.post('/classes/Sequences', {
          nom: sequence.nom + ' (Copie)',
          description: sequence.description,
          isAuto: sequence.isAuto,
          isActif: sequence.isActif,
          actions: [...sequence.actions]
        });
        
        this.sequences.push({
          ...sequence,
          objectId: response.data.objectId,
          nom: sequence.nom + ' (Copie)',
          createdAt: response.data.createdAt || new Date().toISOString()
        });
        
        this.filterSequences();
      } catch (error) {
        this.error = 'Erreur lors de la duplication de la séquence';
        console.error('Erreur:', error);
      }
    },
    
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.updatePagination();
      }
    },
    
    nextPage() {
      if (this.currentPage * this.itemsPerPage < this.filteredSequences.length) {
        this.currentPage++;
        this.updatePagination();
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }))
});
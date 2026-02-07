/**
 * État Alpine.js pour la page des séquences
 * Gestion des séquences de relance
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('sequencesState', () => ({
    
    // État initial
    sequences: [],              // Liste des séquences
    isLoading: true,           // État de chargement
    showCreateModal: false,    // Affichage du modal de création
    showSequenceDeleteConfirmation: false, // Confirmation de suppression
    sequenceToDelete: null,    // Séquence à supprimer
    
    // État pour la création de séquence
    newSequenceName: '',        // Nom de la nouvelle séquence
    newSequenceDescription: '', // Description de la nouvelle séquence
    newSequenceType: 'normal',  // Type de la nouvelle séquence (normal/automatique)
    isCreating: false,         // État de création en cours
    
    // Initialisation
    async init() {
      try {
        console.log('Initialisation de la page séquences...');
        this.isLoading = true;
        
        const initTimeout = setTimeout(() => {
          console.error('❌ Timeout de l\'initialisation atteint');
          this.isLoading = false;
          clearTimeout(initTimeout);
        }, 30000);
        
        // Attendre que Parse soit disponible
        let parseRetryCount = 0;
        const maxParseRetries = 5;
        
        while (!window.Parse && parseRetryCount < maxParseRetries) {
          console.warn('⚠️ Parse n\'est pas encore disponible...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          parseRetryCount++;
        }
        
        if (!window.Parse) {
          console.error('❌ Parse n\'est pas disponible');
          this.isLoading = false;
          clearTimeout(initTimeout);
          return;
        }
        
        await this.fetchSequences();
        
        console.log('✅ Initialisation terminée');
        this.isLoading = false;
        clearTimeout(initTimeout);
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        this.isLoading = false;
        clearTimeout(initTimeout);
      }
    },
    
    // Récupérer les séquences depuis Parse
    async fetchSequences() {
      try {
        this.isLoading = true;
        
        const Sequences = Parse.Object.extend('Sequences');
        const query = new Parse.Query(Sequences);
        
        // Trier par nom
        query.ascending('nom');
        query.limit(99999);
        
        const results = await query.find();
        
        this.sequences = results.map(item => {
          const json = item.toJSON();
          return {
            objectId: json.objectId,
            nom: json.nom || 'Séquence sans nom',
            description: json.description || '',
            isActif: json.isActif || false,
            isAuto: json.isAuto || false,
            actions: json.actions || [],
            createdAt: json.createdAt,
            updatedAt: json.updatedAt,
            lastRun: json.lastRun
          };
        });
        
        console.log('Séquences chargées:', this.sequences);
        
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des séquences:', error);
        this.sequences = [];
      } finally {
        this.isLoading = false;
      }
    },
    
    // Synchroniser les séquences (rafraîchissement simple)
    async syncSequences() {
      try {
        this.isLoading = true;
        console.log('Rafraîchissement des séquences...');
        
        // Rafraîchissement simple - recharger les données depuis Parse
        await this.fetchSequences();
        
        console.log('Rafraîchissement terminé');
        
      } catch (error) {
        console.error('❌ Erreur lors du rafraîchissement:', error);
        this.isLoading = false;
      }
    },
    
    // Naviguer vers les détails d'une séquence
    navigateToSequenceDetail(sequenceId) {
      window.location.href = `/sequence-detail?sequenceId=${sequenceId}`;
    },
    
    // Basculer l'état actif/inactif d'une séquence
    async toggleSequenceStatus(sequence) {
      try {
        const Sequences = Parse.Object.extend('Sequences');
        const sequenceToUpdate = new Sequences();
        sequenceToUpdate.id = sequence.objectId;
        
        sequenceToUpdate.set('isActif', !sequence.isActif);
        
        await sequenceToUpdate.save();
        
        // Mettre à jour localement
        sequence.isActif = !sequence.isActif;
        
        console.log('Statut de la séquence mis à jour:', sequence.nom, sequence.isActif);
        
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du statut:', error);
      }
    },
    
    // Confirmer la suppression d'une séquence
    confirmDeleteSequence(sequence) {
      this.sequenceToDelete = sequence;
      this.showSequenceDeleteConfirmation = true;
    },
    
    // Annuler la suppression
    cancelDeleteSequence() {
      this.sequenceToDelete = null;
      this.showSequenceDeleteConfirmation = false;
    },
    
    // Supprimer une séquence
    async deleteSequence() {
      if (!this.sequenceToDelete) return;
      
      try {
        const Sequences = Parse.Object.extend('Sequences');
        const sequenceToDelete = new Sequences();
        sequenceToDelete.id = this.sequenceToDelete.objectId;
        
        await sequenceToDelete.destroy();
        
        // Retirer de la liste locale
        this.sequences = this.sequences.filter(
          seq => seq.objectId !== this.sequenceToDelete.objectId
        );
        
        console.log('Séquence supprimée:', this.sequenceToDelete.nom);
        
        this.cancelDeleteSequence();
        
      } catch (error) {
        console.error('❌ Erreur lors de la suppression de la séquence:', error);
        this.cancelDeleteSequence();
      }
    },
    
    // Formater une date
    formatDate(date) {
      if (!date) return 'Jamais';
      
      let dateObj;
      
      if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (typeof date === 'number') {
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        if (date.__type === 'Date' && date.iso) {
          dateObj = new Date(date.iso);
        } else {
          console.warn('⚠️ Format de date non reconnu:', date);
          return 'Date inconnue';
        }
      }
      
      if (isNaN(dateObj.getTime())) {
        console.warn('⚠️ Date invalide:', date);
        return 'Date inconnue';
      }
      
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    
    // Créer une nouvelle séquence
    async createSequence() {
      if (this.isCreating) return;
      
      try {
        this.isCreating = true;
        console.log('Création d\'une nouvelle séquence...');
        
        const Sequences = Parse.Object.extend('Sequences');
        const newSequence = new Sequences();
        
        newSequence.set('nom', this.newSequenceName);
        newSequence.set('description', this.newSequenceDescription);
        newSequence.set('isAuto', this.newSequenceType === 'automatique');
        newSequence.set('isActif', true);
        newSequence.set('actions', []);
        
        await newSequence.save();
        
        console.log('Séquence créée avec succès:', this.newSequenceName);
        
        // Réinitialiser le formulaire
        this.newSequenceName = '';
        this.newSequenceDescription = '';
        this.newSequenceType = 'normal';
        this.showCreateModal = false;
        
        // Rafraîchir la liste
        await this.fetchSequences();
        
      } catch (error) {
        console.error('❌ Erreur lors de la création de la séquence:', error);
      } finally {
        this.isCreating = false;
      }
    },
    
    // Tronquer du texte
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    }
  }));
});
/**
 * sequencesState.js - Gestion de l'état principal pour la page de liste des séquences
 * Basé sur les spécifications: admin/specs/sequences/specs.md
 */



document.addEventListener('alpine:init', () => {
  Alpine.data('sequencesState', () => ({
    // État initial
    sequences: [],
    isLoading: false,
    isCreating: false,
    isDeleting: false,
    searchQuery: '',
    currentPage: 1,
    itemsPerPage: 10,
    
    // États d'interface
    showCreateModal: false,
    showDeleteConfirmation: false,
    sequenceToDelete: null,
    showSequenceDeleteConfirmation: false,
    sequenceToDeleteId: null,
    
    // Données pour la nouvelle séquence
    newSequenceName: '',
    newSequenceDescription: '',
    newSequenceType: 'normal', // 'normal' ou 'automatique'
    
    // Notifications
    notification: {
      show: false,
      type: 'info', // success, error, warning, info
      title: '',
      message: ''
    },
    
    /**
     * Initialisation et chargement des données
     */
    
    async init() {
      this.isLoading = true;
      
      try {
        // Vérifier que Parse est disponible
        if (typeof Parse === 'undefined') {
          console.error('Parse SDK non chargé');
          this.showNotification('Erreur', 'Parse SDK non disponible', 'error');
          return;
        }
        
        // Initialiser Parse si nécessaire
        if (window.parseConfig && !Parse.applicationId) {
          Parse.initialize(window.parseConfig.appId, window.parseConfig.javascriptKey);
          Parse.serverURL = window.parseConfig.serverURL;
        }
        
        // Vérifier que Parse est bien initialisé
        if (!Parse.applicationId) {
          console.error('Parse non initialisé - configuration manquante');
          this.showNotification('Erreur', 'Parse non initialisé', 'error');
          return;
        }
        
        console.log('Parse initialisé avec:', {
          appId: Parse.applicationId,
          serverURL: Parse.serverURL
        });
        
        // Charger les séquences
        await this.loadSequences();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        this.showNotification('Erreur', 'Impossible de charger les données initiales', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Chargement des séquences
     */
    async loadSequences() {
      this.isLoading = true;
      
      try {
        // Vérifier que Parse est disponible
        if (typeof Parse === 'undefined' || !Parse.applicationId) {
          console.error('Parse non initialisé');
          this.showNotification('Erreur', 'Parse non initialisé', 'error');
          return;
        }
        
        console.log('Chargement des séquences depuis Parse...');
        
        const query = new Parse.Query('Sequences');
        
        // Tri par nom
        query.ascending('nom');
        
        // Recherche si nécessaire
        if (this.searchQuery) {
          const searchLower = this.searchQuery.toLowerCase();
          query.contains('nom', searchLower);
        }
        
        const results = await query.find();
        
        console.log(`Trouvé ${results.length} séquences`);
        
        this.sequences = results.map(seq => ({
          objectId: seq.id,
          ...seq.toJSON()
        }));
        
      } catch (error) {
        console.error('Erreur lors du chargement des séquences:', error);
        this.showNotification('Erreur', 'Impossible de charger les séquences', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Recherche de séquences
     */
    async searchSequences() {
      this.currentPage = 1;
      await this.loadSequences();
    },
    
    /**
     * Ouverture du drawer de création
     */
    openCreateDrawer() {
      this.showCreateModal = true;
    },
    
    /**
     * Création d'une nouvelle séquence
     */
    async createSequence() {
      if (!this.newSequenceName) {
        this.showNotification('Erreur', 'Le nom de la séquence est obligatoire', 'error');
        return;
      }
      
      this.isCreating = true;
      
      try {
        const Sequences = Parse.Object.extend('sequences');
        const sequence = new Sequences();
        
        sequence.set('nom', this.newSequenceName);
        sequence.set('description', this.newSequenceDescription || '');
        sequence.set('isActif', false);
        sequence.set('actions', []);
        sequence.set('isAuto', this.newSequenceType === 'automatique');
        
        // Si c'est une séquence automatique, initialiser les filtres automatiques
        if (this.newSequenceType === 'automatique') {
          sequence.set('requete_auto', { include: {}, exclude: {} });
        }
        
        const newSequence = await sequence.save();
        
        // Réinitialiser le formulaire
        this.newSequenceName = '';
        this.newSequenceDescription = '';
        this.newSequenceType = 'normal';
        this.showCreateModal = false;
        
        // Recharger les séquences
        await this.loadSequences();
        
        this.showNotification('Succès', 'Séquence créée avec succès', 'success');
        
        // Rediriger vers la page de détail appropriée en fonction du type
        const redirectPath = this.newSequenceType === 'automatique' 
          ? `/sequence-automatique?id=${newSequence.id}`
          : `/sequence?id=${newSequence.id}`;
        
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 1000);
        
      } catch (error) {
        console.error('Erreur lors de la création de la séquence:', error);
        this.showNotification('Erreur', 'Impossible de créer la séquence', 'error');
      } finally {
        this.isCreating = false;
      }
    },
    
    /**
     * Préparation de la suppression d'une séquence
     */
    prepareDeleteSequence(sequenceId) {
      this.sequenceToDelete = sequenceId;
      this.showDeleteConfirmation = true;
    },
    
    /**
     * Suppression d'une séquence
     */
    async deleteSequence() {
      if (!this.sequenceToDelete) return;
      
      this.isDeleting = true;
      
      try {
        const Sequences = Parse.Object.extend('sequences');
        const sequence = new Sequences();
        sequence.id = this.sequenceToDelete;
        
        await sequence.destroy();
        
        this.showDeleteConfirmation = false;
        this.sequenceToDelete = null;
        
        // Recharger les séquences
        await this.loadSequences();
        
        this.showNotification('Succès', 'Séquence supprimée avec succès', 'success');
        
      } catch (error) {
        console.error('Erreur lors de la suppression de la séquence:', error);
        this.showNotification('Erreur', 'Impossible de supprimer la séquence', 'error');
      } finally {
        this.isDeleting = false;
      }
    },
    
    /**
     * Navigation vers les détails d'une séquence
     */
    navigateToSequenceDetail(sequenceId) {
      // All sequences now go to the unified sequence-detail page
      window.location.href = `/sequence-detail?id=${sequenceId}`;
    },
    
    /**
     * Basculer le statut d'une séquence
     */
    async toggleSequenceStatus(sequence) {
      if (!sequence) return;
      
      try {
        const Sequences = Parse.Object.extend('sequences');
        const seq = new Sequences();
        seq.id = sequence.objectId;
        seq.set('isActif', !sequence.isActif);
        
        await seq.save();
        
        // Mettre à jour localement
        sequence.isActif = !sequence.isActif;
        
        this.showNotification('Succès', `Séquence ${sequence.isActif ? 'activée' : 'désactivée'} avec succès`, 'success');
      } catch (error) {
        console.error('Erreur lors du basculement du statut:', error);
        this.showNotification('Erreur', 'Impossible de basculer le statut', 'error');
      }
    },
    
    /**
     * Confirmer la suppression d'une séquence
     */
    confirmDeleteSequence(sequence) {
      this.sequenceToDeleteId = sequence.objectId;
      this.showSequenceDeleteConfirmation = true;
    },
    
    /**
     * Annuler la suppression d'une séquence
     */
    cancelDeleteSequence() {
      this.sequenceToDeleteId = null;
      this.showSequenceDeleteConfirmation = false;
    },
    
    /**
     * Supprimer une séquence
     */
    async deleteSequence() {
      if (!this.sequenceToDeleteId) return;
      
      try {
        const Sequences = Parse.Object.extend('sequences');
        const seq = new Sequences();
        seq.id = this.sequenceToDeleteId;
        
        // D'abord, vérifier si des impayés sont associés à cette séquence
        const Impayes = Parse.Object.extend('Impayes');
        const query = new Parse.Query(Impayes);
        query.equalTo('sequence', seq);
        const impayesCount = await query.count();
        
        if (impayesCount > 0) {
          this.showNotification('Attention', `Cette séquence est associée à ${impayesCount} impayé(s). Veuillez d'abord réassigner ces impayés à une autre séquence.`, 'warning');
          this.cancelDeleteSequence();
          return;
        }
        
        // Supprimer la séquence
        await seq.destroy();
        
        // Rafraîchir la liste
        await this.loadSequences();
        
        this.showNotification('Succès', 'Séquence supprimée avec succès', 'success');
        this.cancelDeleteSequence();
      } catch (error) {
        console.error('Erreur lors de la suppression de la séquence:', error);
        this.showNotification('Erreur', 'Impossible de supprimer la séquence', 'error');
        this.cancelDeleteSequence();
      }
    },
    
    /**
     * Changement de page
     */
    changePage(page) {
      this.currentPage = page;
    },
    
    /**
     * Calcul des séquences paginées
     */
    get paginatedSequences() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.sequences.slice(start, end);
    },
    
    /**
     * Calcul du nombre total de pages
     */
    get totalPages() {
      return Math.ceil(this.sequences.length / this.itemsPerPage);
    },
    

    
    /**
     * Utilitaires
     */
    
    formatDate(dateString) {
      if (!dateString) return 'Non défini';
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Date invalide';
        
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error('Erreur de formatage de date:', error);
        return 'Date invalide';
      }
    },
    
    showNotification(title, message, type = 'info') {
      this.notification = {
        show: true,
        type,
        title,
        message
      };
      
      // Masquer automatiquement après 5 secondes
      setTimeout(() => {
        this.notification.show = false;
      }, 5000);
    }
  }));
});

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
        const Sequences = Parse.Object.extend('Sequences');
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
        const Sequences = Parse.Object.extend('Sequences');
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
     * Basculer le statut d'une séquence avec appel explicite au Cloud Code
     */
    async toggleSequenceStatus(sequence) {
      if (!sequence || !sequence.objectId) {
        this.showNotification('Erreur', 'Séquence invalide', 'error');
        return;
      }
      
      const newStatus = !sequence.isActif;
      
      try {
        // 1. Vérifier que la séquence existe toujours dans la base de données
        const Sequences = Parse.Object.extend('Sequences');
        const sequenceQuery = new Parse.Query(Sequences);
        
        try {
          await sequenceQuery.get(sequence.objectId);
        } catch (verifyError) {
          if (verifyError.code === 101) { // Object not found
            this.showNotification('Erreur', 'La séquence n\'existe plus dans la base de données', 'error');
            return;
          }
          throw verifyError;
        }
        
        // 2. Mettre à jour le statut dans la base de données
        const seq = new Sequences();
        seq.id = sequence.objectId;
        seq.set('isActif', newStatus);
        
        await seq.save();
        
        // 3. Appeler explicitement la fonction Cloud Code appropriée
        if (newStatus) {
          // Activation: appeler populateRelanceSequence
          await this.callCloudFunction('populateRelanceSequence', { idSequence: sequence.objectId });
        } else {
          // Désactivation: appeler cleanupRelancesOnDeactivate
          await this.callCloudFunction('cleanupRelancesOnDeactivate', { idSequence: sequence.objectId });
        }
        
        // 4. Mettre à jour localement
        sequence.isActif = newStatus;
        
        this.showNotification('Succès', `Séquence ${newStatus ? 'activée' : 'désactivée'} avec succès`, 'success');
      } catch (error) {
        console.error('Erreur lors du basculement du statut:', error);
        
        // Essayer de restaurer l'état précédent en cas d'erreur
        try {
          const Sequences = Parse.Object.extend('Sequences');
          const seq = new Sequences();
          seq.id = sequence.objectId;
          seq.set('isActif', sequence.isActif); // Restaurer l'ancien statut
          await seq.save();
        } catch (restoreError) {
          console.error('Erreur lors de la restauration du statut:', restoreError);
        }
        
        // Gestion spécifique des erreurs
        if (error.code === 101) {
          this.showNotification('Erreur', 'La séquence n\'existe plus dans la base de données', 'error');
        } else if (error.code === 141 || error.message.includes('not found')) {
          this.showNotification('Erreur', 'Fonction Cloud non disponible', 'error');
        } else {
          this.showNotification('Erreur', 'Impossible de basculer le statut', 'error');
        }
      }
    },
    
    /**
     * Appeler une fonction Cloud Code avec gestion des erreurs
     */
    async callCloudFunction(functionName, params = {}) {
      try {
        console.log(`Appel de la fonction Cloud ${functionName} avec les paramètres:`, params);
        
        // Vérifier si la fonction existe en essayant de l'appeler
        const result = await Parse.Cloud.run(functionName, params);
        console.log(`Fonction Cloud ${functionName} exécutée avec succès:`, result);
        return result;
      } catch (error) {
        console.error(`Erreur lors de l'exécution de la fonction Cloud ${functionName}:`, error);
        
        // Gestion spécifique pour les fonctions non trouvées
        if (error.code === 141 || error.message.includes('Object not found') || error.message.includes('not found')) {
          console.warn(`La fonction Cloud ${functionName} n'est pas disponible sur le serveur`);
          this.showNotification('Avertissement', `La fonction ${functionName} n'est pas disponible`, 'warning');
          // Retourner un objet vide pour ne pas bloquer l'exécution
          return {};
        }
        
        throw error; // Re-lancer l'erreur pour que l'appelant puisse la gérer
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
        const Sequences = Parse.Object.extend('Sequences');
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
    
    truncateText(text, maxLength = 240) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    
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

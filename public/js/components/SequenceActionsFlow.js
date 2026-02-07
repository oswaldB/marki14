/**
 * SequenceActionsFlow.js - Composant Alpine.js pour gérer toutes les actions de séquence
 * Responsable de la gestion complète du flow des actions (CRUD, UI, logique métier)
 * Collabore avec unifiedSequenceState pour la synchronisation de l'état global
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('sequenceActionsFlow', () => ({
    // État local pour le flow des actions
    sequenceId: null,
    sequence: null,
    actions: [],
    isLoading: true,
    smtpProfiles: [],
    isLoadingSmtpProfiles: false,

    // État pour la création d'actions
    newAction: {
      type: 'email',
      delay: 0,
      subject: '',
      sender: '',
      message: '',
      cc: ''
    },

    // État pour l'édition
    editing: {
      showDrawer: false,
      action: null,
      index: null,
      isSaving: false,
      type: 'email',
      delay: 0,
      subject: '',
      sender: '',
      message: '',
      cc: ''
    },

    // État pour les tests
    testing: {
      showDrawer: false,
      email: '',
      selectedProfile: '',
      isSending: false
    },



    // Initialisation - charge les données et configure le composant
    async init() {
      this.loadSequenceIdFromURL();
      
      try {
        await this.loadData();
        this.setupSync();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du flow:', error);
        this.showNotification('Erreur', 'Impossible d\'initialiser le composant', 'error');
      } finally {
        this.isLoading = false;
      }
    },

    // Chargement complet des données
    async loadData() {
      if (this.sequenceId) {
        await this.loadSequenceFromParse();
      }
      await this.loadSmtpProfiles();
      this.initializeDefaultSender();
    },
    
    // Configuration de la synchronisation avec l'état global
    setupSync() {
      const globalState = window.Alpine?.store('unifiedSequenceState');
      
      if (globalState) {
        // Synchronisation initiale depuis l'état global
        this.syncFromGlobalState(globalState);
        
        // Écouter les changements globaux
        this.setupGlobalListeners(globalState);
        
        // Synchroniser les actions locales vers le global
        this.$watch('actions', (newActions) => {
          this.syncActionsToGlobalState(globalState, newActions);
        }, { deep: true });
      }
    },

    // Synchronisation depuis l'état global
    syncFromGlobalState(globalState) {
      if (globalState.sequence) {
        this.sequence = {...globalState.sequence};
        this.actions = [...globalState.sequence.actions || []];
      }
    },

    // Configuration des écouteurs globaux
    setupGlobalListeners(globalState) {
      // Écouter les événements de mise à jour via le bus d'événements Alpine
      // Note: globalState est un objet régulier, pas un composant Alpine
      // Nous devons utiliser le bus d'événements global ou un autre mécanisme
      
      // Pour l'instant, nous allons utiliser un simple polling pour la démo
      // Dans une version future, utiliser un système d'événements propre
      console.log('Global listeners setup (simplified for demo)');
    },

    // Synchronisation des actions vers l'état global
    syncActionsToGlobalState(globalState, newActions) {
      if (globalState.sequence && 
          JSON.stringify(globalState.sequence.actions) !== JSON.stringify(newActions)) {
        
        globalState.sequence.actions = [...newActions];
        globalState.$dispatch('actions-updated', {
          source: 'flow',
          actions: newActions,
          timestamp: Date.now()
        });
      }
    },

    loadSequenceIdFromURL() {
      const urlParams = new URLSearchParams(window.location.search);
      this.sequenceId = urlParams.get('id');
    },

    async loadSequenceFromParse() {
      if (!this.sequenceId) return;

      try {
        const Sequence = Parse.Object.extend('Sequences');
        const query = new Parse.Query(Sequence);
        const sequence = await query.get(this.sequenceId);

        this.sequence = sequence.toJSON();
        this.actions = this.sequence.actions || [];
        
        console.log('Séquence chargée:', this.sequence);
      } catch (error) {
        console.error('Erreur lors du chargement de la séquence:', error);
        this.showNotification('Erreur', 'Impossible de charger la séquence', 'error');
      }
    },

    async loadSmtpProfiles() {
      this.isLoadingSmtpProfiles = true;
      
      try {
        const SmtpProfile = Parse.Object.extend('SMTPProfile');
        const query = new Parse.Query(SmtpProfile);
        
        const profiles = await query.find();
        this.smtpProfiles = profiles.map(p => p.toJSON());
        
        console.log('Profils SMTP chargés:', this.smtpProfiles);
      } catch (error) {
        console.error('Erreur lors du chargement des profils SMTP:', error);
        this.showNotification('Erreur', 'Impossible de charger les profils SMTP', 'error');
      } finally {
        this.isLoadingSmtpProfiles = false;
      }
    },

    initializeDefaultSender() {
      if (this.smtpProfiles.length > 0) {
        this.newActionSender = this.smtpProfiles[0].email;
        this.selectedSmtpProfile = this.smtpProfiles[0].objectId;
      }
    },

    // Initialiser depuis l'état existant (appelé par le template)
    initFromExistingState() {
      console.log('Initialisation depuis l\'état existant');
      
      // Si nous avons déjà des données, les utiliser
      if (this.sequence) {
        console.log('Séquence déjà chargée:', this.sequence);
        return;
      }
      
      // Sinon, essayer de charger depuis l'état global
      const globalState = window.Alpine?.store('unifiedSequenceState');
      if (globalState && globalState.sequence) {
        this.syncFromGlobalState(globalState);
        console.log('État initialisé depuis le store global');
      } else {
        // Si aucun état global, essayer de charger depuis l'URL
        this.loadSequenceIdFromURL();
        if (this.sequenceId) {
          this.loadSequenceFromParse();
        }
      }
    },
    
    // Synchroniser les valeurs d'édition (appelé par le template)
    syncEditingActionValues() {
      console.log('Synchronisation des valeurs d\'édition');
      
      // Cette méthode est appelée lorsque le drawer d'édition est ouvert
      // Elle devrait être appelée après avoir défini editingAction
      if (!this.editing.action) {
        console.warn('Aucune action en cours d\'édition pour la synchronisation');
        return;
      }
      
      // Mettre à jour les champs du formulaire d'édition
      this.editing.type = this.editing.action.type || 'email';
      this.editing.delay = this.editing.action.delay || 0;
      this.editing.subject = this.editing.action.subject || '';
      this.editing.sender = this.editing.action.sender || '';
      this.editing.message = this.editing.action.message || '';
      this.editing.cc = this.editing.action.cc || '';
      
      console.log('Valeurs d\'édition synchronisées');
    },
    
    // Obtenir les actions triées depuis l'état local
    getSortedActions() {
      return [...this.actions].sort((a, b) => (a.delay || 0) - (b.delay || 0));
    },

    // Mettre à jour les actions dans Parse
    async updateActionsInParse(updatedActions) {
      if (!this.sequenceId) return;

      try {
        const Sequence = Parse.Object.extend('Sequences');
        const sequence = new Sequence();
        sequence.id = this.sequenceId;
        sequence.set('actions', updatedActions);
        await sequence.save();

        this.actions = updatedActions;
        
        // Synchroniser avec l'état global
        const globalState = window.Alpine?.store('unifiedSequenceState');
        if (globalState) {
          globalState.sequence.actions = [...updatedActions];
          globalState.$dispatch('actions-updated', {
            source: 'flow',
            actions: updatedActions
          });
        }
        
        this.showNotification('Succès', 'Actions mises à jour avec succès', 'success');
        return true;
      } catch (error) {
        console.error('Erreur lors de la mise à jour des actions:', error);
        this.showNotification('Erreur', 'Impossible de mettre à jour les actions', 'error');
        throw error;
      }
    },

    // Ajouter une nouvelle action
    async addNewAction() {
      const newAction = {
        type: this.newAction.type,
        delay: parseInt(this.newAction.delay),
        subject: this.newAction.subject,
        senderEmail: this.newAction.sender,
        message: this.newAction.message,
        cc: this.newAction.cc || ''
      };

      try {
        const updatedActions = [...this.actions, newAction];
        await this.updateActionsInParse(updatedActions);
        
        // Réinitialiser le formulaire
        this.resetNewActionForm();
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'action:', error);
        throw error;
      }
    },

    // Réinitialiser le formulaire de nouvelle action
    resetNewActionForm() {
      this.newAction = {
        type: 'email',
        delay: this.getDefaultDelay(),
        subject: '',
        sender: this.smtpProfiles[0]?.email || '',
        message: '',
        cc: ''
      };
    },

    // Réinitialiser le formulaire
    resetActionForm() {
      this.newActionDelay = 0;
      this.newActionSubject = '';
      this.newActionMessage = '';
    },
    
    // Éditer une action existante
    editAction(index) {
      if (index < 0 || index >= this.actions.length) {
        console.error('Index d\'action invalide:', index);
        return;
      }
      
      const action = this.actions[index];
      this.editing.action = {...action};
      this.editing.index = index;
      this.editing.showDrawer = true;
      
      // Synchroniser les valeurs du formulaire d'édition
      this.syncEditingActionValues();
    },
    
    // Ajuster le délai d'une action
    adjustActionDelay(index, delta) {
      if (index < 0 || index >= this.actions.length) {
        console.error('Index d\'action invalide:', index);
        return;
      }
      
      const newDelay = this.actions[index].delay + delta;
      if (newDelay >= 0) { // Ne pas permettre les délais négatifs
        this.actions[index].delay = newDelay;
        
        // Re-trier les actions
        this.actions.sort((a, b) => (a.delay || 0) - (b.delay || 0));
        
        // Synchroniser avec l'état global
        this.syncActionsToGlobalState(
          window.Alpine?.store('unifiedSequenceState'),
          this.actions
        );
      }
    },
    
    // Supprimer une action
    deleteAction(index) {
      if (index < 0 || index >= this.actions.length) {
        console.error('Index d\'action invalide:', index);
        return;
      }
      
      if (confirm('Êtes-vous sûr de vouloir supprimer cette action?')) {
        const deletedAction = this.actions[index];
        this.actions.splice(index, 1);
        
        // Synchroniser avec l'état global
        const globalState = window.Alpine?.store('unifiedSequenceState');
        if (globalState) {
          globalState.sequence.actions = [...this.actions];
        }
        
        this.showNotification('Succès', 'Action supprimée', 'success');
      }
    },
    
    // Sauvegarder l'action modifiée
    async saveEditedAction() {
      if (!this.editing.action || this.editing.index === null || this.editing.index === undefined) {
        console.error('Aucune action en cours d\'édition');
        return;
      }
      
      try {
        this.editing.isSaving = true;
        
        // Mettre à jour l'action avec les valeurs du formulaire
        const updatedAction = {
          type: this.editing.type,
          delay: this.editing.delay,
          subject: this.editing.subject,
          sender: this.editing.sender,
          message: this.editing.message,
          cc: this.editing.cc || ''
        };
        
        // Mettre à jour l'action dans le tableau
        this.actions[this.editing.index] = updatedAction;
        
        // Mettre à jour dans Parse
        await this.updateActionsInParse(this.actions);
        
        // Fermer le drawer et réinitialiser
        this.editing.showDrawer = false;
        this.editing.action = null;
        this.editing.index = null;
        
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'action:', error);
        throw error;
      } finally {
        this.editing.isSaving = false;
      }
    },
    
    // Envoyer un email de test
    async sendTestEmail() {
      try {
        this.testing.isSending = true;
        
        if (!this.testEmail) {
          this.showNotification('Erreur', 'Veuillez spécifier une adresse email de test', 'error');
          return;
        }
        
        if (!this.selectedSmtpProfile) {
          this.showNotification('Erreur', 'Veuillez sélectionner un profil SMTP', 'error');
          return;
        }
        
        // Appeler la fonction Cloud Code pour envoyer le test
        const result = await Parse.Cloud.run('sendTestEmail', {
          sequenceId: this.sequenceId,
          testEmail: this.testEmail,
          smtpProfileId: this.selectedSmtpProfile,
          actions: this.actions
        });
        
        if (result.success) {
          this.showNotification('Succès', 'Email de test envoyé avec succès', 'success');
          this.testing.showDrawer = false;
        } else {
          this.showNotification('Erreur', result.message || 'Impossible d\'envoyer l\'email de test', 'error');
        }
        
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de test:', error);
        this.showNotification('Erreur', 'Impossible d\'envoyer l\'email de test: ' + error.message, 'error');
      } finally {
        this.testing.isSending = false;
      }
    },
    
    // Calculer le délai par défaut pour une nouvelle action
    getDefaultDelay() {
      if (this.actions.length === 0) {
        return 0;
      }
      
      // Trouver le délai maximum existant et ajouter 1
      const maxDelay = Math.max(...this.actions.map(a => a.delay || 0));
      return maxDelay + 1;
    },

    // Éditer une action
    editAction(index) {
      if (!this.actions || index === null || index === undefined) return;

      this.editing.action = {...this.actions[index]};
      this.editing.index = index;
      this.editing.showDrawer = true;
      this.syncEditingValues();
    },

    // Synchroniser les valeurs d'édition
    syncEditingValues() {
      if (!this.editing.action) return;

      this.editing.type = this.editing.action.type || 'email';
      this.editing.delay = this.editing.action.delay || 0;
      this.editing.subject = this.editing.action.subject || '';
      this.editing.sender = this.editing.action.senderEmail || '';
      this.editing.message = this.editing.action.message || '';
      this.editing.cc = this.editing.action.cc || '';
    },

    // Synchroniser l'action avec les valeurs d'édition
    syncActionToEditing() {
      if (!this.editing.action) return;

      this.editing.action.type = this.editing.type;
      this.editing.action.delay = this.editing.delay;
      this.editing.action.subject = this.editing.subject;
      this.editing.action.senderEmail = this.editing.sender;
      this.editing.action.message = this.editing.message;
      this.editing.action.cc = this.editing.cc;
    },

    // Sauvegarder l'action éditée
    async saveEditedAction() {
      if (this.editing.index === null) return;

      this.editing.isSaving = true;

      try {
        this.syncActionToEditing();

        const updatedActions = [...this.actions];
        updatedActions[this.editing.index] = this.editing.action;

        await this.updateActionsInParse(updatedActions);
        this.resetEditState();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'action:', error);
        throw error;
      } finally {
        this.editing.isSaving = false;
      }
    },

    // Réinitialiser l'état d'édition
    resetEditState() {
      this.editing.showDrawer = false;
      this.editing.action = null;
      this.editing.index = null;
      this.editing.isSaving = false;
    },

    // Ajuster le délai d'une action
    async adjustActionDelay(index, delta) {
      if (!this.actions || index === null || index === undefined) return;

      const updatedActions = [...this.actions];
      const action = updatedActions[index];

      if (!action) return;

      const newDelay = Math.max(0, (action.delay || 0) + delta);
      action.delay = newDelay;

      await this.updateActionsInParse(updatedActions);
    },

    // Supprimer une action
    async deleteAction(index) {
      if (!this.actions) return;

      if (!confirm('Êtes-vous sûr de vouloir supprimer cette action?')) return;

      try {
        const updatedActions = this.actions.filter((_, i) => i !== index);
        await this.updateActionsInParse(updatedActions);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'action:', error);
        throw error;
      }
    },

    // Envoyer un email de test
    async sendTestEmail() {
      if (!this.actions || !this.testing.email || !this.testing.selectedProfile) return;

      this.testing.isSending = true;

      try {
        const Impayes = Parse.Object.extend('impayes');
        const query = new Parse.Query(Impayes);
        query.limit(1);

        const results = await query.find();

        if (results.length === 0) {
          this.showNotification('Erreur', 'Aucun impayé disponible pour le test', 'error');
          return;
        }

        const testImpaye = results[0].toJSON();

        for (const action of this.actions) {
          let subject = action.subject;
          let message = action.message;

          for (const [key, value] of Object.entries(testImpaye)) {
            const placeholder = `[[${key}]]`;
            subject = subject.replace(new RegExp(placeholder, 'g'), value);
            message = message.replace(new RegExp(placeholder, 'g'), value);
          }

          await Parse.Cloud.run('sendTestEmail', {
            to: this.testing.email,
            subject: subject,
            body: message,
            from: action.senderEmail,
            cc: action.cc,
            smtpProfileId: this.testing.selectedProfile
          });
        }

        this.testing.showDrawer = false;
        this.showNotification('Succès', 'Emails de test envoyés avec succès', 'success');
      } catch (error) {
        console.error('Erreur lors de l\'envoi du test:', error);
        this.showNotification('Erreur', 'Impossible d\'envoyer les emails de test', 'error');
        throw error;
      } finally {
        this.testing.isSending = false;
      }
    },

    // Notification via le composant parent
    showNotification(title, message, type = 'success') {
      if (window.Alpine && window.Alpine.store('unifiedSequenceState')) {
        const parentState = window.Alpine.store('unifiedSequenceState');
        parentState.showNotification(title, message, type);
      } else {
        console.warn('Composant parent non disponible pour les notifications');
      }
    }
  }));
});

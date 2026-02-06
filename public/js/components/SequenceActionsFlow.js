/**
 * SequenceActionsFlow.js - Composant Alpine.js autonome pour gérer les actions de séquence
 * Ce composant est complètement autonome et ne dépend pas de l'état parent
 * Il charge et gère ses propres données directement depuis Parse
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('sequenceActionsFlow', () => ({
    // État local autonome - ne dépend pas du parent
    sequenceId: null,
    sequence: null,
    actions: [],
    isLoading: true,
    smtpProfiles: [],
    isLoadingSmtpProfiles: false,

    // États locaux pour les actions
    newActionType: 'email',
    newActionDelay: 0,
    newActionSubject: '',
    newActionSender: '',
    newActionMessage: '',

    // États pour l'édition
    showEditDrawer: false,
    editingAction: null,
    editingActionIndex: null,
    isSavingAction: false,
    editingActionType: 'email',
    editingActionDelay: 0,
    editingActionSubject: '',
    editingActionSender: '',
    editingActionMessage: '',

    // États pour les tests
    showTestDrawer: false,
    testEmail: '',
    selectedSmtpProfile: '',
    isSendingTest: false,

    // Notifications
    notification: {
      show: false,
      type: 'info',
      title: '',
      message: ''
    },

    // Initialisation autonome - charge les données directement depuis Parse
    async initFromExistingState() {
      this.loadSequenceIdFromURL();
      
      try {
        if (this.sequenceId) {
          await this.loadSequenceFromParse();
        }
        await this.loadSmtpProfiles();
        this.initializeDefaultSender();
        
        // Synchronisation avec l'état parent si disponible
        this.setupParentStateSync();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation autonome:', error);
        this.showNotification('Erreur', 'Impossible d\'initialiser le composant', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    
    // Synchronisation avec l'état parent
    setupParentStateSync() {
      // Vérifier si l'état parent existe
      if (window.Alpine && window.Alpine.store('unifiedSequenceState')) {
        const parentState = window.Alpine.store('unifiedSequenceState');
        
        // Synchroniser les actions depuis le parent
        if (parentState.sequence?.actions) {
          this.actions = [...parentState.sequence.actions];
        }
        
        // Écouter les changements dans le parent
        this.$watch('$store.unifiedSequenceState.sequence.actions', (newActions) => {
          if (newActions) {
            this.actions = [...newActions];
          }
        });
        
        console.log('Synchronisation avec l\'état parent établie');
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

    // Obtenir les actions triées depuis l'état local
    getSortedActions() {
      return [...this.actions].sort((a, b) => (a.delay || 0) - (b.delay || 0));
    },

    // Méthode autonome pour mettre à jour les actions dans Parse
    async updateSequenceActions(updatedActions) {
      if (!this.sequenceId) return;

      try {
        const Sequence = Parse.Object.extend('Sequences');
        const sequence = new Sequence();
        sequence.id = this.sequenceId;
        sequence.set('actions', updatedActions);
        await sequence.save();

        this.actions = updatedActions;
        
        // Synchroniser avec l'état parent si disponible
        if (window.Alpine && window.Alpine.store('unifiedSequenceState')) {
          const parentState = window.Alpine.store('unifiedSequenceState');
          parentState.sequence.actions = [...updatedActions];
          parentState.$dispatch('actions-updated');
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
        type: this.newActionType,
        delay: parseInt(this.newActionDelay),
        subject: this.newActionSubject,
        senderEmail: this.newActionSender,
        message: this.newActionMessage
      };

      try {
        const updatedActions = [...this.actions, newAction];
        await this.updateSequenceActions(updatedActions);
        this.resetActionForm();
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'action:', error);
      }
    },

    // Réinitialiser le formulaire
    resetActionForm() {
      this.newActionDelay = 0;
      this.newActionSubject = '';
      this.newActionMessage = '';
    },

    // Éditer une action
    editAction(index) {
      if (!this.actions || index === null || index === undefined) return;

      this.editingAction = {...this.actions[index]};
      this.editingActionIndex = index;
      this.syncEditingActionValues();
      this.showEditDrawer = true;
    },

    // Synchroniser les valeurs d'édition
    syncEditingActionValues() {
      if (!this.editingAction) return;

      this.editingActionType = this.editingAction.type || 'email';
      this.editingActionDelay = this.editingAction.delay || 0;
      this.editingActionSubject = this.editingAction.subject || '';
      this.editingActionSender = this.editingAction.senderEmail || '';
      this.editingActionMessage = this.editingAction.message || '';
    },

    // Synchroniser l'action avec les valeurs d'édition
    syncActionToEditingValues() {
      if (!this.editingAction) return;

      this.editingAction.type = this.editingActionType;
      this.editingAction.delay = this.editingActionDelay;
      this.editingAction.subject = this.editingActionSubject;
      this.editingAction.senderEmail = this.editingActionSender;
      this.editingAction.message = this.editingActionMessage;
    },

    // Sauvegarder l'action éditée
    async saveEditedAction() {
      if (this.editingActionIndex === null) return;

      this.isSavingAction = true;

      try {
        this.syncActionToEditingValues();

        const updatedActions = [...this.actions];
        updatedActions[this.editingActionIndex] = this.editingAction;

        await this.updateSequenceActions(updatedActions);
        this.resetEditState();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'action:', error);
      } finally {
        this.isSavingAction = false;
      }
    },

    // Réinitialiser l'état d'édition
    resetEditState() {
      this.showEditDrawer = false;
      this.editingAction = null;
      this.editingActionIndex = null;
    },

    // Ajuster le délai d'une action
    async adjustActionDelay(index, delta) {
      if (!this.actions || index === null || index === undefined) return;

      const updatedActions = [...this.actions];
      const action = updatedActions[index];

      if (!action) return;

      const newDelay = Math.max(0, (action.delay || 0) + delta);
      action.delay = newDelay;

      await this.updateSequenceActions(updatedActions);
    },

    // Supprimer une action
    async deleteAction(index) {
      if (!this.actions) return;

      if (!confirm('Êtes-vous sûr de vouloir supprimer cette action?')) return;

      try {
        const updatedActions = this.actions.filter((_, i) => i !== index);
        await this.updateSequenceActions(updatedActions);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'action:', error);
      }
    },

    // Envoyer un email de test
    async sendTestEmail() {
      if (!this.actions || !this.testEmail || !this.selectedSmtpProfile) return;

      this.isSendingTest = true;

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
            to: this.testEmail,
            subject: subject,
            body: message,
            from: action.senderEmail,
            smtpProfileId: this.selectedSmtpProfile
          });
        }

        this.showTestDrawer = false;
        this.showNotification('Succès', 'Emails de test envoyés avec succès', 'success');
      } catch (error) {
        console.error('Erreur lors de l\'envoi du test:', error);
        this.showNotification('Erreur', 'Impossible d\'envoyer les emails de test', 'error');
      } finally {
        this.isSendingTest = false;
      }
    },

    // Notification locale
    showNotification(title, message, type = 'success') {
      this.notification = {
        show: true,
        type: type,
        title: title,
        message: message
      };

      setTimeout(() => {
        this.notification.show = false;
      }, 5000);
    }
  }));
});

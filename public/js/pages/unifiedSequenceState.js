/**
 * unifiedSequenceState.js - Gestion unifiée de l'état pour les séquences (auto et manuel)
 * Remplace sequenceState.js, autoSequenceState.js et normalSequenceState.js
 * Basé sur les spécifications: admin/specs/sequences/specs.md
 */



document.addEventListener('alpine:init', () => {
  Alpine.data('unifiedSequenceState', () => ({
    // ============================================
    // ÉTAT INITIAL
    // ============================================

    // État principal
    sequence: null,
    sequenceId: null,
    isLoading: false,
    isTogglingStatus: false,
    editingSequenceName: false,
    editingDescription: false,
    
    // États pour les actions (utilisé en mode manuel)
    newActionType: 'email',
    newActionDelay: 0,
    newActionSubject: '',
    newActionSender: '',
    newActionMessage: '',
    
    // États pour l'édition d'action
    showEditDrawer: false,
    editingAction: null,
    editingActionIndex: null,
    isSavingAction: false,
    
    // États pour les filtres automatiques (utilisé en mode auto)
    showAutoFilterDrawer: false,
    autoFilters: {
      include: {},
      exclude: {}
    },
    isSavingFilters: false,
    isTestingFilters: false,
    showFilterResults: false,
    filterTestResults: null,
    
    // États pour le test
    showTestDrawer: false,
    testEmail: '',
    selectedSmtpProfile: '',
    isSendingTest: false,
    
    // États pour la suppression
    showDeleteConfirmation: false,
    showActivationConfirmation: false,
    
    // Variables disponibles
    impayesColumns: [
      'nom', 'prenom', 'email', 'montant', 'date_echeance',
      'reference', 'statut', 'date_creation', 'client_id'
    ],
    variableSearch: '',
    smtpProfiles: [],
    isLoadingSmtpProfiles: false,
    
    // Valeurs distinctes pour les colonnes
    distinctValues: {},
    isLoadingDistinctValues: false,
    

    
    // ============================================
    // PROPRIÉTÉS CALCULÉES
    // ============================================

    // Filtres pour les variables
    get filteredVariables() {
      if (!this.variableSearch) return this.impayesColumns;
      
      const searchLower = this.variableSearch.toLowerCase();
      return this.impayesColumns.filter(col => 
        col.toLowerCase().includes(searchLower)
      );
    },
    
    // Détermine si la séquence est en mode automatique
    get isAutoMode() {
      return this.sequence ? this.sequence.isAuto : false;
    },
    
    // Génération du prompt (adapté au mode)
    get generatedPrompt() {
      if (!this.sequence || !this.impayesColumns) return '';

      // Générer la section contexte avec toutes les variables disponibles
      const contextLines = this.impayesColumns.map(col => `- ${col}: [[${col}]]`).join('\n');

      return `Rédigez un email professionnel de relance pour un impayé.

Contexte:
${contextLines}

Consignes:
- Soyez professionnel et courtois
- Mentionnez clairement les informations pertinentes (montant, référence, date d'échéance)
- Proposez une solution de paiement ou un arrangement
- Adaptez le ton en fonction des informations disponibles
- Utilisez les variables disponibles pour personnaliser le message
- Variables disponibles: ${this.impayesColumns.join(', ')}`;
    },
    
    // ============================================
    // CYCLE DE VIE
    // ============================================

    /**
     * Initialisation principale depuis l'URL
     */
    async initFromUrl() {
      this.isLoading = true;
      
      try {
        // Extraire l'ID de séquence depuis les paramètres d'URL
        const urlParams = new URLSearchParams(window.location.search);
        this.sequenceId = urlParams.get('id');
        
        if (!this.sequenceId) {
          throw new Error('No sequence ID provided in URL');
        }
        
        await this.loadSequence();
        
        // Ne charger les colonnes et profils que si la séquence existe
        if (this.sequence) {
          await this.loadImpayesColumns();
          await this.loadSmtpProfiles();
          
          // Initialiser les filtres automatiques si la séquence est en mode auto
          if (this.sequence.requete_auto) {
            this.autoFilters = this.sequence.requete_auto;
          }
        }
        
        console.log('Unified sequence state initialized:', this);
        console.log('[INFO] État de séquence unifié initialisé');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        
        // Gestion améliorée des erreurs d'initialisation
        if (error.message.includes('No sequence ID provided in URL')) {
          console.error('Erreur: Aucun identifiant de séquence fourni dans l\'URL');
        } else if (error.message.includes('Parse SDK non initialisé')) {
          console.error('Erreur: Connexion au serveur échouée');
        } else if (error.message.includes('Invalid session token')) {
          console.error('Erreur: Session expirée, veuillez vous reconnecter');
        } else if (error.code === 500 || error.message.includes('Internal Server Error')) {
          console.error('Erreur: Erreur serveur, veuillez réessayer plus tard');
        } else {
          console.error('Erreur: Impossible de charger les données initiales');
        }
      } finally {
        this.isLoading = false;
      }
    },
    
    // ============================================
    // CHARGEMENT DES DONNÉES
    // ============================================

    /**
     * Chargement de la séquence
     */
    async loadSequence() {
      if (!this.sequenceId) {
        console.error('No sequence ID provided');
        ;
        return;
      }
      
      this.isLoading = true;
      
      try {
        console.log('Loading sequence with ID:', this.sequenceId);
        
        // Vérifier que Parse est initialisé
        if (!Parse.applicationId) {
          throw new Error('Parse SDK non initialisé');
        }
        
        const Sequences = Parse.Object.extend('Sequences');
        const query = new Parse.Query(Sequences);
        
        const sequence = await query.get(this.sequenceId);
        if (!sequence) {
          throw new Error('Sequence not found');
        }
        
        this.sequence = {
          objectId: sequence.id,
          ...sequence.toJSON()
        };
        
        // S'assurer que les actions existent
        if (!this.sequence.actions) {
          this.sequence.actions = [];
        }
        
        // S'assurer que les propriétés requises existent
        this.ensureSequenceProperties();
        
        console.log('Sequence loaded successfully:', this.sequence);
        
      } catch (error) {
        console.error('Erreur lors du chargement de la séquence:', error);
        
        // Gestion améliorée des erreurs
        if (error.message.includes('Object not found') || 
            error.message.includes('Sequence not found') ||
            error.message.includes('Invalid object') ||
            error.message.includes('Invalid objectId')) {
          ;
        } else if (error.message.includes('Parse SDK non initialisé')) {
          ;
        } else if (error.message.includes('Invalid session token') || 
                   error.message.includes('Invalid credentials')) {
          ;
          // Rediriger vers la page de login après un délai
          setTimeout(() => {
            
          }, 3000);
        } else if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.code === 141 || error.message.includes('Invalid class name')) {
          // Gérer le cas où la classe n'existe pas
          ;
        } else if (error.code === 101 || error.message.includes('Invalid objectId')) {
          // Gérer le cas où l'ID est invalide
          ;
        } else {
          console.error('Erreur inconnue lors du chargement de la séquence:', error);
          ;
        }
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * S'assurer que l'objet sequence a toutes les propriétés requises
     */
    ensureSequenceProperties() {
      if (!this.sequence) return;

      // Set default values for missing properties
      if (this.sequence.isAuto === undefined) {
        this.sequence.isAuto = false;
      }
      if (this.sequence.isActif === undefined) {
        this.sequence.isActif = false;
      }
      if (!this.sequence.actions) {
        this.sequence.actions = [];
      }
      if (!this.sequence.requete_auto) {
        this.sequence.requete_auto = { include: {}, exclude: {} };
      }
    },
    
    /**
     * Chargement des colonnes des impayés via Cloud Code
     */
    async loadImpayesColumns() {
      try {
        // Vérifier que Parse est disponible
        if (!Parse || !Parse.Cloud) {
          console.warn('Parse Cloud non disponible, utilisation des colonnes par défaut');
          this.impayesColumns = [
            'nom', 'prenom', 'email', 'montant', 'date_echeance',
            'reference', 'statut', 'date_creation', 'client_id'
          ];
          return;
        }
        
        // Utiliser la fonction Cloud Code pour obtenir le schéma
        const schema = await Parse.Cloud.run('getImpayesSchema');
        
        if (schema) {
          this.impayesColumns = Object.keys(schema);
        } else {
          // Si le schéma n'est pas disponible, utiliser des colonnes par défaut
          console.warn('Schéma des impayés non disponible, utilisation des colonnes par défaut');
          this.impayesColumns = [
            'nom', 'prenom', 'email', 'montant', 'date_echeance',
            'reference', 'statut', 'date_creation', 'client_id'
          ];
        }
      } catch (error) {
        console.error('Erreur lors du chargement des colonnes des impayés:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else if (error.message.includes('Cloud function not found') || error.code === 141) {
          console.warn('Fonction Cloud getImpayesSchema non trouvée, utilisation des colonnes par défaut');
          this.impayesColumns = [
            'nom', 'prenom', 'email', 'montant', 'date_echeance',
            'reference', 'statut', 'date_creation', 'client_id'
          ];
        } else {
          // Colonnes par défaut si erreur
          this.impayesColumns = [
            'nom', 'prenom', 'email', 'montant', 'date_echeance',
            'reference', 'statut', 'date_creation', 'client_id'
          ];
          ;
        }
      }
    },
    
    /**
     * Chargement des valeurs distinctes pour une colonne
     */
    async loadDistinctValues(columnName) {
      if (!columnName || this.isLoadingDistinctValues) return;
      
      this.isLoadingDistinctValues = true;
      
      try {
        const values = await Parse.Cloud.run('getDistinctValues', { columnName, limit: 50 });
        
        // Stocker les valeurs dans l'objet distinctValues
        this.distinctValues[columnName] = values;
        
        console.log(`Valeurs distinctes chargées pour ${columnName}:`, values);
      } catch (error) {
        console.error(`Erreur lors du chargement des valeurs distinctes pour ${columnName}:`, error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else {
          this.distinctValues[columnName] = [];
          ;
        }
      } finally {
        this.isLoadingDistinctValues = false;
      }
    },
    
    /**
     * Chargement des profils SMTP
     */
    async loadSmtpProfiles() {
      this.isLoadingSmtpProfiles = true;
      
      try {
        // Vérifier que Parse est disponible
        if (!Parse || !Parse.Object) {
          console.warn('Parse Object non disponible, aucun profil SMTP chargé');
          this.smtpProfiles = [];
          return;
        }
        
        const SmtpProfiles = Parse.Object.extend('SMTPProfile');
        const query = new Parse.Query(SmtpProfiles);
        
        const results = await query.find();
        this.smtpProfiles = results.map(profile => ({
          objectId: profile.id,
          ...profile.toJSON()
        }));
        
        // Sélectionner le premier profil par défaut
        if (this.smtpProfiles.length > 0) {
          this.newActionSender = this.smtpProfiles[0].email;
          this.selectedSmtpProfile = this.smtpProfiles[0].objectId;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des profils SMTP:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else if (error.message.includes('Invalid class name') || error.code === 141) {
          console.warn('Classe SMTPProfile non trouvée, aucun profil SMTP chargé');
          this.smtpProfiles = [];
        } else {
          ;
        }
      } finally {
        this.isLoadingSmtpProfiles = false;
      }
    },
    
    // ============================================
    // GESTION DE LA SÉQUENCE
    // ============================================

    /**
     * Sauvegarde du nom de la séquence
     */
    async saveSequenceName() {
      if (!this.sequence) return;
      
      try {
        const Sequences = Parse.Object.extend('Sequences');
        const sequence = new Sequences();
        sequence.id = this.sequence.objectId;
        sequence.set('nom', this.sequence.nom);
        
        await sequence.save();
        ;
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du nom:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else {
          ;
        }
      }
    },
    
    /**
     * Sauvegarde de la description
     */
    async saveSequenceDescription() {
      if (!this.sequence) return;
      
      try {
        const Sequences = Parse.Object.extend('Sequences');
        const sequence = new Sequences();
        sequence.id = this.sequence.objectId;
        sequence.set('description', this.sequence.description);
        
        await sequence.save();
        ;
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la description:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else {
          ;
        }
      }
    },
    
    /**
     * Basculer le statut de la séquence
     */
    async toggleSequenceStatus() {
      if (!this.sequence) return;
      
      // Demander confirmation
      this.showActivationConfirmation = true;
    },
    
    /**
     * Confirmer le basculement de statut
     */
    async confirmToggleStatus() {
      if (!this.sequence || !this.sequence.objectId) {
        this.showNotification('Erreur', 'Séquence invalide', 'error');
        this.isTogglingStatus = false;
        return;
      }
      
      this.isTogglingStatus = true;
      this.showActivationConfirmation = false;
      
      const newStatus = !this.sequence.isActif;
      
      try {
        // 1. Vérifier que la séquence existe toujours dans la base de données
        const Sequences = Parse.Object.extend('Sequences');
        const sequenceQuery = new Parse.Query(Sequences);
        
        try {
          await sequenceQuery.get(this.sequence.objectId);
        } catch (verifyError) {
          if (verifyError.code === 101) { // Object not found
            this.showNotification('Erreur', 'La séquence n\'existe plus dans la base de données', 'error');
            this.isTogglingStatus = false;
            return;
          }
          throw verifyError;
        }
        
        // 2. Mettre à jour le statut dans la base de données
        const sequence = new Sequences();
        sequence.id = this.sequence.objectId;
        sequence.set('isActif', newStatus);
        await sequence.save();
        
        // 3. Appeler explicitement la fonction Cloud Code appropriée
        if (newStatus) {
          // Activation: appeler populateRelanceSequence
          await this.callCloudFunction('populateRelanceSequence', { idSequence: this.sequence.objectId });
        } else {
          // Désactivation: appeler cleanupRelancesOnDeactivate
          await this.callCloudFunction('cleanupRelancesOnDeactivate', { idSequence: this.sequence.objectId });
        }
        
        // 4. Mettre à jour localement
        this.sequence.isActif = newStatus;
        
        const statusText = this.sequence.isActif ? 'activée' : 'désactivée';
        this.showNotification('Succès', `Séquence ${statusText} avec succès`, 'success');
      } catch (error) {
        console.error('Erreur lors du basculement du statut:', error);
        
        // Essayer de restaurer l'état précédent en cas d'erreur
        try {
          const Sequences = Parse.Object.extend('Sequences');
          const sequence = new Sequences();
          sequence.id = this.sequence.objectId;
          sequence.set('isActif', this.sequence.isActif); // Restaurer l'ancien statut
          await sequence.save();
        } catch (restoreError) {
          console.error('Erreur lors de la restauration du statut:', restoreError);
        }
        
        // Gestion spécifique des erreurs
        if (error.code === 101) {
          this.showNotification('Erreur', 'La séquence n\'existe plus dans la base de données', 'error');
        } else if (error.code === 141 || error.message.includes('not found')) {
          this.showNotification('Erreur', 'Fonction Cloud non disponible', 'error');
        } else if (error.code === 500 || error.message.includes('Internal Server Error')) {
          this.showNotification('Erreur', 'Erreur serveur lors du basculement du statut', 'error');
        } else if (error.message.includes('Invalid session token')) {
          this.showNotification('Erreur', 'Session expirée. Veuillez vous reconnecter.', 'error');
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else {
          this.showNotification('Erreur', 'Impossible de basculer le statut', 'error');
        }
      } finally {
        this.isTogglingStatus = false;
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
        
        throw error;
      }
    },
    
    /**
     * Basculer le mode automatique
     */
    async toggleAutoMode() {
      if (!this.sequence) return;
      
      try {
        const Sequences = Parse.Object.extend('Sequences');
        const sequence = new Sequences();
        sequence.id = this.sequence.objectId;
        sequence.set('isAuto', !this.sequence.isAuto);
        
        await sequence.save();
        this.sequence.isAuto = !this.sequence.isAuto;
        
        const modeText = this.sequence.isAuto ? 'activé' : 'désactivé';
        ;
        

      } catch (error) {
        console.error('Erreur lors du basculement du mode automatique:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else {
          ;
        }
      }
    },
    
    /**
     * Dupliquer la séquence
     */
    async duplicateSequence() {
      if (!this.sequence) return;
      
      try {
        const Sequences = Parse.Object.extend('Sequences');
        const sequence = new Sequences();
        
        sequence.set('nom', `${this.sequence.nom} (Copie)`);
        sequence.set('description', this.sequence.description);
        sequence.set('isActif', false);
        sequence.set('actions', [...(this.sequence.actions || [])]);
        sequence.set('isAuto', this.sequence.isAuto);
        sequence.set('requete_auto', this.sequence.requete_auto);
        
        const duplicated = await sequence.save();
        
        ;
        
        // Rediriger vers la nouvelle séquence
        setTimeout(() => {
          
        }, 1000);
      } catch (error) {
        console.error('Erreur lors de la duplication:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else {
          ;
        }
      }
    },
    
    /**
     * Supprimer la séquence
     */
    async deleteSequence() {
      if (!this.sequence) return;
      
      try {
        const Sequences = Parse.Object.extend('Sequences');
        const sequence = new Sequences();
        sequence.id = this.sequence.objectId;
        
        await sequence.destroy();
        
        ;
        
        // Rediriger vers la liste
        setTimeout(() => {
          
        }, 1000);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else {
          ;
        }
      }
    },
    
    // ============================================
    // GESTION DES ACTIONS (MODE MANUEL)
    // ============================================

    /**
     * Ajouter une nouvelle action
     */
    async addNewAction() {
      if (!this.sequence) return;
      
      const newAction = {
        type: this.newActionType,
        delay: parseInt(this.newActionDelay),
        subject: this.newActionSubject,
        senderEmail: this.newActionSender,
        message: this.newActionMessage
      };
      
      try {
        const updatedActions = [...(this.sequence.actions || []), newAction];
        await this.updateSequenceActions(updatedActions);
        
        // Réinitialiser le formulaire
        this.newActionDelay = 0;
        this.newActionSubject = '';
        this.newActionMessage = '';
        
        ;
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'action:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else {
          ;
        }
      }
    },
    
    /**
     * Mettre à jour les actions de la séquence
     */
    async updateSequenceActions(actions) {
      if (!this.sequence) return;
      
      try {
        const Sequences = Parse.Object.extend('Sequences');
        const sequence = new Sequences();
        sequence.id = this.sequence.objectId;
        sequence.set('actions', actions);
        
        await sequence.save();
        this.sequence.actions = actions;
      } catch (error) {
        console.error('Erreur lors de la mise à jour des actions:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else {
          ;
        }
        
        throw error;
      }
    },
    
    /**
     * Éditer une action
     */
    editAction(index) {
      if (!this.sequence || !this.sequence.actions) return;
      
      this.editingAction = {...this.sequence.actions[index]};
      this.editingActionIndex = index;
      this.showEditDrawer = true;
    },
    
    /**
     * Sauvegarder l'action éditée
     */
    async saveEditedAction() {
      if (!this.sequence || this.editingActionIndex === null) return;
      
      this.isSavingAction = true;
      
      try {
        const updatedActions = [...this.sequence.actions];
        updatedActions[this.editingActionIndex] = this.editingAction;
        
        await this.updateSequenceActions(updatedActions);
        
        this.showEditDrawer = false;
        this.editingAction = null;
        this.editingActionIndex = null;
        
        ;
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'action:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else {
          ;
        }
      } finally {
        this.isSavingAction = false;
      }
    },
    
    /**
     * Supprimer une action
     */
    async deleteAction(index) {
      if (!this.sequence || !this.sequence.actions) return;
      
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette action?')) return;
      
      try {
        const updatedActions = this.sequence.actions.filter((_, i) => i !== index);
        await this.updateSequenceActions(updatedActions);
        
        ;
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'action:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else {
          ;
        }
      }
    },
    
    // ============================================
    // GESTION DES FILTRES AUTOMATIQUES (MODE AUTO)
    // ============================================

    /**
     * Ajouter un filtre
     */
    addFilter(type) {
      // Trouver un nom de colonne unique pour le nouveau filtre
      let newColumn = '';
      let counter = 1;
      
      // Trouver une colonne qui n'existe pas encore
      while (true) {
        const testColumn = `new_column_${counter}`;
        if (!this.autoFilters[type][testColumn]) {
          newColumn = testColumn;
          break;
        }
        counter++;
      }
      
      this.autoFilters[type][newColumn] = '';
    },
    
    /**
     * Test des filtres automatiques avec état de chargement
     */
    async testAutoFilters() {
      if (!this.sequence || !this.autoFilters) return;
      
      this.isTestingFilters = true;
      this.showFilterResults = false;
      
      try {
        const result = await Parse.Cloud.run('testAutoFilters', {
          filters: this.autoFilters
        });
        
        this.filterTestResults = result;
        this.showFilterResults = true;
        
        return result;
      } catch (error) {
        console.error('Erreur lors du test des filtres:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else {
          this.filterTestResults = {
            success: false,
            count: 0,
            results: [],
            message: error.message
          };
          this.showFilterResults = true;
          ;
        }
        
        return this.filterTestResults;
      } finally {
        this.isTestingFilters = false;
      }
    },
    
    /**
     * Supprimer un filtre
     */
    removeFilter(column, type) {
      delete this.autoFilters[type][column];
    },
    
    /**
     * Mettre à jour le nom d'une colonne de filtre
     */
    updateFilterColumn(oldColumn, type, newColumn) {
      if (oldColumn === newColumn) return;
      
      const value = this.autoFilters[type][oldColumn];
      delete this.autoFilters[type][oldColumn];
      this.autoFilters[type][newColumn] = value;
    },
    
    /**
     * Sauvegarder les filtres automatiques
     */
    async saveAutoFilters() {
      if (!this.sequence) return;
      
      this.isSavingFilters = true;
      
      try {
        const Sequences = Parse.Object.extend('Sequences');
        const sequence = new Sequences();
        sequence.id = this.sequence.objectId;
        sequence.set('requete_auto', this.autoFilters);
        
        await sequence.save();
        this.sequence.requete_auto = this.autoFilters;
        
        this.showAutoFilterDrawer = false;
        ;
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des filtres:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else {
          ;
        }
      } finally {
        this.isSavingFilters = false;
      }
    },
    
    /**
     * Effacer tous les filtres automatiques
     */
    async clearAutoFilters() {
      if (!this.sequence) return;
      
      if (!confirm('Êtes-vous sûr de vouloir effacer tous les filtres automatiques?')) return;
      
      try {
        const Sequences = Parse.Object.extend('Sequences');
        const sequence = new Sequences();
        sequence.id = this.sequence.objectId;
        sequence.set('requete_auto', { include: {}, exclude: {} });
        
        await sequence.save();
        this.sequence.requete_auto = { include: {}, exclude: {} };
        this.autoFilters = { include: {}, exclude: {} };
        
        ;
      } catch (error) {
        console.error('Erreur lors de l\'effacement des filtres:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else {
          ;
        }
      }
    },
    
    // ============================================
    // GESTION DES TESTS
    // ============================================

    /**
     * Envoyer un email de test
     */
    async sendTestEmail() {
      if (!this.sequence || !this.testEmail || !this.selectedSmtpProfile) return;
      
      this.isSendingTest = true;
      
      try {
        // Récupérer un impayé de test
        const Impayes = Parse.Object.extend('impayes');
        const query = new Parse.Query(Impayes);
        query.limit(1);
        
        const results = await query.find();
        
        if (results.length === 0) {
          ;
          return;
        }
        
        const testImpaye = results[0].toJSON();
        
        // Envoyer chaque action comme email de test
        for (const action of this.sequence.actions || []) {
          // Remplacer les variables dans le sujet et le message
          let subject = action.subject;
          let message = action.message;
          
          for (const [key, value] of Object.entries(testImpaye)) {
            const placeholder = `[[${key}]]`;
            subject = subject.replace(new RegExp(placeholder, 'g'), value);
            message = message.replace(new RegExp(placeholder, 'g'), value);
          }
          
          // Appeler le cloud function pour envoyer l'email
          await Parse.Cloud.run('sendTestEmail', {
            to: this.testEmail,
            subject: subject,
            body: message,
            from: action.senderEmail,
            smtpProfileId: this.selectedSmtpProfile
          });
        }
        
        this.showTestDrawer = false;
        ;
      } catch (error) {
        console.error('Erreur lors de l\'envoi du test:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          ;
        } else if (error.message.includes('Invalid session token')) {
          ;
          setTimeout(() => {
            
          }, 3000);
        } else {
          ;
        }
      } finally {
        this.isSendingTest = false;
      }
    },
    
    // ============================================
    // UTILITAIRES
    // ============================================

    /**
     * Copier dans le presse-papiers
     * Si le texte est une variable, l'entourer de doubles crochets [[variable]]
     */
    copyToClipboard(text) {
      // Vérifier si le texte est une variable (fait partie des colonnes impayes)
      const isVariable = this.impayesColumns.includes(text);
      
      // Si c'est une variable, l'entourer de doubles crochets
      const textToCopy = isVariable ? `[[${text}]]` : text;
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        this.showNotification('Succès', `Copié dans le presse-papiers: ${textToCopy}`, 'success');
      }).catch((error) => {
        console.error('Erreur lors de la copie dans le presse-papiers:', error);
        
        // Gestion améliorée des erreurs
        if (error.message.includes('document is not focused')) {
          this.showNotification('Erreur', 'Veuillez cliquer sur la page avant de copier', 'error');
        } else {
          this.showNotification('Erreur', 'Impossible de copier dans le presse-papiers', 'error');
        }
      });
    },
    
    /**
     * Afficher une notification
     */
    showNotification(title, message, type) {
      this.notification = {
        show: true,
        title: title,
        message: message,
        type: type
      };
      
      // Masquer la notification après 5 secondes
      setTimeout(() => {
        this.notification.show = false;
      }, 5000);
    },
    
    /**
     * Insérer une variable dans le message
     */
    insertVariable(variable) {
      if (this.editingAction) {
        this.editingAction.message += `[[${variable}]]`;
      }
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

  }));
});
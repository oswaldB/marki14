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
    sequence: {
      nom: '',
      description: '',
      actions: [],
      isAuto: false
    },
    sequenceId: null,
    isLoading: false,
    isTogglingStatus: false,
    editingSequenceName: false,
    editingDescription: false,
    
    // États pour les actions (nécessaires pour les templates)
    isSavingAction: false,
    showEditDrawer: false,
    editingAction: null,
    newActionType: 'email',
    newActionDelay: 1,
    newActionSubject: '',
    newActionSender: '',
    newActionCC: '',
    newActionMessage: '',
    editingActionType: 'email',
    editingActionDelay: 1,
    editingActionSubject: '',
    editingActionSender: '',
    editingActionCC: '',
    editingActionMessage: '',
    
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
    impayesColumns: [],
    variableSearch: '',
    smtpProfiles: [],
    isLoadingSmtpProfiles: false,
    
    // Valeurs distinctes pour les colonnes
    distinctValues: {},
    isLoadingDistinctValues: false,
    
    // État de notification
    notification: {
      show: false,
      type: 'info',
      title: '',
      message: ''
    },
    
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
    // MÉTHODES UTILITAIRES
    // ============================================

    /**
     * Récupérer l'email d'un profil SMTP
     */
    getSmtpProfileEmail(profileId) {
      if (!profileId || !this.smtpProfiles) return '';
      
      const profile = this.smtpProfiles.find(p => p.objectId === profileId);
      return profile ? profile.email : '';
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
          // Gérer le cas où la séquence n'existe pas
        } else if (error.message.includes('Parse SDK non initialisé')) {
          // Gérer le cas où Parse n'est pas initialisé
        } else if (error.message.includes('Invalid session token') ||
                   error.message.includes('Invalid credentials')) {
          // Gérer le cas où la session est invalide
          setTimeout(() => {
            // Redirection vers la page de login
          }, 3000);
        } else if (error.code === 500 || error.message.includes('Internal Server Error')) {
          // Gérer les erreurs serveur
        } else if (error.code === 141 || error.message.includes('Invalid class name')) {
          // Gérer le cas où la classe n'existe pas
        } else if (error.code === 101 || error.message.includes('Invalid objectId')) {
          // Gérer le cas où l'ID est invalide
        } else {
          console.error('Erreur inconnue lors du chargement de la séquence:', error);
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
      if (!this.sequence.nom) {
        this.sequence.nom = 'Séquence sans nom';
      }
      if (!this.sequence.description) {
        this.sequence.description = '';
      }
    },
    
    /**
     * Chargement des colonnes des impayés via Cloud Code
     */
    async loadImpayesColumns() {
      try {
        this.isLoading = true;
        const result = await Parse.Cloud.run('getImpayesColumns');
        this.impayesColumns = result.columns || [];
        console.log('Colonnes chargées:', this.impayesColumns.length);
      } catch (error) {
        console.error('Erreur lors du chargement des colonnes:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Chargement des profils SMTP
     */
    async loadSmtpProfiles() {
      try {
        this.isLoadingSmtpProfiles = true;
        const SmtpProfiles = Parse.Object.extend('SmtpProfiles');
        const query = new Parse.Query(SmtpProfiles);
        query.equalTo('isActive', true);
        query.ascending('name');
        
        const profiles = await query.find();
        this.smtpProfiles = profiles.map(p => p.toJSON());
        console.log('Profil SMTP chargés:', this.smtpProfiles.length);
      } catch (error) {
        console.error('Erreur lors du chargement des profils SMTP:', error);
      } finally {
        this.isLoadingSmtpProfiles = false;
      }
    },
    
    // ============================================
    // GESTION DES ACTIONS (MODE MANUEL)
    // ============================================

    /**
     * Mettre à jour les actions de la séquence
     */
    async updateActions() {
      try {
        this.isSavingAction = true;
        // Logique de mise à jour des actions
        
      } catch (error) {
        console.error('Erreur lors de la mise à jour des actions:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          // Gérer les erreurs serveur
        } else if (error.message.includes('Invalid session token')) {
          // Gérer les erreurs de session
          setTimeout(() => {
            // Redirection vers la page de login
          }, 3000);
        } else {
          // Gérer les autres erreurs
        }
      } finally {
        this.isSavingAction = false;
      }
    },
    
    /**
     * Supprimer une action
     */
    async deleteAction(actionId) {
      try {
        this.isSavingAction = true;
        // Logique de suppression de l'action
        
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'action:', error);
      } finally {
        this.isSavingAction = false;
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
        newColumn = `filter_${counter}`;
        if (!this.autoFilters.include[newColumn] && !this.autoFilters.exclude[newColumn]) {
          break;
        }
        counter++;
      }
      
      // Ajouter le filtre avec des valeurs par défaut
      if (type === 'include') {
        this.autoFilters.include[newColumn] = {
          operator: 'contains',
          value: ''
        };
      } else {
        this.autoFilters.exclude[newColumn] = {
          operator: 'contains',
          value: ''
        };
      }
    },
    
    /**
     * Test des filtres automatiques avec état de chargement
     */
    async testAutoFilters() {
      try {
        this.isTestingFilters = true;
        this.showFilterResults = false;
        
        // Logique de test des filtres
        console.log('Testing filters:', this.autoFilters);
        
        // Simulation de résultats
        this.filterTestResults = {
          total: 100,
          filtered: 50,
          sample: []
        };
        
        this.showFilterResults = true;
      } catch (error) {
        console.error('Erreur lors du test des filtres:', error);
      } finally {
        this.isTestingFilters = false;
      }
    },
    
    /**
     * Sauvegarder les filtres automatiques
     */
    async saveAutoFilters() {
      try {
        this.isSavingFilters = true;
        
        // Mettre à jour la séquence avec les nouveaux filtres
        this.sequence.requete_auto = this.autoFilters;
        
        // Sauvegarder la séquence
        const Sequences = Parse.Object.extend('Sequences');
        const sequenceToSave = new Sequences();
        sequenceToSave.id = this.sequenceId;
        sequenceToSave.set('requete_auto', this.autoFilters);
        
        await sequenceToSave.save();
        
        this.showNotification('Succès', 'Filtres automatiques sauvegardés', 'success');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des filtres:', error);
        this.showNotification('Erreur', 'Impossible de sauvegarder les filtres', 'error');
      } finally {
        this.isSavingFilters = false;
      }
    },
    
    /**
     * Effacer tous les filtres automatiques
     */
    async clearAutoFilters() {
      try {
        this.autoFilters = {
          include: {},
          exclude: {}
        };
        
        // Mettre à jour la séquence
        this.sequence.requete_auto = this.autoFilters;
        
        // Sauvegarder la séquence
        const Sequences = Parse.Object.extend('Sequences');
        const sequenceToSave = new Sequences();
        sequenceToSave.id = this.sequenceId;
        sequenceToSave.set('requete_auto', this.autoFilters);
        
        await sequenceToSave.save();
        
        this.showNotification('Succès', 'Filtres automatiques effacés', 'success');
      } catch (error) {
        console.error('Erreur lors de l\'effacement des filtres:', error);
        this.showNotification('Erreur', 'Impossible d\'effacer les filtres', 'error');
      }
    },
    
    // ============================================
    // GESTION DES TESTS
    // ============================================

    /**
     * Envoyer un email de test
     */
    async sendTestEmail() {
      try {
        this.isSendingTest = true;
        // Logique d'envoi d'email de test
        
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de test:', error);
        
        // Gestion améliorée des erreurs
        if (error.code === 500 || error.message.includes('Internal Server Error')) {
          // Gérer les erreurs serveur
        } else if (error.message.includes('Invalid session token')) {
          // Gérer les erreurs de session
          setTimeout(() => {
            // Redirection vers la page de login
          }, 3000);
        } else {
          // Gérer les autres erreurs
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
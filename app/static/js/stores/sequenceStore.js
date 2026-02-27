// sequenceStore.js - Store consolidé pour la gestion complète des séquences
// Ce store centralise toutes les opérations liées aux séquences, actions, profils SMTP, variables et liens de paiement

document.addEventListener('alpine:init', () => {
  Alpine.store('sequence', {
    // ============================================
    // ÉTAT INITIAL - SECTIONS ORGANISÉES
    // ============================================

    // 1. Gestion des séquences
    sequences: [],
    currentSequence: null,
    associatedImpayes: [],
    
    // 2. Gestion des profils SMTP (anciennement smtpProfilesStore)
    smtpProfiles: {
      profiles: [],
      selectedProfile: null,
      isLoading: false,
      error: null
    },
    
    // 3. Gestion des variables (anciennement variablesStore)
    variables: {
      variables: [],
      filteredVariables: [],
      isLoading: false,
      error: null,
      searchTerm: ''
    },
    
    // 4. Gestion des liens de paiement (anciennement paymentLinksStore)
    paymentLinks: {
      links: [],
      selectedLink: null,
      isLoading: false,
      error: null,
      showLink: true,
      customMessage: 'Veuillez trouver ci-dessous le lien pour effectuer votre paiement en ligne.',
      linksConfigOpen: false,
      newLink: '',
      newLinkName: '',
      newLinkDescription: ''
    },
    
    // 5. État global
    isLoading: false,
    error: null,

    // ============================================
    // MÉTHODES PRINCIPALES - SÉQUENCES
    // ============================================

    /**
     * Charge toutes les séquences depuis le serveur
     */
    async loadSequences() {
      this.isLoading = true;
      this.error = null;

      try {
        console.log('Chargement des séquences depuis le store');
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        const response = await parseAxios.get('/classes/Sequences');

        this.sequences = response.data.results.map(seq => ({
          objectId: seq.objectId,
          nom: seq.nom || 'Séquence sans nom',
          description: seq.description || '',
          isAuto: seq.isAuto || false,
          isActif: seq.isActif || true,
          actions: seq.actions || [],
          createdAt: seq.createdAt || new Date().toISOString(),
          updatedAt: seq.updatedAt || new Date().toISOString()
        }));

        console.log('Séquences chargées:', this.sequences.length);
        return this.sequences;

      } catch (error) {
        this.error = 'Erreur lors du chargement des séquences: ' + error.message;
        console.error('Erreur:', error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Charge une séquence spécifique par son ID
     * @param {string} sequenceId - L'ID de la séquence à charger
     */
    async loadSequence(sequenceId) {
      if (!sequenceId) {
        this.error = 'ID de séquence non fourni';
        return null;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        console.log(`Chargement de la séquence ${sequenceId}`);
        const response = await parseAxios.get(`/classes/Sequences/${sequenceId}`);

        this.currentSequence = {
          objectId: response.data.objectId,
          nom: response.data.nom || 'Séquence sans nom',
          description: response.data.description || '',
          isAuto: response.data.isAuto || false,
          isActif: response.data.isActif || true,
          actions: response.data.actions || [],
          createdAt: response.data.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt || new Date().toISOString()
        };

        // Charger les données associées
        await this.loadAssociatedImpayes(sequenceId);
        
        console.log('Séquence chargée:', this.currentSequence.nom);
        return this.currentSequence;

      } catch (error) {
        this.error = `Erreur lors du chargement de la séquence: ${error.message}`;
        console.error('Erreur:', error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Enregistre la séquence courante
     */
    async saveSequence() {
      if (!this.currentSequence || !this.currentSequence.objectId) {
        this.error = 'Aucune séquence sélectionnée à enregistrer';
        return false;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        console.log(`Enregistrement de la séquence ${this.currentSequence.nom}`);

        await parseAxios.put(`/classes/Sequences/${this.currentSequence.objectId}`, {
          nom: this.currentSequence.nom,
          description: this.currentSequence.description,
          isActif: this.currentSequence.isActif,
          isAuto: this.currentSequence.isAuto,
          actions: this.currentSequence.actions
        });

        // Mettre à jour la séquence dans la liste
        const index = this.sequences.findIndex(s => s.objectId === this.currentSequence.objectId);
        if (index !== -1) {
          this.sequences[index] = {...this.currentSequence};
        }

        console.log('Séquence enregistrée avec succès');
        return true;

      } catch (error) {
        this.error = `Erreur lors de l'enregistrement: ${error.message}`;
        console.error('Erreur:', error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Crée une nouvelle séquence
     * @param {Object} sequenceData - Données de la nouvelle séquence
     */
    async createSequence(sequenceData) {
      this.isLoading = true;
      this.error = null;

      try {
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        console.log('Création d\'une nouvelle séquence:', sequenceData.nom);

        const response = await parseAxios.post('/classes/Sequences', {
          nom: sequenceData.nom,
          description: sequenceData.description,
          isAuto: sequenceData.isAuto || false,
          isActif: sequenceData.isActif || true,
          actions: sequenceData.actions || []
        });

        const newSequence = {
          objectId: response.data.objectId,
          nom: response.data.nom,
          description: response.data.description,
          isAuto: response.data.isAuto,
          isActif: response.data.isActif,
          actions: response.data.actions,
          createdAt: response.data.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt || new Date().toISOString()
        };

        this.sequences.push(newSequence);
        this.currentSequence = newSequence;

        console.log('Nouvelle séquence créée:', newSequence.nom);
        return newSequence;

      } catch (error) {
        this.error = `Erreur lors de la création: ${error.message}`;
        console.error('Erreur:', error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Supprime une séquence
     * @param {string} sequenceId - ID de la séquence à supprimer
     */
    async deleteSequence(sequenceId) {
      this.isLoading = true;
      this.error = null;

      try {
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        console.log(`Suppression de la séquence ${sequenceId}`);
        await parseAxios.delete(`/classes/Sequences/${sequenceId}`);

        // Supprimer de la liste locale
        this.sequences = this.sequences.filter(s => s.objectId !== sequenceId);

        // Si c'était la séquence courante, la réinitialiser
        if (this.currentSequence && this.currentSequence.objectId === sequenceId) {
          this.currentSequence = null;
          this.associatedImpayes = [];
        }

        console.log('Séquence supprimée avec succès');
        return true;

      } catch (error) {
        this.error = `Erreur lors de la suppression: ${error.message}`;
        console.error('Erreur:', error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    // ============================================
    // MÉTHODES POUR LES DONNÉES ASSOCIÉES
    // ============================================

    /**
     * Charge les impayés associés à la séquence courante
     */
    async loadAssociatedImpayes(sequenceId) {
      if (!sequenceId) {
        this.associatedImpayes = [];
        return;
      }

      try {
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        console.log(`Chargement des impayés associés à la séquence ${sequenceId}`);
        const response = await parseAxios.get('/classes/Impayes', {
          params: {
            where: JSON.stringify({
              sequence: {
                __type: 'Pointer',
                className: 'Sequences',
                objectId: sequenceId
              }
            }),
            include: 'payeur'
          }
        });

        this.associatedImpayes = response.data.results.map(impaye => ({
          objectId: impaye.objectId,
          nfacture: impaye.nfacture || 'N/A',
          payeur_nom: impaye.payeur?.nom || impaye.payeur_nom || 'Inconnu',
          montant: impaye.montant || 0,
          date: impaye.date || new Date().toISOString(),
          payeur_email: impaye.payeur?.email || impaye.payeur_email || '',
          payeur_telephone: impaye.payeur?.telephone || impaye.payeur_telephone || ''
        }));

        console.log('Impayés associés chargés:', this.associatedImpayes.length);

      } catch (error) {
        console.error('Erreur lors du chargement des impayés associés:', error);
        this.associatedImpayes = [];
      }
    },

    // ============================================
    // MÉTHODES POUR LA GESTION DES ACTIONS
    // ============================================

    /**
     * Ajoute une nouvelle action à la séquence courante
     * @param {string} type - Type d'action (email, sms, etc.)
     */
    addActionToCurrentSequence(type = 'email') {
      if (!this.currentSequence) {
        console.warn('Aucune séquence sélectionnée pour ajouter une action');
        return;
      }

      const newAction = {
        id: Date.now().toString(),
        type: type,
        smtpProfileId: this.getDefaultProfileId(),
        senderEmail: this.getDefaultSenderEmail(),
        subject: 'Rappel de paiement',
        body: 'Bonjour [[client_nom]],\n\nCeci est un rappel pour le paiement de votre facture [[facture_numero]] d\'un montant de [[facture_montant]].\n\nCordialement,\nVotre équipe',
        delay: 0,
        variablesUsed: []
      };

      this.currentSequence.actions.push(newAction);
      console.log('Nouvelle action ajoutée à la séquence');
    },

    /**
     * Supprime une action de la séquence courante
     * @param {number} index - Index de l'action à supprimer
     */
    removeActionFromCurrentSequence(index) {
      if (!this.currentSequence || !this.currentSequence.actions) {
        console.warn('Aucune séquence ou actions disponibles');
        return;
      }

      this.currentSequence.actions.splice(index, 1);
      console.log('Action supprimée de la séquence');
    },

    /**
     * Met à jour une action dans la séquence courante
     * @param {number} index - Index de l'action à mettre à jour
     * @param {Object} updatedAction - Données mises à jour de l'action
     */
    updateActionInCurrentSequence(index, updatedAction) {
      if (!this.currentSequence || !this.currentSequence.actions) {
        console.warn('Aucune séquence ou actions disponibles');
        return;
      }

      this.currentSequence.actions[index] = {...updatedAction};
      console.log('Action mise à jour dans la séquence');
    },

    // ============================================
    // MÉTHODES POUR LES PROFILS SMTP (anciennement smtpProfilesStore)
    // ============================================

    /**
     * Charge tous les profils SMTP depuis le serveur
     */
    async loadSmtpProfiles() {
      this.smtpProfiles.isLoading = true;
      this.smtpProfiles.error = null;

      try {
        console.log('Chargement des profils SMTP depuis le serveur');
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        const response = await parseAxios.get('/classes/SMTPProfile');

        this.smtpProfiles.profiles = response.data.results.map(profile => ({
          objectId: profile.objectId,
          name: profile.name || 'Profil sans nom',
          email: profile.email || '',
          server: profile.server || '',
          port: profile.port || '',
          username: profile.username || '',
          password: profile.password || '',
          useSSL: profile.useSSL || false,
          useTLS: profile.useTLS || false
        }));

        // Sélectionner le premier profil par défaut
        if (this.smtpProfiles.profiles.length > 0) {
          this.smtpProfiles.selectedProfile = this.smtpProfiles.profiles[0];
        }

        console.log('Profils SMTP chargés:', this.smtpProfiles.profiles.length);
        return this.smtpProfiles.profiles;

      } catch (error) {
        this.smtpProfiles.error = 'Erreur lors du chargement des profils SMTP: ' + error.message;
        console.error('Erreur:', error);
        this.smtpProfiles.profiles = [];
        this.smtpProfiles.selectedProfile = null;
        return [];
      } finally {
        this.smtpProfiles.isLoading = false;
      }
    },

    /**
     * Ajoute un nouveau profil SMTP
     * @param {Object} profileData - Données du nouveau profil
     */
    async addSmtpProfile(profileData) {
      this.smtpProfiles.isLoading = true;
      this.smtpProfiles.error = null;

      try {
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        console.log('Ajout d\'un nouveau profil SMTP:', profileData.name);

        const response = await parseAxios.post('/classes/SMTPProfile', {
          name: profileData.name,
          email: profileData.email,
          server: profileData.server,
          port: profileData.port,
          username: profileData.username,
          password: profileData.password,
          useSSL: profileData.useSSL || false,
          useTLS: profileData.useTLS || false
        });

        const newProfile = {
          objectId: response.data.objectId,
          name: response.data.name,
          email: response.data.email,
          server: response.data.server,
          port: response.data.port,
          username: response.data.username,
          password: response.data.password,
          useSSL: response.data.useSSL || false,
          useTLS: response.data.useTLS || false
        };

        this.smtpProfiles.profiles.push(newProfile);
        this.smtpProfiles.selectedProfile = newProfile;

        console.log('Nouveau profil SMTP ajouté:', newProfile.name);
        return newProfile;

      } catch (error) {
        this.smtpProfiles.error = `Erreur lors de l'ajout du profil: ${error.message}`;
        console.error('Erreur:', error);
        return null;
      } finally {
        this.smtpProfiles.isLoading = false;
      }
    },

    /**
     * Met à jour un profil SMTP existant
     * @param {string} profileId - ID du profil à mettre à jour
     * @param {Object} updatedData - Données mises à jour
     */
    async updateSmtpProfile(profileId, updatedData) {
      this.smtpProfiles.isLoading = true;
      this.smtpProfiles.error = null;

      try {
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        console.log('Mise à jour du profil SMTP:', profileId);

        await parseAxios.put(`/classes/SMTPProfile/${profileId}`, {
          name: updatedData.name,
          email: updatedData.email,
          server: updatedData.server,
          port: updatedData.port,
          username: updatedData.username,
          password: updatedData.password,
          useSSL: updatedData.useSSL || false,
          useTLS: updatedData.useTLS || false
        });

        // Mettre à jour localement
        const index = this.smtpProfiles.profiles.findIndex(p => p.objectId === profileId);
        if (index !== -1) {
          this.smtpProfiles.profiles[index] = {
            ...this.smtpProfiles.profiles[index],
            ...updatedData
          };
          
          // Si c'est le profil sélectionné, le mettre à jour aussi
          if (this.smtpProfiles.selectedProfile && this.smtpProfiles.selectedProfile.objectId === profileId) {
            this.smtpProfiles.selectedProfile = this.smtpProfiles.profiles[index];
          }
        }

        console.log('Profil SMTP mis à jour avec succès');
        return true;

      } catch (error) {
        this.smtpProfiles.error = `Erreur lors de la mise à jour: ${error.message}`;
        console.error('Erreur:', error);
        return false;
      } finally {
        this.smtpProfiles.isLoading = false;
      }
    },

    /**
     * Supprime un profil SMTP
     * @param {string} profileId - ID du profil à supprimer
     */
    async deleteSmtpProfile(profileId) {
      this.smtpProfiles.isLoading = true;
      this.smtpProfiles.error = null;

      try {
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        console.log('Suppression du profil SMTP:', profileId);
        await parseAxios.delete(`/classes/SMTPProfile/${profileId}`);

        // Supprimer de la liste locale
        this.smtpProfiles.profiles = this.smtpProfiles.profiles.filter(p => p.objectId !== profileId);

        // Si c'était le profil sélectionné, le réinitialiser
        if (this.smtpProfiles.selectedProfile && this.smtpProfiles.selectedProfile.objectId === profileId) {
          this.smtpProfiles.selectedProfile = this.smtpProfiles.profiles.length > 0 ? this.smtpProfiles.profiles[0] : null;
        }

        console.log('Profil SMTP supprimé avec succès');
        return true;

      } catch (error) {
        this.smtpProfiles.error = `Erreur lors de la suppression: ${error.message}`;
        console.error('Erreur:', error);
        return false;
      } finally {
        this.smtpProfiles.isLoading = false;
      }
    },

    /**
     * Sélectionne un profil SMTP
     * @param {string} profileId - ID du profil à sélectionner
     */
    selectSmtpProfile(profileId) {
      const profile = this.smtpProfiles.profiles.find(p => p.objectId === profileId);
      if (profile) {
        this.smtpProfiles.selectedProfile = profile;
        console.log('Profil SMTP sélectionné:', profile.name);
      } else {
        console.warn('Profil SMTP non trouvé:', profileId);
      }
    },

    /**
     * Sélectionne un profil SMTP par son email
     * @param {string} email - Email du profil à sélectionner
     */
    selectSmtpProfileByEmail(email) {
      const profile = this.smtpProfiles.profiles.find(p => p.email === email);
      if (profile) {
        this.smtpProfiles.selectedProfile = profile;
        console.log('Profil SMTP sélectionné par email:', profile.name);
      } else {
        console.warn('Profil SMTP non trouvé pour l\'email:', email);
      }
    },

    /**
     * Retourne le profil SMTP par défaut (le premier de la liste)
     */
    getDefaultProfile() {
      return this.smtpProfiles.profiles.length > 0 ? this.smtpProfiles.profiles[0] : null;
    },

    /**
     * Retourne l'email du profil sélectionné ou du profil par défaut
     */
    getDefaultSenderEmail() {
      return this.smtpProfiles.selectedProfile ? this.smtpProfiles.selectedProfile.email : 
             this.getDefaultProfile() ? this.getDefaultProfile().email : '';
    },

    /**
     * Retourne l'ID du profil sélectionné ou du profil par défaut
     */
    getDefaultProfileId() {
      return this.smtpProfiles.selectedProfile ? this.smtpProfiles.selectedProfile.objectId : 
             this.getDefaultProfile() ? this.getDefaultProfile().objectId : '';
    },

    // ============================================
    // MÉTHODES POUR LES VARIABLES (anciennement variablesStore)
    // ============================================

    /**
     * Charge les variables depuis le fichier variables.json
     */
    async loadVariables() {
      this.variables.isLoading = true;
      this.variables.error = null;

      try {
        console.log('Chargement des variables depuis variables.json');
        const response = await fetch('/static/configs/variables.json');

        if (!response.ok) {
          throw new Error('Fichier variables.json introuvable');
        }

        const data = await response.json();
        this.variables.variables = data.columns || [];
        this.variables.filteredVariables = [...this.variables.variables];

        console.log('Variables chargées:', this.variables.variables.length);
        return this.variables.variables;

      } catch (error) {
        this.variables.error = 'Erreur lors du chargement des variables: ' + error.message;
        console.error('Erreur:', error);
        this.variables.variables = [];
        this.variables.filteredVariables = [];
        return [];
      } finally {
        this.variables.isLoading = false;
      }
    },

    /**
     * Met à jour les variables filtrées en fonction du terme de recherche
     */
    updateFilteredVariables() {
      if (!this.variables.searchTerm) {
        this.variables.filteredVariables = [...this.variables.variables];
      } else {
        this.variables.filteredVariables = this.variables.variables.filter(variable =>
          variable.toLowerCase().includes(this.variables.searchTerm.toLowerCase())
        );
      }
    },

    /**
     * Met à jour le terme de recherche et filtre les variables
     * @param {string} term - Terme de recherche
     */
    setSearchTerm(term) {
      this.variables.searchTerm = term;
      this.updateFilteredVariables();
    },

    /**
     * Copie une variable dans le presse-papiers
     * @param {string} variable - Variable à copier
     */
    copyVariable(variable) {
      const variableWithBrackets = `[[${variable}]]`;
      navigator.clipboard.writeText(variableWithBrackets)
        .then(() => {
          console.log(`Variable ${variableWithBrackets} copiée dans le presse-papiers`);
          return true;
        })
        .catch(err => {
          console.error('Échec de la copie:', err);
          return false;
        });
    },

    // ============================================
    // MÉTHODES POUR LES LIENS DE PAIEMENT (anciennement paymentLinksStore)
    // ============================================

    /**
     * Charge tous les liens de paiement depuis le serveur
     */
    async loadPaymentLinks() {
      this.paymentLinks.isLoading = true;
      this.paymentLinks.error = null;

      try {
        console.log('Chargement des liens de paiement depuis le serveur');
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        const response = await parseAxios.get('/classes/PaymentLink');

        this.paymentLinks.links = response.data.results.map(link => ({
          objectId: link.objectId,
          url: link.url,
          name: link.name || 'Lien de paiement',
          description: link.description || '',
          variable: `lien_paiement_${link.objectId.substring(0, 4)}`
        }));

        // Sélectionner le premier lien par défaut
        if (this.paymentLinks.links.length > 0) {
          this.paymentLinks.selectedLink = this.paymentLinks.links[0].url;
        }

        console.log('Liens de paiement chargés:', this.paymentLinks.links.length);
        return this.paymentLinks.links;

      } catch (error) {
        this.paymentLinks.error = 'Erreur lors du chargement des liens de paiement: ' + error.message;
        console.error('Erreur:', error);
        this.paymentLinks.links = [];
        this.paymentLinks.selectedLink = null;
        return [];
      } finally {
        this.paymentLinks.isLoading = false;
      }
    },

    /**
     * Ajoute un nouveau lien de paiement
     * @param {Object} linkData - Données du nouveau lien
     */
    async addPaymentLink(linkData) {
      this.paymentLinks.isLoading = true;
      this.paymentLinks.error = null;

      try {
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        console.log('Ajout d\'un nouveau lien de paiement:', linkData.name);

        const response = await parseAxios.post('/classes/PaymentLink', {
          url: linkData.url,
          name: linkData.name,
          description: linkData.description || ''
        });

        const newLink = {
          objectId: response.data.objectId,
          url: response.data.url,
          name: response.data.name,
          description: response.data.description || '',
          variable: `lien_paiement_${response.data.objectId.substring(0, 4)}`
        };

        this.paymentLinks.links.push(newLink);
        this.paymentLinks.selectedLink = newLink.url;

        console.log('Nouveau lien de paiement ajouté:', newLink.name);
        return newLink;

      } catch (error) {
        this.paymentLinks.error = `Erreur lors de l'ajout du lien: ${error.message}`;
        console.error('Erreur:', error);
        return null;
      } finally {
        this.paymentLinks.isLoading = false;
      }
    },

    /**
     * Sélectionne un lien de paiement
     * @param {string} linkUrl - URL du lien à sélectionner
     */
    selectPaymentLink(linkUrl) {
      this.paymentLinks.selectedLink = linkUrl;
      console.log('Lien sélectionné:', linkUrl);
    },

    /**
     * Basculer l'affichage du lien de paiement
     */
    toggleShowPaymentLink() {
      this.paymentLinks.showLink = !this.paymentLinks.showLink;
      console.log('Affichage du lien de paiement:', this.paymentLinks.showLink ? 'activé' : 'désactivé');
    },

    /**
     * Met à jour le message personnalisé
     * @param {string} message - Nouveau message personnalisé
     */
    setPaymentLinkCustomMessage(message) {
      this.paymentLinks.customMessage = message;
    },

    /**
     * Copie une variable de lien de paiement dans le presse-papiers
     * @param {Object} link - Lien de paiement
     */
    copyPaymentLinkVariable(link) {
      const variableWithBrackets = `[[${link.variable}]]`;
      navigator.clipboard.writeText(variableWithBrackets)
        .then(() => {
          console.log(`Variable ${variableWithBrackets} copiée dans le presse-papiers`);
          return true;
        })
        .catch(err => {
          console.error('Échec de la copie:', err);
          return false;
        });
    },

    /**
     * Copie l'URL d'un lien de paiement dans le presse-papiers
     * @param {Object} link - Lien de paiement
     */
    copyPaymentLinkUrl(link) {
      navigator.clipboard.writeText(link.url)
        .then(() => {
          console.log(`URL ${link.url} copiée dans le presse-papiers`);
          return true;
        })
        .catch(err => {
          console.error('Échec de la copie:', err);
          return false;
        });
    },

    // ============================================
    // MÉTHODES UTILITAIRES GLOBALES
    // ============================================

    /**
     * Réinitialise l'état complet du store
     */
    resetStore() {
      this.sequences = [];
      this.currentSequence = null;
      this.associatedImpayes = [];
      
      this.smtpProfiles = {
        profiles: [],
        selectedProfile: null,
        isLoading: false,
        error: null
      };
      
      this.variables = {
        variables: [],
        filteredVariables: [],
        isLoading: false,
        error: null,
        searchTerm: ''
      };
      
      this.paymentLinks = {
        links: [],
        selectedLink: null,
        isLoading: false,
        error: null,
        showLink: true,
        customMessage: 'Veuillez trouver ci-dessous le lien pour effectuer votre paiement en ligne.',
        linksConfigOpen: false,
        newLink: '',
        newLinkName: '',
        newLinkDescription: ''
      };
      
      this.isLoading = false;
      this.error = null;
      console.log('Store complet réinitialisé');
    },

    /**
     * Formate une date pour l'affichage
     * @param {string} dateString - Chaîne de date à formater
     */
    formatDate(dateString) {
      if (!dateString) return 'N/A';

      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (e) {
        return 'Date invalide';
      }
    },

    /**
     * Formate un montant en euros
     * @param {number} amount - Montant à formater
     */
    formatCurrency(amount) {
      if (amount == null) return '0,00 €';
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    }
  });
});
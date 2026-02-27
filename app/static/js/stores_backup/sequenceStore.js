// sequenceStore.js - Store centralisé pour la gestion des séquences
// Ce store gère toutes les opérations liées aux séquences, actions et données associées

document.addEventListener('alpine:init', () => {
  Alpine.store('sequence', {
    // ============================================
    // MÉTHODES UTILITAIRES
    // ========================================================================================
    // ÉTAT INITIAL
    // ============================================

    // Liste complète des séquences
    sequences: [],

    // Séquence actuellement sélectionnée
    currentSequence: null,

    // Données associées à la séquence courante
    associatedImpayes: [],

    // État d'interface et de chargement
    isLoading: false,
    error: null,

    // ============================================
    // MÉTHODES PRINCIPALES
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

      const smtpProfilesStore = Alpine.store('smtpProfiles');
      const newAction = {
        id: Date.now().toString(),
        type: type,
        smtpProfileId: smtpProfilesStore.getDefaultProfileId(),
        senderEmail: smtpProfilesStore.getDefaultSenderEmail(),
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

    // MÉTHODES UTILITAIRES
    // ============================================

    /**
     * Réinitialise l'état du store
     */
    resetStore() {
      this.sequences = [];
      this.currentSequence = null;
      this.associatedImpayes = [];
      this.smtpProfiles = [];
      this.isLoading = false;
      this.error = null;
      console.log('Store réinitialisé');
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
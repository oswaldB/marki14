// sequenceManualState.js - État pour la gestion manuelle des séquences
document.addEventListener('alpine:init', () => {
  Alpine.data('sequenceManual', () => ({
    // ============================================
    // ÉTAT CENTRALISÉ
    // ============================================
    
    // Données principales
    sequence: {
      objectId: "",
      nom: "",
      description: "",
      isActif: true,
      createdAt: "",
      updatedAt: "",
      actions: []
    },
    
    // Gestion des impayés
    associatedImpayes: [],      // Impayés déjà associés à la séquence
    availableImpayes: [],       // Impayés disponibles pour association
    filteredAvailableImpayes: [], // Résultats filtrés
    selectedImpayes: [],         // Impayés sélectionnés pour ajout
    
    // Filtres de recherche
    impayeSearchTerm: "",
    selectedPayeurType: "",
    selectedCodePostal: "",
    
    // Gestion SMTP
    smtpProfiles: [],
    defaultSmtpProfileId: "",
    defaultSenderEmail: "",
    
    // États d'interface
    isLoading: true,
    isSaving: false,
    error: null,
    activeTab: 'actions',
    addImpayeDrawerOpen: false,
    deleteConfirmOpen: false,
    itemToDelete: null,
    deleteType: null, // 'impaye'
    
    // ============================================
    // CYCLE DE VIE
    // ============================================
    
    init() {
      console.log("Initialisation de Sequence Manual...");
      this.loadSequenceData();
    },
    
    // ============================================
    // CHARGEMENT DES DONNÉES
    // ============================================
    
    async loadSequenceData() {
      try {
        this.isLoading = true;
        this.error = null;
        
        // Charger la séquence
        await this.loadSequence();
        
        // Charger les impayés associés
        await this.loadAssociatedImpayes();
        
        // Charger les profils SMTP
        await this.loadSmtpProfiles();
        
        console.log("Données chargées avec succès");
      } catch (error) {
        this.error = `Échec du chargement des données: ${error.message}`;
        console.error("Erreur de chargement:", error);
      } finally {
        this.isLoading = false;
      }
    },
    
    async loadSequence() {
      // Extraire l'ID de la séquence de l'URL
      const pathParts = window.location.pathname.split('/');
      const sequenceId = pathParts[pathParts.length - 1];
      
      if (!sequenceId) {
        throw new Error("ID de séquence non trouvé dans l'URL");
      }
      
      try {
        const parseAxios = this.getParseAxios();
        const response = await parseAxios.get(`/classes/Sequences/${sequenceId}`);
        
        this.sequence = {
          objectId: response.data.objectId,
          nom: response.data.nom || "Séquence sans nom",
          description: response.data.description || "",
          isActif: response.data.isActif || true,
          createdAt: response.data.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt || new Date().toISOString(),
          actions: response.data.actions || []
        };
      } catch (error) {
        console.error("Erreur lors du chargement de la séquence:", error);
        throw error;
      }
    },
    
    async loadAssociatedImpayes() {
      if (!this.sequence.objectId) return;
      
      try {
        const parseAxios = this.getParseAxios();
        const response = await parseAxios.get('/classes/Impayes', {
          params: {
            where: JSON.stringify({
              sequence: {
                __type: "Pointer",
                className: "Sequences",
                objectId: this.sequence.objectId
              }
            }),
            include: "payeur"
          }
        });
        
        this.associatedImpayes = response.data.results.map(impaye => ({
          objectId: impaye.objectId,
          nfacture: impaye.nfacture || "N/A",
          payeur_nom: impaye.payeur?.nom || impaye.payeur_nom || "Inconnu",
          montant: impaye.montant || 0,
          date: impaye.date || new Date().toISOString()
        }));
      } catch (error) {
        console.error("Erreur lors du chargement des impayés associés:", error);
      }
    },
    
    async loadSmtpProfiles() {
      try {
        const parseAxios = this.getParseAxios();
        const response = await parseAxios.get('/classes/SMTPProfile');
        
        this.smtpProfiles = response.data.results.map(profile => ({
          objectId: profile.objectId,
          name: profile.name || "Profil sans nom",
          email: profile.email || "",
          server: profile.server || "",
          port: profile.port || ""
        }));
        
        // Définir un email expéditeur par défaut si disponible
        if (this.smtpProfiles.length > 0) {
          this.defaultSmtpProfileId = this.smtpProfiles[0].objectId;
          this.defaultSenderEmail = this.smtpProfiles[0].email;
        }
      } catch (error) {
        console.error("Erreur lors du chargement des profils SMTP:", error);
        this.smtpProfiles = [];
      }
    },
    
    // ============================================
    // SYNCHRONISATION AVEC LE COMPOSANT ACTIONS
    // ============================================
    
    onActionDeleted(index) {
      // Synchroniser la suppression dans la séquence principale
      this.sequence.actions.splice(index, 1);
    },
    
    getSequenceDataForActions() {
      return {
        actions: this.sequence.actions
      };
    },
    
    async confirmDelete() {
      if (this.deleteType === 'impaye' && this.itemToDelete) {
        try {
          const parseAxios = this.getParseAxios();
          await parseAxios.put(`/classes/Impayes/${this.itemToDelete.objectId}`, {
            sequence: null
          });
          
          // Recharger les impayés associés
          await this.loadAssociatedImpayes();
        } catch (error) {
          this.error = "Erreur lors de la dissociation de l'impayé";
          console.error("Erreur:", error);
        }
      }
      
      this.cancelDelete();
    },
    
    cancelDelete() {
      this.deleteConfirmOpen = false;
      this.itemToDelete = null;
      this.deleteType = null;
    },
    
    // ============================================
    // GESTION DES IMPAYÉS
    // ============================================
    
    filterAvailableImpayes() {
      this.filteredAvailableImpayes = this.availableImpayes.filter(impaye => {
        const matchesSearch = this.impayeSearchTerm === '' ||
          impaye.nfacture.toLowerCase().includes(this.impayeSearchTerm.toLowerCase()) ||
          impaye.payeur_nom.toLowerCase().includes(this.impayeSearchTerm.toLowerCase());
        
        const matchesType = this.selectedPayeurType === '' ||
          impaye.payeur_type === this.selectedPayeurType;
        
        const matchesCodePostal = this.selectedCodePostal === '' ||
          impaye.payeur_codePostal === this.selectedCodePostal;
        
        return matchesSearch && matchesType && matchesCodePostal;
      });
    },
    
    toggleSelectAllImpayes(event) {
      if (event.target.checked) {
        this.selectedImpayes = this.filteredAvailableImpayes.map(impaye => impaye.objectId);
      } else {
        this.selectedImpayes = [];
      }
    },
    
    async addSelectedImpayes() {
      try {
        this.isLoading = true;
        const parseAxios = this.getParseAxios();
        
        for (const impayeId of this.selectedImpayes) {
          await parseAxios.put(`/classes/Impayes/${impayeId}`, {
            sequence: {
              __type: "Pointer",
              className: "Sequences",
              objectId: this.sequence.objectId
            }
          });
        }
        
        // Recharger les impayés associés
        await this.loadAssociatedImpayes();
        
        this.addImpayeDrawerOpen = false;
        this.selectedImpayes = [];
      } catch (error) {
        this.error = "Erreur lors de l'association des impayés";
        console.error("Erreur:", error);
      } finally {
        this.isLoading = false;
      }
    },
    
    async removeImpaye(impaye) {
      this.itemToDelete = impaye;
      this.deleteType = 'impaye';
      this.deleteConfirmOpen = true;
    },
    
    // ============================================
    // SAUVEGARDE
    // ============================================
    
    async saveSequence() {
      try {
        this.isSaving = true;
        this.error = null;
        
        const parseAxios = this.getParseAxios();
        await parseAxios.put(`/classes/Sequences/${this.sequence.objectId}`, {
          nom: this.sequence.nom,
          description: this.sequence.description,
          isActif: this.sequence.isActif,
          actions: this.sequence.actions
        });
        
        this.showNotification("Séquence enregistrée avec succès", "success");
      } catch (error) {
        this.error = `Erreur lors de l'enregistrement: ${error.message}`;
        console.error("Erreur d'enregistrement:", error);
      } finally {
        this.isSaving = false;
      }
    },
    
    // ============================================
    // UTILITAIRES
    // ============================================
    
    getParseAxios() {
      const parseAxios = Alpine.store("parseAxios");
      if (!parseAxios) {
        throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
      }
      return parseAxios;
    },
    
    showNotification(message, type = "info") {
      if (window.showNotification) {
        window.showNotification(message, type);
      } else {
        alert(message);
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return "N/A";
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (e) {
        return "Date invalide";
      }
    },
    
    formatCurrency(amount) {
      if (amount == null) return "0,00 €";
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    }
  }))
});
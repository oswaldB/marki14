// sequenceManualState.js - État pour la gestion manuelle des séquences
document.addEventListener("alpine:init", () => {
    Alpine.data("sequenceManual", () => ({
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
            actions: [],
        },

        // Gestion des impayés
        associatedImpayes: [], // Impayés déjà associés à la séquence
        availableImpayes: [], // Impayés disponibles pour association
        filteredAvailableImpayes: [], // Résultats filtrés
        selectedImpayes: [], // Impayés sélectionnés pour ajout

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
        activeTab: "actions",
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

                // Charger les variables et liens de paiement
                await this.loadVariables();
                await this.loadPaymentLinks();

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
            const pathParts = window.location.pathname.split("/");
            const sequenceId = pathParts[pathParts.length - 1];

            if (!sequenceId) {
                throw new Error("ID de séquence non trouvé dans l'URL");
            }

            try {
                const sequenceStore = Alpine.store('sequence');
                await sequenceStore.loadSequence(sequenceId);
                this.sequence = sequenceStore.currentSequence;
                
                // Charger les profils SMTP séparément
                await this.loadSmtpProfiles();
            } catch (error) {
                console.error(
                    "Erreur lors du chargement de la séquence:",
                    error,
                );
                throw error;
            }
        },

        async loadAssociatedImpayes() {
            if (!this.sequence.objectId) return;

            try {
                const sequenceStore = Alpine.store('sequence');
                await sequenceStore.loadAssociatedImpayes(this.sequence.objectId);
                this.associatedImpayes = sequenceStore.associatedImpayes;
            } catch (error) {
                console.error(
                    "Erreur lors du chargement des impayés associés:",
                    error,
                );
            }
        },

        async loadSmtpProfiles() {
            const sequenceStore = Alpine.store('sequence');
            if (sequenceStore.smtpProfiles.profiles.length === 0) {
                await sequenceStore.loadSmtpProfiles();
            }
            this.smtpProfiles = sequenceStore.smtpProfiles.profiles;

            // Définir un email expéditeur par défaut si disponible
            if (this.smtpProfiles.length > 0) {
                this.defaultSmtpProfileId = sequenceStore.getDefaultProfileId();
                this.defaultSenderEmail = sequenceStore.getDefaultSenderEmail();
            }
        },

        // ============================================
        // SYNCHRONISATION AVEC LE COMPOSANT ACTIONS
        // ============================================

        onActionDeleted(index) {
            // Synchroniser la suppression dans la séquence principale
            const sequenceStore = Alpine.store('sequence');
            sequenceStore.removeActionFromCurrentSequence(index);
        },

        getSequenceDataForActions() {
            const sequenceStore = Alpine.store('sequence');
            return {
                actions: sequenceStore.currentSequence.actions,
                smtpProfiles: sequenceStore.smtpProfiles.profiles,
                defaultSmtpProfileId: sequenceStore.getDefaultProfileId(),
                defaultSenderEmail: sequenceStore.getDefaultSenderEmail(),
            };
        },

        async confirmDelete() {
            if (this.deleteType === "impaye" && this.itemToDelete) {
                try {
                    const parseAxios = this.getParseAxios();
                    await parseAxios.put(
                        `/classes/Impayes/${this.itemToDelete.objectId}`,
                        {
                            sequence: null,
                        },
                    );

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
            this.filteredAvailableImpayes = this.availableImpayes.filter(
                (impaye) => {
                    const matchesSearch =
                        this.impayeSearchTerm === "" ||
                        impaye.nfacture
                            .toLowerCase()
                            .includes(this.impayeSearchTerm.toLowerCase()) ||
                        impaye.payeur_nom
                            .toLowerCase()
                            .includes(this.impayeSearchTerm.toLowerCase());

                    const matchesType =
                        this.selectedPayeurType === "" ||
                        impaye.payeur_type === this.selectedPayeurType;

                    const matchesCodePostal =
                        this.selectedCodePostal === "" ||
                        impaye.payeur_codePostal === this.selectedCodePostal;

                    return matchesSearch && matchesType && matchesCodePostal;
                },
            );
        },

        toggleSelectAllImpayes(event) {
            if (event.target.checked) {
                this.selectedImpayes = this.filteredAvailableImpayes.map(
                    (impaye) => impaye.objectId,
                );
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
                            objectId: this.sequence.objectId,
                        },
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
            this.deleteType = "impaye";
            this.deleteConfirmOpen = true;
        },

        // ============================================
        // SAUVEGARDE
        // ============================================

        async saveSequence() {
            try {
                this.isSaving = true;
                this.error = null;

                // Dispatch event to all email cards to sync content before save
                this.$dispatch("before-save");

                // Small delay to ensure all components have processed the event
                await new Promise((resolve) => setTimeout(resolve, 100));

                const sequenceStore = Alpine.store('sequence');
                await sequenceStore.saveSequence();

                this.showNotification(
                    "Séquence enregistrée avec succès",
                    "success",
                );
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
                throw new Error(
                    "parseAxios n'est pas disponible. Veuillez recharger la page.",
                );
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
            const sequenceStore = Alpine.store('sequence');
            return sequenceStore.formatDate(dateString);
        },

        formatCurrency(amount) {
            const sequenceStore = Alpine.store('sequence');
            return sequenceStore.formatCurrency(amount);
        },

        // ============================================
        // CHARGEMENT DES VARIABLES ET LIENS DE PAIEMENT
        // ============================================

        async loadVariables() {
            try {
                const sequenceStore = Alpine.store('sequence');
                await sequenceStore.loadVariables();
                console.log('Variables chargées:', sequenceStore.variables.variables.length);
            } catch (error) {
                console.error("Erreur lors du chargement des variables:", error);
            }
        },

        async loadPaymentLinks() {
            try {
                const sequenceStore = Alpine.store('sequence');
                await sequenceStore.loadPaymentLinks();
                console.log('Liens de paiement chargés:', sequenceStore.paymentLinks.links.length);
            } catch (error) {
                console.error("Erreur lors du chargement des liens de paiement:", error);
            }
        },
    }));
});

// emailTableState.js - État pour le composant email_table (datatable avec variables exactes)
document.addEventListener("alpine:init", () => {
    Alpine.data("emailTableState", () => ({
        tableConfig: {
            showTable: true,
            configOpen: false,
            columns: [],
            availableColumns: [],
            invoiceData: null,
            selectedColumns: [
                "refpiece",
                "nfacture",
                "datepiece",
                "totalttcnet",
                "resteapayer",
                "payeur_nom",
            ],
        },

        // State for column configuration
        dragColumn: null,
        editingColumnId: null,
        newColumnName: "",
        isLoading: false,
        error: null,

        async init() {
            console.log("Initializing emailTableState...");
            this.isLoading = true;
            this.error = null;

            // S'assurer que tableConfig est initialisé
            if (!this.tableConfig) {
                console.error("tableConfig is null during init!");
                this.tableConfig = {
                    showTable: true,
                    configOpen: false,
                    columns: [],
                    availableColumns: [],
                    invoiceData: null,
                    selectedColumns: [
                        "refpiece",
                        "nfacture",
                        "datepiece",
                        "totalttcnet",
                        "resteapayer",
                        "payeur_nom",
                    ],
                };
            }

            try {
                await this.loadTableConfiguration();
                await this.loadInvoiceData();
                console.log(
                    "Initialization complete. invoiceData:",
                    this.tableConfig.invoiceData ? "loaded" : "null",
                );
            } catch (error) {
                this.error = "Erreur de chargement des données";
                console.error("Init error:", error);
            } finally {
                this.isLoading = false;
            }
        },

        async loadTableConfiguration() {
            try {
                const response = await fetch("/static/configs/variables.json");
                if (!response.ok)
                    throw new Error("Configuration file not found");

                const data = await response.json();

                // Utiliser TOUTES les colonnes comme variables du tableau
                // Les colonnes sont les variables exactes du fichier variables.json
                this.tableConfig.availableColumns = data.columns.map(
                    (col, index) => ({
                        id: col,
                        label: this.getColumnLabel(col),
                        visible: this.tableConfig.selectedColumns.includes(col),
                        order: this.tableConfig.selectedColumns.includes(col)
                            ? this.tableConfig.selectedColumns.indexOf(col)
                            : index,
                        originalLabel: this.getColumnLabel(col), // Sauvegarder le nom original
                    }),
                );

                // Trier les colonnes par ordre défini
                this.updateVisibleColumns();
            } catch (error) {
                console.error("Error loading table configuration:", error);
                this.tableConfig.availableColumns = [];
            }
        },

        async loadInvoiceData() {
            try {
                // Charger les données réelles depuis le fichier variables.json
                console.log("Loading invoice data from variables.json...");

                const response = await fetch("/static/configs/variables.json");
                if (!response.ok) throw new Error("Variables file not found");

                const config = await response.json();
                console.log(
                    "Variables loaded:",
                    config.columns.length,
                    "columns",
                );

                // Créer un objet avec toutes les variables initialisées à des valeurs par défaut
                // Ces valeurs correspondent aux types attendus pour chaque variable
                this.tableConfig.invoiceData = {};
                console.log("Initializing invoiceData object...");

                // Initialiser chaque colonne avec une valeur par défaut appropriée
                config.columns.forEach((column) => {
                    switch (column) {
                        case "objectId":
                            this.tableConfig.invoiceData[column] =
                                "temp_id_123";
                            break;
                        case "createdAt":
                        case "updatedAt":
                        case "datepiece":
                        case "dateDebutMission":
                        case "datecre":
                        case "sequenceAssignedAt":
                            this.tableConfig.invoiceData[column] = "2023-01-15";
                            break;
                        case "ACL":
                            this.tableConfig.invoiceData[column] = {};
                            break;
                        case "totalttcnet":
                        case "resteapayer":
                        case "totalhtnet":
                            this.tableConfig.invoiceData[column] = 1000.0;
                            break;
                        case "facturesoldee":
                        case "sequenceIsAutomatic":
                        case "valide":
                            this.tableConfig.invoiceData[column] = false;
                            break;
                        case "refpiece":
                            this.tableConfig.invoiceData[column] =
                                "FACT-2023-001";
                            break;
                        case "nfacture":
                            this.tableConfig.invoiceData[column] = "INV-0001";
                            break;
                        case "payeur_nom":
                            this.tableConfig.invoiceData[column] =
                                "Client Example";
                            break;
                        case "payeur_email":
                            this.tableConfig.invoiceData[column] =
                                "client@example.com";
                            break;
                        case "payeur_telephone":
                            this.tableConfig.invoiceData[column] =
                                "+33123456789";
                            break;
                        case "adresse":
                            this.tableConfig.invoiceData[column] =
                                "123 Rue Example";
                            break;
                        case "ville":
                            this.tableConfig.invoiceData[column] = "Paris";
                            break;
                        case "codePostal":
                            this.tableConfig.invoiceData[column] = "75001";
                            break;
                        case "commentaire_piece":
                            this.tableConfig.invoiceData[column] =
                                "Facture standard";
                            break;
                        case "statut_intitule":
                            this.tableConfig.invoiceData[column] = "En attente";
                            break;
                        default:
                            // Pour les autres colonnes, utiliser une valeur par défaut générique
                            if (column.includes("email")) {
                                this.tableConfig.invoiceData[column] =
                                    "example@domain.com";
                            } else if (column.includes("telephone")) {
                                this.tableConfig.invoiceData[column] =
                                    "+33100000000";
                            } else if (column.includes("nom")) {
                                this.tableConfig.invoiceData[column] =
                                    "Nom Example";
                            } else if (column.includes("date")) {
                                this.tableConfig.invoiceData[column] =
                                    "2023-01-01";
                            } else if (
                                column.includes("numero") ||
                                column.includes("reference")
                            ) {
                                this.tableConfig.invoiceData[column] =
                                    "REF-001";
                            } else {
                                this.tableConfig.invoiceData[column] = "N/A";
                            }
                    }
                });

                console.log(
                    "Invoice data loaded with all variables:",
                    this.tableConfig.invoiceData,
                );
            } catch (error) {
                console.error("Error loading invoice data:", error);
                this.tableConfig.invoiceData = null;
            }
        },

        getColumnLabel(columnId) {
            // Map column IDs to human-readable labels pour le datatable
            // Ces labels correspondent aux variables exactes du fichier variables.json
            const labelMap = {
                objectId: "ID",
                createdAt: "Créé le",
                updatedAt: "Mis à jour le",
                ACL: "Permissions",
                datepiece: "Date facture",
                dateDebutMission: "Date début mission",
                totalttcnet: "Montant TTC",
                resteapayer: "Reste à payer",
                facturesoldee: "Facture soldée",
                commentaire_piece: "Commentaire pièce",
                refpiece: "Référence pièce",
                idDossier: "ID Dossier",
                nfacture: "Numéro facture",
                statut_intitule: "Statut",
                contactPlace: "Contact",
                reference: "Référence",
                numero: "Numéro",
                totalhtnet: "Montant HT",
                commentaire_dossier: "Commentaire dossier",
                adresse: "Adresse",
                cptAdresse: "Complément adresse",
                codePostal: "Code postal",
                ville: "Ville",
                numeroLot: "Numéro lot",
                etage: "Étage",
                escalier: "Escalier",
                porte: "Porte",
                numVoie: "Numéro voie",
                cptNumVoie: "Complément numéro",
                typeVoie: "Type de voie",
                employe_intervention: "Intervenant",
                payeur_nom: "Payeur",
                idStatut: "ID Statut",
                datecre: "Date création",
                payeur_contact_email: "Email contact payeur",
                proprietaire_nom: "Propriétaire",
                proprietaire_typePersonne: "Type propriétaire",
                payeur_type: "Type payeur",
                invoice_url: "URL Facture",
                idEmployeIntervention: "ID Intervenant",
                payeur_typePersonne: "Type personne payeur",
                entree: "Entrée",
                payeur_contact_nom: "Nom contact payeur",
                apporteur_affaire_nom: "Apporteur affaire",
                apporteur_affaire_email: "Email apporteur",
                apporteur_affaire_contact_email: "Email contact apporteur",
                apporteur_affaire_typePersonne: "Type apporteur",
                payeur_email: "Email payeur",
                apporteur_affaire_contact_nom: "Nom contact apporteur",
                donneur_ordre_email: "Email donneur ordre",
                proprietaire_email: "Email propriétaire",
                donneur_ordre_nom: "Donneur ordre",
                proprietaire_contact_nom: "Nom contact propriétaire",
                proprietaire_contact_email: "Email contact propriétaire",
                proprietaire_telephone: "Téléphone propriétaire",
                donneur_ordre_telephone: "Téléphone donneur ordre",
                syndic_email: "Email syndic",
                apporteur_affaire_telephone: "Téléphone apporteur",
                referenceExterne: "Référence externe",
                notaire_email: "Email notaire",
                notaire_nom: "Nom notaire",
                payeur_telephone: "Téléphone payeur",
                locataire_entrant_nom: "Locataire entrant",
                locataire_entrant_email: "Email locataire entrant",
                locataire_entrant_telephone: "Téléphone locataire entrant",
                locataire_sortant_email: "Email locataire sortant",
                locataire_sortant_nom: "Nom locataire sortant",
                locataire_sortant_telephone: "Téléphone locataire sortant",
                acquerur_email: "Email acquéreur",
                sequenceName: "Nom séquence",
                sequenceIsAutomatic: "Séquence automatique",
                sequence: "Séquence",
                valide: "Validé",
                sequenceAssignedAt: "Séquence assignée le",
            };

            return (
                labelMap[columnId] ||
                columnId
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())
            );
        },

        formatDate(dateString) {
            if (!dateString) return "N/A";
            const date = new Date(dateString);
            return date.toLocaleDateString("fr-FR");
        },

        formatCurrency(amount) {
            if (amount === undefined || amount === null) return "0,00 €";
            return typeof amount === "string"
                ? amount
                : `${amount.toFixed(2)} €`;
        },

        formatBoolean(value) {
            return value ? "Oui" : "Non";
        },

        getFormattedValue(columnId, value) {
            // Vérifications de sécurité multiples
            if (!this.tableConfig.invoiceData) return "N/A";
            if (value === undefined || value === null) return "N/A";

            const actualValue = this.tableConfig.invoiceData[columnId];
            if (actualValue === undefined || actualValue === null) return "N/A";

            // Debug log pour voir quelles valeurs sont accédées
            console.log("Formatting:", columnId, "=", actualValue);

            // Formatage spécifique selon le type de colonne (variable)
            switch (columnId) {
                case "datepiece":
                case "dateDebutMission":
                case "createdAt":
                case "updatedAt":
                case "datecre":
                case "sequenceAssignedAt":
                    return this.formatDate(actualValue);
                case "totalttcnet":
                case "resteapayer":
                case "totalhtnet":
                    return this.formatCurrency(actualValue);
                case "facturesoldee":
                case "sequenceIsAutomatic":
                case "valide":
                    return this.formatBoolean(actualValue);
                case "ACL":
                case "objectId":
                    return JSON.stringify(actualValue);
                default:
                    return actualValue;
            }
        },

        updateVisibleColumns() {
            this.tableConfig.columns = [...this.tableConfig.availableColumns]
                .filter((col) => col.visible)
                .sort((a, b) => a.order - b.order);

            // Calculer la largeur équitable pour chaque colonne
            this.calculateEqualColumnWidths();
        },

        calculateEqualColumnWidths() {
            const visibleColumns = this.tableConfig.columns.length;
            if (visibleColumns === 0) return;

            // Calculer la largeur disponible (en supposant un conteneur de 1200px)
            const containerWidth = 1200;
            const minWidth = 120; // Largeur minimale
            const maxWidth = 200; // Largeur maximale

            // Calculer la largeur idéale
            const idealWidth = containerWidth / visibleColumns;

            // Appliquer la largeur (entre min et max)
            const finalWidth = Math.max(
                minWidth,
                Math.min(idealWidth, maxWidth),
            );

            console.log(
                `Distributing width: ${finalWidth}px for ${visibleColumns} columns`,
            );
        },

        // Drag and drop methods
        startDrag(columnId) {
            this.dragColumn = columnId;
        },

        endDrag() {
            this.dragColumn = null;
        },

        dropColumn(targetColumnId) {
            if (!this.dragColumn || this.dragColumn === targetColumnId) return;

            const columns = [...this.tableConfig.availableColumns];
            const dragIndex = columns.findIndex(
                (col) => col.id === this.dragColumn,
            );
            const dropIndex = columns.findIndex(
                (col) => col.id === targetColumnId,
            );

            if (dragIndex !== -1 && dropIndex !== -1) {
                // Update the order values
                const dragColumn = columns[dragIndex];
                const dropColumn = columns[dropIndex];

                // Swap orders
                const tempOrder = dragColumn.order;
                dragColumn.order = dropColumn.order;
                dropColumn.order = tempOrder;

                this.updateVisibleColumns();
            }

            this.dragColumn = null;
        },

        // Column reordering methods
        moveColumnUp(columnId) {
            const columns = [...this.tableConfig.availableColumns];
            const columnIndex = columns.findIndex((col) => col.id === columnId);

            if (columnIndex > 0) {
                // Swap order with previous column
                const currentColumn = columns[columnIndex];
                const previousColumn = columns[columnIndex - 1];

                const tempOrder = currentColumn.order;
                currentColumn.order = previousColumn.order;
                previousColumn.order = tempOrder;

                this.updateVisibleColumns();
            }
        },

        moveColumnDown(columnId) {
            const columns = [...this.tableConfig.availableColumns];
            const columnIndex = columns.findIndex((col) => col.id === columnId);

            if (columnIndex >= 0 && columnIndex < columns.length - 1) {
                // Swap order with next column
                const currentColumn = columns[columnIndex];
                const nextColumn = columns[columnIndex + 1];

                const tempOrder = currentColumn.order;
                currentColumn.order = nextColumn.order;
                nextColumn.order = tempOrder;

                this.updateVisibleColumns();
            }
        },

        // Column renaming methods
        startEditing(columnId) {
            this.editingColumnId = columnId;
            const column = this.tableConfig.availableColumns.find(
                (col) => col.id === columnId,
            );
            this.newColumnName = column ? column.label : "";
        },

        saveColumnName(columnId) {
            if (!this.newColumnName.trim()) return;

            const column = this.tableConfig.availableColumns.find(
                (col) => col.id === columnId,
            );
            if (column) {
                column.label = this.newColumnName;
                this.editingColumnId = null;
            }
        },

        cancelEditing() {
            this.editingColumnId = null;
        },

        resetColumnName(columnId) {
            const column = this.tableConfig.availableColumns.find(
                (col) => col.id === columnId,
            );
            if (column && column.originalLabel) {
                column.label = column.originalLabel;
                this.editingColumnId = null;
            }
        },

        // Basic table methods
        toggleTable() {
            console.log(
                "Toggling table. Current state:",
                this.tableConfig.showTable,
            );
            this.tableConfig.showTable = !this.tableConfig.showTable;
            console.log("New state:", this.tableConfig.showTable);
            console.log("isLoading:", this.isLoading);
            console.log("error:", this.error);
        },

        openConfig() {
            this.tableConfig.configOpen = true;
        },

        closeConfig() {
            this.tableConfig.configOpen = false;
        },

        // Column visibility methods
        toggleColumnVisibility(columnId) {
            const column = this.tableConfig.availableColumns.find(
                (col) => col.id === columnId,
            );
            if (column) {
                column.visible = !column.visible;
                this.updateVisibleColumns();
            }
        },
    }));
});

<script>
document.addEventListener('alpine:init', () => {
    Alpine.data('impayesState', () => ({
        // État principal
        impayes: [],
        filteredImpayes: [],
        isLoading: false,
        error: null,
        searchTerm: '',
        selectedPayeur: '',
        sortBy: 'datepiece',
        expandedPayeurs: [],

        // État du drawer de facture
        isInvoiceDrawerOpen: false,
        invoiceDrawerLoading: false,
        invoiceDrawerError: null,
        invoiceDrawerTitle: '',
        invoiceDrawerFilename: '',
        invoiceDrawerPdfContent: null,

        // État du drawer de détails
        isDetailsDrawerOpen: false,
        selectedImpayeForDetails: null,

        // État du combo payeur
        payerComboIsOpen: false,
        payerComboOpenedWithKeyboard: false,
        payerComboSearchTerm: '',

        // Initialisation
        init() {
            setTimeout(() => {
                this.refreshData();
            }, 100);
        },

        // Méthodes du drawer de facture
        async openInvoice(invoiceUrl) {
            this.isInvoiceDrawerOpen = true;
            this.invoiceDrawerLoading = true;
            this.invoiceDrawerError = null;
            this.invoiceDrawerTitle = 'Chargement de la facture...';
            this.invoiceDrawerFilename = '';
            this.invoiceDrawerPdfContent = null;

            try {
                if (!invoiceUrl || typeof invoiceUrl !== 'string' || invoiceUrl.trim() === '') {
                    throw new Error('URL de facture invalide');
                }

                let flaskAxios = Alpine.store('flaskAxios');
                if (!flaskAxios && window.flaskAxios) {
                    flaskAxios = window.flaskAxios;
                }

                if (!flaskAxios) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    flaskAxios = Alpine.store('flaskAxios') || window.flaskAxios;
                }

                if (!flaskAxios) {
                    throw new Error('flaskAxios n\'est pas disponible');
                }

                const response = await flaskAxios.post('/script/getInvoice', {
                    invoice_url: invoiceUrl
                });

                if (response.data.status === 'success') {
                    this.invoiceDrawerTitle = response.data.filename;
                    this.invoiceDrawerFilename = response.data.filename;
                    this.invoiceDrawerPdfContent = response.data.content;
                } else {
                    this.invoiceDrawerError = response.data.message || 'Erreur lors du chargement de la facture';
                }

            } catch (error) {
                console.error('Erreur lors du chargement de la facture:', error);
                this.invoiceDrawerError = 'Impossible de charger la facture depuis le serveur.';
            } finally {
                this.invoiceDrawerLoading = false;
            }
        },

        closeInvoiceDrawer() {
            this.isInvoiceDrawerOpen = false;
            setTimeout(() => {
                this.invoiceDrawerError = null;
                this.invoiceDrawerPdfContent = null;
                this.invoiceDrawerFilename = '';
                this.invoiceDrawerTitle = '';
            }, 300);
        },

        // Méthodes du drawer de détails
        openDetails(impaye) {
            if (!impaye) {
                console.warn('Tentative d\'ouverture des détails sans facture sélectionnée');
                return;
            }

            console.log('Opening details for impaye:', impaye);
            this.selectedImpayeForDetails = impaye;
            this.isDetailsDrawerOpen = true;
        },

        closeDetailsDrawer() {
            this.isDetailsDrawerOpen = false;
            setTimeout(() => {
                this.selectedImpayeForDetails = null;
            }, 300);
        },

        // Méthodes du combo payeur
        togglePayeurCombo() {
            this.payerComboIsOpen = !this.payerComboIsOpen;
        },

        get payeurs() {
            if (!this.impayes || !Array.isArray(this.impayes)) {
                return [];
            }
            const payeurs = [...new Set(this.impayes.map(impaye => impaye.payeur_nom).filter(Boolean))];
            return payeurs.sort();
        },

        get filteredPayeurs() {
            const payeurs = this.payeurs;
            if (!this.payerComboSearchTerm) return payeurs;

            return payeurs.filter(payeur =>
                payeur.toLowerCase().includes(this.payerComboSearchTerm.toLowerCase())
            );
        },

        selectPayeur(payeur) {
            this.selectedPayeur = payeur;
            this.payerComboSearchTerm = '';
            this.payerComboIsOpen = false;
            this.payerComboOpenedWithKeyboard = false;
            this.filterImpayes();
        },

        filterPayeurs() {
            // Cette méthode est appelée par l'input de recherche dans le combo payeur
            // Elle déclenche simplement le recalcul des payeurs filtrés
            // (qui est déjà géré par le getter filteredPayeurs)
            return this.filteredPayeurs;
        },

        // Méthodes principales
        async refreshData() {
            this.isLoading = true;
            this.error = null;

            try {
                let parseAxios = Alpine.store('parseAxios');

                if (!parseAxios) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    parseAxios = Alpine.store('parseAxios');
                }

                if (!parseAxios) {
                    throw new Error('parseAxios n\'est pas disponible');
                }

                const response = await parseAxios.get('/classes/Impayes?limit=1000&order=-datepiece');
                this.impayes = response.data.results || [];
                this.filteredImpayes = [...this.impayes];
                this.filterImpayes();

                this.expandedPayeurs = [];

            } catch (error) {
                console.error('Erreur lors du chargement des impayés:', error);
                this.error = 'Impossible de charger les données des impayés.';
            } finally {
                this.isLoading = false;
            }
        },

        filterImpayes() {
            if (!this.impayes || !Array.isArray(this.impayes)) {
                this.filteredImpayes = [];
                return;
            }

            let filtered = [...this.impayes];

            if (this.searchTerm) {
                const searchLower = this.searchTerm.toLowerCase();
                filtered = filtered.filter(impaye => {
                    return (impaye.payeur_nom && impaye.payeur_nom.toLowerCase().includes(searchLower)) ||
                           (impaye.refpiece && impaye.refpiece.toLowerCase().includes(searchLower)) ||
                           (impaye.nfacture && impaye.nfacture.toString().includes(searchLower)) ||
                           (impaye.totalttcnet && impaye.totalttcnet.toString().includes(searchLower));
                });
            }

            if (this.selectedPayeur) {
                filtered = filtered.filter(impaye => impaye.payeur_nom === this.selectedPayeur);
            }

            this.filteredImpayes = filtered;
            this.sortImpayes();
        },

        sortImpayes() {
            if (!this.filteredImpayes || !Array.isArray(this.filteredImpayes)) {
                return;
            }

            this.filteredImpayes.sort((a, b) => {
                let aValue = a[this.sortBy];
                let bValue = b[this.sortBy];

                if (this.sortBy === 'datepiece') {
                    aValue = aValue && aValue.iso ? new Date(aValue.iso) : new Date(0);
                    bValue = bValue && bValue.iso ? new Date(bValue.iso) : new Date(0);
                    return bValue - aValue;
                }

                if (typeof aValue === 'number') {
                    return bValue - aValue;
                }

                if (typeof aValue === 'string') {
                    return aValue.localeCompare(bValue);
                }

                return 0;
            });
        },

        togglePayeur(payeur) {
            const index = this.expandedPayeurs.indexOf(payeur);
            if (index > -1) {
                this.expandedPayeurs.splice(index, 1);
            } else {
                this.expandedPayeurs.push(payeur);
            }
        },

        calculateDaysLate(impaye) {
            if (!impaye.datepiece) return 0;

            let datePiece;
            if (impaye.datepiece.iso) {
                datePiece = new Date(impaye.datepiece.iso);
            } else if (typeof impaye.datepiece === 'string') {
                datePiece = new Date(impaye.datepiece);
            } else if (impaye.datepiece instanceof Date) {
                datePiece = impaye.datepiece;
            } else {
                return 0;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const diffTime = today - datePiece;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return Math.max(0, diffDays);
        },

        calculateMaxDaysLate(group) {
            if (!group || group.length === 0) return 0;

            let maxDaysLate = 0;
            group.forEach(impaye => {
                const daysLate = this.calculateDaysLate(impaye);
                if (daysLate > maxDaysLate) {
                    maxDaysLate = daysLate;
                }
            });

            return maxDaysLate;
        },

        formatDate(dateObj) {
            if (!dateObj) return 'N/A';

            if (dateObj.iso) {
                return new Date(dateObj.iso).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }

            if (typeof dateObj === 'string') {
                return new Date(dateObj).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }

            if (dateObj instanceof Date) {
                return dateObj.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }

            return 'N/A';
        },

        formatCurrency(amount) {
            if (amount === null || amount === undefined) return '0,00 €';
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
            }).format(amount);
        },

        // Computed properties
        get groupedImpayes() {
            if (!this.filteredImpayes || !Array.isArray(this.filteredImpayes)) {
                return {};
            }

            const groups = {};

            this.filteredImpayes.forEach(impaye => {
                const payeur = impaye.payeur_nom || 'Payeur inconnu';
                if (!groups[payeur]) {
                    groups[payeur] = [];
                }
                groups[payeur].push(impaye);
            });

            return groups;
        }
    }));
});
</script>

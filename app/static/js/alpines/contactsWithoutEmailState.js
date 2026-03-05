document.addEventListener('alpine:init', () => {
    Alpine.data('contactsWithoutEmailState', () => ({
        // État initial
        contacts: [],
        filteredContacts: [],
        searchTerm: '',
        selectedType: '',
        currentPage: 1,
        itemsPerPage: 1000,
        isLoading: false,

        // Charger les contacts depuis le store Impayes
        async loadContacts() {
            this.isLoading = true;
            try {
                // Vérifier si le store impayesStore existe
                if (!Alpine.store('impayesStore')) {
                    console.warn('impayesStore non disponible, utilisation de données simulées');
                    // Utiliser des données simulées en cas d'absence du store
                    this.contacts = [
                        { id: 1, name: 'Jean Dupont', type: 'client', phone: '0123456789', address: '123 Rue de Paris' },
                        { id: 2, name: 'Marie Martin', type: 'fournisseur', phone: '0987654321', address: '456 Avenue des Champs' },
                        { id: 3, name: 'Pierre Durand', type: 'client', phone: '', address: '' }
                    ];
                    this.filterContacts();
                    return;
                }

                const impayesStore = Alpine.store('impayesStore');
                
                // Vérifier si les données sont déjà chargées
                if (impayesStore.impayesData && impayesStore.impayesData.length > 0) {
                    console.log('Utilisation des données existantes du store');
                } else {
                    // Charger les données depuis le store
                    await impayesStore.loadImpayes();
                }

                // Extraire les contacts sans email depuis les données des impayés
                const impayesData = impayesStore.impayesData || [];
                
                if (impayesData.length === 0) {
                    console.warn('Aucune donnée dans impayesStore');
                    this.contacts = [];
                    this.filterContacts();
                    return;
                }
                
                // Créer une liste plate de toutes les factures des contacts sans email
                const contactsWithoutEmail = [];
                
                impayesData.forEach(impaye => {
                    // Vérifier si le payeur n'a pas d'email
                    if (!impaye.payeur_email || impaye.payeur_email.trim() === '') {
                        contactsWithoutEmail.push({
                            id: impaye.objectId,
                            name: impaye.payeur_nom,
                            type: impaye.payeur_typePersonne === 'P' ? 'client' : 'fournisseur',
                            invoiceRef: impaye.refpiece || 'N/A',
                            invoiceDate: impaye.datepiece || '',
                            amount: impaye.resteapayer || 0,
                            phone: impaye.payeur_telephone || '',
                            address: this.formatAddress(impaye) || ''
                        });
                    }
                });

                this.contacts = contactsWithoutEmail;
                this.filterContacts();

            } catch (error) {
                console.error('Erreur lors du chargement des contacts:', error);
                // En cas d'erreur, initialiser avec un tableau vide pour éviter les erreurs de pagination
                this.contacts = [];
                this.filterContacts();
            } finally {
                this.isLoading = false;
            }
        },

        // Formater l'adresse à partir des données de l'impayé
        formatAddress(impaye) {
            const parts = [];
            if (impaye.numVoie) parts.push(impaye.numVoie);
            if (impaye.typeVoie) parts.push(impaye.typeVoie);
            if (impaye.adresse) parts.push(impaye.adresse);
            if (impaye.codepostal) parts.push(impaye.codepostal);
            if (impaye.ville) parts.push(impaye.ville);
            return parts.join(' ');
        },

        // Formater une date
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            
            // Gestion du format Parse {__type: "Date", iso: "..."}
            let dateToParse = dateString;
            if (typeof dateString === 'object' && dateString.iso) {
                dateToParse = dateString.iso;
            }
            
            const date = new Date(dateToParse);
            if (isNaN(date.getTime())) {
                return 'Date invalide';
            }
            return date.toLocaleDateString('fr-FR');
        },

        // Formater un montant en euros
        formatCurrency(amount) {
            if (amount === undefined || amount === null) return '0,00 €';
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
            }).format(amount);
        },

        // Filtrer les contacts
        filterContacts() {
            this.filteredContacts = this.contacts.filter(contact => {
                const matchesSearch = contact.name.toLowerCase().includes(this.searchTerm.toLowerCase());
                const matchesType = this.selectedType ? contact.type === this.selectedType : true;
                return matchesSearch && matchesType;
            });
            this.currentPage = 1;
        },

        // Pagination
        get paginatedContacts() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredContacts.slice(start, end);
        },

        previousPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },

        nextPage() {
            if (this.currentPage * this.itemsPerPage < this.filteredContacts.length) {
                this.currentPage++;
            }
        },



        // Notification (à adapter selon votre système de notification)
        showNotification({ type, message }) {
            // Implémentez votre système de notification ici
            console.log(`${type}: ${message}`);
            // Exemple avec un événement personnalisé
            document.dispatchEvent(new CustomEvent('showNotification', {
                detail: { type, message }
            }));
        }
    }));
});
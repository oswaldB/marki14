<script>
document.addEventListener('alpine:init', () => {
    Alpine.data('smtpProfilesState', () => ({
        // État principal
        profiles: [],
        filteredProfiles: [],
        searchTerm: '',
        selectedStatus: '',
        currentPage: 1,
        itemsPerPage: 10,
        
        // État du drawer
        showDrawer: false,
        editingProfile: false,
        currentProfile: {
            name: '',
            email: '',
            fromName: '',
            host: '',
            port: '',
            username: '',
            password: '',
            useSSL: false,
            useTLS: false,
            isActive: true,
            isArchived: false,
            htmlSignature: ''
        },

        // Initialisation
        init() {
            this.loadProfiles();
        },

        // Afficher une notification
        showNotification(message, type = 'info', duration = 5000) {
            const event = new CustomEvent('add-notification', {
                detail: {
                    message: message,
                    type: type,
                    duration: duration
                }
            });
            document.dispatchEvent(event);
        },

        // Charger les profils depuis Parse
        async loadProfiles() {
            try {
                // Attendre que parseAxios soit disponible
                let parseAxios = Alpine.store('parseAxios');
                
                // Si parseAxios n'est pas disponible, attendre un peu et réessayer
                if (!parseAxios) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    parseAxios = Alpine.store('parseAxios');
                }
                
                if (!parseAxios) {
                    throw new Error('parseAxios n\'est pas disponible');
                }
                
                const response = await parseAxios.get('/classes/SMTPProfile', {
                    params: {
                        where: JSON.stringify({
                            isArchived: false
                        }),
                        order: '-createdAt'
                    }
                });
                
                this.profiles = response.data.results || [];
                this.filteredProfiles = [...this.profiles];
                this.filterProfiles();
            } catch (error) {
                console.error('Erreur lors du chargement des profils SMTP:', error);
                this.showNotification('Erreur lors du chargement des profils SMTP', 'error');
            }
        },

        // Filtrer les profils
        filterProfiles() {
            let filtered = this.profiles;
            
            // Filtre par terme de recherche
            if (this.searchTerm) {
                const term = this.searchTerm.toLowerCase();
                filtered = filtered.filter(profile => 
                    profile.name.toLowerCase().includes(term) ||
                    profile.email.toLowerCase().includes(term) ||
                    profile.host.toLowerCase().includes(term)
                );
            }
            
            // Filtre par statut
            if (this.selectedStatus !== '') {
                const isActive = this.selectedStatus === 'true';
                filtered = filtered.filter(profile => profile.isActive === isActive);
            }
            
            this.filteredProfiles = filtered;
            this.currentPage = 1; // Réinitialiser à la première page
        },

        // Pagination
        get paginatedProfiles() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredProfiles.slice(start, end);
        },

        previousPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },

        nextPage() {
            if (this.currentPage * this.itemsPerPage < this.filteredProfiles.length) {
                this.currentPage++;
            }
        },

        // Gestion du drawer
        openCreateDrawer() {
            this.currentProfile = {
                name: '',
                email: '',
                fromName: '',
                host: '',
                port: '',
                username: '',
                password: '',
                useSSL: false,
                useTLS: false,
                isActive: true,
                isArchived: false,
                htmlSignature: ''
            };
            this.editingProfile = false;
            this.showDrawer = true;
        },

        openEditDrawer(profile) {
            this.currentProfile = {
                objectId: profile.objectId,
                name: profile.name,
                email: profile.email,
                fromName: profile.fromName || '',
                host: profile.host,
                port: profile.port,
                username: profile.username,
                password: '', // Ne pas charger le mot de passe pour des raisons de sécurité
                useSSL: profile.useSSL || false,
                useTLS: profile.useTLS || false,
                isActive: profile.isActive || false,
                isArchived: profile.isArchived || false,
                htmlSignature: profile.htmlSignature || ''
            };
            this.editingProfile = true;
            this.showDrawer = true;
        },

        closeDrawer() {
            this.showDrawer = false;
        },

        // Créer un nouveau profil
        async createProfile() {
            try {
                let parseAxios = Alpine.store('parseAxios');
                if (!parseAxios) {
                    throw new Error('parseAxios n\'est pas disponible');
                }
                
                const profileData = { ...this.currentProfile };
                
                // Supprimer objectId si présent (pour éviter les conflits)
                delete profileData.objectId;
                
                const response = await parseAxios.post('/classes/SMTPProfile', profileData);
                
                this.showNotification('Profil SMTP créé avec succès!', 'success');
                this.closeDrawer();
                this.loadProfiles(); // Recharger la liste
            } catch (error) {
                console.error('Erreur lors de la création du profil SMTP:', error);
                this.showNotification('Erreur lors de la création du profil SMTP', 'error');
            }
        },

        // Mettre à jour un profil
        async updateProfile() {
            try {
                let parseAxios = Alpine.store('parseAxios');
                if (!parseAxios) {
                    throw new Error('parseAxios n\'est pas disponible');
                }
                
                const profileData = { ...this.currentProfile };
                
                // Si le mot de passe est vide, ne pas l'inclure dans la mise à jour
                if (!profileData.password) {
                    delete profileData.password;
                }
                
                const response = await parseAxios.put(
                    `/classes/SMTPProfile/${profileData.objectId}`,
                    profileData
                );
                
                this.showNotification('Profil SMTP mis à jour avec succès!', 'success');
                this.closeDrawer();
                this.loadProfiles(); // Recharger la liste
            } catch (error) {
                console.error('Erreur lors de la mise à jour du profil SMTP:', error);
                this.showNotification('Erreur lors de la mise à jour du profil SMTP', 'error');
            }
        },

        // Archiver/désarchiver un profil
        async toggleArchiveProfile(profile) {
            try {
                let parseAxios = Alpine.store('parseAxios');
                if (!parseAxios) {
                    throw new Error('parseAxios n\'est pas disponible');
                }
                
                const newArchivedStatus = !profile.isArchived;
                const response = await parseAxios.put(
                    `/classes/SMTPProfile/${profile.objectId}`,
                    { isArchived: newArchivedStatus }
                );
                
                this.showNotification(
                    newArchivedStatus 
                        ? 'Profil SMTP archivé avec succès!'
                        : 'Profil SMTP restauré avec succès!',
                    'success'
                );
                this.loadProfiles(); // Recharger la liste
            } catch (error) {
                console.error('Erreur lors de l\'archivage du profil SMTP:', error);
                this.showNotification('Erreur lors de l\'archivage du profil SMTP', 'error');
            }
        }
    }));
});
</script>
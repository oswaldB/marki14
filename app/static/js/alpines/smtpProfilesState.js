document.addEventListener('alpine:init', () => {
    Alpine.data('smtpProfilesState', () => ({
        profiles: [],
        filteredProfiles: [],
        isLoading: false,
        error: null,
        searchTerm: '',
        selectedStatus: '',
        currentPage: 1,
        itemsPerPage: 10,

        get paginatedProfiles() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredProfiles.slice(start, start + this.itemsPerPage);
        },

        async init() {
            await this.loadProfiles();
            window.addEventListener('smtp-profile-saved', () => this.loadProfiles());
        },

        async loadProfiles() {
            this.isLoading = true;
            this.error = null;
            try {
                const res = await parseAxios.get('/classes/SMTPProfile', {
                    params: { where: JSON.stringify({ isArchived: { $ne: true } }), limit: 100 }
                });
                this.profiles = res.data.results || [];
                this.filterProfiles();
            } catch (e) {
                this.error = 'Erreur lors du chargement des profils';
            } finally {
                this.isLoading = false;
            }
        },

        filterProfiles() {
            let filtered = [...this.profiles];
            if (this.searchTerm) {
                const term = this.searchTerm.toLowerCase();
                filtered = filtered.filter(p =>
                    p.name?.toLowerCase().includes(term) ||
                    p.email?.toLowerCase().includes(term)
                );
            }
            if (this.selectedStatus !== '') {
                const isActive = this.selectedStatus === 'true';
                filtered = filtered.filter(p => p.isActive === isActive);
            }
            this.filteredProfiles = filtered;
            this.currentPage = 1;
        },

        previousPage() {
            if (this.currentPage > 1) this.currentPage--;
        },

        nextPage() {
            if (this.currentPage * this.itemsPerPage < this.filteredProfiles.length) this.currentPage++;
        },

        openCreatePanel() {
            window.dispatchEvent(new CustomEvent('open-smtp-panel', { detail: {} }));
        },

        openEditPanel(profile) {
            window.dispatchEvent(new CustomEvent('open-smtp-panel', { detail: { profile } }));
        },

        async toggleArchiveProfile(profile) {
            try {
                await parseAxios.put(`/classes/SMTPProfile/${profile.objectId}`, {
                    isArchived: !profile.isArchived
                });
                await this.loadProfiles();
            } catch (e) {
                Alpine.store('notifications').add({ type: 'error', message: "Erreur lors de l'archivage" });
            }
        }
    }))
});

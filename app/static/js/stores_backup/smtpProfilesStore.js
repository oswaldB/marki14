// smtpProfilesStore.js - Store centralisé pour la gestion des profils SMTP
// Ce store gère toutes les opérations liées aux profils SMTP

document.addEventListener('alpine:init', () => {
  Alpine.store('smtpProfiles', {
    // ============================================
    // ÉTAT INITIAL
    // ============================================

    // Liste complète des profils SMTP
    profiles: [],

    // Profil SMTP actuellement sélectionné
    selectedProfile: null,

    // État d'interface et de chargement
    isLoading: false,
    error: null,

    // ============================================
    // MÉTHODES PRINCIPALES
    // ============================================

    /**
     * Charge tous les profils SMTP depuis le serveur
     */
    async loadSmtpProfiles() {
      this.isLoading = true;
      this.error = null;

      try {
        console.log('Chargement des profils SMTP depuis le serveur');
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        const response = await parseAxios.get('/classes/SMTPProfile');

        this.profiles = response.data.results.map(profile => ({
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
        if (this.profiles.length > 0) {
          this.selectedProfile = this.profiles[0];
        }

        console.log('Profils SMTP chargés:', this.profiles.length);
        return this.profiles;

      } catch (error) {
        this.error = 'Erreur lors du chargement des profils SMTP: ' + error.message;
        console.error('Erreur:', error);
        this.profiles = [];
        this.selectedProfile = null;
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Ajoute un nouveau profil SMTP
     * @param {Object} profileData - Données du nouveau profil
     */
    async addSmtpProfile(profileData) {
      this.isLoading = true;
      this.error = null;

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

        this.profiles.push(newProfile);
        this.selectedProfile = newProfile;

        console.log('Nouveau profil SMTP ajouté:', newProfile.name);
        return newProfile;

      } catch (error) {
        this.error = `Erreur lors de l'ajout du profil: ${error.message}`;
        console.error('Erreur:', error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Met à jour un profil SMTP existant
     * @param {string} profileId - ID du profil à mettre à jour
     * @param {Object} updatedData - Données mises à jour
     */
    async updateSmtpProfile(profileId, updatedData) {
      this.isLoading = true;
      this.error = null;

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
        const index = this.profiles.findIndex(p => p.objectId === profileId);
        if (index !== -1) {
          this.profiles[index] = {
            ...this.profiles[index],
            ...updatedData
          };
          
          // Si c'est le profil sélectionné, le mettre à jour aussi
          if (this.selectedProfile && this.selectedProfile.objectId === profileId) {
            this.selectedProfile = this.profiles[index];
          }
        }

        console.log('Profil SMTP mis à jour avec succès');
        return true;

      } catch (error) {
        this.error = `Erreur lors de la mise à jour: ${error.message}`;
        console.error('Erreur:', error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Supprime un profil SMTP
     * @param {string} profileId - ID du profil à supprimer
     */
    async deleteSmtpProfile(profileId) {
      this.isLoading = true;
      this.error = null;

      try {
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        console.log('Suppression du profil SMTP:', profileId);
        await parseAxios.delete(`/classes/SMTPProfile/${profileId}`);

        // Supprimer de la liste locale
        this.profiles = this.profiles.filter(p => p.objectId !== profileId);

        // Si c'était le profil sélectionné, le réinitialiser
        if (this.selectedProfile && this.selectedProfile.objectId === profileId) {
          this.selectedProfile = this.profiles.length > 0 ? this.profiles[0] : null;
        }

        console.log('Profil SMTP supprimé avec succès');
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
    // MÉTHODES DE SÉLECTION
    // ============================================

    /**
     * Sélectionne un profil SMTP
     * @param {string} profileId - ID du profil à sélectionner
     */
    selectProfile(profileId) {
      const profile = this.profiles.find(p => p.objectId === profileId);
      if (profile) {
        this.selectedProfile = profile;
        console.log('Profil SMTP sélectionné:', profile.name);
      } else {
        console.warn('Profil SMTP non trouvé:', profileId);
      }
    },

    /**
     * Sélectionne un profil SMTP par son email
     * @param {string} email - Email du profil à sélectionner
     */
    selectProfileByEmail(email) {
      const profile = this.profiles.find(p => p.email === email);
      if (profile) {
        this.selectedProfile = profile;
        console.log('Profil SMTP sélectionné par email:', profile.name);
      } else {
        console.warn('Profil SMTP non trouvé pour l\'email:', email);
      }
    },

    // ============================================
    // MÉTHODES UTILITAIRES
    // ============================================

    /**
     * Retourne le profil SMTP par défaut (le premier de la liste)
     */
    getDefaultProfile() {
      return this.profiles.length > 0 ? this.profiles[0] : null;
    },

    /**
     * Retourne l'email du profil sélectionné ou du profil par défaut
     */
    getDefaultSenderEmail() {
      return this.selectedProfile ? this.selectedProfile.email : 
             this.getDefaultProfile() ? this.getDefaultProfile().email : '';
    },

    /**
     * Retourne l'ID du profil sélectionné ou du profil par défaut
     */
    getDefaultProfileId() {
      return this.selectedProfile ? this.selectedProfile.objectId : 
             this.getDefaultProfile() ? this.getDefaultProfile().objectId : '';
    },

    /**
     * Réinitialise l'état du store
     */
    resetStore() {
      this.profiles = [];
      this.selectedProfile = null;
      this.isLoading = false;
      this.error = null;
      console.log('Store SMTP profiles réinitialisé');
    }
  });
});
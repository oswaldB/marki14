/**
 * SMTP Profile Settings State Management
 * 
 * This file contains the Alpine.js component for SMTP profile management
 * using a local state approach for better isolation and maintainability
 */

// Define the SMTP settings page component
function smtpSettingsPage() {
  return {
    // State properties
    profiles: [],
    isLoading: false,
    isDrawerOpen: '',
    currentProfileId: null,
    formData: {
      profileName: '',
      smtpHost: '',
      smtpPort: '',
      smtpSecurity: '',
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: '',
      htmlSignature: ''
    },
    isTesting: false,

    /**
     * Initialize the component
     */
    async init() {
      console.log('SMTP Settings page initialized');
      // Ensure drawer is closed on load      
      await this.refreshSmtpProfiles();
    },

    /**
     * Refresh the list of SMTP profiles from the database
     */
    async refreshSmtpProfiles() {
      this.isLoading = true;
      try {
        const query = new Parse.Query('SMTPProfile');
        query.equalTo('isArchived', false);
        query.ascending('name');

        const results = await query.find();

        this.profiles = results.map(profile => ({
          id: profile.id,
          name: profile.get('name'),
          host: profile.get('host'),
          port: profile.get('port'),
          security: profile.get('useSSL') ? 'ssl' : profile.get('useTLS') ? 'tls' : 'none',
          fromEmail: profile.get('email'),
          fromName: profile.get('fromName') || '',
          htmlSignature: profile.get('htmlSignature') || '',
          isActive: profile.get('isActive') || false
        }));

        this.updateActiveProfileCount();

      } catch (error) {
        console.error('Erreur lors du chargement des profils SMTP:', error);
        alert('Erreur: ' + (error.message || 'Échec du chargement des profils SMTP'));
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Update the active profile count display
     */
    updateActiveProfileCount() {
      const count = this.profiles.filter(p => p.isActive).length;
      const activeProfileCountElement = document.getElementById('activeProfileCount');
      if (activeProfileCountElement) {
        activeProfileCountElement.textContent = count;
      }
    },

    /**
     * Set a profile as active
     * @param {string} profileId - The ID of the profile to activate
     */
    async setActiveProfile(profileId) {
      try {
        const query = new Parse.Query('SMTPProfile');
        const allProfiles = await query.find();

        await Parse.Object.saveAll(allProfiles.map(p => {
          p.set('isActive', false);
          return p;
        }));

        const profileToActivate = allProfiles.find(p => p.id === profileId);
        if (profileToActivate) {
          profileToActivate.set('isActive', true);
          await profileToActivate.save();
        }

        await this.refreshSmtpProfiles();

      } catch (error) {
        console.error('Erreur lors de l\'activation du profil:', error);
        alert('Erreur: ' + (error.message || 'Échec de l\'activation du profil'));
      }
    },

    /**
     * Test a profile connection
     * @param {string} profileId - The ID of the profile to test
     */
    async testProfileConnection(profileId) {
      try {
        const query = new Parse.Query('SMTPProfile');
        const profile = await query.get(profileId);

        const profileData = {
          host: profile.get('host'),
          port: profile.get('port'),
          username: profile.get('username'),
          password: profile.get('password'),
          email: profile.get('email'),
          useSSL: profile.get('useSSL')
        };

        const result = await Parse.Cloud.run('sendTestEmail', {
          recipient: profile.get('email'),
          smtpProfile: profileData
        });

        alert('Test réussi: ' + result.message);

      } catch (error) {
        console.error('Erreur lors du test du profil:', error);
        alert('Erreur: ' + (error.message || 'Échec du test du profil'));
      }
    },

    /**
     * Edit a profile
     * @param {string} profileId - The ID of the profile to edit
     */
    async editProfile(profileId) {
      try {
        const query = new Parse.Query('SMTPProfile');
        const profile = await query.get(profileId);

        this.currentProfileId = profileId;
        this.formData = {
          profileName: profile.get('name'),
          smtpHost: profile.get('host'),
          smtpPort: profile.get('port'),
          smtpSecurity: profile.get('useSSL') ? 'ssl' : profile.get('useTLS') ? 'tls' : 'none',
          smtpUsername: profile.get('username'),
          smtpPassword: profile.get('password'),
          fromEmail: profile.get('email'),
          fromName: profile.get('fromName') || '',
          htmlSignature: profile.get('htmlSignature') || ''
        };
        this.isDrawerOpen = true;

      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        alert('Erreur: ' + (error.message || 'Échec de la récupération du profil'));
      }
    },

    /**
     * Delete a profile
     * @param {string} profileId - The ID of the profile to delete
     */
    async deleteProfile(profileId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce profil SMTP?')) {
        try {
          const query = new Parse.Query('SMTPProfile');
          const profile = await query.get(profileId);

          profile.set('isArchived', true);
          profile.set('isActive', false);
          await profile.save();

          await this.refreshSmtpProfiles();

        } catch (error) {
          console.error('Erreur lors de la suppression du profil:', error);
          alert('Erreur: ' + (error.message || 'Échec de la suppression du profil'));
        }
      }
    },

    /**
     * Open the drawer for creating/editing a profile
     * @param {string|null} profileId - The ID of the profile to edit, or null for new profile
     */
    openDrawer(profileId = null) {
      // Close drawer first to avoid issues
      this.isDrawerOpen = false;
      
      // Reset state
      this.currentProfileId = profileId;
      if (!profileId) {
        this.resetForm();
      }
      
      // Open drawer
      this.isDrawerOpen = true;
    },

    /**
     * Close the drawer
     */
    closeDrawer() {
      this.isDrawerOpen = false;
      this.currentProfileId = null;
      this.resetForm();
    },

    /**
     * Reset the form data
     */
    resetForm() {
      this.formData = {
        profileName: '',
        smtpHost: '',
        smtpPort: '',
        smtpSecurity: '',
        smtpUsername: '',
        smtpPassword: '',
        fromEmail: '',
        fromName: '',
        htmlSignature: ''
      };
    },

 
    /**
     * Test the current SMTP connection settings
     */
    async testSmtpConnection() {
      if (!this.validateForm()) return;

      this.isTesting = true;
      this.isLoading = true;

      try {
        const result = await Parse.Cloud.run('sendTestEmail', {
          recipient: this.formData.fromEmail,
          smtpProfile: {
            host: this.formData.smtpHost,
            port: this.formData.smtpPort,
            username: this.formData.smtpUsername,
            password: this.formData.smtpPassword,
            email: this.formData.fromEmail,
            useSSL: this.formData.smtpSecurity === 'ssl'
          }
        });

        alert('Test réussi: ' + result.message);

      } catch (error) {
        console.error('Erreur lors du test SMTP:', error);
        alert('Erreur: ' + (error.message || 'Échec du test SMTP'));
      } finally {
        this.isTesting = false;
        this.isLoading = false;
      }
    },

    /**
     * Save the SMTP profile
     */
    async saveSmtpProfile() {
      if (!this.validateForm()) return;

      this.isLoading = true;

      try {
        const SMTPProfile = Parse.Object.extend('SMTPProfile');
        let profile;

        if (this.currentProfileId) {
          // Update existing profile
          const query = new Parse.Query('SMTPProfile');
          profile = await query.get(this.currentProfileId);
        } else {
          // Create new profile
          profile = new SMTPProfile();
        }

        profile.set('name', this.formData.profileName);
        profile.set('host', this.formData.smtpHost);
        profile.set('port', this.formData.smtpPort);
        profile.set('username', this.formData.smtpUsername);
        profile.set('password', this.formData.smtpPassword);
        profile.set('email', this.formData.fromEmail);
        profile.set('fromName', this.formData.fromName || '');
        profile.set('htmlSignature', this.formData.htmlSignature || '');
        profile.set('useSSL', this.formData.smtpSecurity === 'ssl');
        profile.set('useTLS', this.formData.smtpSecurity === 'tls');
        profile.set('isActive', false);
        profile.set('isArchived', false);

        await profile.save();

        await this.refreshSmtpProfiles();
        this.closeDrawer();
        alert('Profil SMTP enregistré avec succès!');

      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du profil SMTP:', error);
        alert('Erreur: ' + (error.message || 'Échec de l\'enregistrement du profil SMTP'));
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Validate the form data
     * @returns {boolean} True if form is valid, false otherwise
     */
    validateForm() {
      // Only profile name is mandatory
      if (!this.formData.profileName) {
        alert('Veuillez remplir le champ obligatoire: Nom du profil.');
        return false;
      }

      return true;
    }
  };
}

// Make the function available globally if Alpine.js is loaded
if (typeof Alpine !== 'undefined') {
  // Register the component with Alpine.js
  document.addEventListener('alpine:init', () => {
    Alpine.data('smtpSettingsPage', smtpSettingsPage);
  });
} else {
  // If Alpine.js is not loaded yet, wait for it
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof Alpine !== 'undefined') {
      Alpine.data('smtpSettingsPage', smtpSettingsPage);
    }
  });
}
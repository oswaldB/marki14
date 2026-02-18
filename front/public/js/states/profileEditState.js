/**
 * État Alpine.js pour l'édition du profil utilisateur
 * Gère la récupération, la validation et la mise à jour des données de profil
 */

if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    Alpine.data('profileEditState', () => ({
      // État initial
      currentUser: {
        username: '',
        email: '',
        avatar: null
      },
      originalUser: {
        username: '',
        email: '',
        avatar: null
      },
      loading: false,
      error: null,
      saving: false,
      avatarPreview: null,
      avatarFile: null,
      avatarError: null,
      usernameError: null,
      emailError: null,

      /**
       * Initialise les données du profil utilisateur
       * Récupère les informations de l'utilisateur connecté depuis Parse
       */
      async initializeProfile() {
        this.loading = true;
        this.error = null;

        try {
          // Vérifier l'authentification
          const authStore = Alpine.store('auth');
          if (!authStore || !authStore.isAuthenticated) {
            throw new Error('Non authentifié');
          }

          // Récupérer les données utilisateur depuis Parse REST API
          const authData = JSON.parse(localStorage.getItem('parseAuth')) ||
                          JSON.parse(sessionStorage.getItem('parseAuth'));

          if (!authData || !authData.parseToken) {
            throw new Error('Token d\'authentification manquant');
          }

          const response = await axios.get(
            'https://dev.parse.markidiags.com/parse/users/me',
            {
              headers: {
                'X-Parse-Application-Id': 'marki',
                'X-Parse-REST-API-Key': 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9',
                'X-Parse-Session-Token': authData.parseToken
              }
            }
          );

          const userData = response.data;

          // Stocker les données originales et courantes
          this.originalUser = {
            username: userData.username || '',
            email: userData.email || '',
            avatar: userData.avatar || null
          };

          this.currentUser = {
            username: userData.username || '',
            email: userData.email || '',
            avatar: userData.avatar || null
          };

        } catch (error) {
          console.error('Erreur lors de l\'initialisation du profil:', error);
          this.error = this.getErrorMessage(error);
        } finally {
          this.loading = false;
        }
      },

      /**
       * Met à jour les informations du profil utilisateur
       * @param {Object} userData - Données à mettre à jour
       * @param {string} [userData.username] - Nouveau pseudo
       * @param {string} [userData.email] - Nouveau email
       * @param {File} [userData.avatar] - Nouveau fichier avatar
       * @returns {Promise<Object>} Résultat de la mise à jour
       */
      async updateUserProfile(userData) {
        this.saving = true;
        this.error = null;

        try {
          const authData = JSON.parse(localStorage.getItem('parseAuth')) ||
                          JSON.parse(sessionStorage.getItem('parseAuth'));

          if (!authData || !authData.parseToken) {
            throw new Error('Token d\'authentification manquant');
          }

          // Préparer les données à envoyer
          const updateData = {};

          if (userData.username && userData.username !== this.originalUser.username) {
            updateData.username = userData.username;
          }

          if (userData.email && userData.email !== this.originalUser.email) {
            updateData.email = userData.email;
          }

          // Si un nouvel avatar est fourni, l'uploader d'abord
          if (userData.avatar) {
            const avatarResult = await this.uploadAvatar(userData.avatar);
            if (avatarResult.success) {
              updateData.avatar = avatarResult.file;
            } else {
              throw new Error(avatarResult.error || 'Erreur lors de l\'upload de l\'avatar');
            }
          }

          // Mettre à jour l'utilisateur via Parse REST API
          const response = await axios.put(
            'https://dev.parse.markidiags.com/parse/users/' + authData.userId,
            updateData,
            {
              headers: {
                'X-Parse-Application-Id': 'marki',
                'X-Parse-REST-API-Key': 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9',
                'X-Parse-Session-Token': authData.parseToken,
                'Content-Type': 'application/json'
              }
            }
          );

          // Mettre à jour les données locales
          this.originalUser = {
            username: response.data.username || this.originalUser.username,
            email: response.data.email || this.originalUser.email,
            avatar: response.data.avatar || this.originalUser.avatar
          };

          this.currentUser = {
            username: response.data.username || this.currentUser.username,
            email: response.data.email || this.currentUser.email,
            avatar: response.data.avatar || this.currentUser.avatar
          };

          return {
            success: true,
            user: response.data
          };

        } catch (error) {
          console.error('Erreur lors de la mise à jour du profil:', error);
          return {
            success: false,
            error: this.getErrorMessage(error)
          };
        } finally {
          this.saving = false;
        }
      },

      /**
       * Upload un fichier avatar vers Parse.File
       * @param {File} file - Fichier image à uploader
       * @returns {Promise<Object>} Résultat de l'upload
       */
      async uploadAvatar(file) {
        try {
          const authData = JSON.parse(localStorage.getItem('parseAuth')) ||
                          JSON.parse(sessionStorage.getItem('parseAuth'));

          if (!authData || !authData.parseToken) {
            throw new Error('Token d\'authentification manquant');
          }

          // Créer un FormData pour l'upload
          const formData = new FormData();
          formData.append('file', file);

          const response = await axios.post(
            'https://dev.parse.markidiags.com/parse/files/' + file.name,
            formData,
            {
              headers: {
                'X-Parse-Application-Id': 'marki',
                'X-Parse-REST-API-Key': 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9',
                'X-Parse-Session-Token': authData.parseToken,
                'Content-Type': 'multipart/form-data'
              }
            }
          );

          return {
            success: true,
            file: {
              __type: 'File',
              name: response.data.name,
              url: response.data.url
            }
          };

        } catch (error) {
          console.error('Erreur lors de l\'upload de l\'avatar:', error);
          return {
            success: false,
            error: this.getErrorMessage(error)
          };
        }
      },

      /**
       * Valide un pseudo utilisateur
       * @param {string} username - Pseudo à valider
       * @returns {Object} Résultat de la validation
       */
      validateUsername(username) {
        if (!username || username.length < 3) {
          this.usernameError = 'Le pseudo doit contenir au moins 3 caractères';
          return { valid: false };
        }

        if (username.length > 20) {
          this.usernameError = 'Le pseudo ne doit pas dépasser 20 caractères';
          return { valid: false };
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          this.usernameError = 'Le pseudo ne peut contenir que des lettres, chiffres et underscores';
          return { valid: false };
        }

        this.usernameError = null;
        return { valid: true };
      },

      /**
       * Valide un email utilisateur
       * @param {string} email - Email à valider
       * @returns {Object} Résultat de la validation
       */
      validateEmail(email) {
        if (!email) {
          this.emailError = 'L\'email est obligatoire';
          return { valid: false };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          this.emailError = 'Veuillez entrer un email valide';
          return { valid: false };
        }

        this.emailError = null;
        return { valid: true };
      },

      /**
       * Gère le changement d'avatar
       * @param {Event} event - Événement de changement de fichier
       */
      handleAvatarChange(event) {
        const file = event.target.files[0];

        if (!file) {
          this.avatarError = null;
          this.avatarPreview = null;
          this.avatarFile = null;
          return;
        }

        // Validation du fichier
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
          this.avatarError = 'Seuls les fichiers JPEG et PNG sont autorisés';
          this.avatarPreview = null;
          this.avatarFile = null;
          return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2 Mo
          this.avatarError = 'Le fichier ne doit pas dépasser 2 Mo';
          this.avatarPreview = null;
          this.avatarFile = null;
          return;
        }

        this.avatarError = null;
        this.avatarFile = file;

        // Prévisualisation
        const reader = new FileReader();
        reader.onload = (e) => {
          this.avatarPreview = e.target.result;
        };
        reader.readAsDataURL(file);
      },

      /**
       * Sauvegarde les modifications du profil
       * Appelée lors du clic sur le bouton Enregistrer
       */
      async saveProfile() {
        // Valider le formulaire avant sauvegarde
        const usernameValid = this.validateUsername(this.currentUser.username);
        const emailValid = this.validateEmail(this.currentUser.email);

        if (!usernameValid.valid || !emailValid.valid) {
          return;
        }

        // Préparer les données à sauvegarder
        const updateData = {
          username: this.currentUser.username,
          email: this.currentUser.email
        };

        // Ajouter l'avatar si un nouveau fichier a été sélectionné
        if (this.avatarFile) {
          updateData.avatar = this.avatarFile;
        }

        try {
          const result = await this.updateUserProfile(updateData);

          if (result.success) {
            // Réinitialiser l'avatar preview et file après sauvegarde
            this.avatarPreview = null;
            this.avatarFile = null;

            // Afficher une notification de succès
            if (window.Alpine.store('ui') && typeof window.Alpine.store('ui').showToast === 'function') {
              window.Alpine.store('ui').showToast('Profil mis à jour avec succès', 'success');
            } else {
              // Fallback si le store UI n'existe pas
              alert('Profil mis à jour avec succès');
            }

            // Mettre à jour les données originales
            this.originalUser = {
              username: this.currentUser.username,
              email: this.currentUser.email,
              avatar: result.user.avatar || this.currentUser.avatar
            };

          } else {
            throw new Error(result.error || 'Erreur lors de la mise à jour du profil');
          }

        } catch (error) {
          console.error('Erreur lors de la sauvegarde du profil:', error);
          this.error = this.getErrorMessage(error);

          // Afficher une notification d'erreur
          if (window.Alpine.store('ui') && typeof window.Alpine.store('ui').showToast === 'function') {
            window.Alpine.store('ui').showToast('Erreur: ' + this.error, 'error');
          } else {
            // Fallback si le store UI n'existe pas
            alert('Erreur: ' + this.error);
          }
        }
      },

      /**
       * Extrait un message d'erreur à partir d'une exception
       * @param {Error|Object} error - Erreur à traiter
       * @returns {string} Message d'erreur utilisateur
       */
      getErrorMessage(error) {
        if (error.response && error.response.data && error.response.data.error) {
          return error.response.data.error;
        }

        if (error.message) {
          if (error.message.includes('username')) {
            return 'Ce pseudo est déjà utilisé';
          }
          if (error.message.includes('email')) {
            return 'Cet email est déjà utilisé';
          }
          if (error.message.includes('authentification')) {
            return 'Session expirée, veuillez vous reconnecter';
          }
          return error.message;
        }

        return 'Une erreur inconnue est survenue';
      },

      /**
       * Vérifie si le formulaire est valide
       * @returns {boolean}
       */
      get isFormValid() {
        return !this.usernameError && !this.emailError &&
               this.currentUser.username && this.currentUser.email;
      },

      /**
       * Vérifie si des modifications ont été apportées
       * @returns {boolean}
       */
      get hasChanges() {
        return this.currentUser.username !== this.originalUser.username ||
               this.currentUser.email !== this.originalUser.email ||
               !!this.avatarFile;
      },

      /**
       * Initialisation du composant
       */
      init() {
        console.log('profileEditState initialisé');
      }
    }));
  });
}
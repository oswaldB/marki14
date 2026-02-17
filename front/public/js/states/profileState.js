/**
 * État Alpine.js pour la page de profil utilisateur
 * Gère la récupération et l'affichage des données de profil
 */

if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    Alpine.data('profileState', () => ({
      // État initial
      profile: null,
      loading: false,
      error: null,
      activities: [],
      loadingActivities: false,
      showMessageModal: false,
      messageContent: '',
      sendingMessage: false,
      messageError: null,

      /**
       * Charge le profil utilisateur
       */
      async loadProfile() {
        const username = window.location.pathname.split('/').pop();
        
        if (!username || !username.startsWith('@')) {
          this.error = 'Pseudo utilisateur invalide';
          return;
        }
        
        this.loading = true;
        this.error = null;
        
        try {
          const result = await this.getPublicUserProfile(username.substring(1));
          
          if (result.success && result.user) {
            this.profile = result.user;
            await this.loadActivities(result.user.objectId);
          } else {
            this.error = result.error || 'Utilisateur introuvable';
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
          this.error = 'Erreur lors du chargement du profil';
        } finally {
          this.loading = false;
        }
      },

      /**
       * Charge les activités récentes
       * @param {string} userId - ID de l'utilisateur
       */
      async loadActivities(userId) {
        this.loadingActivities = true;
        
        try {
          const result = await this.getUserRecentActivities(userId, 5);
          
          if (result.success) {
            this.activities = result.activities || [];
          } else {
            this.activities = [];
          }
        } catch (error) {
          console.error('Erreur lors du chargement des activités:', error);
          this.activities = [];
        } finally {
          this.loadingActivities = false;
        }
      },

      /**
       * Récupère le profil public d'un utilisateur
       * @param {string} username - Pseudo de l'utilisateur
       * @returns {Promise<Object>} { success: boolean, user: object|null, error: string|null }
       */
      async getPublicUserProfile(username) {
        try {
          const response = await axios.get(
            'https://dev.parse.markidiags.com/parse/users',
            {
              params: {
                where: JSON.stringify({ username: username }),
                keys: 'username,createdAt,avatar' // Champs publics uniquement
              },
              headers: {
                'X-Parse-Application-Id': 'marki',
                'X-Parse-REST-API-Key': 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9'
              }
            }
          );
          
          if (response.data.results && response.data.results.length > 0) {
            const user = response.data.results[0];
            return {
              success: true,
              user: {
                objectId: user.objectId,
                username: user.username,
                createdAt: user.createdAt,
                avatar: user.avatar || null
              },
              error: null
            };
          }
          
          return {
            success: false,
            user: null,
            error: 'Utilisateur introuvable'
          };
        } catch (error) {
          console.error('Erreur Parse API:', error.response?.data || error.message);
          return {
            success: false,
            user: null,
            error: 'Erreur lors de la récupération du profil'
          };
        }
      },

      /**
       * Récupère les activités récentes d'un utilisateur
       * @param {string} userId - ID de l'utilisateur
       * @param {number} limit - Nombre maximal d'activités
       * @returns {Promise<Object>} { success: boolean, activities: array|null, error: string|null }
       */
      async getUserRecentActivities(userId, limit = 5) {
        try {
          // Requête pour les posts de l'utilisateur
          const postsResponse = await axios.get(
            'https://dev.parse.markidiags.com/parse/classes/Post',
            {
              params: {
                where: JSON.stringify({ author: { __type: 'Pointer', className: '_User', objectId: userId } }),
                limit: limit,
                order: '-createdAt',
                keys: 'title,createdAt'
              },
              headers: {
                'X-Parse-Application-Id': 'marki',
                'X-Parse-REST-API-Key': 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9'
              }
            }
          );
          
          // Requête pour les commentaires de l'utilisateur
          const commentsResponse = await axios.get(
            'https://dev.parse.markidiags.com/parse/classes/Comment',
            {
              params: {
                where: JSON.stringify({ author: { __type: 'Pointer', className: '_User', objectId: userId } }),
                limit: limit,
                order: '-createdAt',
                keys: 'content,createdAt,post'
              },
              headers: {
                'X-Parse-Application-Id': 'marki',
                'X-Parse-REST-API-Key': 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9'
              }
            }
          );
          
          // Fusion et formatage des résultats
          const posts = postsResponse.data.results.map(post => ({
            id: post.objectId,
            title: post.title,
            date: post.createdAt,
            type: 'Post',
            link: `/post/${post.objectId}`
          }));
          
          const comments = commentsResponse.data.results.map(comment => ({
            id: comment.objectId,
            title: `Commentaire: ${comment.content.substring(0, 30)}...`,
            date: comment.createdAt,
            type: 'Commentaire',
            link: `/post/${comment.post.objectId}#comment-${comment.objectId}`
          }));
          
          // Fusion et tri par date
          const allActivities = [...posts, ...comments];
          allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
          
          return {
            success: true,
            activities: allActivities.slice(0, limit),
            error: null
          };
        } catch (error) {
          console.error('Erreur lors de la récupération des activités:', error);
          return {
            success: false,
            activities: null,
            error: 'Erreur lors de la récupération des activités'
          };
        }
      },

      /**
       * Envoie un message à l'utilisateur
       */
      async sendMessage() {
        if (!this.messageContent.trim()) {
          this.messageError = 'Le message ne peut pas être vide';
          return;
        }
        
        this.sendingMessage = true;
        this.messageError = null;
        
        try {
          // Vérifier que l'utilisateur est connecté
          const authStore = window.Alpine.store('auth');
          if (!authStore || !authStore.isAuthenticated) {
            throw new Error('Vous devez être connecté pour envoyer un message');
          }
          
          const result = await this.sendMessageToUser(this.profile.objectId, this.messageContent);
          
          if (result.success) {
            this.showMessageModal = false;
            this.messageContent = '';
            // Afficher une notification de succès
            if (window.Alpine.store('ui')) {
              window.Alpine.store('ui').showToast('Message envoyé avec succès', 'success');
            }
          } else {
            this.messageError = result.error || 'Erreur lors de l\'envoi du message';
          }
        } catch (error) {
          console.error('Erreur lors de l\'envoi du message:', error);
          this.messageError = error.message || 'Erreur lors de l\'envoi du message';
        } finally {
          this.sendingMessage = false;
        }
      },

      /**
       * Envoie un message via Parse REST API
       * @param {string} recipientId - ID du destinataire
       * @param {string} message - Contenu du message
       * @returns {Promise<Object>} { success: boolean, messageId: string|null, error: string|null }
       */
      async sendMessageToUser(recipientId, message) {
        try {
          // Récupérer le token de session
          const authData = JSON.parse(localStorage.getItem('parseAuth')) ||
                          JSON.parse(sessionStorage.getItem('parseAuth'));
          
          if (!authData || !authData.parseToken) {
            throw new Error('Non authentifié');
          }
          
          const response = await axios.post(
            'https://dev.parse.markidiags.com/parse/classes/Message',
            {
              sender: { __type: 'Pointer', className: '_User', objectId: authData.userId },
              recipient: { __type: 'Pointer', className: '_User', objectId: recipientId },
              content: message,
              read: false
            },
            {
              headers: {
                'X-Parse-Application-Id': 'marki',
                'X-Parse-REST-API-Key': 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9',
                'X-Parse-Session-Token': authData.parseToken,
                'Content-Type': 'application/json'
              }
            }
          );
          
          return {
            success: true,
            messageId: response.data.objectId,
            error: null
          };
        } catch (error) {
          console.error('Erreur Parse API:', error.response?.data || error.message);
          return {
            success: false,
            messageId: null,
            error: error.response?.data?.error || error.message || 'Erreur lors de l\'envoi'
          };
        }
      },

      /**
       * Formate une date pour l'affichage
       * @param {string} dateString - Date au format ISO
       * @returns {string} Date formatée
       */
      formatDate(dateString) {
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        } catch (error) {
          return dateString;
        }
      },

      /**
       * Vérifie si l'utilisateur est authentifié
       * @returns {boolean}
       */
      get isAuthenticated() {
        const authStore = window.Alpine.store('auth');
        return authStore ? authStore.isAuthenticated : false;
      },

      /**
       * Initialisation du composant
       */
      init() {
        console.log('profileState initialisé');
      }
    }));
  });
}
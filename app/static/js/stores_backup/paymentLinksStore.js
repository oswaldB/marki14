// paymentLinksStore.js - Store centralisé pour la gestion des liens de paiement
// Ce store gère toutes les opérations liées aux liens de paiement

document.addEventListener('alpine:init', () => {
  Alpine.store('paymentLinks', {
    // ============================================
    // ÉTAT INITIAL
    // ============================================

    // Liste complète des liens de paiement
    links: [],

    // Lien actuellement sélectionné
    selectedLink: null,

    // État d'interface et de chargement
    isLoading: false,
    error: null,

    // Configuration pour l'affichage
    showLink: true,
    customMessage: 'Veuillez trouver ci-dessous le lien pour effectuer votre paiement en ligne.',

    // État pour la gestion des liens
    linksConfigOpen: false,
    newLink: '',
    newLinkName: '',
    newLinkDescription: '',

    // ============================================
    // MÉTHODES PRINCIPALES
    // ============================================

    /**
     * Charge tous les liens de paiement depuis le serveur
     */
    async loadPaymentLinks() {
      this.isLoading = true;
      this.error = null;

      try {
        console.log('Chargement des liens de paiement depuis le serveur');
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        const response = await parseAxios.get('/classes/PaymentLink');

        this.links = response.data.results.map(link => ({
          objectId: link.objectId,
          url: link.url,
          name: link.name || 'Lien de paiement',
          description: link.description || '',
          variable: `lien_paiement_${link.objectId.substring(0, 4)}`
        }));

        // Sélectionner le premier lien par défaut
        if (this.links.length > 0) {
          this.selectedLink = this.links[0].url;
        }

        console.log('Liens de paiement chargés:', this.links.length);
        return this.links;

      } catch (error) {
        this.error = 'Erreur lors du chargement des liens de paiement: ' + error.message;
        console.error('Erreur:', error);
        this.links = [];
        this.selectedLink = null;
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Ajoute un nouveau lien de paiement
     * @param {Object} linkData - Données du nouveau lien
     */
    async addPaymentLink(linkData) {
      this.isLoading = true;
      this.error = null;

      try {
        const parseAxios = Alpine.store('parseAxios');
        if (!parseAxios) {
          throw new Error("parseAxios n'est pas disponible. Veuillez recharger la page.");
        }

        console.log('Ajout d\'un nouveau lien de paiement:', linkData.name);

        const response = await parseAxios.post('/classes/PaymentLink', {
          url: linkData.url,
          name: linkData.name,
          description: linkData.description || ''
        });

        const newLink = {
          objectId: response.data.objectId,
          url: response.data.url,
          name: response.data.name,
          description: response.data.description || '',
          variable: `lien_paiement_${response.data.objectId.substring(0, 4)}`
        };

        this.links.push(newLink);
        this.selectedLink = newLink.url;

        console.log('Nouveau lien de paiement ajouté:', newLink.name);
        return newLink;

      } catch (error) {
        this.error = `Erreur lors de l'ajout du lien: ${error.message}`;
        console.error('Erreur:', error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Sélectionne un lien de paiement
     * @param {string} linkUrl - URL du lien à sélectionner
     */
    selectLink(linkUrl) {
      this.selectedLink = linkUrl;
      console.log('Lien sélectionné:', linkUrl);
    },

    /**
     * Basculer l'affichage du lien de paiement
     */
    toggleShowLink() {
      this.showLink = !this.showLink;
      console.log('Affichage du lien de paiement:', this.showLink ? 'activé' : 'désactivé');
    },

    /**
     * Met à jour le message personnalisé
     * @param {string} message - Nouveau message personnalisé
     */
    setCustomMessage(message) {
      this.customMessage = message;
    },

    /**
     * Copie une variable de lien de paiement dans le presse-papiers
     * @param {Object} link - Lien de paiement
     */
    copyPaymentLinkVariable(link) {
      const variableWithBrackets = `[[${link.variable}]]`;
      navigator.clipboard.writeText(variableWithBrackets)
        .then(() => {
          console.log(`Variable ${variableWithBrackets} copiée dans le presse-papiers`);
          return true;
        })
        .catch(err => {
          console.error('Échec de la copie:', err);
          return false;
        });
    },

    /**
     * Copie l'URL d'un lien de paiement dans le presse-papiers
     * @param {Object} link - Lien de paiement
     */
    copyPaymentLinkUrl(link) {
      navigator.clipboard.writeText(link.url)
        .then(() => {
          console.log(`URL ${link.url} copiée dans le presse-papiers`);
          return true;
        })
        .catch(err => {
          console.error('Échec de la copie:', err);
          return false;
        });
    },

    /**
     * Réinitialise l'état du store
     */
    resetStore() {
      this.links = [];
      this.selectedLink = null;
      this.isLoading = false;
      this.error = null;
      this.showLink = true;
      this.customMessage = 'Veuillez trouver ci-dessous le lien pour effectuer votre paiement en ligne.';
      this.linksConfigOpen = false;
      this.newLink = '';
      this.newLinkName = '';
      this.newLinkDescription = '';
      console.log('Store paymentLinks réinitialisé');
    }
  });
});
// sequenceActionsState.js - État pour le composant sequence_actions
document.addEventListener('alpine:init', () => {
  Alpine.data('sequenceActionsState', () => ({
    actions: [],
    deleteConfirmOpen: false,
    actionToDelete: null,
    smtpProfiles: [],

    async init() {
      // Listen for delete action events
      this.$el.addEventListener('delete-action', (e) => {
        this.deleteActionByIndex(e.detail.index);
      });
      // Load SMTP profiles
      await this.loadSmtpProfiles();
    },

    async loadSmtpProfiles() {
      try {
        const parseAxios = this.getParseAxios();
        const response = await parseAxios.get('/classes/SMTPProfile');

        this.smtpProfiles = response.data.results.map(profile => ({
          objectId: profile.objectId,
          name: profile.name,
          email: profile.email,
          server: profile.server,
          port: profile.port
        }));

        console.log('SMTP Profiles loaded:', this.smtpProfiles);
      } catch (error) {
        console.error('Error loading SMTP profiles:', error);
        this.smtpProfiles = [];
      }
    },

    getParseAxios() {
      const parseAxios = Alpine.store('parseAxios');
      if (!parseAxios) {
        throw new Error('parseAxios is not available. Please reload the page.');
      }
      return parseAxios;
    },

    deleteActionByIndex(index) {
      this.actions.splice(index, 1);
    },

    addAction(type) {
      if (type !== 'email') return;

      const defaultBody = this.getDefaultEmailBody();
      const newAction = {
        id: Date.now().toString(),
        type: 'email',
        smtpProfileId: this.smtpProfiles.length > 0 ? this.smtpProfiles[0].objectId : '',
        senderEmail: this.smtpProfiles.length > 0 ? this.smtpProfiles[0].email : '',
        subject: 'Rappel de paiement',
        bodyStart: defaultBody.bodyStart,
        bodyEnd: defaultBody.bodyEnd,
        delay: 0
      };

      this.actions.push(newAction);
    },

    getDefaultEmailBody() {
      return {
        bodyStart: `Bonjour [[client_nom]],\n\nCeci est un rappel pour le paiement de votre facture [[facture_numero]] d'un montant de [[facture_montant]].`,
        bodyEnd: `Cordialement,\nVotre équipe`
      };
    }
  }));
});

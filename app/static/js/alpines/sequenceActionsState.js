// sequenceActionsState.js - État pour le composant sequence_actions
document.addEventListener('alpine:init', () => {
  Alpine.data('sequenceActionsState', () => ({
    // Données locales
    actions: [],
    smtpProfiles: [],
    deleteConfirmOpen: false,
    actionToDelete: null,

    async init() {
      // Listen for delete action events
      this.$el.addEventListener('delete-action', (e) => {
        this.deleteActionByIndex(e.detail.index);
      });
      
      // Charger les données directement depuis le store
      const sequenceStore = Alpine.store('sequence');
      this.actions = sequenceStore.currentSequence ? sequenceStore.currentSequence.actions : [];
      
      // Charger les profils SMTP directement depuis le store
      const smtpProfilesStore = Alpine.store('smtpProfiles');
      if (smtpProfilesStore.profiles.length === 0) {
        await smtpProfilesStore.loadSmtpProfiles();
      }
      this.smtpProfiles = smtpProfilesStore.profiles;
      
      console.log('Sequence Actions State initialized');
    },

    deleteActionByIndex(index) {
      const sequenceStore = Alpine.store('sequence');
      sequenceStore.removeActionFromCurrentSequence(index);
      this.$dispatch('action-deleted', { index: index });
    },

    addAction(type) {
      if (type !== 'email') return;

      const sequenceStore = Alpine.store('sequence');
      sequenceStore.addActionToCurrentSequence(type);
      this.actions = sequenceStore.currentSequence.actions;
    }
  }));
});

// emailCardState.js - État pour le composant email_card
document.addEventListener('alpine:init', () => {
  Alpine.data('emailCardState', (action, index) => ({
    action: action,
    index: index,
    deleteConfirmOpen: false,

    init() {
      // Debug: log action to console
      console.log('Email card initialized - Action:', this.index, 'Type:', this.action.type);
    },

    editAction() {
      console.log('Editing action', this.index);
    },

    deleteAction() {
      this.deleteConfirmOpen = true;
    },

    confirmDelete() {
      // Dispatch event for parent to delete the action
      this.$dispatch('delete-action', { index: this.index });
      this.deleteConfirmOpen = false;
    },

    cancelDelete() {
      this.deleteConfirmOpen = false;
    }
  }));
});

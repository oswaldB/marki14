/**
 * État Alpine.js global pour la gestion des notifications UI
 * Gère les toast notifications et autres éléments UI globaux
 */

if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    Alpine.store('ui', {
      // État initial
      toasts: [],

      /**
       * Affiche une notification toast
       * @param {string} message - Message à afficher
       * @param {string} type - Type de toast (success, error, info, warning)
       * @param {number} duration - Durée en millisecondes (default: 5000)
       */
      showToast(message, type = 'info', duration = 5000) {
        const id = Date.now();
        
        this.toasts.push({
          id,
          message,
          type,
          visible: true
        });

        // Masquer automatiquement après la durée spécifiée
        setTimeout(() => {
          this.hideToast(id);
        }, duration);
      },

      /**
       * Masque une notification toast
       * @param {number} id - ID du toast à masquer
       */
      hideToast(id) {
        const toastIndex = this.toasts.findIndex(t => t.id === id);
        if (toastIndex !== -1) {
          this.toasts[toastIndex].visible = false;
          
          // Supprimer complètement après l'animation
          setTimeout(() => {
            this.toasts = this.toasts.filter(t => t.id !== id);
          }, 300);
        }
      },

      /**
       * Récupère la classe CSS pour un type de toast
       * @param {string} type - Type de toast
       * @returns {string} Classe CSS
       */
      getToastClass(type) {
        const baseClasses = 'fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg transition-all duration-300';
        
        switch (type) {
          case 'success':
            return `${baseClasses} bg-green-50 border border-green-200`;
          case 'error':
            return `${baseClasses} bg-red-50 border border-red-200`;
          case 'warning':
            return `${baseClasses} bg-yellow-50 border border-yellow-200`;
          case 'info':
          default:
            return `${baseClasses} bg-blue-50 border border-blue-200`;
        }
      },

      /**
       * Récupère la classe CSS pour l'icône du toast
       * @param {string} type - Type de toast
       * @returns {string} Classe CSS pour l'icône
       */
      getToastIcon(type) {
        switch (type) {
          case 'success':
            return 'fas fa-check-circle text-green-500';
          case 'error':
            return 'fas fa-exclamation-circle text-red-500';
          case 'warning':
            return 'fas fa-exclamation-triangle text-yellow-500';
          case 'info':
          default:
            return 'fas fa-info-circle text-blue-500';
        }
      },

      /**
       * Initialisation du store
       */
      init() {
        console.log('uiStore initialisé');
      }
    });
    
    // Initialisation automatique
    Alpine.store('ui').init();
  });
}
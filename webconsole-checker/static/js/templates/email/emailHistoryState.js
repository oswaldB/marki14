/**
 * emailHistoryState.js - Alpine.js state pour la page d'historique des emails
 * Conforme aux règles de développement du projet
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('emailHistoryState', () => ({
    // État initial
    emailId: '',
    historyEntries: [],
    showModal: false,
    diffContent: {
      beforeHtml: '',
      afterHtml: '',
      diffHtml: ''
    },
    currentHistoryId: null,
    currentField: null,

    // Initialisation
    init() {
      // Récupérer l'ID de l'email depuis l'URL
      const pathParts = window.location.pathname.split('/');
      this.emailId = pathParts[pathParts.length - 1];
      
      // Charger l'historique
      this.loadHistory();
    },

    // Charger l'historique depuis Parse
    async loadHistory() {
      try {
        const response = await Alpine.store('parseAxios').get('/script/emailHistory', {
          params: {
            action: 'fetchEmailHistory',
            emailId: this.emailId
          }
        });

        if (response.data.success) {
          this.historyEntries = response.data.history.map(entry => ({
            id: entry.objectId,
            user: {
              name: entry.user ? entry.user.username : 'Utilisateur inconnu',
              avatar: entry.user ? entry.user.avatar : null
            },
            formattedDate: this.formatDate(entry.timestamp),
            changes: entry.changes
          }));
        } else {
          console.error('Erreur lors du chargement de l\'historique:', response.data.error);
        }
      } catch (error) {
        console.error('Erreur réseau:', error);
      }
    },

    // Formater la date
    formatDate(dateString) {
      if (!dateString) return 'Date inconnue';
      
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    // Afficher la modale de comparaison
    async showDiffModal(historyId, field) {
      this.currentHistoryId = historyId;
      this.currentField = field;
      
      try {
        const response = await Alpine.store('parseAxios').get('/script/emailHistory', {
          params: {
            action: 'getDiffForField',
            historyId: historyId,
            field: field
          }
        });

        if (response.data.success) {
          const diffData = response.data.diff;
          
          // Utiliser notre fonction de génération de diff avec Tailwind
          this.diffContent = {
            beforeHtml: this.escapeHtml(diffData.before),
            afterHtml: this.escapeHtml(diffData.after),
            diffHtml: this.generateDiffHtml(diffData.before, diffData.after)
          };
          
          this.showModal = true;
        } else {
          console.error('Erreur lors de la récupération du diff:', response.data.error);
        }
      } catch (error) {
        console.error('Erreur réseau:', error);
      }
    }
=======,

    // Fermer la modale
    closeModal() {
      this.showModal = false;
      this.diffContent = {
        beforeHtml: '',
        afterHtml: '',
        diffHtml: ''
      };
    },

    // Échapper le HTML pour affichage sécurisé
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },
    
    // Générer du HTML pour le diff en utilisant des classes Tailwind
    generateDiffHtml(before, after) {
      return `
        <div class="bg-white p-3 rounded border border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
              <h4 class="font-medium text-red-800 mb-2">AVANT</h4>
              <pre class="text-sm text-red-700 whitespace-pre-wrap">${this.escapeHtml(before)}</pre>
            </div>
            <div class="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
              <h4 class="font-medium text-green-800 mb-2">APRÈS</h4>
              <pre class="text-sm text-green-700 whitespace-pre-wrap">${this.escapeHtml(after)}</pre>
            </div>
          </div>
        </div>
      `;
    }
=======
  }));
});
/**
 * État Alpine.js pour la page des séquences
 */

// Vérifier que le code s'exécute côté client uniquement
if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    Alpine.data('sequencesState', () => ({
      // État initial
      sequences: [],
      isLoading: true,
      error: null,
      deactivationSuccess: null,
      deactivationError: null,

      // Cycle de vie
      init() {
        console.log('Composant sequencesState initialisé');
        this.fetchSequences();
      },

      // Méthode pour récupérer les séquences
      async fetchSequences() {
        console.log('Début de la récupération des séquences');
        this.isLoading = true;
        this.error = null;

        try {
          // Appel à la fonction fetchSequences du module
          this.sequences = await fetchSequences();
          console.log('Séquences récupérées avec succès:', this.sequences);
        } catch (error) {
          console.error('Erreur lors de la récupération des séquences:', error);
          this.error = 'Impossible de charger les séquences';
        } finally {
          this.isLoading = false;
          console.log('Fin de la récupération des séquences');
        }
      },

      // Méthode pour désactiver une séquence
      async deactivateSequence(sequenceId, event) {
        console.log(`Début de la désactivation de la séquence ${sequenceId}`);
        
        // Réinitialiser les messages
        this.deactivationSuccess = null;
        this.deactivationError = null;
        
        try {
          // Appel à la fonction de désactivation
          const result = await deactivateSequence(sequenceId);
          
          if (result.success) {
            if (result.cancelledCount > 0) {
              this.deactivationSuccess = `${result.cancelledCount} relance(s) annulée(s) avec succès.`;
            } else {
              this.deactivationSuccess = 'Séquence désactivée avec succès. Aucune relance à annuler.';
            }
            
            // Rafraîchir la liste des séquences
            await this.fetchSequences();
          } else {
            this.deactivationError = result.error || 'Erreur lors de la désactivation de la séquence.';
          }
          
        } catch (error) {
          console.error(`Erreur lors de la désactivation de la séquence ${sequenceId}:`, error);
          this.deactivationError = error.message || 'Erreur lors de la désactivation de la séquence.';
        }
      }
    }));
  });
}
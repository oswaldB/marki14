/**
 * sequencesState.js
 * 
 * State management for the sequences page using Alpine.js
 * Handles fetching sequences and relances count from Parse server
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('sequencesState', () => ({
    sequences: [],
    isLoading: true,
    error: null,

    /**
     * Initialize the state by fetching sequences
     */
    async init() {
      await this.fetchSequences();
    },

    /**
     * Fetch all sequences from Parse server
     * @returns {Promise<void>}
     */
    async fetchSequences() {
      this.isLoading = true;
      this.error = null;

      try {
        console.log('Début de la récupération des séquences');
        
        // Fetch sequences from Parse REST API
        const sequencesResponse = await fetch('/api/parse/classes/Sequences', {
          headers: {
            'X-Parse-Application-Id': 'marki',
            'X-Parse-Master-Key': 'Shaky4-Exception6'
          }
        });

        if (!sequencesResponse.ok) {
          throw new Error('Impossible de charger les séquences');
        }

        const sequencesData = await sequencesResponse.json();
        console.log('Séquences récupérées:', sequencesData.results);

        // For each sequence, count the relances
        const sequencesWithRelances = await Promise.all(
          sequencesData.results.map(async (sequence) => {
            const relancesCount = await this.fetchRelancesCount(sequence.objectId);
            return {
              id: sequence.objectId,
              nom: sequence.nom,
              statut: sequence.isActif,
              typePeuplement: sequence.isAuto ? 'automatique' : 'manuel',
              relancesCount
            };
          })
        );

        this.sequences = sequencesWithRelances;
        console.log('Séquences avec relances:', this.sequences);
      } catch (error) {
        console.error('Erreur lors de la récupération des séquences:', error);
        this.error = error.message || 'Impossible de charger les séquences';
      } finally {
        this.isLoading = false;
        console.log('Fin de la récupération des séquences');
      }
    },

    /**
     * Fetch the count of relances for a specific sequence
     * @param {string} sequenceId - The sequence objectId
     * @returns {Promise<number>} - The count of relances
     */
    async fetchRelancesCount(sequenceId) {
      try {
        console.log(`Début du comptage des relances pour la séquence ${sequenceId}`);
        
        // Fetch relances count from Parse REST API
        const response = await fetch(`/api/parse/classes/Impayes?where={"sequence":{"__type":"Pointer","className":"Sequences","objectId":"${sequenceId}"}}&count=1`, {
          headers: {
            'X-Parse-Application-Id': 'marki',
            'X-Parse-Master-Key': 'Shaky4-Exception6'
          }
        });

        if (!response.ok) {
          throw new Error('Impossible de compter les relances');
        }

        const data = await response.json();
        const count = data.count || 0;
        
        console.log(`Nombre de relances pour la séquence ${sequenceId}:`, count);
        return count;
      } catch (error) {
        console.error(`Erreur lors du comptage des relances pour la séquence ${sequenceId}:`, error);
        return 0;
      }
    },

    /**
     * Redirect to sequence detail page based on type
     * @param {string} id - The sequence objectId
     * @param {'automatique'|'manuel'} type - The sequence type
     */
    redirectToSequenceDetail(id, type) {
      if (type === 'manuel') {
        window.location.href = `/sequences/manuelle/?id=${id}`;
      } else if (type === 'automatique') {
        window.location.href = `/sequences/auto/?id=${id}`;
      }
    },

    /**
     * Retry fetching sequences
     */
    retry() {
      this.fetchSequences();
    }
  }));
});
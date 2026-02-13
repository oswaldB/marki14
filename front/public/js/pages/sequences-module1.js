/**
 * Module pour la gestion des séquences
 * Contient les fonctions pour récupérer les séquences et les relances
 */

// Configuration de Parse
const PARSE_APP_ID = 'markidiagsAppId';
const PARSE_JS_KEY = 'markidiagsJavaScriptKey';
const PARSE_SERVER_URL = 'https://dev.markidiags.com/parse';

/**
 * Récupère toutes les séquences depuis Parse
 * @returns {Promise<Array>} Liste des séquences avec leurs informations
 */
async function fetchSequences() {
  console.log('fetchSequences appelé');
  
  try {
    // Récupérer les séquences depuis Parse
    const sequencesResponse = await fetch(`${PARSE_SERVER_URL}/classes/Sequences`, {
      headers: {
        'X-Parse-Application-Id': PARSE_APP_ID,
        'X-Parse-Javascript-Key': PARSE_JS_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!sequencesResponse.ok) {
      throw new Error(`Erreur lors de la récupération des séquences: ${sequencesResponse.status}`);
    }
    
    const sequencesData = await sequencesResponse.json();
    const sequences = sequencesData.results || [];
    
    console.log('Séquences récupérées:', sequences);
    
    // Pour chaque séquence, récupérer le nombre de relances
    const sequencesWithRelances = await Promise.all(
      sequences.map(async (sequence) => {
        const relancesCount = await fetchRelancesCount(sequence.objectId);
        
        return {
          id: sequence.objectId,
          nom: sequence.nom,
          statut: sequence.isActif,
          typePeuplement: sequence.isAuto ? 'automatique' : 'manuel',
          relancesCount: relancesCount
        };
      })
    );
    
    console.log('Séquences avec relances:', sequencesWithRelances);
    return sequencesWithRelances;
    
  } catch (error) {
    console.error('Erreur dans fetchSequences:', error);
    throw error;
  }
}

/**
 * Récupère le nombre de relances pour une séquence donnée
 * @param {string} sequenceId - ID de la séquence
 * @returns {Promise<number>} Nombre de relances
 */
async function fetchRelancesCount(sequenceId) {
  console.log(`fetchRelancesCount appelé pour la séquence ${sequenceId}`);
  
  try {
    // Créer la requête pour compter les relances
    const query = {
      where: {
        sequence: {
          __type: 'Pointer',
          className: 'Sequences',
          objectId: sequenceId
        }
      },
      count: 1
    };
    
    const response = await fetch(`${PARSE_SERVER_URL}/classes/Impayes`, {
      method: 'GET',
      headers: {
        'X-Parse-Application-Id': PARSE_APP_ID,
        'X-Parse-Javascript-Key': PARSE_JS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des relances: ${response.status}`);
    }
    
    const data = await response.json();
    const count = data.count || 0;
    
    console.log(`Nombre de relances pour la séquence ${sequenceId}:`, count);
    return count;
    
  } catch (error) {
    console.error(`Erreur dans fetchRelancesCount pour la séquence ${sequenceId}:`, error);
    return 0;
  }
}

/**
 * Redirige vers la page de détail d'une séquence
 * @param {string} sequenceId - ID de la séquence
 * @param {string} type - Type de peuplement ('automatique' ou 'manuel')
 */
function redirectToSequenceDetail(sequenceId, type) {
  console.log(`Redirection vers la séquence ${sequenceId} de type ${type}`);
  
  if (type === 'manuel') {
    window.location.href = `/sequences/manuelle/?id=${sequenceId}`;
  } else if (type === 'automatique') {
    window.location.href = `/sequences/auto/?id=${sequenceId}`;
  }
}

// Exporter les fonctions pour qu'elles soient disponibles globalement
if (typeof window !== 'undefined') {
  window.fetchSequences = fetchSequences;
  window.fetchRelancesCount = fetchRelancesCount;
  window.redirectToSequenceDetail = redirectToSequenceDetail;
}
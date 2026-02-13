/**
 * sequencesState.js
 * État et fonctions pour la page des séquences
 * Version simplifiée pour la démonstration
 */

document.addEventListener('alpine:init', () => {
  // Fonction pour récupérer les séquences depuis Parse
  window.fetchSequences = async function() {
    try {
      console.log('Récupération des séquences depuis Parse...');
      
      // Vérifier que Parse est disponible
      if (!window.Parse) {
        console.error('Parse n\'est pas disponible');
        throw new Error('Parse n\'est pas initialisé');
      }
      
      // Créer une requête pour les séquences
      const Sequence = Parse.Object.extend('Sequences');
      const query = new Parse.Query(Sequence);
      
      // Ajouter des conditions si nécessaire
      // query.equalTo('statut', true);
      
      // Limite à 100 enregistrements
      query.limit(100);
      
      // Exécuter la requête
      const results = await query.find();
      
      // Convertir les objets Parse en objets JavaScript simples
      const sequences = results.map(item => {
        const json = item.toJSON();
        return {
          id: json.objectId,
          nom: json.nom || 'Sans nom',
          statut: json.statut || false,
          typePeuplement: json.typePeuplement || 'Inconnu',
          relancesCount: json.relancesCount || 0
        };
      });
      
      console.log('Séquences récupérées:', sequences);
      return sequences;
      
    } catch (error) {
      console.error('Erreur lors de la récupération des séquences:', error);
      throw error;
    }
  };
  
  // Fonction pour rediriger vers les détails d'une séquence
  window.redirectToSequenceDetail = function(id, type) {
    console.log('Redirection vers la séquence:', id, type);
    
    // Logique de redirection à implémenter
    // Par exemple: window.location.href = `/sequences/${id}`;
    
    // Pour l'instant, juste un message
    alert(`Redirection vers la séquence ${id} de type ${type} - à implémenter`);
  };
});
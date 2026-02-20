/**
 * Script pour gérer l'historique des modifications d'emails
 * Conforme aux règles de développement du projet
 */

// Fonction pour logger une modification d'email
async function logEmailModification(emailId, user, changes) {
  try {
    // Vérification des paramètres
    if (!emailId || !user || !changes) {
      throw new Error('Paramètres manquants pour logEmailModification');
    }

    // Création de l'objet EmailHistory pour Parse Server
    const EmailHistory = Parse.Object.extend('EmailHistory');
    const historyEntry = new EmailHistory();

    // Configuration des champs
    historyEntry.set('email', {
      __type: 'Pointer',
      className: 'EmailPlanified',
      objectId: emailId
    });

    historyEntry.set('user', {
      __type: 'Pointer',
      className: '_User',
      objectId: user.id || user.objectId
    });

    // Stockage des modifications
    historyEntry.set('changes', changes);
    historyEntry.set('timestamp', new Date());

    // Sauvegarde dans Parse
    const savedEntry = await historyEntry.save();
    return savedEntry;

  } catch (error) {
    console.error('Erreur dans logEmailModification:', error);
    throw error;
  }
}

// Fonction pour récupérer l'historique d'un email
async function fetchEmailHistory(emailId, limit = 20) {
  try {
    if (!emailId) {
      throw new Error('emailId requis pour fetchEmailHistory');
    }

    const EmailHistory = Parse.Object.extend('EmailHistory');
    const query = new Parse.Query(EmailHistory);

    // Filtrer par email et inclure les données utilisateur
    query.equalTo('email', {
      __type: 'Pointer',
      className: 'EmailPlanified',
      objectId: emailId
    });

    query.include('user');
    query.descending('timestamp');
    query.limit(limit);

    const results = await query.find();
    return results;

  } catch (error) {
    console.error('Erreur dans fetchEmailHistory:', error);
    throw error;
  }
}

// Fonction pour obtenir les différences pour un champ spécifique
async function getDiffForField(historyId, field) {
  try {
    if (!historyId || !field) {
      throw new Error('historyId et field requis pour getDiffForField');
    }

    const EmailHistory = Parse.Object.extend('EmailHistory');
    const query = new Parse.Query(EmailHistory);

    query.equalTo('objectId', historyId);
    const historyEntry = await query.first();

    if (!historyEntry) {
      throw new Error('Entrée d\'historique non trouvée');
    }

    const changes = historyEntry.get('changes');
    if (!changes || !changes[field]) {
      throw new Error('Champ de modification non trouvé');
    }

    const fieldChanges = changes[field];
    
    // Pour les champs simples (subject, etc.)
    if (fieldChanges.old !== undefined && fieldChanges.new !== undefined) {
      return {
        before: fieldChanges.old,
        after: fieldChanges.new,
        diffHtml: generateSimpleDiff(fieldChanges.old, fieldChanges.new)
      };
    }

    // Pour les champs complexes (body avec diff algorithm)
    if (field === 'body') {
      return {
        before: fieldChanges.old,
        after: fieldChanges.new,
        diffHtml: generateBodyDiff(fieldChanges.old, fieldChanges.new)
      };
    }

    return {
      before: 'N/A',
      after: 'N/A',
      diffHtml: '<p>Aucune différence disponible</p>'
    };

  } catch (error) {
    console.error('Erreur dans getDiffForField:', error);
    throw error;
  }
}

// Fonction utilitaire pour générer un diff simple
function generateSimpleDiff(oldValue, newValue) {
  return `
    <div class="diff-container">
      <div class="diff-old">${escapeHtml(oldValue)}</div>
      <div class="diff-arrow">→</div>
      <div class="diff-new">${escapeHtml(newValue)}</div>
    </div>
  `;
}

// Fonction utilitaire pour générer un diff pour le corps de l'email
function generateBodyDiff(oldBody, newBody) {
  // Implémentation simplifiée d'un algorithme de diff
  // Dans une application réelle, utiliser une bibliothèque comme diff-match-patch
  
  const oldLines = oldBody.split('\n');
  const newLines = newBody.split('\n');
  
  let diffHtml = '<div class="body-diff">';
  
  // Trouver les lignes communes pour l'alignement
  let i = 0, j = 0;
  while (i < oldLines.length && j < newLines.length) {
    if (oldLines[i] === newLines[j]) {
      diffHtml += `<div class="diff-common">${escapeHtml(oldLines[i])}</div>`;
      i++; j++;
    } else {
      // Lignes différentes
      if (oldLines[i]) {
        diffHtml += `<div class="diff-removed">${escapeHtml(oldLines[i])}</div>`;
      }
      if (newLines[j]) {
        diffHtml += `<div class="diff-added">${escapeHtml(newLines[j])}</div>`;
      }
      i++; j++;
    }
  }
  
  // Lignes restantes
  while (i < oldLines.length) {
    diffHtml += `<div class="diff-removed">${escapeHtml(oldLines[i])}</div>`;
    i++;
  }
  
  while (j < newLines.length) {
    diffHtml += `<div class="diff-added">${escapeHtml(newLines[j])}</div>`;
    j++;
  }
  
  diffHtml += '</div>';
  return diffHtml;
}

// Fonction utilitaire pour échapper le HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export des fonctions pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    logEmailModification,
    fetchEmailHistory,
    getDiffForField
  };
}
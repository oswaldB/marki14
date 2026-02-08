// generateSingleEmailWithAI.js - Fonction cloud pour générer un seul email avec IA
// Génère un seul email de relance personnalisé

const { generateEmailWithOllama } = require('./generateEmailWithOllama');

Parse.Cloud.define('generateSingleEmailWithAI', async (request) => {
  const { 
    sequenceId, 
    target, 
    tone = 'professionnel', 
    delay = 0 
  } = request.params;

  try {
    // Vérifier que la séquence existe
    const Sequences = Parse.Object.extend('Sequences');
    const query = new Parse.Query(Sequences);
    const sequence = await query.get(sequenceId);

    if (!sequence) {
      throw new Error('Sequence not found');
    }

    // Générer un seul email
    const action = await generateSingleEmailAction(target, tone, delay);

    // Ajouter l'action à la séquence existante
    const currentActions = sequence.get('actions') || [];
    currentActions.push(action);
    sequence.set('actions', currentActions);
    await sequence.save();

    return {
      success: true,
      message: 'Email généré avec succès et ajouté à la séquence',
      actionGenerated: action
    };

  } catch (error) {
    console.error('Erreur dans generateSingleEmailWithAI:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Générer un seul email
async function generateSingleEmailAction(target, tone, delay) {
  // Créer un exemple d'impayé pour la génération
  const sampleImpaye = createSampleImpaye(target);

  // Générer le sujet et le message avec l'IA
  const prompt = buildSingleEmailPrompt(target, tone);

  try {
    // Utiliser la fonction existante pour générer l'email
    const result = await generateEmailWithOllama({
      impayeData: sampleImpaye,
      sequenceName: 'Email généré par IA',
      actionType: 'email',
      isMultiple: false,
      template: prompt
    });

    if (result.success) {
      return {
        type: 'email',
        delay: delay,
        subject: result.subject,
        senderEmail: 'default@example.com', // À configurer
        message: result.body,
        isMultipleImpayes: false
      };
    } else {
      // Utiliser un fallback si l'IA échoue
      const fallbackAction = generateFallbackSingleEmail(target, tone, delay);
      
      // Appliquer le remplacement des placeholders avec les données de l'impayé
      const sampleImpaye = createSampleImpaye(target);
      fallbackAction.subject = replacePlaceholders(fallbackAction.subject, sampleImpaye);
      fallbackAction.message = replacePlaceholders(fallbackAction.message, sampleImpaye);
      
      return fallbackAction;
    }

  } catch (error) {
    console.error('Erreur lors de la génération de l\'email:', error);
    return generateFallbackSingleEmail(target, tone, delay);
  }
}





// Construire le prompt pour un seul email
function buildSingleEmailPrompt(target, tone) {
  let prompt = `Générez un email de relance unique pour ${getTargetDescription(target)}. `;
  prompt += `Ton: ${getToneDescription(tone)}. `;
  prompt += `Cet email doit être autonome et complet.\n\n`;

  prompt += `Structure souhaitée:\n`;
  prompt += `- Sujet: Clair et concis (max 80 caractères)\n`;
  prompt += `- Message: Professionnel avec les informations essentielles\n`;
  prompt += `- Ton: Adapté à la situation\n`;
  prompt += `- Format: JSON avec {subject: "...", body: "..."}\n`;

  return prompt;
}

// Obtenir la description de la cible
function getTargetDescription(target) {
  const descriptions = {
    'particulier': 'un particulier',
    'professionnel': 'un professionnel/entreprise',
    'syndic': 'un syndic de copropriété',
    'locataire': 'un locataire',
    'proprietaire': 'un propriétaire'
  };
  return descriptions[target] || 'un client';
}

// Obtenir la description du ton
function getToneDescription(tone) {
  const tones = {
    'professionnel': 'professionnel et courtois',
    'amiable': 'amiable et compréhensif',
    'ferme': 'ferme avec rappel des obligations',
    'urgent': 'urgent avec délai strict'
  };
  return tones[tone] || 'professionnel et courtois';
}

// Générer un email de fallback
function generateFallbackSingleEmail(target, tone, delay) {
  return {
    type: 'email',
    delay: delay,
    subject: generateFallbackSubject(target, tone),
    senderEmail: 'default@example.com',
    message: generateFallbackMessage(target, tone),
    isMultipleImpayes: false
  };
}

// Générer un sujet de fallback
function generateFallbackSubject(target, tone) {
  const subjects = {
    'professionnel': 'Rappel - Facture [[nfacture]] impayée',
    'amiable': 'Rappel amiable - Facture [[nfacture]]',
    'ferme': 'Rappel ferme - Facture [[nfacture]] impayée',
    'urgent': 'Rappel urgent - Facture [[nfacture]] impayée'
  };
  return subjects[tone] || 'Rappel - Facture [[nfacture]] impayée';
}

// Générer un message de fallback
function generateFallbackMessage(target, tone) {
  const messages = {
    'professionnel': 'Bonjour [[payeur_nom]],\n\nNous vous rappelons que votre facture n°[[nfacture]] d\'un montant de [[resteapayer]] € est actuellement impayée.\n\nNous vous invitons à régulariser cette situation dans les plus brefs délais.\n\nCordialement,',
    'amiable': 'Bonjour [[payeur_nom]],\n\nNous vous rappelons que votre facture n°[[nfacture]] reste impayée.\n\nNous comprenons que des retards peuvent survenir et restons à votre disposition pour trouver une solution.\n\nCordialement,',
    'ferme': 'Bonjour [[payeur_nom]],\n\nNous vous rappelons que votre facture n°[[nfacture]] reste impayée malgré nos précédents rappels.\n\nNous vous demandons de régulariser cette situation immédiatement.\n\nCordialement,',
    'urgent': 'Bonjour [[payeur_nom]],\n\nNous vous rappelons que votre facture n°[[nfacture]] est impayée.\n\nNous vous demandons de procéder au règlement dans les 24 heures.\n\nCordialement,'
  };
  return messages[tone] || 'Bonjour [[payeur_nom]],\n\nNous vous rappelons que votre facture n°[[nfacture]] est impayée.\n\nCordialement,';
}

// Fonction pour remplacer les placeholders [[nomColonne]] dans les messages
function replacePlaceholders(template, impayeData) {
  if (!template || typeof template !== 'string') {
    return template;
  }
  
  let result = template;
  
  // Remplacer les placeholders [[nomColonne]]
  result = result.replaceAll(/\[\[\s*([^\]\]]+)\s*\]\]/g, (match, fieldName) => {
    const field = fieldName.trim();
    const value = impayeData[field] || '';
    
    // Appliquer le formatage approprié pour certains champs
    if (field === 'datepiece' && value) {
      return formatDate(value);
    } else if ((field === 'totalttcnet' || field === 'resteapayer') && value) {
      return formatCurrency(value);
    }
    
    return value;
  });
  
  return result;
}

function formatDate(date) {
  if (!date) return '';
  
  if (date instanceof Date) {
    return date.toLocaleDateString('fr-FR');
  }
  
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString('fr-FR');
    }
  }
  
  return date;
}

function formatCurrency(value) {
  if (value === null || value === undefined) return '';
  
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return value;
  
  return numericValue.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Exporter les fonctions pour les tests
module.exports = {
  generateSingleEmailAction,
  buildSingleEmailPrompt,
  getTargetDescription,
  getToneDescription,
  generateFallbackSingleEmail,
  generateFallbackSubject,
  generateFallbackMessage,
  replacePlaceholders,
  formatDate,
  formatCurrency
};
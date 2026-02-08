// generateFullSequenceWithAI.js - Fonction cloud pour générer une séquence complète avec IA
// Génère une séquence de relances complète avec plusieurs étapes

const { generateEmailWithOllama } = require('./generateEmailWithOllama');

Parse.Cloud.define('generateFullSequenceWithAI', async (request) => {
  const { 
    sequenceId, 
    target, 
    multipleImpayes = false, 
    startTone = 'professionnel', 
    endTone = 'ferme', 
    huissierThreshold = 3 
  } = request.params;

  try {
    // Vérifier que la séquence existe
    const Sequences = Parse.Object.extend('Sequences');
    const query = new Parse.Query(Sequences);
    const sequence = await query.get(sequenceId);

    if (!sequence) {
      throw new Error('Sequence not found');
    }

    // Générer une séquence complète avec plusieurs étapes
    const actions = await generateCompleteSequence(target, multipleImpayes, startTone, endTone, huissierThreshold);

    // Mettre à jour la séquence avec les nouvelles actions
    sequence.set('actions', actions);
    await sequence.save();

    return {
      success: true,
      message: 'Séquence complète générée avec succès',
      actionsGenerated: actions.length
    };

  } catch (error) {
    console.error('Erreur dans generateFullSequenceWithAI:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Générer une séquence complète avec plusieurs étapes
async function generateCompleteSequence(target, multipleImpayes, startTone, endTone, huissierThreshold) {
  const actions = [];

  // Définir les étapes de la séquence
  const sequenceSteps = [
    { delay: 0, type: 'email', tone: startTone, purpose: 'premier_rappel' },
    { delay: 7, type: 'email', tone: 'amiable', purpose: 'rappel_amiable' },
    { delay: 14, type: 'email', tone: 'professionnel', purpose: 'rappel_professionnel' },
    { delay: 21, type: 'email', tone: 'ferme', purpose: 'rappel_ferme' },
    { delay: 28, type: 'email', tone: endTone, purpose: 'dernier_rappel' }
  ];

  // Si le seuil d'huissier est atteint, ajouter une étape de préparation
  if (huissierThreshold <= 5) {
    sequenceSteps.push({
      delay: 35,
      type: 'email',
      tone: 'juridique',
      purpose: 'preparation_huissier'
    });
  }

  // Générer chaque action de la séquence
  for (const step of sequenceSteps) {
    const action = await generateSequenceAction(target, multipleImpayes, step);
    actions.push(action);
  }

  return actions;
}

// Générer une action individuelle pour la séquence
async function generateSequenceAction(target, multipleImpayes, step) {
  // Créer un exemple d'impayé pour la génération
  const sampleImpaye = createSampleImpaye(target, multipleImpayes);

  // Déterminer le ton en fonction de l'étape
  const tone = determineToneForStep(step);

  // Générer le sujet et le message avec l'IA
  const prompt = buildSequencePrompt(target, step.purpose, tone, multipleImpayes);

  try {
    // Utiliser la fonction existante pour générer l'email
    const result = await generateEmailWithOllama({
      impayeData: sampleImpaye,
      sequenceName: 'Séquence générée par IA',
      actionType: step.purpose,
      isMultiple: multipleImpayes,
      template: prompt
    });

    if (result.success) {
      return {
        type: 'email',
        delay: step.delay,
        subject: result.subject,
        senderEmail: 'default@example.com', // À configurer
        message: result.body,
        isMultipleImpayes: multipleImpayes,
        multipleSubject: multipleImpayes ? generateMultipleSubject(step.purpose, tone) : '',
        multipleMessage: multipleImpayes ? generateMultipleMessage(step.purpose, tone) : ''
      };
    } else {
      // Utiliser un fallback si l'IA échoue
      const fallbackAction = generateFallbackAction(target, step, multipleImpayes);
      
      // Appliquer le remplacement des placeholders avec les données de l'impayé
      const sampleImpaye = createSampleImpaye(target, multipleImpayes);
      
      if (multipleImpayes) {
        // Pour les multiples impayés, utiliser le premier impayé pour le remplacement
        const firstImpaye = Array.isArray(sampleImpaye) ? sampleImpaye[0] : sampleImpaye;
        fallbackAction.subject = replacePlaceholders(fallbackAction.subject, firstImpaye);
        fallbackAction.message = replacePlaceholders(fallbackAction.message, firstImpaye);
        fallbackAction.multipleSubject = replacePlaceholders(fallbackAction.multipleSubject, firstImpaye);
        fallbackAction.multipleMessage = replacePlaceholders(fallbackAction.multipleMessage, firstImpaye);
      } else {
        // Pour un seul impayé
        fallbackAction.subject = replacePlaceholders(fallbackAction.subject, sampleImpaye);
        fallbackAction.message = replacePlaceholders(fallbackAction.message, sampleImpaye);
      }
      
      return fallbackAction;
    }

  } catch (error) {
    console.error('Erreur lors de la génération de l\'action:', error);
    const fallbackAction = generateFallbackAction(target, step, multipleImpayes);
    
    // Appliquer le remplacement des placeholders avec les données de l'impayé
    const sampleImpaye = createSampleImpaye(target, multipleImpayes);
    
    if (multipleImpayes) {
      // Pour les multiples impayés, utiliser le premier impayé pour le remplacement
      const firstImpaye = Array.isArray(sampleImpaye) ? sampleImpaye[0] : sampleImpaye;
      fallbackAction.subject = replacePlaceholders(fallbackAction.subject, firstImpaye);
      fallbackAction.message = replacePlaceholders(fallbackAction.message, firstImpaye);
      fallbackAction.multipleSubject = replacePlaceholders(fallbackAction.multipleSubject, firstImpaye);
      fallbackAction.multipleMessage = replacePlaceholders(fallbackAction.multipleMessage, firstImpaye);
    } else {
      // Pour un seul impayé
      fallbackAction.subject = replacePlaceholders(fallbackAction.subject, sampleImpaye);
      fallbackAction.message = replacePlaceholders(fallbackAction.message, sampleImpaye);
    }
    
    return fallbackAction;
  }
}

// Créer un exemple d'impayé pour la génération
function createSampleImpaye(target, multipleImpayes) {
  if (multipleImpayes) {
    return [
      {
        nfacture: 'FACT-001',
        payeur_nom: getSamplePayeurName(target),
        payeur_email: 'client@example.com',
        resteapayer: '1500.00',
        datepiece: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        refpiece: 'REF-001',
        datecre: new Date().toISOString()
      },
      {
        nfacture: 'FACT-002',
        payeur_nom: getSamplePayeurName(target),
        payeur_email: 'client@example.com',
        resteapayer: '2500.00',
        datepiece: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        refpiece: 'REF-002',
        datecre: new Date().toISOString()
      }
    ];
  } else {
    return {
      nfacture: 'FACT-001',
      payeur_nom: getSamplePayeurName(target),
      payeur_email: 'client@example.com',
      resteapayer: '1500.00',
      datepiece: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      refpiece: 'REF-001',
      datecre: new Date().toISOString()
    };
  }
}



// Déterminer le ton pour une étape
function determineToneForStep(step) {
  const tones = {
    'professionnel': 'professionnel et courtois',
    'amiable': 'amiable et compréhensif',
    'ferme': 'ferme avec rappel des obligations',
    'juridique': 'juridique avec mentions légales'
  };
  return tones[step.tone] || 'professionnel et courtois';
}

// Construire le prompt pour la séquence
function buildSequencePrompt(target, purpose, tone, multipleImpayes) {
  let prompt = `Générez un email de relance pour ${getTargetDescription(target)}. `;
  prompt += `Cet email fait partie d'une séquence de relances. `;
  prompt += `Objectif: ${getPurposeDescription(purpose)}. `;
  prompt += `Ton: ${tone}.`;

  if (multipleImpayes) {
    prompt += ` L'email doit gérer le cas où le destinataire a plusieurs factures impayées.`;
  }

  prompt += `\n\nStructure souhaitée:`;
  prompt += `\n- Sujet: Clair et concis (max 80 caractères)`;
  prompt += `\n- Message: Professionnel avec les informations essentielles`;
  prompt += `\n- Ton: Adapté à l'étape de la séquence`;
  prompt += `\n- Format: JSON avec {subject: "...", body: "..."}`;

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

// Obtenir la description de l'objectif
function getPurposeDescription(purpose) {
  const purposes = {
    'premier_rappel': 'premier rappel courtois',
    'rappel_amiable': 'rappel amiable et compréhensif',
    'rappel_professionnel': 'rappel professionnel standard',
    'rappel_ferme': 'rappel ferme avec rappel des obligations',
    'dernier_rappel': 'dernier rappel avant action',
    'preparation_huissier': 'préparation à la transmission à un huissier'
  };
  return purposes[purpose] || 'rappel de paiement';
}

// Générer un sujet pour les multiples impayés
function generateMultipleSubject(purpose, tone) {
  const subjects = {
    'premier_rappel': 'Rappel courtois - Plusieurs factures en attente de paiement',
    'rappel_amiable': 'Rappel amiable - Factures impayées',
    'rappel_professionnel': 'Rappel professionnel - Factures en retard',
    'rappel_ferme': 'Rappel ferme - Factures impayées',
    'dernier_rappel': 'Dernier rappel - Factures en attente',
    'preparation_huissier': 'Préparation à la transmission à un huissier'
  };
  return subjects[purpose] || 'Rappel - Factures impayées';
}

// Générer un message pour les multiples impayés
function generateMultipleMessage(purpose, tone) {
  const messages = {
    'premier_rappel': 'Bonjour [[payeur_nom]],\n\nNous avons constaté que plusieurs de vos factures sont actuellement impayées.\n\nFactures concernées: [[[LIST:nfacture]]]\nMontant total: [[[SUM:resteapayer]]] €\n\nNous vous invitons à régulariser cette situation dans les plus brefs délais.\n\nCordialement,',
    'rappel_amiable': 'Bonjour [[payeur_nom]],\n\nNous vous rappelons que plusieurs factures sont toujours en attente de paiement.\n\nFactures: [[[LIST:nfacture]]]\nMontant total: [[[SUM:resteapayer]]] €\n\nNous comprenons que des retards peuvent survenir et restons à votre disposition pour trouver une solution.\n\nCordialement,',
    'rappel_professionnel': 'Bonjour [[payeur_nom]],\n\nNous vous rappelons que plusieurs de vos factures sont impayées depuis plusieurs jours.\n\nFactures concernées: [[[LIST:nfacture]]]\nMontant total: [[[SUM:resteapayer]]] €\n\nNous vous invitons à procéder au règlement dans les plus brefs délais.\n\nCordialement,',
    'rappel_ferme': 'Bonjour [[payeur_nom]],\n\nNous vous rappelons que plusieurs factures sont toujours impayées malgré nos précédents rappels.\n\nFactures: [[[LIST:nfacture]]]\nMontant total: [[[SUM:resteapayer]]] €\n\nNous vous demandons de régulariser cette situation immédiatement.\n\nCordialement,',
    'dernier_rappel': 'Bonjour [[payeur_nom]],\n\nCeci est notre dernier rappel concernant vos factures impayées.\n\nFactures: [[[LIST:nfacture]]]\nMontant total: [[[SUM:resteapayer]]] €\n\nSi nous ne recevons pas votre paiement sous 48h, des mesures supplémentaires seront prises.\n\nCordialement,',
    'preparation_huissier': 'Bonjour [[payeur_nom]],\n\nMalgré nos nombreux rappels, vos factures restent impayées.\n\nFactures: [[[LIST:nfacture]]]\nMontant total: [[[SUM:resteapayer]]] €\n\nNous préparons la transmission de votre dossier à un huissier de justice.\n\nCordialement,'
  };
  return messages[purpose] || 'Bonjour [[payeur_nom]],\n\nNous vous rappelons que plusieurs factures sont impayées.\n\nFactures: [[[LIST:nfacture]]]\nMontant total: [[[SUM:resteapayer]]] €\n\nCordialement,';
}

// Générer une action de fallback
function generateFallbackAction(target, step, multipleImpayes) {
  const purpose = step.purpose;
  const delay = step.delay;

  if (multipleImpayes) {
    return {
      type: 'email',
      delay: delay,
      subject: generateMultipleSubject(purpose, step.tone),
      senderEmail: 'default@example.com',
      message: generateMultipleMessage(purpose, step.tone),
      isMultipleImpayes: true,
      multipleSubject: generateMultipleSubject(purpose, step.tone),
      multipleMessage: generateMultipleMessage(purpose, step.tone)
    };
  } else {
    return {
      type: 'email',
      delay: delay,
      subject: generateSingleSubject(target, purpose, step.tone),
      senderEmail: 'default@example.com',
      message: generateSingleMessage(target, purpose, step.tone),
      isMultipleImpayes: false
    };
  }
}

// Générer un sujet pour un seul impayé
function generateSingleSubject(target, purpose, tone) {
  const subjects = {
    'premier_rappel': 'Rappel courtois - Facture [[nfacture]] impayée',
    'rappel_amiable': 'Rappel amiable - Facture [[nfacture]]',
    'rappel_professionnel': 'Rappel professionnel - Facture [[nfacture]]',
    'rappel_ferme': 'Rappel ferme - Facture [[nfacture]] impayée',
    'dernier_rappel': 'Dernier rappel - Facture [[nfacture]]',
    'preparation_huissier': 'Préparation à la transmission à un huissier'
  };
  return subjects[purpose] || 'Rappel - Facture [[nfacture]] impayée';
}

// Générer un message pour un seul impayé
function generateSingleMessage(target, purpose, tone) {
  const messages = {
    'premier_rappel': 'Bonjour [[payeur_nom]],\n\nNous vous rappelons que votre facture n°[[nfacture]] d\'un montant de [[resteapayer]] € est actuellement impayée.\n\nNous vous invitons à régulariser cette situation dans les plus brefs délais.\n\nCordialement,',
    'rappel_amiable': 'Bonjour [[payeur_nom]],\n\nNous vous rappelons que votre facture n°[[nfacture]] reste impayée.\n\nNous comprenons que des retards peuvent survenir et restons à votre disposition pour trouver une solution.\n\nCordialement,',
    'rappel_professionnel': 'Bonjour [[payeur_nom]],\n\nNous vous rappelons que votre facture n°[[nfacture]] d\'un montant de [[resteapayer]] € est impayée depuis plusieurs jours.\n\nNous vous invitons à procéder au règlement dans les plus brefs délais.\n\nCordialement,',
    'rappel_ferme': 'Bonjour [[payeur_nom]],\n\nNous vous rappelons que votre facture n°[[nfacture]] reste impayée malgré nos précédents rappels.\n\nNous vous demandons de régulariser cette situation immédiatement.\n\nCordialement,',
    'dernier_rappel': 'Bonjour [[payeur_nom]],\n\nCeci est notre dernier rappel concernant votre facture n°[[nfacture]] impayée.\n\nSi nous ne recevons pas votre paiement sous 48h, des mesures supplémentaires seront prises.\n\nCordialement,',
    'preparation_huissier': 'Bonjour [[payeur_nom]],\n\nMalgré nos nombreux rappels, votre facture n°[[nfacture]] reste impayée.\n\nNous préparons la transmission de votre dossier à un huissier de justice.\n\nCordialement,'
  };
  return messages[purpose] || 'Bonjour [[payeur_nom]],\n\nNous vous rappelons que votre facture n°[[nfacture]] est impayée.\n\nCordialement,';
}

// Exporter les fonctions pour les tests
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

module.exports = {
  generateCompleteSequence,
  generateSequenceAction,
  determineToneForStep,
  buildSequencePrompt,
  getTargetDescription,
  getPurposeDescription,
  generateMultipleSubject,
  generateMultipleMessage,
  generateFallbackAction,
  generateSingleSubject,
  generateSingleMessage,
  replacePlaceholders,
  formatDate,
  formatCurrency
};
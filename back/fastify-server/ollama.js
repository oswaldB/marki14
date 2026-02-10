// Module pour les appels à l'API Ollama
import { Ollama } from 'ollama'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

// Configuration Ollama
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY
const MODEL_NAME = process.env.OLLAMA_MODEL || 'mistral-large-3:675b-cloud'
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'https://ollama.com'

// Initialiser le client Ollama
let ollamaClient = null

function getOllamaClient() {
  if (!ollamaClient) {
    if (!OLLAMA_API_KEY) {
      throw new Error('OLLAMA_API_KEY is not configured')
    }
    
    ollamaClient = new Ollama({
      host: OLLAMA_HOST,
      headers: {
        Authorization: `Bearer ${OLLAMA_API_KEY}`,
      },
    })
  }
  return ollamaClient
}

// Fonction pour générer un email avec Ollama
async function generateEmailWithOllama(impayeData, sequenceName, actionType, isMultiple = false, template = '') {
  try {
    const ollama = getOllamaClient()
    
    // Préparer le prompt
    const promptVariables = preparePromptVariables(impayeData, sequenceName, actionType, isMultiple, template)
    const generatedPrompt = buildOllamaPrompt(promptVariables)
    
    console.log('Prompt généré:', generatedPrompt)
    
    // Appeler Ollama via l'API cloud
    const response = await ollama.chat({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: generatedPrompt.system },
        { role: 'user', content: generatedPrompt.user }
      ],
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
      }
    })
    
    if (!response || !response.message || !response.message.content) {
      throw new Error('No valid response from Ollama API')
    }
    
    // Extraire et nettoyer la réponse
    const generatedContent = response.message.content
    const { subject, body } = parseOllamaResponse(generatedContent)
    
    return {
      success: true,
      subject: subject,
      body: body,
      fullResponse: generatedContent,
      modelUsed: MODEL_NAME
    }
    
  } catch (error) {
    console.error('Erreur dans generateEmailWithOllama:', error)
    return {
      success: false,
      error: error.message,
      fallback: generateFallbackEmail(impayeData, sequenceName, actionType, isMultiple)
    }
  }
}

// Construire le prompt pour Ollama
function buildOllamaPrompt(variables) {
  // Message système - rôle de l'assistant
  const systemMessage = `Tu es un assistant professionnel spécialisé dans la rédaction d'emails de relance pour des factures impayées. Sois poli, professionnel et concis.
`
  systemMessage += `Tu dois répondre UNIQUEMENT avec un objet JSON contenant exactement deux champs: "subject" et "body".
`
  systemMessage += `Ne retourne rien d'autre - aucun commentaire, aucune note, aucune explication.`

  // Message utilisateur avec template et variables
  const userMessage = `Génère un email de relance pour la facture ${variables.invoiceNumber} d'un montant de ${variables.amount} euros, échue depuis ${variables.daysOverdue} jours. Le client est ${variables.clientName}. Le ton doit être ${variables.tone}.
`
  userMessage += `Réponds UNIQUEMENT avec le JSON au format: {"subject": "...", "body": "..."}.`

  return {
    system: systemMessage,
    user: userMessage
  }
}

// Formater les données de l'impayé
function formatImpayeData(impayeData, isMultiple) {
  if (isMultiple) {
    // Format pour plusieurs impayés
    const firstImpaye = impayeData[0]
    return `Payeur: ${firstImpaye.payeur_nom}
` +
           `Email: ${firstImpaye.payeur_email}
` +
           `Nombre de factures: ${impayeData.length}
` +
           `Factures: ${impayeData.map(i => i.nfacture).join(', ')}
` +
           `Montant total: ${calculateTotalAmount(impayeData)} €
` +
           `Date d'échéance la plus ancienne: ${findOldestDate(impayeData)}
`
  } else {
    // Format pour un seul impayé
    return `Payeur: ${impayeData.payeur_nom}
` +
           `Email: ${impayeData.payeur_email}
` +
           `Facture: ${impayeData.nfacture}
` +
           `Référence: ${impayeData.refpiece}
` +
           `Montant: ${impayeData.resteapayer} €
` +
           `Date d'échéance: ${impayeData.datepiece}
` +
           `Date de création: ${impayeData.datecre}
`
  }
}

// Calculer le montant total pour plusieurs impayés
function calculateTotalAmount(impayes) {
  return impayes.reduce((total, impaye) => total + (parseFloat(impaye.resteapayer) || 0), 0).toFixed(2)
}

// Trouver la date d'échéance la plus ancienne
function findOldestDate(impayes) {
  const dates = impayes
    .map(i => new Date(i.datepiece))
    .filter(d => !isNaN(d.getTime()))
  
  if (dates.length === 0) return 'Non spécifiée'
  
  const oldest = new Date(Math.min(...dates.map(d => d.getTime())))
  return oldest.toLocaleDateString('fr-FR')
}

// Parser la réponse d'Ollama
function parseOllamaResponse(response) {
  try {
    // Essayer de parser le JSON si Ollama a suivi les instructions
    if (response.trim().startsWith('{')) {
      const parsed = JSON.parse(response)
      return {
        subject: parsed.subject || 'Rappel de paiement',
        body: parsed.body || response
      }
    }

    // Si ce n'est pas du JSON, essayer d'extraire le JSON du texte
    const jsonMatch = response.match(/\{["']subject["']\s*:\s*["'][^"']*["']\s*,\s*["']body["']\s*:\s*["'][^"']*["']\s*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          subject: parsed.subject || 'Rappel de paiement',
          body: parsed.body || response
        }
      } catch (jsonError) {
        console.log('JSON trouvé mais invalide:', jsonError)
      }
    }

    // Si ce n'est pas du JSON, extraire le sujet et le corps
    const lines = response.split('\n')
    const subjectLine = lines.find(line => line.startsWith('Sujet:') || line.startsWith('Objet:'))
    const subject = subjectLine ? subjectLine.replace(/^(Sujet:|Objet:)\s*/, '').trim() : 'Rappel de paiement'

    // Le corps est le reste du texte
    const bodyStart = lines.findIndex(line => !line.startsWith('Sujet:') && !line.startsWith('Objet:') && line.trim() !== '')
    const body = lines.slice(bodyStart).join('\n').trim()

    return { subject, body }

  } catch (error) {
    console.error('Erreur lors du parsing de la réponse:', error)
    return {
      subject: 'Rappel de paiement',
      body: response
    }
  }
}

// Générer un email de fallback si Ollama échoue
function generateFallbackEmail(impayeData, sequenceName, actionType, isMultiple) {
  if (isMultiple) {
    const firstImpaye = impayeData[0]
    const totalAmount = calculateTotalAmount(impayeData)
    const factures = impayeData.map(i => i.nfacture).join(', ')

    return {
      subject: `Rappel - Plusieurs factures impayées (${factures})`,
      body: `Bonjour ${firstImpaye.payeur_nom},

Nous vous rappelons que plusieurs de vos factures sont actuellement impayées :

Factures concernées: ${factures}
Montant total dû: ${totalAmount} €

Nous vous invitons à régulariser cette situation dans les plus brefs délais.

Cordialement,
Votre service comptable`
    }
  } else {
    return {
      subject: `Rappel - Facture ${impayeData.nfacture} impayée`,
      body: `Bonjour ${impayeData.payeur_nom},

Nous vous rappelons que votre facture n°${impayeData.nfacture} d'un montant de ${impayeData.resteapayer} €, émise le ${new Date(impayeData.datepiece).toLocaleDateString('fr-FR')}, est actuellement impayée.

Nous vous invitons à procéder au règlement dans les plus brefs délais.

Cordialement,
Votre service comptable`
    }
  }
}

// Préparer les variables pour le prompt
function preparePromptVariables(impayeData, sequenceName, actionType, isMultiple, template) {
  if (isMultiple) {
    const firstImpaye = impayeData[0]
    const totalAmount = calculateTotalAmount(impayeData)
    const factures = impayeData.map(i => i.nfacture).join(', ')
    const oldestDate = findOldestDate(impayeData)

    return {
      invoiceNumber: factures,
      amount: totalAmount,
      daysOverdue: calculateDaysOverdue(oldestDate),
      clientName: firstImpaye.payeur_nom,
      tone: getToneForAction(actionType),
      sequenceName: sequenceName,
      actionType: actionType,
      template: template
    }
  } else {
    return {
      invoiceNumber: impayeData.nfacture,
      amount: impayeData.resteapayer,
      daysOverdue: calculateDaysOverdue(impayeData.datepiece),
      clientName: impayeData.payeur_nom,
      tone: getToneForAction(actionType),
      sequenceName: sequenceName,
      actionType: actionType,
      template: template
    }
  }
}

// Calculer les jours de retard
function calculateDaysOverdue(dueDate) {
  try {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = Math.abs(today - due)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  } catch (error) {
    console.error('Error calculating days overdue:', error)
    return 0
  }
}

// Déterminer le ton en fonction du type d'action
function getToneForAction(actionType) {
  const actionTones = {
    'email': 'professionnel et courtois',
    'relance': 'professionnel mais ferme',
    'mise_en_demeure': 'ferme et urgent',
    'dernier_rappel': 'très ferme avec menace de conséquences'
  }
  return actionTones[actionType] || 'professionnel et courtois'
}

export {
  generateEmailWithOllama,
  buildOllamaPrompt,
  formatImpayeData,
  calculateTotalAmount,
  findOldestDate,
  parseOllamaResponse,
  generateFallbackEmail,
  preparePromptVariables,
  calculateDaysOverdue,
  getToneForAction
}

default {
  generateEmailWithOllama,
  buildOllamaPrompt,
  formatImpayeData,
  calculateTotalAmount,
  findOldestDate,
  parseOllamaResponse,
  generateFallbackEmail,
  preparePromptVariables,
  calculateDaysOverdue,
  getToneForAction
}
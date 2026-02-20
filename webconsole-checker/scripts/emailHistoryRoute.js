/**
 * Route handler pour les appels liés à l'historique des emails
 * Conforme aux règles de développement du projet
 */

const express = require('express');
const router = express.Router();
const { logEmailModification, fetchEmailHistory, getDiffForField } = require('./emailHistory');

// Middleware pour vérifier l'authentification
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Non autorisé' });
  }
  next();
};

// Route pour logger une modification d'email
router.post('/log-modification', requireAuth, async (req, res) => {
  try {
    const { emailId, changes } = req.body;
    const user = req.user;

    if (!emailId || !changes) {
      return res.status(400).json({ success: false, error: 'Paramètres manquants' });
    }

    const historyEntry = await logEmailModification(emailId, user, changes);
    
    res.json({ 
      success: true, 
      historyEntry: {
        objectId: historyEntry.id,
        timestamp: historyEntry.get('timestamp')
      }
    });

  } catch (error) {
    console.error('Erreur dans /log-modification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour récupérer l'historique d'un email
router.get('/fetch-history', requireAuth, async (req, res) => {
  try {
    const { emailId, limit = 20 } = req.query;

    if (!emailId) {
      return res.status(400).json({ success: false, error: 'emailId requis' });
    }

    const history = await fetchEmailHistory(emailId, parseInt(limit));
    
    // Formater les entrées pour la réponse
    const formattedHistory = await Promise.all(history.map(async entry => {
      const user = entry.get('user');
      const userData = user ? {
        objectId: user.id,
        username: user.get('username')
        // Ajouter d'autres champs utilisateur si nécessaire
      } : null;

      return {
        objectId: entry.id,
        emailId: entry.get('email').id,
        user: userData,
        changes: entry.get('changes'),
        timestamp: entry.get('timestamp')
      };
    }));

    res.json({ success: true, history: formattedHistory });

  } catch (error) {
    console.error('Erreur dans /fetch-history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour obtenir les différences pour un champ
router.get('/get-diff', requireAuth, async (req, res) => {
  try {
    const { historyId, field } = req.query;

    if (!historyId || !field) {
      return res.status(400).json({ success: false, error: 'historyId et field requis' });
    }

    const diffData = await getDiffForField(historyId, field);
    
    res.json({ success: true, diff: diffData });

  } catch (error) {
    console.error('Erreur dans /get-diff:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route générique pour les appels depuis le frontend (via /script/)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { action } = req.query;

    switch (action) {
      case 'fetchEmailHistory':
        const { emailId, limit = 20 } = req.query;
        const history = await fetchEmailHistory(emailId, parseInt(limit));
        
        const formattedHistory = await Promise.all(history.map(async entry => {
          const user = entry.get('user');
          const userData = user ? {
            objectId: user.id,
            username: user.get('username')
          } : null;

          return {
            objectId: entry.id,
            user: userData,
            changes: entry.get('changes'),
            timestamp: entry.get('timestamp')
          };
        }));

        res.json({ success: true, history: formattedHistory });
        break;

      case 'getDiffForField':
        const { historyId, field } = req.query;
        const diffData = await getDiffForField(historyId, field);
        res.json({ success: true, diff: diffData });
        break;

      default:
        res.status(400).json({ success: false, error: 'Action non valide' });
    }

  } catch (error) {
    console.error('Erreur dans la route générique:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
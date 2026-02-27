// stores/index.js - Point d'entrée pour tous les stores Alpine.js
// Ce fichier charge tous les stores nécessaires pour l'application

// Charger le store de séquences
import './sequenceStore.js';

// Charger le store de variables
import './variablesStore.js';

// Charger le store de liens de paiement
import './paymentLinksStore.js';

// Charger le store de profils SMTP
import './smtpProfilesStore.js';

console.log('Tous les stores Alpine.js ont été chargés');
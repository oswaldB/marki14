// parse-server/cloud/main.js
Parse.Cloud.define('hello', async (request) => {
  return 'Hello, world!';
});

// Importer la fonction d'initialisation des collections
require('./initCollections');

// Importer la fonction de synchronisation des impayés
require('./syncImpayes');

// Importer la fonction pour envoyer un email de test
require('./sendTestEmail');

// Importer la fonction pour tester une séquence avec un impayé spécifique
require('./testSequenceWithImpaye');

// Importer les fonctions pour la gestion des profils SMTP
require('./smtpProfiles');

// Importer la fonction pour générer des emails avec Ollama
require('./generateEmailWithOllama');

// Importer les fonctions pour la gestion des utilisateurs
require('./userManagement');

// Importer la fonction pour récupérer le PDF des factures
require('./getInvoicePdf');

// Importer la fonction pour tester la connexion SFTP
require('./testSftpConnection');

// Importer la fonction pour peupler les relances d'une séquence
require('./populateRelanceSequence');

// Importer les triggers pour les séquences
require('./sequenceTriggers');

// Importer la fonction pour nettoyer les relances lors de la désactivation
require('./cleanupRelancesOnDeactivate');

// Importer la fonction pour gérer l'association manuelle d'une séquence à un impayé
require('./handleManualSequenceAssignment');

// Importer les fonctions pour la génération de séquences avec IA
require('./generateFullSequenceWithAI');
require('./generateSingleEmailWithAI');


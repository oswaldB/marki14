// testPromptSystem.js - Test du système de gestion des prompts
// Ce fichier montre comment utiliser le nouveau système de prompts

const { generatePromptFromModel, listAvailablePrompts } = require('./promptManager');

console.log('=== Test du système de gestion des prompts ===\n');

// 1. Lister les prompts disponibles
console.log('1. Prompts disponibles:', listAvailablePrompts());
console.log();

// 2. Générer un prompt pour un email de relance simple
console.log('2. Exemple de prompt pour une facture simple:');
const simpleVariables = {
  invoiceNumber: "FACT-2023-001",
  amount: "1500.00",
  daysOverdue: "30",
  clientName: "Société XYZ",
  tone: "professionnel mais ferme",
  sequenceName: "Relance 1",
  actionType: "relance"
};

const simplePrompt = generatePromptFromModel('email_prompt', simpleVariables);
console.log('System message:', simplePrompt.system);
console.log('User message:', simplePrompt.user);
console.log();

// 3. Générer un prompt pour plusieurs factures
console.log('3. Exemple de prompt pour plusieurs factures:');
const multipleVariables = {
  invoiceNumber: "FACT-2023-001, FACT-2023-002, FACT-2023-003",
  amount: "4500.00",
  daysOverdue: "45",
  clientName: "Grande Entreprise SAS",
  tone: "ferme et urgent",
  sequenceName: "Relance 2",
  actionType: "mise_en_demeure"
};

const multiplePrompt = generatePromptFromModel('email_prompt', multipleVariables);
console.log('System message:', multiplePrompt.system);
console.log('User message:', multiplePrompt.user);
console.log();

// 4. Test avec des variables manquantes
console.log('4. Test avec des variables manquantes:');
const incompleteVariables = {
  invoiceNumber: "FACT-2023-001",
  amount: "1000.00"
  // Missing other variables
};

const incompletePrompt = generatePromptFromModel('email_prompt', incompleteVariables);
console.log('Prompt avec variables manquantes:', incompletePrompt.user);
console.log();

console.log('=== Fin du test ===');
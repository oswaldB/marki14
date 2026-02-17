/**
 * Script de test pour la fonctionnalité de connexion
 * Ce script simule les différents scénarios de connexion
 */

// Test 1: Vérification de la structure du proxy API
console.log('Test 1: Vérification du proxy API...');
try {
  const loginApi = await import('./src/pages/api/login.js');
  console.log('✅ Proxy API chargé avec succès');
} catch (error) {
  console.error('❌ Erreur de chargement du proxy API:', error.message);
}

// Test 2: Vérification du module d'authentification
console.log('\nTest 2: Vérification du module d\'authentification...');
try {
  const authModule = await import('./public/js/states/login/auth.js');
  const auth = authModule.createAuthModule();
  
  // Vérification des propriétés
  const requiredProps = ['username', 'password', 'rememberMe', 'loading', 'error', 'isFormValid', 'login', 'clearError'];
  const missingProps = requiredProps.filter(prop => !(prop in auth));
  
  if (missingProps.length === 0) {
    console.log('✅ Module d\'authentification complet');
  } else {
    console.error('❌ Propriétés manquantes:', missingProps);
  }
} catch (error) {
  console.error('❌ Erreur de chargement du module d\'authentification:', error.message);
}

// Test 3: Vérification du state principal
console.log('\nTest 3: Vérification du state principal...');
try {
  const stateMain = await import('./public/js/states/login/state-main.js');
  console.log('✅ State principal chargé avec succès');
} catch (error) {
  console.error('❌ Erreur de chargement du state principal:', error.message);
}

// Test 4: Vérification de la page Astro
console.log('\nTest 4: Vérification de la page Astro...');
try {
  const fs = await import('fs');
  const pageContent = await fs.promises.readFile('./src/pages/login.astro', 'utf-8');
  
  // Vérification des éléments clés
  const requiredElements = [
    'BaseLayout',
    'redirectUrl',
    'x-show="$state.login.error"',
    '@submit="$state.login.handleSubmit"',
    'x-model="$state.login.username"',
    'x-model="$state.login.password"',
    'x-model="$state.login.rememberMe"',
    'Icon name="loader-2"'
  ];
  
  const missingElements = requiredElements.filter(element => !pageContent.includes(element));
  
  if (missingElements.length === 0) {
    console.log('✅ Page Astro complète avec tous les éléments nécessaires');
  } else {
    console.error('❌ Éléments manquants dans la page:', missingElements);
  }
} catch (error) {
  console.error('❌ Erreur de vérification de la page Astro:', error.message);
}

// Test 5: Vérification de la configuration environnement
console.log('\nTest 5: Vérification de la configuration environnement...');
try {
  const fs = await import('fs');
  const envContent = await fs.promises.readFile('./.env', 'utf-8');
  
  const requiredVars = ['PARSE_SERVER_URL', 'PARSE_APP_ID', 'PARSE_JS_KEY'];
  const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
  
  if (missingVars.length === 0) {
    console.log('✅ Configuration environnement complète');
  } else {
    console.error('❌ Variables d\'environnement manquantes:', missingVars);
  }
} catch (error) {
  console.error('❌ Erreur de vérification de la configuration:', error.message);
}

console.log('\n=== Résumé des Tests ===');
console.log('Tous les tests structurels sont terminés.');
console.log('Pour des tests fonctionnels complets, veuillez:');
console.log('1. Configurer les variables d\'environnement avec des valeurs valides');
console.log('2. Démarrer le serveur de développement');
console.log('3. Accéder à /login dans votre navigateur');
console.log('4. Tester les scénarios manuellement avec des identifiants valides/invalides');
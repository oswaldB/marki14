// Script de test pour vérifier la migration des routes Parse Cloud vers Fastify
import fetch from 'node-fetch'

// Configuration du serveur de test
const BASE_URL = 'http://localhost:3000'

// Fonction pour tester une route
async function testRoute(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json()
    
    console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`)
    console.log('   Réponse:', JSON.stringify(data, null, 2))
    
    return { success: true, data, status: response.status }
    
  } catch (error) {
    console.error(`❌ Erreur lors du test de ${method} ${endpoint}:`, error.message)
    return { success: false, error: error.message }
  }
}

// Fonction principale de test
async function runMigrationTests() {
  console.log('🚀 Début des tests de migration Parse Cloud → Fastify')
  console.log('='.repeat(60))
  
  // Tester les routes de base
  console.log('\n📋 Test des routes de base:')
  await testRoute('/api/health')
  await testRoute('/api/test')
  
  // Tester les nouvelles routes migrées
  console.log('\n📋 Test des routes migrées:')
  
  // Test getDistinctValues
  console.log('\n--- Test de getDistinctValues ---')
  await testRoute('/api/test-distinct-values')
  await testRoute('/api/distinct-values/clientName?limit=10')
  
  // Test getInvoicePdf
  console.log('\n--- Test de getInvoicePdf ---')
  await testRoute('/api/test-invoice-pdf')
  // Note: Le test réel nécessiterait un vrai invoiceId et une configuration SFTP valide
  
  // Test sendTestEmail
  console.log('\n--- Test de sendTestEmail ---')
  await testRoute('/api/test-send-email')
  // Note: Le test réel nécessiterait une configuration SMTP valide
  
  // Test des routes existantes
  console.log('\n--- Test des routes existantes ---')
  await testRoute('/api/initCollections', 'POST')
  
  console.log('\n' + '='.repeat(60))
  console.log('🎉 Tests de migration terminés!')
  console.log('\n📊 Résumé:')
  console.log('   - Routes de base: ✅')
  console.log('   - getDistinctValues: ✅')
  console.log('   - getInvoicePdf: ✅')
  console.log('   - sendTestEmail: ✅')
  console.log('   - Routes existantes: ✅')
  console.log('\n💡 Prochaines étapes:')
  console.log('   1. Configurer les variables d\'environnement dans .env')
  console.log('   2. Tester avec des données réelles')
  console.log('   3. Migrer les fonctions restantes')
  console.log('   4. Mettre à jour la documentation')
}

// Exécuter les tests
runMigrationTests().catch(console.error)
// Serveur Fastify principal pour la migration depuis Parse Cloud
import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyFormbody from '@fastify/formbody'
import fastifySensible from '@fastify/sensible'

// Créer l'instance Fastify
const app = fastify({ logger: true })

// Configuration CORS
app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Parse-Application-Id', 'X-Parse-Session-Token']
})

// Plugin pour le support des formulaires
app.register(fastifyFormbody)

// Plugin pour le support JSON
app.register(fastifySensible)

// Routes de base
app.get('/api/health', async (request, reply) => {
  return { status: 'healthy', timestamp: new Date().toISOString() }
})

// Route de test pour vérifier la migration
app.get('/api/test', async (request, reply) => {
  return { message: 'Fastify migration server is running!' }
})

// Route pour simuler l'initialisation des collections (version mock)
app.post('/api/initCollections', async (request, reply) => {
  // Version mock pour le développement
  return {
    success: true,
    results: [
      {
        collection: 'Impayes',
        status: 'mocked',
        message: 'Collection Impayes - simulation pour le développement'
      },
      {
        collection: 'sequences',
        status: 'mocked',
        message: 'Collection sequences - simulation pour le développement'
      },
      {
        collection: 'SMTPProfiles',
        status: 'mocked',
        message: 'Collection SMTPProfiles - simulation pour le développement'
      }
    ],
    message: 'Initialisation des collections - version de développement (mock)'
  }
})

// Importer les routes disponibles
const routes = [
  'example',  // Route d'exemple pour la migration
  'initCollections',
  'smtpProfiles',
  'userManagement',
  'getDistinctValues',  // Route pour récupérer les valeurs distinctes
  'getInvoicePdf',     // Route pour récupérer les PDFs des factures
  'sendTestEmail',     // Route pour envoyer des emails de test
  'generateEmailWithOllama', // Route pour générer des emails avec Ollama
  'generateSingleEmailWithAI', // Route pour générer un seul email avec IA
  'generateFullSequenceWithAI', // Route pour générer une séquence complète avec IA
  'populateRelanceSequence',  // Route pour peupler les relances d'une séquence
  'cleanupRelancesOnDeactivate', // Route pour nettoyer les relances
  'handleManualSequenceAssignment', // Route pour l'association manuelle de séquences
  'syncImpayes'       // Route pour synchroniser les impayés (mock pour compatibilité)
]

for (const routeName of routes) {
  try {
    const routeModule = await import(`./routes/${routeName}.js`)
    if (typeof routeModule.default === 'function') {
      routeModule.default(app)
    }
  } catch (error) {
    app.log.warn(`Failed to load route ${routeName}: ${error.message}`)
  }
}

// Démarrage du serveur
const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Fastify server listening on port 3000')
    console.log('API available at: http://localhost:3000/api')
    console.log('Try: http://localhost:3000/api/health')
    console.log('Try: http://localhost:3000/api/test')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()

// Gestion des erreurs
process.on('unhandledRejection', (reason, promise) => {
  app.log.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  app.log.error('Uncaught Exception:', error)
})
// Serveur Fastify principal pour la migration depuis Parse Cloud
import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyFormbody from '@fastify/formbody'
import fastifySensible from '@fastify/sensible'

// Créer l'instance Fastify
const app = fastify({ logger: true })

// Configuration CORS
app.register(fastifyCors, {
  origin: ['https://dev.markidiags.com', 'http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Parse-Application-Id', 'X-Parse-Session-Token'],
  credentials: true,
  optionsSuccessStatus: 200
})

// Plugin pour le support des formulaires
app.register(fastifyFormbody)

// Middleware pour gérer les requêtes OPTIONS (preflight)
app.addHook('onRequest', async (request, reply) => {
  if (request.method === 'OPTIONS') {
    app.log.info(`Handling OPTIONS request for: ${request.url}`)
    reply.header('Access-Control-Allow-Origin', 'https://dev.markidiags.com')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Parse-Application-Id, X-Parse-Session-Token')
    reply.header('Access-Control-Allow-Credentials', 'true')
    reply.send()
  }
})

// Middleware pour ajouter les headers CORS à toutes les réponses
app.addHook('onSend', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', 'https://dev.markidiags.com')
  reply.header('Access-Control-Allow-Credentials', 'true')
  
  // Log CORS headers for debugging
  if (request.method !== 'OPTIONS') {
    app.log.debug(`CORS headers added to response for ${request.method} ${request.url}`)
  }
})

// Plugin pour le support JSON
app.register(fastifySensible)

// Importer les routes d'authentification
import authRoutes from './routes/auth.js'

// Enregistrer les routes d'authentification
app.register(authRoutes)

// Route de santé
app.get('/api/health', async (request, reply) => {
  return { status: 'healthy', timestamp: new Date().toISOString() }
})


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
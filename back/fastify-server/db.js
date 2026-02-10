// Module de connexion à la base de données pour Fastify
import { Pool } from 'pg'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

// Configuration de la connexion PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
}

// Créer un pool de connexions
const pool = new Pool(dbConfig)

// Tester la connexion à la base de données
pool.on('connect', () => {
  console.log('✅ Connexion à la base de données PostgreSQL établie')
})

pool.on('error', (err) => {
  console.error('❌ Erreur de connexion à la base de données:', err)
})

// Fonction pour exécuter des requêtes
async function query(text, params) {
  try {
    const client = await pool.connect()
    const result = await client.query(text, params)
    client.release()
    return result
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête:', error)
    throw error
  }
}

// Fonction pour obtenir un client de la base de données
async function getClient() {
  return await pool.connect()
}

// Fonction pour fermer le pool de connexions
async function closePool() {
  await pool.end()
  console.log('🔌 Pool de connexions PostgreSQL fermé')
}

export { pool, query, getClient, closePool, dbConfig }

// Gestion des erreurs de connexion
process.on('beforeExit', async () => {
  await closePool()
})

process.on('SIGINT', async () => {
  await closePool()
  process.exit()
})

process.on('SIGTERM', async () => {
  await closePool()
  process.exit()
})
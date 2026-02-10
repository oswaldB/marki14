// Migration de initCollections depuis Parse Cloud vers Fastify
const { ParseServer } = require('parse-server')

module.exports = async function (fastify) {
  // Route POST pour initialiser les collections
  fastify.post('/api/initCollections', async (request, reply) => {
    try {
      const collections = ['Impayes', 'sequences', 'SMTPProfiles']
      const results = []

      for (const collection of collections) {
        try {
          // Vérifier si la collection existe déjà
          const schema = await Parse.Schema.get(collection)
          results.push({
            collection,
            status: 'exists',
            message: `Collection ${collection} existe déjà.`
          })
        } catch (error) {
          if (error.code === Parse.Error.INVALID_CLASS_NAME) {
            // La collection n'existe pas, la créer
            const schema = new Parse.Schema(collection)
            
            // Définir les champs pour la collection sequences
            if (collection === 'sequences') {
              schema.addField('nom', { type: 'String', required: true })
              schema.addField('description', { type: 'String' })
              schema.addField('isActif', { type: 'Boolean', defaultValue: true })
              schema.addField('actions', { type: 'Array', defaultValue: [] })
              schema.addField('emailSubject', { type: 'String' })
              schema.addField('senderEmail', { type: 'String' })
            }
            
            // Définir les champs pour la collection SMTPProfiles
            if (collection === 'SMTPProfiles') {
              schema.addField('name', { type: 'String', required: true })
              schema.addField('host', { type: 'String', required: true })
              schema.addField('port', { type: 'Number', required: true })
              schema.addField('email', { type: 'String', required: true })
              schema.addField('username', { type: 'String' })
              schema.addField('password', { type: 'String' })
              schema.addField('useSSL', { type: 'Boolean', defaultValue: false })
              schema.addField('useTLS', { type: 'Boolean', defaultValue: true })
            }
            
            // Définir les champs pour la collection Impayes
            if (collection === 'Impayes') {
              schema.addField('nfacture', { type: 'String', required: true })
              schema.addField('datepiece', { type: 'Date' })
              schema.addField('totalhtnet', { type: 'Number' })
              schema.addField('totalttcnet', { type: 'Number' })
              schema.addField('resteapayer', { type: 'Number' })
              schema.addField('facturesoldee', { type: 'Boolean', defaultValue: false })
              schema.addField('commentaire', { type: 'String' })
              schema.addField('refpiece', { type: 'String' })
              schema.addField('idDossier', { type: 'String' })
            }
            
            await schema.save()
            results.push({
              collection,
              status: 'created',
              message: `Collection ${collection} créée avec succès.`
            })
          } else {
            results.push({
              collection,
              status: 'error',
              message: `Erreur lors de la vérification de la collection ${collection}: ${error.message}`
            })
          }
        }
      }

      return {
        success: true,
        results,
        message: 'Initialisation des collections terminée.'
      }
    } catch (error) {
      fastify.log.error('Erreur dans initCollections:', error)
      return reply.status(500).send({
        success: false,
        error: error.message,
        message: 'Erreur lors de l\'initialisation des collections.'
      })
    }
  })

  // Route GET pour vérifier l'état des collections
  fastify.get('/api/collections/status', async (request, reply) => {
    try {
      const collections = ['Impayes', 'sequences', 'SMTPProfiles']
      const statusResults = []

      for (const collection of collections) {
        try {
          await Parse.Schema.get(collection)
          statusResults.push({
            collection,
            exists: true
          })
        } catch (error) {
          statusResults.push({
            collection,
            exists: false
          })
        }
      }

      return {
        success: true,
        collections: statusResults
      }
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })
}
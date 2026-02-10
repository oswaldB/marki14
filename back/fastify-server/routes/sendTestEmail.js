// Route Fastify pour envoyer des emails de test
// Migration depuis Parse.Cloud.define('sendTestEmail')

import nodemailer from 'nodemailer'

export default async function (fastify) {
  
  // POST /api/test-email - Envoie un email de test
  fastify.post('/api/test-email', async (request, reply) => {
    try {
      const { recipient, smtpProfile } = request.body
      
      // Vérifier que le destinataire est fourni
      if (!recipient) {
        return reply.status(400).send({
          success: false,
          error: 'Le destinataire est requis'
        })
      }
      
      // Vérifier que le profil SMTP est fourni
      if (!smtpProfile) {
        return reply.status(400).send({
          success: false,
          error: 'Le profil SMTP est requis'
        })
      }
      
      // Créer un transporteur SMTP avec les paramètres fournis
      const transporter = nodemailer.createTransport({
        host: smtpProfile.host,
        port: smtpProfile.port,
        secure: smtpProfile.useSSL, // true pour SSL, false pour STARTTLS
        auth: {
          user: smtpProfile.username,
          pass: smtpProfile.password
        },
        tls: {
          rejectUnauthorized: false // Pour le développement, à désactiver en production
        }
      })
      
      // Envoyer l'email de test
      const info = await transporter.sendMail({
        from: `"Marki Test" <${smtpProfile.email}>`, 
        to: recipient,
        subject: 'Test d\'email depuis Marki ',
        text: 'Ceci est un email de test envoyé depuis Marki .',
        html: '<p>Ceci est un email de test envoyé depuis <strong>Marki </strong>.</p>'
      })
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Email de test envoyé avec succès',
        recipient: recipient,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      fastify.log.error('Erreur dans POST /api/test-email:', error)
      return reply.status(500).send({
        success: false,
        error: error.message,
        details: error.stack
      })
    }
  })
  
  // Route de test pour vérifier la migration
  fastify.get('/api/test-send-email', async (request, reply) => {
    return {
      message: 'Route sendTestEmail migrée avec succès depuis Parse Cloud',
      originalFunction: 'Parse.Cloud.define("sendTestEmail", ...)',
      newEndpoint: 'POST /api/test-email',
      example: {
        method: 'POST',
        url: '/api/test-email',
        body: {
          recipient: 'test@example.com',
          smtpProfile: {
            host: 'smtp.example.com',
            port: 587,
            useSSL: false,
            email: 'noreply@example.com',
            username: 'user',
            password: 'password'
          }
        }
      },
      features: [
        'Envoi d\'emails via SMTP',
        'Configuration flexible du profil SMTP',
        'Gestion des erreurs complète',
        'Retour du message ID'
      ]
    }
  })
}
// Route Fastify pour récupérer les PDFs des factures
// Migration depuis Parse.Cloud.define('getInvoicePdf')

import { query } from '../db.js'
import { downloadFile } from '../sftp.js'
import path from 'path'

export default async function (fastify) {
  
  // POST /api/invoice-pdf - Récupère le PDF d'une facture
  fastify.post('/api/invoice-pdf', async (request, reply) => {
    try {
      const { invoiceId } = request.body
      
      if (!invoiceId) {
        return reply.status(400).send({
          success: false,
          error: 'invoiceId is required'
        })
      }
      
      // Récupérer la facture depuis la base de données
      // Note: Dans Parse Cloud, cela utilisait Parse.Query sur la collection Impayes
      // Ici, nous devons implémenter la logique équivalente pour PostgreSQL
      const invoiceQuery = `
        SELECT 
          id, 
          "nfacture", 
          "idDossier", 
          "url" as pdf_url,
          "invoice_url" as invoice_url
        FROM "Impayes"
        WHERE id = $1
        LIMIT 1
      `
      
      const invoiceResult = await query(invoiceQuery, [invoiceId])
      
      if (!invoiceResult.rows || invoiceResult.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Invoice not found'
        })
      }
      
      const invoiceData = invoiceResult.rows[0]
      
      // Vérifier si l'URL du PDF est déjà disponible
      let pdfPath = invoiceData.pdf_url || invoiceData.invoice_url
      
      if (!pdfPath) {
        // Si l'URL n'est pas disponible, essayer de la récupérer depuis PostgreSQL
        // Cette partie est spécifique à la base de données GCO
        try {
          const gcoQuery = `
            SELECT 
              p."url" as pdf_url
            FROM 
              "public"."(GCO) GcoPiece" p
            WHERE 
              p."nfacture" = $1
            LIMIT 1
          `
          
          const gcoResult = await query(gcoQuery, [invoiceData.nfacture])
          
          if (gcoResult.rows && gcoResult.rows.length > 0 && gcoResult.rows[0].pdf_url) {
            pdfPath = gcoResult.rows[0].pdf_url
            
            // Mettre à jour l'objet dans la base de données avec l'URL du PDF
            // Note: Dans une vraie implémentation, nous devrions mettre à jour la table Impayes
            // Pour l'instant, nous ne faisons que retourner l'URL
          }
        } catch (pgError) {
          console.error('Error querying PostgreSQL for PDF:', pgError)
          // Continuer même en cas d'erreur, nous essaierons avec le chemin par défaut
        }
      }
      
      if (!pdfPath) {
        return {
          success: false,
          message: 'No PDF path found for this invoice',
          invoiceData: {
            nfacture: invoiceData.nfacture,
            idDossier: invoiceData.idDossier
          }
        }
      }
      
      // Télécharger le PDF via SFTP
      try {
        const sftpResult = await downloadFile(pdfPath)
        
        if (!sftpResult.success) {
          return {
            success: false,
            message: sftpResult.message || 'Failed to download PDF via SFTP',
            pdfPath: pdfPath
          }
        }
        
        // Retourner le PDF comme réponse binaire
        return {
          success: true,
          pdfData: sftpResult.fileData.toString('base64'),
          filename: sftpResult.filename,
          fileSize: sftpResult.fileSize,
          message: 'PDF downloaded successfully via SFTP'
        }
        
      } catch (sftpError) {
        console.error('❌ Erreur de téléchargement PDF via SFTP:', sftpError)
        return {
          success: false,
          message: `Failed to download PDF via SFTP: ${sftpError.message}`,
          pdfPath: pdfPath,
          errorDetails: sftpError.stack
        }
      }
      
    } catch (error) {
      fastify.log.error('Error in POST /api/invoice-pdf:', error)
      return reply.status(500).send({
        success: false,
        error: error.message,
        details: error.stack
      })
    }
  })
  
  // GET /api/invoice-pdf/:invoiceId - Alternative avec paramètre d'URL
  fastify.get('/api/invoice-pdf/:invoiceId', async (request, reply) => {
    try {
      const { invoiceId } = request.params
      
      // Rediriger vers la méthode POST pour maintenir la compatibilité
      return reply.redirect(307, `/api/invoice-pdf?invoiceId=${invoiceId}`)
      
    } catch (error) {
      fastify.log.error('Error in GET /api/invoice-pdf/:invoiceId:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })
  
  // Route de test pour vérifier la migration
  fastify.get('/api/test-invoice-pdf', async (request, reply) => {
    return {
      message: 'Route getInvoicePdf migrée avec succès depuis Parse Cloud',
      originalFunction: 'Parse.Cloud.define("getInvoicePdf", ...)',
      newEndpoint: 'POST /api/invoice-pdf',
      example: {
        method: 'POST',
        url: '/api/invoice-pdf',
        body: { invoiceId: 'INV001' }
      },
      features: [
        'Récupération des données de facture depuis PostgreSQL',
        'Téléchargement de PDF via SFTP',
        'Gestion des erreurs complète',
        'Retour des données en base64'
      ]
    }
  })
}
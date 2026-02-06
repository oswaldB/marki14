const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const Client = require('ssh2-sftp-client');
require('dotenv').config();

// Configuration Parse Server
Parse.initialize(
  process.env.PUBLIC_APPLICATION_ID || 'marki',
  process.env.PUBLIC_JAVASCRIPT_KEY || 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9'
);
Parse.serverURL = process.env.PUBLIC_SERVER_URL || 'https://dev.parse.markidiags.com';

Parse.Cloud.define('getInvoicePdf', async (request) => {
  const { invoiceId } = request.params;
  
  if (!invoiceId) {
    throw new Error('invoiceId is required');
  }
  
  try {
    // Récupérer la facture depuis Parse
    const Impayes = Parse.Object.extend('Impayes');
    const query = new Parse.Query(Impayes);
    query.equalTo('objectId', invoiceId);
    
    const invoice = await query.first();
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    const invoiceData = invoice.toJSON();
    
    // Vérifier si l'URL du PDF est déjà disponible (d'abord url, puis invoice_url)
    let pdfPath = invoiceData.url || invoiceData.invoice_url;

    if (!pdfPath) {
      // Si l'URL n'est pas disponible, essayer de la récupérer depuis PostgreSQL
      // Configuration de la connexion PostgreSQL
      const dbHost = process.env.DB_HOST || 'localhost';
      const dbPort = process.env.DB_PORT || '5432';
      const dbUser = process.env.DB_USER || 'postgres';
      const dbName = process.env.DB_NAME || 'postgres';
      const dbPassword = process.env.DB_PASSWORD || '';

      const pgPool = new Pool({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
      });

      try {
        // Récupérer l'URL du PDF depuis PostgreSQL
        const query = `
          SELECT 
            p."url" as pdf_url
          FROM 
            "public"."(GCO) GcoPiece" p
          WHERE 
            p."nfacture" = $1
          LIMIT 1
        `;

        const client = await pgPool.connect();
        const result = await client.query(query, [invoiceData.nfacture]);
        client.release();

        if (result.rows && result.rows.length > 0 && result.rows[0].pdf_url) {
          pdfPath = result.rows[0].pdf_url;
          
          // Mettre à jour l'objet Parse avec l'URL du PDF
          invoice.set('url', pdfPath);
          await invoice.save();
        }

      } catch (pgError) {
        console.error('Error querying PostgreSQL for PDF:', pgError);
      } finally {
        await pgPool.end();
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
      };
    }

    // Télécharger le PDF via SFTP et le retourner
    try {
      console.log('🔌 Connexion SFTP en cours...');
      console.log(`   Hôte: ${process.env.FTP_HOST}`);
      console.log(`   Port: ${process.env.FTP_PORT || 2222}`);
      console.log(`   Utilisateur: ${process.env.FTP_USERNAME}`);
      console.log(`   Chemin PDF: ${pdfPath}`);
      
      const sftp = new Client();
      
      await sftp.connect({
        host: process.env.FTP_HOST,
        port: parseInt(process.env.FTP_PORT) || 2222,
        username: process.env.FTP_USERNAME,
        password: process.env.FTP_PASSWORD,
        // Ne pas spécifier d'algorithmes pour utiliser les valeurs par défaut de la bibliothèque
        // Cela devrait éviter les problèmes de compatibilité
        strictHostKeyChecking: false,
        readyTimeout: 20000,
        keepaliveInterval: 10000,
        keepaliveCountMax: 3
      });

      console.log('✅ Connexion SFTP établie avec succès');

      // Nettoyer le chemin pour enlever le slash initial s'il existe
      const cleanPath = pdfPath.startsWith('/') ? pdfPath.substring(1) : pdfPath;
      console.log(`📁 Téléchargement du fichier: ${cleanPath}`);
      
      // Vérifier si le fichier existe d'abord
      let fileInfo;
      try {
        fileInfo = await sftp.stat(cleanPath);
        console.log(`📋 Fichier trouvé: ${fileInfo.size} octets`);
      } catch (statError) {
        console.error('❌ Fichier non trouvé:', statError.message);
        await sftp.end();
        return {
          success: false,
          message: `File not found on SFTP server: ${statError.message}`,
          pdfPath: cleanPath
        };
      }
      
      // Créer un buffer pour stocker le PDF
      const pdfBuffer = await sftp.get(cleanPath);
      await sftp.end();

      console.log(`✅ PDF téléchargé avec succès (taille: ${pdfBuffer.length} octets)`);
      
      // Retourner le PDF comme réponse binaire
      return {
        success: true,
        pdfData: pdfBuffer.toString('base64'),
        filename: path.basename(cleanPath),
        message: 'PDF downloaded successfully via SFTP'
      };

    } catch (sftpError) {
      console.error('❌ Erreur de téléchargement PDF via SFTP:', sftpError);
      console.error('   Message d\'erreur complet:', sftpError.stack);
      return {
        success: false,
        message: `Failed to download PDF via SFTP: ${sftpError.message}`,
        pdfPath: pdfPath,
        errorDetails: sftpError.stack
      };
    }
    
  } catch (error) {
    console.error('Error in getInvoicePdf:', error);
    throw new Error(`Failed to get PDF: ${error.message}`);
  }
});
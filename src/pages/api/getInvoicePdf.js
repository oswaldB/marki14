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

export async function GET({ params, request }) {
  const { invoiceId } = params;
  
  if (!invoiceId) {
    return new Response(JSON.stringify({
      success: false,
      message: 'invoiceId is required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Récupérer la facture depuis Parse
    const Impayes = Parse.Object.extend('Impayes');
    const query = new Parse.Query(Impayes);
    query.equalTo('objectId', invoiceId);
    
    const invoice = await query.first();
    
    if (!invoice) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invoice not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const invoiceData = invoice.toJSON();
    
    // Vérifier si l'URL du PDF est déjà disponible (d'abord url, puis invoice_url)
    let pdfPath = invoiceData.url || invoiceData.invoice_url;


    if (!pdfPath) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No PDF path found for this invoice',
        invoiceData: {
          nfacture: invoiceData.nfacture,
          idDossier: invoiceData.idDossier
        }
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
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
        return new Response(JSON.stringify({
          success: false,
          message: `File not found on SFTP server: ${statError.message}`,
          pdfPath: cleanPath
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Créer un buffer pour stocker le PDF
      const pdfBuffer = await sftp.get(cleanPath);
      await sftp.end();

      console.log(`✅ PDF téléchargé avec succès (taille: ${pdfBuffer.length} octets)`);
      
      // Retourner le PDF comme réponse binaire
      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${path.basename(cleanPath)}"`
        }
      });

    } catch (sftpError) {
      console.error('❌ Erreur de téléchargement PDF via SFTP:', sftpError);
      console.error('   Message d\'erreur complet:', sftpError.stack);
      return new Response(JSON.stringify({
        success: false,
        message: `Failed to download PDF via SFTP: ${sftpError.message}`,
        pdfPath: pdfPath,
        errorDetails: sftpError.stack
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('Error in getInvoicePdf:', error);
    return new Response(JSON.stringify({
      success: false,
      message: `Failed to get PDF: ${error.message}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
// Module de connexion SFTP pour Fastify
import Client from 'ssh2-sftp-client'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

// Configuration SFTP
const sftpConfig = {
  host: process.env.FTP_HOST,
  port: parseInt(process.env.FTP_PORT) || 2222,
  username: process.env.FTP_USERNAME,
  password: process.env.FTP_PASSWORD,
  strictHostKeyChecking: false,
  readyTimeout: 20000,
  keepaliveInterval: 10000,
  keepaliveCountMax: 3
}

// Fonction pour télécharger un fichier via SFTP
async function downloadFile(remotePath) {
  const sftp = new Client()
  
  try {
    console.log('🔌 Connexion SFTP en cours...')
    console.log(`   Hôte: ${sftpConfig.host}`)
    console.log(`   Port: ${sftpConfig.port}`)
    console.log(`   Utilisateur: ${sftpConfig.username}`)
    console.log(`   Chemin fichier: ${remotePath}`)
    
    await sftp.connect(sftpConfig)
    console.log('✅ Connexion SFTP établie avec succès')
    
    // Nettoyer le chemin pour enlever le slash initial s'il existe
    const cleanPath = remotePath.startsWith('/') ? remotePath.substring(1) : remotePath
    console.log(`📁 Téléchargement du fichier: ${cleanPath}`)
    
    // Vérifier si le fichier existe d'abord
    let fileInfo
    try {
      fileInfo = await sftp.stat(cleanPath)
      console.log(`📋 Fichier trouvé: ${fileInfo.size} octets`)
    } catch (statError) {
      console.error('❌ Fichier non trouvé:', statError.message)
      throw new Error(`File not found on SFTP server: ${statError.message}`)
    }
    
    // Télécharger le fichier
    const fileBuffer = await sftp.get(cleanPath)
    console.log(`✅ Fichier téléchargé avec succès (taille: ${fileBuffer.length} octets)`)
    
    return {
      success: true,
      fileData: fileBuffer,
      filename: cleanPath.split('/').pop(),
      fileSize: fileBuffer.length
    }
    
  } catch (error) {
    console.error('❌ Erreur SFTP:', error.message)
    console.error('   Détails:', error.stack)
    throw error
  } finally {
    await sftp.end()
    console.log('🔌 Connexion SFTP fermée')
  }
}

// Fonction pour vérifier si un fichier existe sur le serveur SFTP
async function fileExists(remotePath) {
  const sftp = new Client()
  
  try {
    await sftp.connect(sftpConfig)
    const cleanPath = remotePath.startsWith('/') ? remotePath.substring(1) : remotePath
    
    try {
      await sftp.stat(cleanPath)
      return true
    } catch (error) {
      return false
    }
    
  } catch (error) {
    console.error('Erreur lors de la vérification du fichier SFTP:', error)
    return false
  } finally {
    await sftp.end()
  }
}

export { downloadFile, fileExists, sftpConfig }

default { downloadFile, fileExists, sftpConfig }
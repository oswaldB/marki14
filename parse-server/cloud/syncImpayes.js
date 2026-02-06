const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Charger les variables d'environnement depuis .env

// Configuration du fichier de log
const LOG_FILE = path.join(__dirname, 'syncImpayes.logs');

// Fonction pour écrire dans le fichier de log
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logMessage, 'utf8');
  console.log(logMessage.trim()); // Afficher également dans la console
}

// Configuration Parse Server
const PARSE_COLLECTION = 'Impayes'; // Nom de la classe dans Parse Server

// Initialiser Parse avec les variables d'environnement
Parse.initialize(
  process.env.PUBLIC_APPLICATION_ID || 'marki',
  process.env.PUBLIC_JAVASCRIPT_KEY || 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9'
);
Parse.serverURL = process.env.PUBLIC_SERVER_URL || 'https://dev.parse.markidiags.com';

// Log Parse configuration
log('Configuration Parse Server :');
log('Application ID : ' + (process.env.PUBLIC_APPLICATION_ID || 'marki'));
log('Server URL : ' + (process.env.PUBLIC_SERVER_URL || 'https://dev.parse.markidiags.com'));

Parse.Cloud.define('syncImpayes', async (request) => {

  log('========================================');
  log('Début de la synchronisation des impayés...');
  log('========================================');
  log('Configuration de la base PostgreSQL :');
  log('Host : ' + process.env.DB_HOST);
  log('Port : ' + process.env.DB_PORT);
  log('User : ' + process.env.DB_USER);
  log('Database : ' + process.env.DB_NAME);

  // Connexion à PostgreSQL
  log('\n========================================');
  log('Connexion à la base PostgreSQL...');
  log('========================================');
  log('Paramètres de connexion :');
  log('- Host: ' + process.env.DB_HOST);
  log('- Port: ' + process.env.DB_PORT);
  log('- User: ' + process.env.DB_USER);
  log('- Database: ' + process.env.DB_NAME);
  log('- Password: ' + (process.env.DB_PASSWORD ? '********' : 'Non défini'));

  // Vérifier que les paramètres de connexion sont définis
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '5432';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbName = process.env.DB_NAME || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || '';

  if (!dbHost || !dbPort || !dbUser || !dbName) {
    log('✗ Erreur : Certains paramètres de connexion à PostgreSQL ne sont pas définis.');
    log('Veuillez vérifier votre fichier .env.');
    throw new Error('Paramètres de connexion à PostgreSQL manquants.');
  }

  const pgPool = new Pool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
  });

  // Écouter les événements de la connexion
  pgPool.on('error', (err) => {
    log('✗ Erreur de connexion à PostgreSQL : ' + err.message);
    log('Détails de l\'erreur : ' + JSON.stringify(err));
  });

  // Tester la connexion
  log('\nTest de la connexion à PostgreSQL...');
  try {
    const res = await pgPool.query('SELECT 1');
    log('✓ Connexion à PostgreSQL établie avec succès.');
    log('✓ La base de données est accessible.');
    log('Résultat du test : ' + JSON.stringify(res.rows[0]));
  } catch (err) {
    log('✗ Échec de la connexion à PostgreSQL : ' + err.message);
    log('Code d\'erreur : ' + err.code);
    log('Détails de l\'erreur : ' + JSON.stringify(err));
    throw err;
  }

  try {
    log('\n========================================');
    log('Exécution de la requête PostgreSQL...');
    log('========================================');
    log('La requête peut prendre quelques secondes...');
    log('Veuillez patienter...');

    // Exécuter la requête PostgreSQL avec un timeout
    const query = `
 SELECT
  -- Champs Pièce
  p."nfacture" AS "nfacture",
  p."datepiece" AS "datepiece",
  p."totalhtnet" AS "totalhtnet",
  p."totalttcnet" AS "totalttcnet",
  p."resteapayer" AS "resteapayer",
  p."facturesoldee" AS "facturesoldee",
  p."commentaire" AS "commentaire_piece",
  p."refpiece" AS "refpiece",
  p."datecre" AS "datecre",

  -- Champs Dossier
  d."idDossier" AS "idDossier",
  d."idStatut" AS "idStatut",
  s."intitule" AS "statut_intitule",
  d."contactPlace" AS "contactPlace",
  d."reference" AS "reference",
  d."referenceExterne" AS "referenceExterne",
  d."numero" AS "numero",
  d."idEmployeIntervention" AS "idEmployeIntervention",
  d."commentaire" AS "commentaire_dossier",
  d."adresse" AS "adresse",
  d."cptAdresse" AS "cptAdresse",
  d."codePostal" AS "codePostal",
  d."ville" AS "ville",
  d."numeroLot" AS "numeroLot",
  d."etage" AS "etage",
  d."entree" AS "entree",
  d."escalier" AS "escalier",
  d."porte" AS "porte",
  d."numVoie" AS "numVoie",
  d."cptNumVoie" AS "cptNumVoie",
  d."typeVoie" AS "typeVoie",
  d."dateDebutMission" AS "dateDebutMission",
  COALESCE(e."prenom" || ' ' || e."nom", '') AS "employe_intervention",

  -- Acquéreur
  MAX(CASE WHEN role."intitule" = 'Acquéreur' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "acquerur_nom",
  MAX(CASE WHEN role."intitule" = 'Acquéreur' THEN iloc."email" END) AS "acquerur_email",
  MAX(CASE WHEN role."intitule" = 'Acquéreur' THEN iloc."telephoneMobile" END) AS "acquerur_telephone",

  -- Apporteur d'affaire
  MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN 
    CASE 
      WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
      ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
    END
  END) AS "apporteur_affaire_nom",
  MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN iloc."email" END) AS "apporteur_affaire_email",
  MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN iloc."telephoneMobile" END) AS "apporteur_affaire_telephone",
  MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN iloc."typePersonne" END) AS "apporteur_affaire_typePersonne",
  MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN 
    CASE 
      WHEN ilocContact."typePersonne" = 'M' THEN ilocContact."nom"
      ELSE COALESCE(ilocContact."nom" || ' ' || ilocContact."prenom", ilocContact."nom", ilocContact."prenom")
    END
  END) AS "apporteur_affaire_contact_nom",
  MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN ilocContact."email" END) AS "apporteur_affaire_contact_email",

  -- Donneur d'ordre
  MAX(CASE WHEN role."intitule" = 'Donneur d''ordre' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "donneur_ordre_nom",
  MAX(CASE WHEN role."intitule" = 'Donneur d''ordre' THEN iloc."email" END) AS "donneur_ordre_email",
  MAX(CASE WHEN role."intitule" = 'Donneur d''ordre' THEN iloc."telephoneMobile" END) AS "donneur_ordre_telephone",

  -- Locataire entrant
  MAX(CASE WHEN role."intitule" = 'Locataire entrant' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "locataire_entrant_nom",
  MAX(CASE WHEN role."intitule" = 'Locataire entrant' THEN iloc."email" END) AS "locataire_entrant_email",
  MAX(CASE WHEN role."intitule" = 'Locataire entrant' THEN iloc."telephoneMobile" END) AS "locataire_entrant_telephone",

  -- Locataire sortant
  MAX(CASE WHEN role."intitule" = 'Locataire sortant' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "locataire_sortant_nom",
  MAX(CASE WHEN role."intitule" = 'Locataire sortant' THEN iloc."email" END) AS "locataire_sortant_email",
  MAX(CASE WHEN role."intitule" = 'Locataire sortant' THEN iloc."telephoneMobile" END) AS "locataire_sortant_telephone",

  -- Notaire
  MAX(CASE WHEN role."intitule" = 'Notaire' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "notaire_nom",
  MAX(CASE WHEN role."intitule" = 'Notaire' THEN iloc."email" END) AS "notaire_email",
  MAX(CASE WHEN role."intitule" = 'Notaire' THEN iloc."telephoneMobile" END) AS "notaire_telephone",

  -- Payeur
  MAX(CASE WHEN role."intitule" = 'Payeur' THEN 
    CASE 
      WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
      ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
    END
  END) AS "payeur_nom",
  MAX(CASE WHEN role."intitule" = 'Payeur' THEN iloc."email" END) AS "payeur_email",
  MAX(CASE WHEN role."intitule" = 'Payeur' THEN iloc."telephoneMobile" END) AS "payeur_telephone",
  MAX(CASE WHEN role."intitule" = 'Payeur' THEN iloc."typePersonne" END) AS "payeur_typePersonne",
  MAX(CASE WHEN role."intitule" = 'Payeur' THEN 
    CASE 
      WHEN ilocContact."typePersonne" = 'M' THEN ilocContact."nom"
      ELSE COALESCE(ilocContact."nom" || ' ' || ilocContact."prenom", ilocContact."nom", ilocContact."prenom")
    END
  END) AS "payeur_contact_nom",
  MAX(CASE WHEN role."intitule" = 'Payeur' THEN ilocContact."email" END) AS "payeur_contact_email",

  -- Propriétaire
  MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN 
    CASE 
      WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
      ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
    END
  END) AS "proprietaire_nom",
  MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN iloc."email" END) AS "proprietaire_email",
  MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN iloc."telephoneMobile" END) AS "proprietaire_telephone",
  MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN iloc."typePersonne" END) AS "proprietaire_typePersonne",
  MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN 
    CASE 
      WHEN ilocContact."typePersonne" = 'M' THEN ilocContact."nom"
      ELSE COALESCE(ilocContact."nom" || ' ' || ilocContact."prenom", ilocContact."nom", ilocContact."prenom")
    END
  END) AS "proprietaire_contact_nom",
  MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN ilocContact."email" END) AS "proprietaire_contact_email",

  -- Syndic
  MAX(CASE WHEN role."intitule" = 'Syndic' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "syndic_nom",
  MAX(CASE WHEN role."intitule" = 'Syndic' THEN iloc."email" END) AS "syndic_email",
  MAX(CASE WHEN role."intitule" = 'Syndic' THEN iloc."telephoneMobile" END) AS "syndic_telephone",

  -- Calcul du type de payeur
  CASE
    WHEN MAX(CASE WHEN role."intitule" = 'Payeur' THEN 
      CASE 
        WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
        ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
      END
    END) = MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN 
      CASE 
        WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
        ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
      END
    END)
    THEN 'Propriétaire'
    WHEN MAX(CASE WHEN role."intitule" = 'Payeur' THEN 
      CASE 
        WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
        ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
      END
    END) = MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN 
      CASE 
        WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
        ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
      END
    END)
    THEN 'Apporteur d''affaire'
    ELSE 'Autre'
  END AS "payeur_type"

FROM
  "public"."(GCO) GcoPiece" p
LEFT JOIN
  "public"."(GCO) GcoPieceMetier" pm ON p."idpiece" = pm."idpiece"
LEFT JOIN
  "public"."(ADN_DIAG) Dossier" d ON pm."idmetier" = d."idDossier"
LEFT JOIN
  "public"."(ADN_RG)Employe" e ON d."idEmployeIntervention" = e."idEmploye"
LEFT JOIN
  "public"."(ADN_DIAG) StatutDossier" s ON d."idStatut" = s."idStatut"
LEFT JOIN
  "public"."(ADN_DIAG) DossierInterlocuteur" di ON d."idDossier" = di."idDossier"
LEFT JOIN
  "public"."(ADN_RG)Interlocuteur" iloc ON di."idInterlocuteur" = iloc."idInterlocuteur"
LEFT JOIN
  "public"."(ADN_RG)Interlocuteur" ilocContact ON di."idContact" = ilocContact."idInterlocuteur"
LEFT JOIN
  "public"."(ADN_DIAG) RoleInterlocuteurDossier" role ON di."idRole" = role."idRole"

WHERE
  (p."nfacture" IS NOT NULL)
  AND (
    p."datepiece" >= (
      CAST(CAST((NOW() + INTERVAL '-300000 day') AS date) AS timestamptz) + INTERVAL '-7 day'
    )
  )
  AND (
    p."datepiece" < (
      CAST(CAST(NOW() AS date) AS timestamptz) + INTERVAL '-7 day'
    )
  )
  AND (p."facturesoldee" = FALSE)
  AND (p."resteapayer" > 0)
  AND (p."valide" = TRUE)
  AND EXISTS (
    SELECT 1 
    FROM "public"."(ADN_DIAG) DossierInterlocuteur" di2
    LEFT JOIN "public"."(ADN_DIAG) RoleInterlocuteurDossier" role2 ON di2."idRole" = role2."idRole"
    WHERE di2."idDossier" = d."idDossier" 
    AND role2."intitule" = 'Payeur'
  )

GROUP BY
  p."nfacture",
  p."datepiece",
  p."totalhtnet",
  p."totalttcnet",
  p."resteapayer",
  p."facturesoldee",
  p."commentaire",
  p."refpiece",
  p."datecre",
  d."idDossier",
  d."idStatut",
  s."intitule",
  d."contactPlace",
  d."reference",
  d."referenceExterne",
  d."numero",
  d."idEmployeIntervention",
  d."commentaire",
  d."adresse",
  d."cptAdresse",
  d."codePostal",
  d."ville",
  d."numeroLot",
  d."etage",
  d."entree",
  d."escalier",
  d."porte",
  d."numVoie",
  d."cptNumVoie",
  d."typeVoie",
  d."dateDebutMission",
  COALESCE(e."prenom" || ' ' || e."nom", '')
ORDER BY p."datepiece" DESC
    `;

    // Initialiser externalData pour éviter les erreurs de référence
    let externalData = [];
    
    // Ajouter un timeout à la requête PostgreSQL
    const client = await pgPool.connect();
    try {
      // Définir un timeout de 10 secondes pour la requête
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: La requête PostgreSQL a dépassé le temps d\'exécution maximum de 10 secondes.'));
        }, 100000);
      });

      log('Exécution de la requête PostgreSQL...');
      log('Veuillez patienter, cela peut prendre un moment...');
      log('Si le timeout est atteint, la requête sera annulée.');

      const res = await Promise.race([
        client.query(query),
        timeoutPromise
      ]);
      externalData = res.rows;
      log(`Récupération de ${externalData.length} factures impayées depuis la base PostgreSQL.`);
      log('Exemple de données externes : ' + JSON.stringify(externalData.length > 0 ? externalData[0] : 'Aucune donnée'));
    } catch (err) {
      if (err.message.startsWith('Timeout:')) {
        log('Erreur : ' + err.message);
        log('La requête PostgreSQL a été annulée en raison d\'un timeout.');
        log('Veuillez vérifier la requête ou la connexion à la base de données.');
      } else {
        throw err;
      }
    } finally {
      client.release();
    }

    // Vérifier si externalData contient des données valides
    if (externalData.length === 0) {
      log('\nAucune donnée externe à synchroniser. Arrêt du script.');
      log('========================================');
      log('Fin du script de synchronisation.');
      log('========================================');
      return { success: true, message: 'Aucune donnée à synchroniser', inserted: 0, updated: 0, skipped: 0 };
    }

    // Récupérer les données locales depuis Parse Server
    log('\nRécupération des données locales depuis Parse Server...');
    let localData = [];
    try {
      // Créer une requête pour récupérer toutes les données existantes
      const Impaye = Parse.Object.extend(PARSE_COLLECTION);
      const query = new Parse.Query(Impaye);
      
      // Récupérer toutes les données avec une limite de 10 000 résultats
      query.limit(10000);
      const results = await query.find();
      localData = results.map(item => item.toJSON());
      
      log(`✓ Récupération terminée. Total : ${localData.length} factures impayées.`);
      log('Exemple de données locales : ' + JSON.stringify(localData.length > 0 ? localData[0] : 'Aucune donnée'));
    } catch (err) {
      log('❌ Erreur lors de la récupération des données depuis Parse Server :');
      log('Message d\'erreur : ' + err.message);
      log('Détails : ' + JSON.stringify(err));
      throw err;
    }

    // Comparer et mettre à jour
    log('\nComparaison et synchronisation des données...');
    let updatedCount = 0;
    let insertedCount = 0;
    let skippedCount = 0;

    for (const externalRow of externalData) {
      log(`\nTraitement de la facture ${externalRow.nfacture}...`);
      
      // Valider les données avant l'envoi
      if (!externalRow.nfacture || !externalRow.idDossier) {
        log(`❌ Erreur : Les champs requis (nfacture ou idDossier) sont manquants pour la facture ${externalRow.nfacture}.`);
        continue;
      }
      
      // Vérifier les types de données
      const requiredFields = ['nfacture', 'idDossier', 'datepiece', 'totalhtnet', 'totalttcnet', 'resteapayer', 'facturesoldee'];
      for (const field of requiredFields) {
        if (externalRow[field] === undefined || externalRow[field] === null) {
          log(`❌ Erreur : Le champ requis ${field} est manquant ou null pour la facture ${externalRow.nfacture}.`);
          continue;
        }
      }
      
      // Convertir les champs numériques en nombres
      const numericFields = ['totalhtnet', 'totalttcnet', 'resteapayer'];
      for (const field of numericFields) {
        if (typeof externalRow[field] === 'string') {
          externalRow[field] = parseFloat(externalRow[field]);
        }
      }
      
      // Vérifier les types de données numériques
      const requiredNumericFields = ['nfacture', 'idDossier', 'totalhtnet', 'totalttcnet', 'resteapayer'];
      for (const field of requiredNumericFields) {
        if (typeof externalRow[field] !== 'number') {
          log(`❌ Erreur : Le champ ${field} doit être un nombre pour la facture ${externalRow.nfacture}. Type actuel : ${typeof externalRow[field]}`);
          continue;
        }
      }
      
      // Vérifier les types de données booléens
      if (typeof externalRow.facturesoldee !== 'boolean') {
        log(`❌ Erreur : Le champ facturesoldee doit être un booléen pour la facture ${externalRow.nfacture}. Type actuel : ${typeof externalRow.facturesoldee}`);
        continue;
      }
      
      // Vérifier si la facture existe déjà dans Parse Server en utilisant nfacture et idDossier
      const localRow = localData.find(row => row.nfacture === externalRow.nfacture && row.idDossier === externalRow.idDossier);
      log(`Vérification de l'existence de la facture ${externalRow.nfacture} (Dossier: ${externalRow.idDossier}) dans Parse Server...`);
      log(localRow ? `✓ Facture trouvée dans Parse Server.` : `✗ Facture non trouvée dans Parse Server.`);
      log('Données locales correspondantes : ' + JSON.stringify(localRow ? localRow : 'Aucune donnée'));
      log('Données externes à comparer : ' + JSON.stringify(externalRow));
      if (!localRow) {
        log(`La facture ${externalRow.nfacture} (Dossier: ${externalRow.idDossier}) n'existe pas dans Parse Server. Insertion...`);
        try {
          // Insérer une nouvelle entrée dans Parse Server
          const Impaye = Parse.Object.extend(PARSE_COLLECTION);
          const newImpaye = new Impaye();
          
          // Définir toutes les propriétés
          for (const [key, value] of Object.entries(externalRow)) {
            newImpaye.set(key, value);
          }
          
          // Générer et définir l'URL du PDF si la date de facture et la référence sont disponibles
          if (externalRow.datecre && externalRow.refpiece) {
            try {
              log(`Tentative de génération d'URL PDF pour la facture ${externalRow.nfacture} avec datecre: ${externalRow.datecre}, refpiece: ${externalRow.refpiece}`);
              
              const dateFacture = new Date(externalRow.datecre);
              if (isNaN(dateFacture.getTime())) {
                throw new Error(`Format de date invalide: ${externalRow.datecre}`);
              }
              
              const year = dateFacture.getFullYear();
              const month = dateFacture.toLocaleString('fr-FR', { month: 'long' })
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
              const refPiece = externalRow.refpiece.replace(/ /g, "_");
              
              const invoiceUrl = `/ADN/Reporting/Gco/Piece/${year}/${month}/${refPiece}/standard/${refPiece} (GCO PI FA).pdf`;
              newImpaye.set('invoice_url', invoiceUrl);
              log(`✓ URL PDF générée pour la facture ${externalRow.nfacture}: ${invoiceUrl}`);
            } catch (err) {
              log(`⚠️ Impossible de générer l'URL PDF pour la facture ${externalRow.nfacture}: ${err.message}`);
              log(`   Détails: datecre=${externalRow.datecre}, refpiece=${externalRow.refpiece}`);
            }
          } else {
            log(`⚠️ Champs manquants pour la génération d'URL PDF pour la facture ${externalRow.nfacture}: datecre=${externalRow.datecre}, refpiece=${externalRow.refpiece}`);
          }
          
          const savedItem = await newImpaye.save();
          insertedCount++;
          log(`✓ Facture ${externalRow.nfacture} (Dossier: ${externalRow.idDossier}) insérée avec succès. ID : ${savedItem.id}`);
        } catch (err) {
          log(`❌ Erreur lors de l'insertion de la facture ${externalRow.nfacture} (Dossier: ${externalRow.idDossier}) :`);
          log('Message d\'erreur : ' + err.message);
          log('Détails : ' + JSON.stringify(err));
          log('Données envoyées : ' + JSON.stringify(externalRow, null, 2));
        }
      } else {
        // Comparer les données pour voir si une mise à jour est nécessaire
        // Liste des champs à comparer (exclure createdAt, updatedAt, objectId, etc.)
        const fieldsToCompare = [
          'nfacture', 'idDossier', 'datepiece', 'totalhtnet', 'totalttcnet', 'resteapayer', 'facturesoldee',
          'commentaire_piece', 'refpiece', 'idStatut', 'statut_intitule', 'contactPlace', 'reference',
          'referenceExterne', 'numero', 'idEmployeIntervention', 'commentaire_dossier', 'adresse',
          'cptAdresse', 'codePostal', 'ville', 'numeroLot', 'etage', 'entree', 'escalier', 'porte',
          'numVoie', 'cptNumVoie', 'typeVoie', 'dateDebutMission', 'employe_intervention',
          'acquerur_nom', 'acquerur_email', 'acquerur_telephone',
          'apporteur_affaire_nom', 'apporteur_affaire_email', 'apporteur_affaire_telephone',
          'apporteur_affaire_typePersonne', 'apporteur_affaire_contact_nom', 'apporteur_affaire_contact_email',
          'donneur_ordre_nom', 'donneur_ordre_email', 'donneur_ordre_telephone',
          'locataire_entrant_nom', 'locataire_entrant_email', 'locataire_entrant_telephone',
          'locataire_sortant_nom', 'locataire_sortant_email', 'locataire_sortant_telephone',
          'notaire_nom', 'notaire_email', 'notaire_telephone',
          'payeur_nom', 'payeur_email', 'payeur_telephone', 'payeur_typePersonne',
          'payeur_contact_nom', 'payeur_contact_email',
          'proprietaire_nom', 'proprietaire_email', 'proprietaire_telephone',
          'proprietaire_typePersonne', 'proprietaire_contact_nom', 'proprietaire_contact_email',
          'syndic_nom', 'syndic_email', 'syndic_telephone', 'payeur_type'
        ];

        let needsUpdate = false;
        for (const field of fieldsToCompare) {
          // Vérifier si le champ existe dans les données locales et externes
          if (!localRow.hasOwnProperty(field) || !externalRow.hasOwnProperty(field)) {
            log(`Champ manquant dans les données locales ou externes : ${field}`);
            continue;
          }

          // Normaliser les valeurs pour la comparaison
          let localValue = localRow[field];
          let externalValue = externalRow[field];

          // Gérer les valeurs nulles ou indéfinies
          if (localValue === null || localValue === undefined || externalValue === null || externalValue === undefined) {
            if (localValue !== externalValue) {
              needsUpdate = true;
              log(`Champ différent détecté : ${field} (local: ${localValue}, externe: ${externalValue})`);
              break;
            }
            continue;
          }

          // Gérer les dates au format Parse (ex: {"__type":"Date","iso":"2023-01-04T00:00:00.000Z"})
          if (localValue && localValue.__type === 'Date' && localValue.iso) {
            localValue = new Date(localValue.iso).toISOString();
          }
          if (externalValue && externalValue.__type === 'Date' && externalValue.iso) {
            externalValue = new Date(externalValue.iso).toISOString();
          }

          // Gérer les dates au format ISO string
          if (typeof localValue === 'string' && !isNaN(new Date(localValue).getTime())) {
            localValue = new Date(localValue).toISOString();
          }
          if (typeof externalValue === 'string' && !isNaN(new Date(externalValue).getTime())) {
            externalValue = new Date(externalValue).toISOString();
          }

          // Comparer les valeurs normalisées
          if (localValue !== externalValue) {
            needsUpdate = true;
            log(`Champ différent détecté : ${field} (local: ${localValue}, externe: ${externalValue})`);
            break;
          }
        }

        if (needsUpdate) {
          log(`La facture ${externalRow.nfacture} (Dossier: ${externalRow.idDossier}) existe déjà dans Parse Server mais est différente. Mise à jour...`);
          try {
            // Mettre à jour l'entrée existante dans Parse Server
            const Impaye = Parse.Object.extend(PARSE_COLLECTION);
            const query = new Parse.Query(Impaye);
            query.equalTo('nfacture', externalRow.nfacture);
            query.equalTo('idDossier', externalRow.idDossier);
            
            const itemToUpdate = await query.first();
            if (itemToUpdate) {
              // Mettre à jour toutes les propriétés
              for (const [key, value] of Object.entries(externalRow)) {
                itemToUpdate.set(key, value);
              }
              
              // Générer et mettre à jour l'URL du PDF si la date de facture et la référence sont disponibles
              if (externalRow.datecre && externalRow.refpiece) {
                try {
                  log(`Tentative de mise à jour d'URL PDF pour la facture ${externalRow.nfacture} avec datecre: ${externalRow.datecre}, refpiece: ${externalRow.refpiece}`);
                  
                  const dateFacture = new Date(externalRow.datecre);
                  if (isNaN(dateFacture.getTime())) {
                    throw new Error(`Format de date invalide: ${externalRow.datecre}`);
                  }
                  
                  const year = dateFacture.getFullYear();
                  const month = dateFacture.toLocaleString('fr-FR', { month: 'long' })
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase();
                  const refPiece_underligne = externalRow.refpiece.replace(/ /g, "_");
                  const refPiece=externalRow.refpiece;
                  
                  const invoiceUrl = `/ADN/Reporting/Gco/Piece/${year}/${month}/${refPiece_underligne}/standard/${refPiece} (GCO PI FA).pdf`;
                  itemToUpdate.set('invoice_url', invoiceUrl);
                  log(`✓ URL PDF mise à jour pour la facture ${externalRow.nfacture}: ${invoiceUrl}`);
                } catch (err) {
                  log(`⚠️ Impossible de mettre à jour l'URL PDF pour la facture ${externalRow.nfacture}: ${err.message}`);
                  log(`   Détails: datecre=${externalRow.datecre}, refpiece=${externalRow.refpiece}`);
                }
              } else {
                log(`⚠️ Champs manquants pour la mise à jour d'URL PDF pour la facture ${externalRow.nfacture}: datecre=${externalRow.datecre}, refpiece=${externalRow.refpiece}`);
              }
              
              await itemToUpdate.save();
              updatedCount++;
              log(`✓ Facture ${externalRow.nfacture} (Dossier: ${externalRow.idDossier}) mise à jour avec succès.`);
            }
          } catch (err) {
            log(`❌ Erreur lors de la mise à jour de la facture ${externalRow.nfacture} (Dossier: ${externalRow.idDossier}) :`);
            log('Message d\'erreur : ' + err.message);
            log('Détails : ' + JSON.stringify(err));
            log('Données envoyées : ' + JSON.stringify(externalRow, null, 2));
          }
        } else {
          log(`La facture ${externalRow.nfacture} (Dossier: ${externalRow.idDossier}) existe déjà dans Parse Server et est identique. Aucune action nécessaire.`);
          skippedCount++;
        }
      }
    }

    log('\n========================================');
    log('Synchronisation terminée avec succès !');
    log('========================================');
    log(`Nombre de nouvelles entrées ajoutées : ${insertedCount}`);
    log(`Nombre d'entrées mises à jour : ${updatedCount}`);
    log(`Nombre d'entrées inchangées : ${skippedCount}`);
    log(`Total des entrées traitées : ${externalData.length}`);

    return {
      success: true,
      message: 'Synchronisation terminée avec succès',
      inserted: insertedCount,
      updated: updatedCount,
      skipped: skippedCount,
      total: externalData.length
    };
  } catch (err) {
    log('\n========================================');
    log('Erreur lors de la synchronisation :');
    log('========================================');
    log('Message d\'erreur : ' + err.message);
    log('Détails de l\'erreur : ' + JSON.stringify(err.response ? err.response.data : err));
    log('Stack trace : ' + err.stack);
    
    return {
      success: false,
      message: 'Erreur lors de la synchronisation',
      error: err.message,
      details: err.response ? err.response.data : err
    };
  } finally {
    // Fermer la connexion à PostgreSQL
    log('\nFermeture de la connexion à PostgreSQL...');
    await pgPool.end();
    log('Connexion à PostgreSQL fermée avec succès.');
    log('========================================');
    log('Fin du script de synchronisation.');
    log('========================================');
  }
});

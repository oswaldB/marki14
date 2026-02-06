// initCollections.js - Script pour initialiser les collections nécessaires dans Parse Server

Parse.Cloud.define('initCollections', async (request) => {
  const collections = ['Impayes', 'sequences', 'SMTPProfiles'];
  
  for (const collection of collections) {
    try {
      // Vérifier si la collection existe déjà
      const schema = await Parse.Schema.get(collection);
      console.log(`Collection ${collection} existe déjà.`);
    } catch (error) {
      if (error.code === Parse.Error.INVALID_CLASS_NAME) {
        // La collection n'existe pas, la créer
        try {
          const schema = new Parse.Schema(collection);
          

          // Définir les champs pour la collection sequences
          if (collection === 'sequences') {
            schema.addField('nom', { type: 'String', required: true });
            schema.addField('description', { type: 'String' });
            schema.addField('isActif', { type: 'Boolean', defaultValue: true });
            schema.addField('actions', { type: 'Array', defaultValue: [] });
            schema.addField('emailSubject', { type: 'String' });
            schema.addField('senderEmail', { type: 'String' });
          }
          
          // Définir les champs pour la collection SMTPProfiles
          if (collection === 'SMTPProfiles') {
            schema.addField('name', { type: 'String', required: true });
            schema.addField('host', { type: 'String', required: true });
            schema.addField('port', { type: 'Number', required: true });
            schema.addField('email', { type: 'String', required: true });
            schema.addField('username', { type: 'String' });
            schema.addField('password', { type: 'String' });
            schema.addField('useSSL', { type: 'Boolean', defaultValue: false });
            schema.addField('useTLS', { type: 'Boolean', defaultValue: true });
          }
          
          // Définir les champs pour la collection Impayes
          if (collection === 'Impayes') {
            schema.addField('nfacture', { type: 'String', required: true });
            schema.addField('datepiece', { type: 'Date' });
            schema.addField('totalhtnet', { type: 'Number' });
            schema.addField('totalttcnet', { type: 'Number' });
            schema.addField('resteapayer', { type: 'Number' });
            schema.addField('facturesoldee', { type: 'Boolean', defaultValue: false });
            schema.addField('commentaire', { type: 'String' });
            schema.addField('refpiece', { type: 'String' });
            schema.addField('idDossier', { type: 'String' });
            schema.addField('idStatut', { type: 'String' });
            schema.addField('statut_intitule', { type: 'String' });
            schema.addField('contactPlace', { type: 'String' });
            schema.addField('reference', { type: 'String' });
            schema.addField('referenceExterne', { type: 'String' });
            schema.addField('numero', { type: 'String' });
            schema.addField('idEmployeIntervention', { type: 'String' });
            schema.addField('commentaire_dossier', { type: 'String' });
            schema.addField('adresse', { type: 'String' });
            schema.addField('cptAdresse', { type: 'String' });
            schema.addField('codePostal', { type: 'String' });
            schema.addField('ville', { type: 'String' });
            schema.addField('numeroLot', { type: 'String' });
            schema.addField('etage', { type: 'String' });
            schema.addField('entree', { type: 'String' });
            schema.addField('escalier', { type: 'String' });
            schema.addField('porte', { type: 'String' });
            schema.addField('numVoie', { type: 'String' });
            schema.addField('cptNumVoie', { type: 'String' });
            schema.addField('typeVoie', { type: 'String' });
            schema.addField('dateDebutMission', { type: 'Date' });
            schema.addField('employe_intervention', { type: 'String' });
            schema.addField('acquerur_nom', { type: 'String' });
            schema.addField('acquerur_email', { type: 'String' });
            schema.addField('acquerur_telephone', { type: 'String' });
            schema.addField('apporteur_affaire_nom', { type: 'String' });
            schema.addField('apporteur_affaire_email', { type: 'String' });
            schema.addField('apporteur_affaire_telephone', { type: 'String' });
            schema.addField('apporteur_affaire_typePersonne', { type: 'String' });
            schema.addField('apporteur_affaire_contact_nom', { type: 'String' });
            schema.addField('apporteur_affaire_contact_email', { type: 'String' });
            schema.addField('donneur_ordre_nom', { type: 'String' });
            schema.addField('donneur_ordre_email', { type: 'String' });
            schema.addField('donneur_ordre_telephone', { type: 'String' });
            schema.addField('locataire_entrant_nom', { type: 'String' });
            schema.addField('locataire_entrant_email', { type: 'String' });
            schema.addField('locataire_entrant_telephone', { type: 'String' });
            schema.addField('locataire_sortant_nom', { type: 'String' });
            schema.addField('locataire_sortant_email', { type: 'String' });
            schema.addField('locataire_sortant_telephone', { type: 'String' });
            schema.addField('notaire_nom', { type: 'String' });
            schema.addField('notaire_email', { type: 'String' });
            schema.addField('notaire_telephone', { type: 'String' });
            schema.addField('payeur_nom', { type: 'String' });
            schema.addField('payeur_email', { type: 'String' });
            schema.addField('payeur_telephone', { type: 'String' });
            schema.addField('payeur_typePersonne', { type: 'String' });
            schema.addField('payeur_contact_nom', { type: 'String' });
            schema.addField('payeur_contact_email', { type: 'String' });
            schema.addField('proprietaire_nom', { type: 'String' });
            schema.addField('proprietaire_email', { type: 'String' });
            schema.addField('proprietaire_telephone', { type: 'String' });
            schema.addField('proprietaire_typePersonne', { type: 'String' });
            schema.addField('proprietaire_contact_nom', { type: 'String' });
            schema.addField('proprietaire_contact_email', { type: 'String' });
            schema.addField('syndic_nom', { type: 'String' });
            schema.addField('syndic_email', { type: 'String' });
            schema.addField('syndic_telephone', { type: 'String' });
            schema.addField('payeur_type', { type: 'String' });
          }
          
          await schema.save();
          console.log(`Collection ${collection} créée avec succès.`);
        } catch (err) {
          console.error(`Erreur lors de la création de la collection ${collection}:`, err);
          throw err;
        }
      } else {
        console.error(`Erreur lors de la vérification de la collection ${collection}:`, error);
        throw error;
      }
    }
  }
  
  return { success: true, message: 'Collections initialisées avec succès' };
});
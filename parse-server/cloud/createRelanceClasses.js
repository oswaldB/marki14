// createRelanceClasses.js - Script pour créer les classes Relances et Relance si elles n'existent pas

Parse.Cloud.define('createRelanceClasses', async (request) => {
  try {
    // Créer la classe Relance
    try {
      await Parse.Schema.get('Relance');
      console.log('Classe Relance existe déjà');
    } catch (error) {
      if (error.code === Parse.Error.INVALID_CLASS_NAME) {
        console.log('Création de la classe Relance...');
        const relanceSchema = new Parse.Schema('Relance');
        relanceSchema.addField('type', { type: 'String', required: true }); // email, sms, etc.
        relanceSchema.addField('message', { type: 'String', required: true });
        relanceSchema.addField('date', { type: 'Date', required: true });
        relanceSchema.addField('isSent', { type: 'Boolean', defaultValue: false });
        relanceSchema.addField('impaye', { type: 'Pointer', targetClass: 'Impayes' });
        relanceSchema.addField('sequence', { type: 'Pointer', targetClass: 'sequences' });
        await relanceSchema.save();
        console.log('Classe Relance créée avec succès');
      } else {
        throw error;
      }
    }
    
    // Créer la classe Relances
    try {
      await Parse.Schema.get('Relances');
      console.log('Classe Relances existe déjà');
    } catch (error) {
      if (error.code === Parse.Error.INVALID_CLASS_NAME) {
        console.log('Création de la classe Relances...');
        const relancesSchema = new Parse.Schema('Relances');
        relancesSchema.addField('email_sender', { type: 'String' });
        relancesSchema.addField('email_subject', { type: 'String' });
        relancesSchema.addField('email_body', { type: 'String' });
        relancesSchema.addField('email_to', { type: 'String' });
        relancesSchema.addField('email_cc', { type: 'String' });
        relancesSchema.addField('send_date', { type: 'Date' });
        relancesSchema.addField('is_sent', { type: 'Boolean', defaultValue: false });
        relancesSchema.addField('relance', { type: 'Pointer', targetClass: 'Relance' });
        relancesSchema.addField('impaye', { type: 'Pointer', targetClass: 'Impayes' });
        relancesSchema.addField('sequence', { type: 'Pointer', targetClass: 'sequences' });
        await relancesSchema.save();
        console.log('Classe Relances créée avec succès');
      } else {
        throw error;
      }
    }
    
    return {
      success: true,
      message: 'Classes Relance et Relances créées ou vérifiées avec succès'
    };
    
  } catch (error) {
    console.error('Erreur lors de la création des classes:', error);
    throw error;
  }
});
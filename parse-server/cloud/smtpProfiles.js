// Cloud Functions pour la gestion des profils SMTP

// Récupérer tous les profils SMTP
Parse.Cloud.define('getSMTPProfiles', async (request) => {
  try {
    const query = new Parse.Query('SMTPProfile');
    const results = await query.find({ useMasterKey: true });
    return results.map(profile => profile.toJSON());
  } catch (error) {
    console.error('Erreur lors de la récupération des profils SMTP:', error);
    throw new Error('Erreur lors de la récupération des profils SMTP: ' + error.message);
  }
});

// Récupérer un profil SMTP spécifique
Parse.Cloud.define('getSMTPProfile', async (request) => {
  const { objectId } = request.params;
  
  if (!objectId) {
    throw new Error('L\'ID du profil SMTP est requis');
  }
  
  try {
    const query = new Parse.Query('SMTPProfile');
    const profile = await query.get(objectId, { useMasterKey: true });
    return profile.toJSON();
  } catch (error) {
    console.error('Erreur lors de la récupération du profil SMTP:', error);
    throw new Error('Erreur lors de la récupération du profil SMTP: ' + error.message);
  }
});

// Créer un nouveau profil SMTP
Parse.Cloud.define('createSMTPProfile', async (request) => {
  const { name, host, port, username, password, email, useSSL, useTLS } = request.params;
  
  // Validation des paramètres
  if (!name || !host || !port || !email) {
    throw new Error('Les champs name, host, port et email sont requis');
  }
  
  try {
    const SMTPProfile = Parse.Object.extend('SMTPProfile');
    const profile = new SMTPProfile();
    
    profile.set('name', name);
    profile.set('host', host);
    profile.set('port', port);
    profile.set('username', username || '');
    profile.set('password', password || '');
    profile.set('email', email);
    profile.set('useSSL', useSSL || false);
    profile.set('useTLS', useTLS || false);
    profile.set('isActive', true);
    profile.set('isArchived', false);
    
    const savedProfile = await profile.save(null, { useMasterKey: true });
    return savedProfile.toJSON();
  } catch (error) {
    console.error('Erreur lors de la création du profil SMTP:', error);
    throw new Error('Erreur lors de la création du profil SMTP: ' + error.message);
  }
});

// Mettre à jour un profil SMTP
Parse.Cloud.define('updateSMTPProfile', async (request) => {
  const { objectId, name, host, port, username, password, email, useSSL, useTLS, isActive } = request.params;
  
  if (!objectId) {
    throw new Error('L\'ID du profil SMTP est requis');
  }
  
  try {
    const query = new Parse.Query('SMTPProfile');
    const profile = await query.get(objectId, { useMasterKey: true });
    
    if (name) profile.set('name', name);
    if (host) profile.set('host', host);
    if (port) profile.set('port', port);
    if (username !== undefined) profile.set('username', username);
    if (password !== undefined) profile.set('password', password);
    if (email) profile.set('email', email);
    if (useSSL !== undefined) profile.set('useSSL', useSSL);
    if (useTLS !== undefined) profile.set('useTLS', useTLS);
    if (isActive !== undefined) profile.set('isActive', isActive);
    
    const updatedProfile = await profile.save(null, { useMasterKey: true });
    return updatedProfile.toJSON();
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil SMTP:', error);
    throw new Error('Erreur lors de la mise à jour du profil SMTP: ' + error.message);
  }
});

// Archiver un profil SMTP
Parse.Cloud.define('archiveSMTPProfile', async (request) => {
  const { objectId } = request.params;
  
  if (!objectId) {
    throw new Error('L\'ID du profil SMTP est requis');
  }
  
  try {
    const query = new Parse.Query('SMTPProfile');
    const profile = await query.get(objectId, { useMasterKey: true });
    
    profile.set('isArchived', true);
    profile.set('isActive', false);
    
    const archivedProfile = await profile.save(null, { useMasterKey: true });
    return archivedProfile.toJSON();
  } catch (error) {
    console.error('Erreur lors de l\'archivage du profil SMTP:', error);
    throw new Error('Erreur lors de l\'archivage du profil SMTP: ' + error.message);
  }
});

// Supprimer définitivement un profil SMTP
Parse.Cloud.define('deleteSMTPProfile', async (request) => {
  const { objectId } = request.params;
  
  if (!objectId) {
    throw new Error('L\'ID du profil SMTP est requis');
  }
  
  try {
    const query = new Parse.Query('SMTPProfile');
    const profile = await query.get(objectId, { useMasterKey: true });
    
    await profile.destroy({ useMasterKey: true });
    return { success: true, message: 'Profil SMTP supprimé avec succès' };
  } catch (error) {
    console.error('Erreur lors de la suppression du profil SMTP:', error);
    throw new Error('Erreur lors de la suppression du profil SMTP: ' + error.message);
  }
});

// Tester un profil SMTP
Parse.Cloud.define('testSMTPProfile', async (request) => {
  const { objectId, testEmail } = request.params;
  
  if (!objectId) {
    throw new Error('L\'ID du profil SMTP est requis');
  }
  
  if (!testEmail) {
    throw new Error('L\'email de test est requis');
  }
  
  try {
    // Récupérer le profil SMTP
    const query = new Parse.Query('SMTPProfile');
    const profile = await query.get(objectId, { useMasterKey: true });
    
    const profileData = profile.toJSON();
    
    // Appeler la fonction sendTestEmail existante
    const result = await Parse.Cloud.run('sendTestEmail', {
      recipient: testEmail,
      smtpProfile: {
        host: profileData.host,
        port: profileData.port,
        username: profileData.username,
        password: profileData.password,
        email: profileData.email,
        useSSL: profileData.useSSL
      }
    });
    
    return result;
  } catch (error) {
    console.error('Erreur lors du test du profil SMTP:', error);
    throw new Error('Erreur lors du test du profil SMTP: ' + error.message);
  }
});
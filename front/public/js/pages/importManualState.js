/**
 * État Alpine.js pour la page d'import manuel d'impayés
 * @namespace importManualState
 */
document.addEventListener('alpine:init', () => {
  Alpine.data('importManualState', () => ({
    // État initial
    file: null,
    preview: [],
    mapping: {
      email: 'email_contact',
      amount: 'montant',
      dueDate: 'date_echeance',
      role: 'role_contact',
      url: 'url_facture',
      num: 'num_facture'
    },
    loading: false,
    error: null,
    successMessage: null,
    skipHeader: true,

    /**
     * Gère le téléchargement du fichier
     * @param {Event} e - Événement de changement de fichier
     */
    async handleFile(e) {
      console.log('Fichier sélectionné:', e.target.files[0]);
      this.file = e.target.files[0];
      this.preview = await this.parseCSVPreview(this.file);
      this.error = null;
      this.successMessage = null;
    },

    /**
     * Aperçu des 5 premières lignes du CSV
     * @param {File} file - Fichier CSV à parser
     * @returns {Promise<Array>} - Tableau des 5 premières lignes
     */
    async parseCSVPreview(file) {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          preview: 5,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('Aperçu CSV:', results.data);
            resolve(results.data);
          },
          error: (err) => {
            console.error('Erreur de parsing:', err);
            reject(new Error("Fichier invalide"));
          }
        });
      });
    },

    /**
     * Valide et importe le fichier CSV
     */
    async validateImport() {
      console.log('Validation de l\'import...');
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      try {
        // Validation des colonnes obligatoires
        if (!this.preview.length) {
          throw new Error("Le fichier est vide ou corrompu");
        }

        const requiredColumns = ['email_contact', 'montant', 'date_echeance', 'role_contact'];
        const missingColumns = requiredColumns.filter(col => 
          !Object.keys(this.preview[0]).includes(col)
        );

        if (missingColumns.length > 0) {
          throw new Error(`Colonnes manquantes: ${missingColumns.join(', ')}`);
        }

        // Import complet
        const results = await this.importCSV();
        this.successMessage = `${results.length} impayés importés avec succès.`;
        console.log('Import réussi:', results);
      } catch (err) {
        console.error('Erreur d\'import:', err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Parse le fichier CSV complet et crée les impayés
     * @returns {Promise<Array>} - Tableau des impayés créés
     */
    async importCSV() {
      return new Promise((resolve, reject) => {
        Papa.parse(this.file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            console.log('Données complètes:', results.data);
            try {
              const createdImpayes = [];
              
              for (const row of results.data) {
                if (this.skipHeader && results.data.indexOf(row) === 0) continue;
                
                // Validation des données
                this.validateRow(row);
                
                // Création du contact
                const contact = await this.findOrCreateContact(row[this.mapping.email]);
                
                // Création de l'impayé
                const impaye = await this.createImpaye(contact.objectId, row);
                createdImpayes.push(impaye);
              }
              
              resolve(createdImpayes);
            } catch (error) {
              reject(error);
            }
          },
          error: (err) => {
            reject(new Error("Erreur de parsing du fichier"));
          }
        });
      });
    },

    /**
     * Valide une ligne de données
     * @param {Object} row - Ligne de données à valider
     * @throws {Error} - Si la ligne est invalide
     */
    validateRow(row) {
      console.log('Validation de la ligne:', row);
      
      // Validation email
      if (!row[this.mapping.email]) {
        throw new Error("La colonne Email est obligatoire");
      }

      // Validation montant
      if (isNaN(parseFloat(row[this.mapping.amount]))) {
        throw new Error("Montant invalide");
      }

      // Validation date
      const date = new Date(row[this.mapping.dueDate]);
      if (isNaN(date.getTime())) {
        throw new Error("Format de date incorrect (attendu: JJ/MM/AAAA)");
      }

      // Validation rôle
      const validRoles = ['payeur', 'apport. affaires'];
      if (!validRoles.includes(row[this.mapping.role])) {
        throw new Error("Le rôle doit être 'payeur' ou 'apport. affaires'");
      }
    },

    /**
     * Trouve ou crée un contact
     * @param {string} email - Email du contact
     * @returns {Promise<Object>} - Contact trouvé ou créé
     */
    async findOrCreateContact(email) {
      console.log('Recherche/Création de contact pour:', email);
      
      try {
        // Recherche existante
        const response = await axios.get('/parse/classes/Contacts', {
          params: { 
            where: JSON.stringify({ email: email.toLowerCase() })
          },
          headers: this.parseHeaders()
        });

        let contact = response.data.results[0];
        
        if (!contact) {
          // Création si inexistant
          console.log('Création d\'un nouveau contact');
          const newContact = await axios.post('/parse/classes/Contacts', {
            email: email.toLowerCase(),
            nom: email.split('@')[0]
          }, { headers: this.parseHeaders() });
          
          contact = newContact.data;
        }
        
        console.log('Contact trouvé/créé:', contact);
        return contact;
      } catch (error) {
        console.error('Erreur contact:', error);
        throw new Error("Erreur lors de la gestion du contact");
      }
    },

    /**
     * Crée un impayé
     * @param {string} contactId - ID du contact
     * @param {Object} row - Données de la ligne
     * @returns {Promise<Object>} - Impayé créé
     */
    async createImpaye(contactId, row) {
      console.log('Création d\'un impayé pour le contact:', contactId);
      
      try {
        const currentUser = JSON.parse(localStorage.getItem('parseUser'));
        
        const response = await axios.post('/parse/classes/Impayes', {
          contactId: { 
            __type: 'Pointer', 
            className: 'Contacts', 
            objectId: contactId 
          },
          montant: parseFloat(row[this.mapping.amount]),
          dateEcheance: { 
            __type: 'Date', 
            iso: new Date(row[this.mapping.dueDate]).toISOString() 
          },
          role: row[this.mapping.role],
          statut: 'non_payé',
          urlFacture: row[this.mapping.url] || '',
          numFacture: row[this.mapping.num] || '',
          source: 'import_manuel',
          metadata: {
            importedBy: { 
              __type: 'Pointer', 
              className: '_User', 
              objectId: currentUser.objectId 
            },
            importedAt: { 
              __type: 'Date', 
              iso: new Date().toISOString() 
            },
            fileName: this.file.name
          }
        }, { headers: this.parseHeaders() });

        console.log('Impayé créé:', response.data);
        return response.data;
      } catch (error) {
        console.error('Erreur création impayé:', error);
        throw new Error("Erreur lors de la création de l'impayé");
      }
    },

    /**
     * Récupère les headers Parse
     * @returns {Object} - Headers pour les requêtes Parse
     */
    parseHeaders() {
      return {
        'X-Parse-Application-Id': import.meta.env.VITE_PARSE_APP_ID,
        'X-Parse-REST-API-Key': import.meta.env.VITE_PARSE_REST_KEY,
        'X-Parse-Session-Token': localStorage.getItem('parseToken'),
        'Content-Type': 'application/json'
      };
    },

    /**
     * Télécharge un modèle CSV
     */
    downloadTemplate() {
      console.log('Téléchargement du modèle CSV');
      const csv = "email_contact,montant,date_echeance,role_contact,url_facture,num_facture\noswald@steriods.com,1200.50,2026-01-15,payeur,,INV-01";
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'modele_impayes.csv';
      a.click();
    },

    /**
     * Initialisation du composant
     */
    init() {
      console.log('Composant importManualState initialisé');
      // Charger PapaParse si nécessaire
      if (typeof Papa === 'undefined') {
        console.warn('PapaParse non chargé');
      }
    }
  }));
});
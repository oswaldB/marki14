/**
 * Alpine Store pour la gestion des impayés
 * Contient la logique et les propriétés partagées
 */
// Enregistrer le store avec Alpine.js
document.addEventListener('alpine:init', () => {
  Alpine.store('impayesBase',{
    // État initial commun
    impayes: [],              // Données brutes des factures
    searchQuery: '',          // Texte de recherche
    viewMode: 'list',         // Mode d'affichage actuel
    isLoading: true,          // État de chargement général
    isLoadingSequences: false, // État de chargement des séquences
    showPdfDrawer: false,     // État du tiroir PDF
    showSequenceDrawer: false,// État du tiroir de séquence
    currentInvoiceId: null,   // ID de la facture actuelle pour le visualiseur PDF
    currentPdfUrl: null,      // URL du PDF actuel
    currentPdfFilename: null, // Nom du fichier PDF actuel
    selectedImpaye: null,     // Facture sélectionnée pour la gestion des séquences
    selectedGroupInvoices: null, // Groupe de factures sélectionné pour l'assignation groupée
    sequences: [],            // Liste des séquences disponibles
    newSequenceName: '',      // Nom de la nouvelle séquence
    newSequenceIsAutomatic: false, // Si la nouvelle séquence est automatique
    addingSequenceId: null,   // ID de la séquence en cours d'ajout (pour le spinner)
    isSearching: false,      // État de recherche en cours
    
    // Filtres communs
    payerTypeFilter: '',     // Filtre par type de payeur
    delayFilter: '',         // Filtre par délai (retard)
    amountFilter: '',        // Filtre par montant
    
    // Propriétés calculées (getters)
    get filteredImpayes() {
      let result = this.impayes;
      
      // Appliquer le filtre de recherche texte
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(invoice => {
          const invoiceText = JSON.stringify(invoice).toLowerCase();
          return invoiceText.includes(query);
        });
      }
      
      // Appliquer le filtre par type de payeur
      if (this.payerTypeFilter) {
        result = result.filter(invoice => {
          return invoice.payeur_type === this.payerTypeFilter;
        });
      }
      
      // Appliquer le filtre par délai (retard)
      if (this.delayFilter) {
        const delayDays = parseInt(this.delayFilter);
        if (!isNaN(delayDays)) {
          result = result.filter(invoice => {
            const invoiceDelay = this.calculateDaysOverdue(invoice.datepiece);
            return invoiceDelay >= delayDays;
          });
        }
      }
      
      // Appliquer le filtre par montant
      if (this.amountFilter) {
        const amountValue = parseFloat(this.amountFilter);
        if (!isNaN(amountValue)) {
          result = result.filter(invoice => {
            return (invoice.resteapayer || 0) >= amountValue;
          });
        }
      }
      
      return result;
    },
    
    // Méthodes communes
    
    /**
     * Initialisation du store
     */
    async init() {
      try {
        console.log('Initialisation du store impayés...');
        this.isLoading = true;
        
        // Vérifier que Parse est disponible
        if (!window.Parse) {
          console.error('❌ Parse n\'est pas disponible');
          this.isLoading = false;
          return;
        }
        
        // Charger les données
        await this.fetchImpayes();
        await this.fetchSequences();
        
        console.log('✅ Initialisation terminée');
        this.isLoading = false;
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        this.isLoading = false;
      }
    },
    
    /**
     * Récupère les factures impayées depuis Parse
     */
    async fetchImpayes() {
      console.log('Récupération des factures impayées...');
      
      try {
        this.isLoading = true;
        
        const Impayes = Parse.Object.extend('Impayes');
        const query = new Parse.Query(Impayes);
        
        // Filtre: resteapayer != 0 et facturesoldee = false
        query.notEqualTo('resteapayer', 0);
        query.equalTo('facturesoldee', false);
        
        // Inclure les données de séquence
        query.include('sequence');
        
        // Limite à 99999 enregistrements
        query.limit(99999);
        
        // Exécuter la requête
        const results = await query.find();
        
        // Convertir les objets Parse en objets JavaScript
        this.impayes = results.map(item => {
          const json = item.toJSON();
          
          // Ajouter les informations de séquence
          if (json.sequence && typeof json.sequence === 'object') {
            json.sequence_name = json.sequence.nom || 'Non spécifié';
            json.sequence_is_automatic = json.sequence.is_automatic || false;
            json.sequence_id = json.sequence.objectId;
          } else {
            json.sequence_name = 'Sans séquence';
            json.sequence_is_automatic = false;
            json.sequence_id = null;
          }
          
          return json;
        });
        
        console.log(`✅ ${this.impayes.length} factures récupérées`);
        
      } catch (error) {
        console.error('❌ Erreur lors de la récupération:', error);
        this.impayes = [];
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Récupérer les séquences disponibles
     */
    async fetchSequences() {
      console.log('Récupération des séquences...');
      this.isLoadingSequences = true;
      
      try {
        const Sequence = Parse.Object.extend('Sequences');
        const query = new Parse.Query(Sequence);
        query.limit(1000);
        
        const results = await query.find();
        this.sequences = results.map(item => {
          const json = item.toJSON();
          return {
            id: json.objectId,
            name: json.nom || 'Séquence sans nom',
            is_automatic: json.is_automatic || false,
            createdAt: json.createdAt
          };
        });
        
        console.log(`✅ ${this.sequences.length} séquences récupérées`);
        return this.sequences;
        
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des séquences:', error);
        this.sequences = [];
        return [];
      } finally {
        this.isLoadingSequences = false;
      }
    },
    
    /**
     * Calculer les jours de retard
     */
    calculateDaysOverdue(invoiceDate) {
      if (!invoiceDate) return 0;
      
      let invoiceDateObj;
      
      if (typeof invoiceDate === 'string') {
        invoiceDateObj = new Date(invoiceDate);
        
        if (isNaN(invoiceDateObj.getTime()) && invoiceDate.includes('/')) {
          const parts = invoiceDate.split('/');
          if (parts.length === 3) {
            invoiceDateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        }
        
        if (isNaN(invoiceDateObj.getTime())) {
          invoiceDateObj = new Date(parseInt(invoiceDate));
        }
      } else if (typeof invoiceDate === 'number') {
        invoiceDateObj = new Date(invoiceDate);
      } else if (invoiceDate instanceof Date) {
        invoiceDateObj = invoiceDate;
      } else {
        if (invoiceDate.__type === 'Date' && invoiceDate.iso) {
          invoiceDateObj = new Date(invoiceDate.iso);
        } else {
          console.warn('⚠️ Format de date non reconnu:', invoiceDate);
          return 0;
        }
      }
      
      if (isNaN(invoiceDateObj.getTime())) {
        console.warn('⚠️ Date invalide:', invoiceDate);
        return 0;
      }
      
      const today = new Date();
      const diffTime = Math.abs(today - invoiceDateObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    },
    
    /**
     * Formater une date
     */
    formatDate(date) {
      if (!date) return 'Date inconnue';
      
      let dateObj;
      
      if (typeof date === 'string') {
        dateObj = new Date(date);
        
        if (isNaN(dateObj.getTime()) && date.includes('/')) {
          const parts = date.split('/');
          if (parts.length === 3) {
            dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        }
      } else if (typeof date === 'number') {
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        if (date.__type === 'Date' && date.iso) {
          dateObj = new Date(date.iso);
        } else {
          console.warn('⚠️ Format de date non reconnu:', date);
          return 'Date inconnue';
        }
      }
      
      if (isNaN(dateObj.getTime())) {
        console.warn('⚠️ Date invalide:', date);
        return 'Date inconnue';
      }
      
      return dateObj.toLocaleDateString('fr-FR');
    },
    
    /**
     * Calculer le total pour un groupe
     */
    calculateGroupTotal(invoices) {
      if (!invoices || !Array.isArray(invoices)) return 0;
      return invoices.reduce((total, invoice) => total + (invoice.resteapayer || 0), 0);
    },
    
    /**
     * Trouver le retard maximum
     */
    findMaxDelay(invoices) {
      if (!invoices || !Array.isArray(invoices) || invoices.length === 0) return 0;
      
      const delays = invoices.map(invoice => this.calculateDaysOverdue(invoice.datepiece));
      return Math.max(...delays);
    },
    
    /**
     * Obtenir la date la plus récente
     */
    getLatestInvoiceDate(invoices) {
      if (!invoices || !Array.isArray(invoices) || invoices.length === 0) return 0;
      
      const dates = invoices.map(invoice => {
        let dateObj;
        if (typeof invoice.datepiece === 'string') {
          dateObj = new Date(invoice.datepiece);
        } else if (typeof invoice.datepiece === 'number') {
          dateObj = new Date(invoice.datepiece);
        } else if (invoice.datepiece instanceof Date) {
          dateObj = invoice.datepiece;
        } else if (invoice.datepiece?.__type === 'Date' && invoice.datepiece.iso) {
          dateObj = new Date(invoice.datepiece.iso);
        } else {
          dateObj = new Date(0);
        }
        
        return isNaN(dateObj.getTime()) ? 0 : dateObj.getTime();
      });
      
      return Math.max(...dates);
    },
    
    // Méthodes utilitaires
    
    isMobileDevice() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      
      return isMobile || isSmallScreen;
    },
    
    truncateText(text, maxLength = 240) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    
    formatAddress(invoice) {
      if (!invoice) return 'Adresse inconnue';
      
      const parts = [];
      
      if (invoice.numVoie) parts.push(invoice.numVoie);
      if (invoice.typeVoie) parts.push(invoice.typeVoie);
      if (invoice.cptAdresse) parts.push(invoice.cptAdresse);
      if (invoice.adresse) parts.push(invoice.adresse);
      if (invoice.numeroLot) parts.push(`Lot ${invoice.numeroLot}`);
      if (invoice.etage) parts.push(`Étage ${invoice.etage}`);
      if (invoice.entree) parts.push(`Entrée ${invoice.entree}`);
      if (invoice.escalier) parts.push(`Esc. ${invoice.escalier}`);
      if (invoice.porte) parts.push(`Porte ${invoice.porte}`);
      
      if (invoice.codePostal || invoice.ville) {
        const postalCity = [];
        if (invoice.codePostal) postalCity.push(invoice.codePostal);
        if (invoice.ville) postalCity.push(invoice.ville);
        parts.push(postalCity.join(' '));
      }
      
      return parts.length > 0 ? parts.join(', ') : 'Adresse inconnue';
    },
    
    formatInterventionDate(date) {
      return this.formatDate(date);
    },
    
    // Statistiques communes
    get totalImpayesCount() {
      return this.filteredImpayes.length;
    },
    
    get totalAmount() {
      return this.filteredImpayes.reduce((total, invoice) => total + (invoice.resteapayer || 0), 0);
    },
    
    get averageDelay() {
      if (this.filteredImpayes.length === 0) return 0;
      const totalDelay = this.filteredImpayes.reduce((total, invoice) => {
        return total + this.calculateDaysOverdue(invoice.datepiece);
      }, 0);
      return Math.round(totalDelay / this.filteredImpayes.length);
    }
  });
});
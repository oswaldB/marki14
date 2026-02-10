/**
 * État Alpine.js pour la page impayes index (par payeur)
 * Version simplifiée et nettoyée
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('impayesIndexState', () => ({
    
    // État initial
    impayes: [],              // Données brutes des factures
    searchQuery: '',          // Texte de recherche
    viewMode: 'byPayeur',     // Mode d'affichage actuel
    isLoading: true,          // État de chargement général
    sortBy: 'amount',         // Option de tri pour le regroupement par payeur
    sortDirection: 'desc',    // Direction de tri
    payerTypeFilter: '',     // Filtre par type de payeur
    delayFilter: '',         // Filtre par délai
    amountFilter: '',        // Filtre par montant
    isSearching: false,      // État de recherche en cours

    // Propriétés calculées (getters)
    get filteredImpayes() {
      console.log('Calcul des factures filtrées...');
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
    
    get sortedImpayes() {
      console.log(`Tri des factures (${this.sortBy} ${this.sortDirection})...`);
      
      return [...this.filteredImpayes].sort((a, b) => {
        let valueA, valueB;
        
        switch (this.sortBy) {
          case 'delay':
            valueA = this.calculateDaysOverdue(a.datepiece);
            valueB = this.calculateDaysOverdue(b.datepiece);
            break;
            
          case 'date':
            valueA = new Date(a.datepiece || 0).getTime();
            valueB = new Date(b.datepiece || 0).getTime();
            break;
            
          case 'amount':
          default:
            valueA = a.resteapayer || 0;
            valueB = b.resteapayer || 0;
            break;
        }
        
        if (this.sortDirection === 'asc') {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      });
    },
    
    get impayesByPayeur() {
      console.log('Regroupement des factures par payeur...');
      const grouped = {};
      const uniqueInvoices = new Map();
      
      this.filteredImpayes.forEach(invoice => {
        const invoiceKey = invoice.nfacture;
        
        if (!uniqueInvoices.has(invoiceKey)) {
          uniqueInvoices.set(invoiceKey, invoice);
        } else {
          console.warn(`⚠️ Facture en double détectée: ${invoice.nfacture}`);
        }
      });
      
      uniqueInvoices.forEach(invoice => {
        const payerName = invoice.payeur_nom || 'Inconnu';
        if (!grouped[payerName]) {
          grouped[payerName] = [];
        }
        grouped[payerName].push(invoice);
      });
      
      return grouped;
    },
    
    get sortedImpayesByPayeur() {
      console.log(`Tri des groupes par payeur (${this.sortBy} ${this.sortDirection})...`);
      const sorted = {};
      const groups = Object.entries(this.impayesByPayeur);
      
      groups.sort((a, b) => {
        const invoicesA = a[1];
        const invoicesB = b[1];
        let valueA, valueB;
        
        switch (this.sortBy) {
          case 'delay':
            valueA = this.findMaxDelay(invoicesA);
            valueB = this.findMaxDelay(invoicesB);
            break;
            
          case 'date':
            valueA = this.getLatestInvoiceDate(invoicesA);
            valueB = this.getLatestInvoiceDate(invoicesB);
            break;
            
          case 'amount':
          default:
            valueA = this.calculateGroupTotal(invoicesA);
            valueB = this.calculateGroupTotal(invoicesB);
            break;
        }
        
        if (this.sortDirection === 'asc') {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      });
      
      groups.forEach(([payerName, invoices]) => {
        sorted[payerName] = invoices;
      });
      
      return sorted;
    },
    
    get impayesBySequence() {
      console.log('Regroupement des factures par séquence...');
      const grouped = {};
      
      grouped['Sans séquence'] = this.filteredImpayes.filter(invoice => 
        !invoice.sequence_id || invoice.sequence_name === 'Sans séquence'
      );
      
      this.filteredImpayes.forEach(invoice => {
        if (invoice.sequence_id && invoice.sequence_name !== 'Sans séquence') {
          if (!grouped[invoice.sequence_name]) {
            grouped[invoice.sequence_name] = [];
          }
          grouped[invoice.sequence_name].push(invoice);
        }
      });
      
      return grouped;
    },

    // Méthodes principales
    async init() {
      try {
        console.log('Initialisation de la page impayes...');
        this.isLoading = true;
        
        const initTimeout = setTimeout(() => {
          console.error('❌ Timeout de l\'initialisation atteint');
          this.isLoading = false;
          clearTimeout(initTimeout);
        }, 30000);
        
        let parseRetryCount = 0;
        const maxParseRetries = 5;
        
        while (!window.Parse && parseRetryCount < maxParseRetries) {
          console.warn('⚠️ Parse n\'est pas encore disponible...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          parseRetryCount++;
        }
        
        if (!window.Parse) {
          console.error('❌ Parse n\'est pas disponible');
          this.isLoading = false;
          clearTimeout(initTimeout);
          return;
        }
        
        this.detectViewModeFromUrl();
        await this.fetchImpayes();
        
        console.log('✅ Initialisation terminée');
        this.isLoading = false;
        clearTimeout(initTimeout);
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        this.isLoading = false;
        clearTimeout(initTimeout);
      }
    },
    
    detectViewModeFromUrl() {
      const pathname = window.location.pathname;
      console.log('Détection du mode de vue depuis URL:', pathname);
      this.viewMode = 'byPayeur';
      console.log('Mode de vue défini à:', this.viewMode);
    },
    
    async syncImpayesFromPostgres() {
      try {
        this.isLoading = true;
        const response = await Parse.Cloud.run('syncImpayes');
        await this.fetchImpayes();
      } catch (error) {
        console.error('❌ Erreur lors de la synchronisation:', error);
        await this.fetchImpayes();
      }
    },
    
    async fetchImpayes() {
      try {
        this.isLoading = true;
        
        const Impayes = Parse.Object.extend('Impayes');
        const query = new Parse.Query(Impayes);
        
        query.notEqualTo('resteapayer', 0);
        query.equalTo('facturesoldee', false);
        query.include('sequence');
        query.limit(99999);
        
        const results = await query.find();
        
        this.impayes = results.map(item => {
          const json = item.toJSON();
          
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
        
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des factures:', error);
        this.impayes = [];
      } finally {
        this.isLoading = false;
      }
    },
    
    setViewMode(mode) {
      console.log('Changement de mode d\'affichage:', mode);
      this.viewMode = mode;
    },
    
    updateSearch() {
      console.log('Requête de recherche mise à jour:', this.searchQuery);
    },
    
    async performSearch() {
      try {
        this.isSearching = true;
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('❌ Erreur lors de la recherche:', error);
      } finally {
        this.isSearching = false;
      }
    },
    
    setSortBy(sortBy) {
      console.log('Changement de l\'option de tri:', sortBy);
      this.sortBy = sortBy;
    },
    
    setSortDirection(direction) {
      console.log('Changement de la direction de tri:', direction);
      this.sortDirection = direction;
    },
    
    toggleSortDirection() {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    },
    
    setPayerTypeFilter(type) {
      console.log('🔍 Filtre par type de payeur mis à jour:', type);
      this.payerTypeFilter = type;
    },
    
    setDelayFilter(delay) {
      console.log('🔍 Filtre par délai mis à jour:', delay);
      this.delayFilter = delay;
    },
    
    setAmountFilter(amount) {
      console.log('🔍 Filtre par montant mis à jour:', amount);
      this.amountFilter = amount;
    },
    
    resetFilters() {
      console.log('🔍 Réinitialisation de tous les filtres');
      this.searchQuery = '';
      this.payerTypeFilter = '';
      this.delayFilter = '';
      this.amountFilter = '';
    },
    
    isMobileDevice() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      return isMobile || isSmallScreen;
    },
    
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
    
    calculateGroupTotal(invoices) {
      if (!invoices || !Array.isArray(invoices)) return 0;
      return invoices.reduce((total, invoice) => total + (invoice.resteapayer || 0), 0);
    },
    
    findMaxDelay(invoices) {
      if (!invoices || !Array.isArray(invoices) || invoices.length === 0) return 0;
      const delays = invoices.map(invoice => this.calculateDaysOverdue(invoice.datepiece));
      return Math.max(...delays);
    },
    
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
    
    getUniqueSequences(invoices) {
      if (!invoices || !Array.isArray(invoices) || invoices.length === 0) return [];
      
      const uniqueSequences = new Map();
      invoices.forEach(invoice => {
        if (invoice.sequence_name && !uniqueSequences.has(invoice.sequence_name)) {
          uniqueSequences.set(invoice.sequence_name, {
            name: invoice.sequence_name,
            is_automatic: invoice.sequence_is_automatic
          });
        }
      });
      
      return Array.from(uniqueSequences.values());
    },
    
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
    },
    
    get contactsToFixCount() {
      return this.contactsWithoutEmails.length;
    },
    
    get contactsWithoutEmails() {
      const contacts = new Map();
      
      this.filteredImpayes.forEach(invoice => {
        if (!invoice.payeur_email) {
          this.addInvoiceToContact(contacts, invoice.payeur_nom || 'Payeur Inconnu', invoice);
        }
        
        if (invoice.apporteur_nom && !invoice.apporteur_email) {
          this.addInvoiceToContact(contacts, invoice.apporteur_nom, invoice);
        }
      });
      
      return Array.from(contacts.values());
    },
    
    addInvoiceToContact(contacts, contactName, invoice) {
      if (!contacts.has(contactName)) {
        contacts.set(contactName, {
          name: contactName,
          invoices: [],
          totalAmount: 0,
          maxDelay: 0
        });
      }
      
      const contact = contacts.get(contactName);
      contact.invoices.push(invoice);
      contact.totalAmount += invoice.resteapayer || 0;
      
      const invoiceDelay = this.calculateDaysOverdue(invoice.datepiece);
      if (invoiceDelay > contact.maxDelay) {
        contact.maxDelay = invoiceDelay;
      }
    },
    
    get topPayeursByAmount() {
      const payersByAmount = [];
      const payersMap = new Map();
      
      this.filteredImpayes.forEach(invoice => {
        const payerName = invoice.payeur_nom || 'Inconnu';
        if (!payersMap.has(payerName)) {
          payersMap.set(payerName, {
            name: payerName,
            amount: 0,
            delay: 0,
            invoiceCount: 0
          });
        }
        
        const payerData = payersMap.get(payerName);
        payerData.amount += invoice.resteapayer || 0;
        payerData.invoiceCount++;
        
        const invoiceDelay = this.calculateDaysOverdue(invoice.datepiece);
        if (invoiceDelay > payerData.delay) {
          payerData.delay = invoiceDelay;
        }
      });
      
      const payersArray = Array.from(payersMap.values());
      payersArray.sort((a, b) => b.amount - a.amount);
      
      return payersArray.slice(0, 5);
    },
    
    get topPayeursByDelay() {
      const payersByDelay = [];
      const payersMap = new Map();
      
      this.filteredImpayes.forEach(invoice => {
        const payerName = invoice.payeur_nom || 'Inconnu';
        if (!payersMap.has(payerName)) {
          payersMap.set(payerName, {
            name: payerName,
            amount: 0,
            delay: 0,
            invoiceCount: 0
          });
        }
        
        const payerData = payersMap.get(payerName);
        payerData.amount += invoice.resteapayer || 0;
        payerData.invoiceCount++;
        
        const invoiceDelay = this.calculateDaysOverdue(invoice.datepiece);
        if (invoiceDelay > payerData.delay) {
          payerData.delay = invoiceDelay;
        }
      });
      
      const payersArray = Array.from(payersMap.values());
      payersArray.sort((a, b) => b.delay - a.delay);
      
      return payersArray.slice(0, 5);
    }
  }));
});
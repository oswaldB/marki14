/**
 * État Alpine.js pour la page impayes to-fix (contacts avec emails manquants)
 * Version simplifiée et nettoyée
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('impayesState', () => ({
    
    // État initial
    impayes: [],              // Données brutes des factures
    searchQuery: '',          // Texte de recherche
    viewMode: 'toFix',        // Mode d'affichage actuel
    isLoading: true,          // État de chargement général
    isSearching: false,      // État de recherche en cours
    payerTypeFilter: '',     // Filtre par type de payeur
    delayFilter: '',         // Filtre par délai

    // Propriétés calculées
    get filteredImpayes() {
      let result = this.impayes;
      
      // Filtre de recherche texte
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(invoice => {
          const invoiceText = JSON.stringify(invoice).toLowerCase();
          return invoiceText.includes(query);
        });
      }
      
      // Filtre par type de payeur
      if (this.payerTypeFilter) {
        result = result.filter(invoice => {
          return invoice.payeur_type === this.payerTypeFilter;
        });
      }
      
      // Filtre par délai
      if (this.delayFilter) {
        const delayDays = parseInt(this.delayFilter);
        if (!isNaN(delayDays)) {
          result = result.filter(invoice => {
            const invoiceDelay = this.calculateDaysOverdue(invoice.datepiece);
            return invoiceDelay >= delayDays;
          });
        }
      }
      
      return result;
    },
    
    get impayesToFix() {
      return this.filteredImpayes.filter(invoice => {
        return !invoice.payeur_email || 
               (invoice.apporteur_nom && !invoice.apporteur_email);
      });
    },
    
    get contactsWithoutEmails() {
      const contacts = new Map();
      
      this.filteredImpayes.forEach(invoice => {
        // Vérifier les contacts sans email
        if (!invoice.payeur_email) {
          this.addInvoiceToContact(contacts, invoice.payeur_nom || 'Payeur Inconnu', invoice);
        }
        
        if (invoice.apporteur_nom && !invoice.apporteur_email) {
          this.addInvoiceToContact(contacts, invoice.apporteur_nom, invoice);
        }
      });
      
      return Array.from(contacts.values());
    },

    // Méthodes principales
    async init() {
      try {
        console.log('Initialisation de la page impayes to-fix...');
        this.isLoading = true;
        
        const initTimeout = setTimeout(() => {
          console.error('Timeout de l\'initialisation atteint');
          this.isLoading = false;
          clearTimeout(initTimeout);
        }, 30000);
        
        let parseRetryCount = 0;
        const maxParseRetries = 5;
        
        while (!window.Parse && parseRetryCount < maxParseRetries) {
          console.warn('Parse n\'est pas encore disponible...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          parseRetryCount++;
        }
        
        if (!window.Parse) {
          console.error('Parse n\'est pas disponible');
          this.isLoading = false;
          clearTimeout(initTimeout);
          return;
        }
        
        await this.fetchImpayes();
        
        console.log('Initialisation terminée');
        this.isLoading = false;
        clearTimeout(initTimeout);
        
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        this.isLoading = false;
        clearTimeout(initTimeout);
      }
    },
    
    async syncImpayesFromPostgres() {
      try {
        this.isLoading = true;
        const response = await Parse.Cloud.run('syncImpayes');
        await this.fetchImpayes();
      } catch (error) {
        console.error('Erreur lors de la synchronisation:', error);
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
        console.error('Erreur lors de la récupération des factures:', error);
        this.impayes = [];
      } finally {
        this.isLoading = false;
      }
    },
    
    updateSearch() {
      console.log('Requête de recherche mise à jour:', this.searchQuery);
    },
    
    async performSearch() {
      try {
        this.isSearching = true;
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      } finally {
        this.isSearching = false;
      }
    },
    
    setPayerTypeFilter(type) {
      this.payerTypeFilter = type;
    },
    
    setDelayFilter(delay) {
      this.delayFilter = delay;
    },
    
    resetFilters() {
      this.searchQuery = '';
      this.payerTypeFilter = '';
      this.delayFilter = '';
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
      } else if (invoiceDate.__type === 'Date' && invoiceDate.iso) {
        invoiceDateObj = new Date(invoiceDate.iso);
      } else {
        return 0;
      }
      
      if (isNaN(invoiceDateObj.getTime())) {
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
      } else if (date.__type === 'Date' && date.iso) {
        dateObj = new Date(date.iso);
      } else {
        return 'Date inconnue';
      }
      
      if (isNaN(dateObj.getTime())) {
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
    
    copyContactInfo(contact) {
      if (!contact || !contact.name) {
        console.error('Contact invalide pour la copie');
        return;
      }
      
      const contactInfo = {
        Nom: contact.name,
        'Nombre de factures': contact.invoices.length,
        'Retard maximum': `${contact.maxDelay} jours`,
        'Total à payer': contact.totalAmount.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'}),
        'Factures associées': contact.invoices.map(invoice => `
  - Facture #${invoice.nfacture} (${invoice.resteapayer || 0}€, ${this.calculateDaysOverdue(invoice.datepiece)}j retard)`).join('')
      };
      
      const textToCopy = Object.entries(contactInfo)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        console.log(`Informations du contact "${contact.name}" copiées dans le presse-papiers`);
      }).catch(err => {
        console.error('Échec de la copie dans le presse-papiers:', err);
        
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            console.log(`Informations du contact "${contact.name}" copiées avec la méthode de secours`);
          }
        } catch (fallbackErr) {
          console.error('Échec de la copie avec la méthode de secours:', fallbackErr);
        }
        
        document.body.removeChild(textarea);
      });
    },
    
    async verifyMissingEmails() {
      try {
        this.isLoading = true;
        const response = await Parse.Cloud.run('syncImpayes');
        await this.fetchImpayes();
        return response;
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },
    
    exportMissingEmailsToCSV() {
      const missingEmails = this.impayes.filter(invoice => {
        return !invoice.payeur_email || 
               (invoice.apporteur_nom && !invoice.apporteur_email);
      });
      
      if (missingEmails.length === 0) {
        console.log('Aucun email manquant trouvé');
        return null;
      }
      
      const headers = ['Facture', 'Payeur', 'Email Payeur', 'Apporteur', 'Email Apporteur', 'Montant', 'Date'];
      const rows = missingEmails.map(invoice => [
        invoice.nfacture || '',
        invoice.payeur_nom || '',
        invoice.payeur_email || 'MANQUANT',
        invoice.apporteur_nom || '',
        invoice.apporteur_email || 'MANQUANT',
        invoice.resteapayer || 0,
        invoice.datepiece || ''
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'emails_manquants.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Export de ${missingEmails.length} factures avec emails manquants`);
      return csvContent;
    }
  }));
});
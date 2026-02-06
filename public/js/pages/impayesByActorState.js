/**
 * État Alpine.js pour la page impayes by-actor (vue par acteur)
 * Version simplifiée et nettoyée
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('impayesByActorState', () => ({
    
    // État initial
    impayes: [],              // Données brutes des factures
    searchQuery: '',          // Texte de recherche
    viewMode: 'byActor',      // Mode d'affichage actuel
    isLoading: true,          // État de chargement général
    actorSortBy: 'total',    // Option de tri pour la vue par acteur (total, name, count)
    actorSortDirection: 'desc', // Direction de tri pour la vue par acteur (desc, asc)
    isSearching: false,      // État de recherche en cours
    
    // Filtres spécifiques à la vue par acteur
    payerTypeFilter: '',     // Filtre par type de payeur
    delayFilter: '',         // Filtre par délai (retard)
    amountFilter: '',        // Filtre par montant
    
    // Propriétés calculées (getters)
    get filteredImpayes() {
      console.log('Calcul des factures filtrées pour la vue par acteur...');
      let result = [...this.impayes];
      
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
    
    get impayesByActor() {
      console.log('Regroupement des factures par acteur...');
      const grouped = {};
      
      // First, group invoices by invoice number to handle duplicates
      const invoicesByNumber = {};
      this.filteredImpayes.forEach(invoice => {
        const invoiceKey = invoice.nfacture;
        if (!invoicesByNumber[invoiceKey]) {
          invoicesByNumber[invoiceKey] = invoice;
        } else {
          console.warn(`⚠️ Facture en double détectée: ${invoice.nfacture} - conservation de la première occurrence`);
        }
      });
      
      // Now process the unique invoices
      Object.values(invoicesByNumber).forEach(invoice => {
        // Regrouper par payeur pour "à régler"
        const payerName = invoice.payeur_nom || 'Inconnu';
        if (!grouped[payerName]) {
          grouped[payerName] = {
            toPay: [],
            broughtIn: []
          };
        }
        
        // Ajouter à la liste "à régler" (toujours le cas pour les impayés)
        grouped[payerName].toPay.push(invoice);
        
        // Ajouter à la liste "apportées" si apporteur existe
        if (invoice.apporteur_nom) {
          const providerName = invoice.apporteur_nom;
          if (!grouped[providerName]) {
            grouped[providerName] = {
              toPay: [],
              broughtIn: []
            };
          }
          grouped[providerName].broughtIn.push(invoice);
        }
      });
      
      return this.sortActors(grouped);
    },
    
    /**
     * Trier les acteurs
     * @param {Object} actors - Objet groupé par acteur
     * @returns {Object} Acteurs triés
     */
    sortActors(actors) {
      console.log(`Tri des acteurs (${this.actorSortBy} ${this.actorSortDirection})...`);
      const sorted = {};
      
      // Convertir l'objet groupé en tableau pour le tri
      const actorEntries = Object.entries(actors);
      
      // Trier selon l'option sélectionnée
      actorEntries.sort((a, b) => {
        const [actorNameA, actorDataA] = a;
        const [actorNameB, actorDataB] = b;
        
        let valueA, valueB;
        
        switch (this.actorSortBy) {
          case 'name': // Nom de l'acteur
            valueA = actorNameA.toLowerCase();
            valueB = actorNameB.toLowerCase();
            break;
            
          case 'count': // Nombre total de factures
            valueA = actorDataA.toPay.length + actorDataA.broughtIn.length;
            valueB = actorDataB.toPay.length + actorDataB.broughtIn.length;
            break;
            
          case 'total': // Montant total
          default:
            valueA = this.calculateGroupTotal(actorDataA.toPay);
            valueB = this.calculateGroupTotal(actorDataB.toPay);
            break;
        }
        
        // Appliquer la direction de tri
        if (this.actorSortDirection === 'asc') {
          if (typeof valueA === 'string' && typeof valueB === 'string') {
            return valueA.localeCompare(valueB);
          } else {
            return valueA - valueB;
          }
        } else {
          if (typeof valueA === 'string' && typeof valueB === 'string') {
            return valueB.localeCompare(valueA);
          } else {
            return valueB - valueA;
          }
        }
      });
      
      // Reconvertir en objet
      actorEntries.forEach(([actorName, actorData]) => {
        sorted[actorName] = actorData;
      });
      
      return sorted;
    },
    
    /**
     * Initialisation du composant
     */
    async init() {
      try {
        console.log('Initialisation de la page impayes by-actor...');
        this.isLoading = true;

        // Timeout de sécurité pour éviter que isLoading reste bloqué indéfiniment
        const initTimeout = setTimeout(() => {
          console.error('❌ Timeout de l\'initialisation atteint (30 secondes)');
          this.isLoading = false;
          clearTimeout(initTimeout);
        }, 30000);

        // Vérifier que Parse est disponible
        let parseRetryCount = 0;
        const maxParseRetries = 5;
        
        while (!window.Parse && parseRetryCount < maxParseRetries) {
          console.warn('⚠️ Parse n\'est pas encore disponible, attente... (tentative ' + (parseRetryCount + 1) + '/' + maxParseRetries + ')');
          await new Promise(resolve => setTimeout(resolve, 1000));
          parseRetryCount++;
        }

        if (!window.Parse) {
          console.error('❌ Parse n\'est pas disponible après ' + maxParseRetries + ' tentatives');
          this.isLoading = false;
          clearTimeout(initTimeout);
          return;
        }

        // Détecter le mode de vue basé sur l'URL
        this.detectViewModeFromUrl();

        // Charger les données
        await this.fetchImpayes();
        
        console.log('✅ Initialisation terminée avec succès');
        this.isLoading = false;
        clearTimeout(initTimeout);
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        this.isLoading = false;
        clearTimeout(initTimeout);
        // Réessayer après un court délai, mais avec une limite
        if (this.initRetryCount < 3) {
          this.initRetryCount = (this.initRetryCount || 0) + 1;
          console.log('🔄 Nouvelle tentative d\'initialisation (' + this.initRetryCount + '/3)...');
          setTimeout(() => this.init(), 2000);
        } else {
          console.error('❌ Échec de l\'initialisation après 3 tentatives');
        }
      }
    },
    
    /**
     * Détecte le mode de vue basé sur l'URL actuelle
     */
    detectViewModeFromUrl() {
      const pathname = window.location.pathname;
      console.log('Détection du mode de vue depuis URL:', pathname);
      this.viewMode = 'byActor';
      console.log('Mode de vue défini à:', this.viewMode);
    },
    
    /**
     * Récupère les factures impayées depuis Parse
     */
    async fetchImpayes() {
      console.log('Récupération des factures impayées depuis Parse...');
      
      try {
        this.isLoading = true;
        
        // Timeout de sécurité pour la requête
        const fetchTimeout = setTimeout(() => {
          console.error('❌ Timeout de la requête fetchImpayes atteint (15 secondes)');
          this.isLoading = false;
        }, 15000);
        
        // Créer une requête pour les factures impayées
        const Impayes = Parse.Object.extend('Impayes');
        const query = new Parse.Query(Impayes);
        
        // Filtre: resteapayer != 0 et facturesoldee = false
        query.notEqualTo('resteapayer', 0);
        query.equalTo('facturesoldee', false);
        
        // Inclure les données de séquence si disponibles
        query.include('sequence');
        
        // Limite à 99999 enregistrements
        query.limit(99999);
        
        // Exécuter la requête
        const results = await query.find();
        
        // Convertir les objets Parse en objets JavaScript simples
        this.impayes = results.map(item => {
          const json = item.toJSON();
          
          // Ajouter les informations de séquence si disponibles
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
        
        console.log(`✅ ${this.impayes.length} factures impayées récupérées`);
        if (this.impayes.length > 0) {
          console.log('📄 Exemple de facture:', this.impayes[0]);
        }
        
        clearTimeout(fetchTimeout);
        
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des factures:', error);
        this.impayes = [];
        
        // Si c'est une erreur de réseau, essayer de recharger après un délai
        if (error.message && (error.message.includes('network') || error.message.includes('ECONN'))) {
          console.log('🔄 Nouvelle tentative de chargement des factures après erreur réseau...');
          setTimeout(() => this.fetchImpayes(), 5000);
        }
      } finally {
        this.isLoading = false;
        console.log('🔄 Chargement des données terminé');
      }
    },
    
    /**
     * Met à jour la requête de recherche
     */
    updateSearch() {
      console.log('Requête de recherche mise à jour:', this.searchQuery);
      console.log('🔍 Nombre de résultats filtrés:', this.filteredImpayes.length);
    },
    
    /**
     * Effectue la recherche avec loader
     */
    async performSearch() {
      console.log('🔍 Début de la recherche:', this.searchQuery);
      
      try {
        this.isSearching = true;
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ Recherche terminée. Résultats:', this.filteredImpayes.length);
        
      } catch (error) {
        console.error('❌ Erreur lors de la recherche:', error);
      } finally {
        this.isSearching = false;
      }
    },
    
    /**
     * Changer l'option de tri pour la vue par acteur
     * @param {string} sortBy - Option de tri (total, name, count)
     */
    setActorSortBy(sortBy) {
      console.log('Changement de l\'option de tri pour la vue par acteur:', sortBy);
      this.actorSortBy = sortBy;
      console.log('📊 Tri de la vue par acteur mis à jour:', {
        actorSortBy: this.actorSortBy,
        actorSortDirection: this.actorSortDirection
      });
    },
    
    /**
     * Basculer la direction de tri pour la vue par acteur
     */
    toggleActorSortDirection() {
      this.actorSortDirection = this.actorSortDirection === 'asc' ? 'desc' : 'asc';
      console.log('📊 Direction de tri de la vue par acteur basculée:', this.actorSortDirection);
    },
    
    /**
     * Mettre à jour le filtre par type de payeur
     * @param {string} type - Type de payeur à filtrer
     */
    setPayerTypeFilter(type) {
      console.log('🔍 Filtre par type de payeur mis à jour:', type);
      this.payerTypeFilter = type;
    },
    
    /**
     * Mettre à jour le filtre par délai
     * @param {string} delay - Délai minimum en jours
     */
    setDelayFilter(delay) {
      console.log('🔍 Filtre par délai mis à jour:', delay);
      this.delayFilter = delay;
    },
    
    /**
     * Mettre à jour le filtre par montant
     * @param {string} amount - Montant minimum
     */
    setAmountFilter(amount) {
      console.log('🔍 Filtre par montant mis à jour:', amount);
      this.amountFilter = amount;
    },
    
    /**
     * Réinitialiser tous les filtres
     */
    resetFilters() {
      console.log('🔍 Réinitialisation de tous les filtres');
      this.searchQuery = '';
      this.payerTypeFilter = '';
      this.delayFilter = '';
      this.amountFilter = '';
    },
    
    /**
     * Détecter si l'appareil est mobile
     * @returns {boolean} True si l'appareil est mobile
     */
    isMobileDevice() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      return isMobile || isSmallScreen;
    },
    
    /**
     * Calculer les jours de retard pour une facture
     * @param {Date} invoiceDate - La date de la facture
     * @returns {number} Jours de retard
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
      
      console.log(`⏰ ${diffDays} jours de retard pour la facture datée du ${invoiceDate}`);
      return diffDays;
    },
    
    /**
     * Formater une date pour l'affichage
     * @param {*} date - Date à formater
     * @returns {string} Date formatée
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
     * Formater une adresse complète
     * @param {Object} invoice - La facture contenant les informations d'adresse
     * @returns {string} Adresse formatée
     */
    formatAddress(invoice) {
      if (!invoice) return 'Adresse inconnue';
      
      const parts = [];
      
      if (invoice.numVoie) {
        parts.push(invoice.numVoie);
      }
      
      if (invoice.typeVoie) {
        parts.push(invoice.typeVoie);
      }
      
      if (invoice.cptAdresse) {
        parts.push(invoice.cptAdresse);
      }
      
      if (invoice.adresse) {
        parts.push(invoice.adresse);
      }
      
      if (invoice.numeroLot) {
        parts.push(`Lot ${invoice.numeroLot}`);
      }
      
      if (invoice.etage) {
        parts.push(`Étage ${invoice.etage}`);
      }
      
      if (invoice.entree) {
        parts.push(`Entrée ${invoice.entree}`);
      }
      
      if (invoice.escalier) {
        parts.push(`Esc. ${invoice.escalier}`);
      }
      
      if (invoice.porte) {
        parts.push(`Porte ${invoice.porte}`);
      }
      
      if (invoice.codePostal || invoice.ville) {
        const postalCity = [];
        if (invoice.codePostal) {
          postalCity.push(invoice.codePostal);
        }
        if (invoice.ville) {
          postalCity.push(invoice.ville);
        }
        parts.push(postalCity.join(' '));
      }
      
      return parts.length > 0 ? parts.join(', ') : 'Adresse inconnue';
    },
    
    /**
     * Calculer le total pour un groupe de factures
     * @param {Array} invoices - Liste de factures
     * @returns {number} Total
     */
    calculateGroupTotal(invoices) {
      if (!invoices || !Array.isArray(invoices)) return 0;
      return invoices.reduce((total, invoice) => total + (invoice.resteapayer || 0), 0);
    },
    
    /**
     * Calculer les statistiques pour les cartes
     */
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
  }));
});
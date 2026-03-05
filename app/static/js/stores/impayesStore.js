// impayesStore.js - Store Alpine.js pour la gestion globale des impayés

document.addEventListener('alpine:init', () => {
  console.log('Enregistrement du store impayesStore');
  Alpine.store('impayesStore', {
    // État global
    impayesData: [],
    currentView: 'payeur', // 'payeur', 'facture', 'acteur', 'payeur-details', 'apporteur'
    isLoading: false,
    isSorting: false,
    error: null,
    isDetailsDrawerOpen: false,
    
    // État pour la sélection multiple
    selectedImpayes: [],
    isBulkMode: false,
    
    // État pour le drawer de séquences
    isSequenceDrawerOpen: false,
    availableSequences: [],
    selectedSequenceForAdd: null,
    newSequenceName: '',
    
    // État du drawer de facture
    isInvoiceDrawerOpen: false,
    invoiceDrawerTitle: '',
    invoiceDrawerLoading: false,
    invoiceDrawerError: null,
    invoiceDrawerPdfContent: null,
    invoiceDrawerFilename: '',
    
    // État de tri moderne - tableau de descripteurs de tri
    sortDescriptors: [
      { field: 'datepiece', direction: 'asc' } // Tri par défaut
    ],
    
    filters: {
      searchTerm: '',
      selectedPayeur: '',
      dateRange: null,
      amountRange: null,
      statusFilter: 'all', // 'all', 'overdue', 'paid'
      sequenceFilter: 'all' // 'all', 'with-sequence', 'without-sequence'
    },
    
    // État spécifique aux vues
    viewStates: {
      payeur: {
        expandedPayeurs: [],
        selectedPayeurForDetails: null
      },
      facture: {
        expandedFactures: [],
        selectedFactureForDetails: null
      },
      acteur: {
        expandedActeurs: [],
        selectedActeurForDetails: null
      }
    },

    // Propriétés calculées
    get payeurs() {
      return [...new Set(this.impayesData.map(imp => imp.payeur_nom))].filter(Boolean);
    },

    get selectedImpayeForDetails() {
      return this.viewStates[this.currentView]?.selectedItemForDetails;
    },
    
    // Initialisation
    init() {
      console.log('Initialisation du store impayesStore');
      this.loadImpayes();
    },
    
    // Charger les impayés depuis Parse
    async loadImpayes() {
      this.isLoading = true;
      this.error = null;
      
      try {
        console.log('Chargement des impayés via ParseAxios');
        if (!window.parseAxios) {
          throw new Error("parseAxios n'est pas disponible");
        }
        
        const response = await window.parseAxios.get('/classes/Impayes', {
          params: { limit: 9999 }
        });
        
        // Pré-calculer les positions de tri pour chaque champ
        const rawData = response.data.results;
        
        // D'abord calculer les délais pour tous les éléments et les ajouter aux données
        const dataWithDelais = rawData.map(item => ({
          ...item,
          delai_calcule: this.calculateDelai(item) // Délai calculé une fois pour toutes
        }));
        
        // Créer des tableaux de tri pour chaque champ (y compris delai_calcule)
        const sortFields = ['datepiece', 'totalttcnet', 'payeur_nom', 'refpiece', 'delai_calcule'];
        const sortPositions = {};
        
        sortFields.forEach(field => {
          const sorted = [...dataWithDelais].sort((a, b) => {
            const valA = a[field] || '';
            const valB = b[field] || '';
            
            if (typeof valA === 'number' && typeof valB === 'number') {
              return valA - valB;
            }
            
            if (field.includes('date')) {
              return new Date(valA) - new Date(valB);
            }
            
            return String(valA).localeCompare(String(valB));
          });
          
          // Créer un mapping position -> objectId
          // Note: Nous inversons l'index pour que les plus petites valeurs aient les plus petits indices
          sortPositions[field] = {};
          sorted.forEach((item, index) => {
            sortPositions[field][item.objectId] = index;
          });
        });
        
        this.impayesData = dataWithDelais.map(impaye => ({
          objectId: impaye.objectId,
          refpiece: impaye.refpiece || '',
          nfacture: impaye.nfacture || '',
          datepiece: impaye.datepiece || '',
          datecre: impaye.datecre || '',
          dateDebutMission: impaye.dateDebutMission || '',
          totalhtnet: impaye.totalhtnet || 0,
          totalttcnet: impaye.totalttcnet || 0,
          resteapayer: impaye.resteapayer || 0,
          facturesoldee: impaye.facturesoldee || false,
          payeur_nom: impaye.payeur_nom || '',
          payeur_typePersonne: impaye.payeur_typePersonne || '',
          payeur_email: impaye.payeur_email || '',
          payeur_telephone: impaye.payeur_telephone || '',
          payeur_isApporteur: impaye.payeur_isApporteur || false,
          delai_calcule: impaye.delai_calcule || 0,
          
          // Ajouter les positions de tri pré-calculées
          sortPositions: {
            tri_date: sortPositions.datepiece[impaye.objectId] || 0,
            tri_montant: sortPositions.totalttcnet[impaye.objectId] || 0,
            tri_payeur: sortPositions.payeur_nom[impaye.objectId] || 0,
            tri_reference: sortPositions.refpiece[impaye.objectId] || 0,
            tri_delai: sortPositions.delai_calcule[impaye.objectId] || 0
          },
          acteur_id: impaye.acteur_id || '',
          acteur_nom: impaye.acteur_nom || '',
          numVoie: impaye.numVoie || '',
          typeVoie: impaye.typeVoie || '',
          cptNumVoie: impaye.cptNumVoie || '',
          adresse: impaye.adresse || '',
          codepostal: impaye.codepostal || '',
          ville: impaye.ville || '',
          idDossier: impaye.idDossier || '',
          reference: impaye.reference || '',
          numero: impaye.numero || '',
          statut_intitule: impaye.statut_intitule || '',
          employe_intervention: impaye.employe_intervention || '',
          idEmployeIntervention: impaye.idEmployeIntervention || '',
          commentaire_piece: impaye.commentaire_piece || '',
          commentaire_dossier: impaye.commentaire_dossier || '',
          contactPlace: impaye.contactPlace || '',
          referenceExterne: impaye.referenceExterne || '',
          invoice_url: impaye.invoice_url || '',
          cptAdresse: impaye.cptAdresse || '',
          codePostal: impaye.codePostal || '',
          numeroLot: impaye.numeroLot || '',
          etage: impaye.etage || '',
          entree: impaye.entree || '',
          escalier: impaye.escalier || '',
          porte: impaye.porte || ''
        }));
        
        console.log('Impayés chargés:', this.impayesData.length, 'enregistrements');
        
      } catch (error) {
        this.error = 'Erreur lors du chargement des impayés: ' + error.message;
        console.error('Erreur:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    // Rafraîchir les données
    refreshData() {
      this.loadImpayes();
    },
    
    // Changer de vue
    switchView(viewName) {
      this.currentView = viewName;
      console.log('Changement de vue vers:', viewName);
      // Réinitialiser l'état spécifique à la vue si nécessaire
      if (!this.viewStates[viewName]) {
        this.viewStates[viewName] = {
          expandedItems: [],
          selectedItemForDetails: null
        };
      }
    },

    // Filtrer les impayés
    filterImpayes() {
      console.log("Filtre appliqué:", this.filters.selectedPayeur);
    },

    // Calculer le délai en jours pour une facture
    calculateDelai(impaye) {
      if (!impaye.datepiece) return 0;
      const dateFacture = new Date(impaye.datepiece);
      const aujourdhui = new Date();
      const diffTime = Math.abs(aujourdhui - dateFacture);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    // Appliquer les descripteurs de tri aux données
    applySortDescriptors(data) {
      if (!this.sortDescriptors?.length || !data || !data.length) return data;
      
      // Mapping entre les champs de filtre et les positions de tri
      const sortFieldMapping = {
        'datepiece': 'tri_date',
        'totalttcnet': 'tri_montant',
        'payeur_nom': 'tri_payeur',
        'refpiece': 'tri_reference',
        'delais': 'tri_delai',
        'delai_calcule': 'tri_delai' // Mapping pour le champ calculé
      };
      
      return [...data].sort((a, b) => {
        for (const descriptor of this.sortDescriptors) {
          const sortKey = sortFieldMapping[descriptor.field] || 'tri_date';
          const posA = a.sortPositions?.[sortKey] || 0;
          const posB = b.sortPositions?.[sortKey] || 0;
          const result = (posA - posB) * (descriptor.direction === 'desc' ? -1 : 1);
          
          // Si les positions sont différentes, retourner le résultat
          if (result !== 0) return result;
        }
        
        // Si tous les tris sont égaux, retourner 0 (égalité)
        return 0;
      });
    },

    // Mettre à jour les descripteurs de tri
    updateSortDescriptor(field) {
      console.log("Mise à jour du descripteur de tri pour:", field);
      this.isSorting = true;
      
      // Trouver si le champ existe déjà dans les descripteurs
      const existingIndex = this.sortDescriptors.findIndex(d => d.field === field);
      
      if (existingIndex >= 0) {
        // Si le champ existe, inverser la direction ou le supprimer
        const currentDirection = this.sortDescriptors[existingIndex].direction;
        const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
        
        // Mettre à jour la direction
        this.sortDescriptors[existingIndex].direction = newDirection;
      } else {
        // Si le champ n'existe pas, l'ajouter avec direction ascendante
        this.sortDescriptors = [{ field, direction: 'asc' }];
      }
      
      setTimeout(() => {
        const filteredData = this.getFilteredData();
        this.impayesData = this.applySortDescriptors(filteredData);
        this.isSorting = false;
      }, 100);
    },

    // Basculer la direction de tri pour le champ actuel
    toggleSortDirection() {
      if (this.sortDescriptors.length === 0) return;
      
      const currentDescriptor = this.sortDescriptors[0];
      currentDescriptor.direction = currentDescriptor.direction === 'asc' ? 'desc' : 'asc';
      
      this.updateSortOrder();
    },

    // Mettre à jour l'ordre de tri (compatibilité)
    updateSortOrder() {
      if (this.sortDescriptors.length === 0) return;
      
      const filteredData = this.getFilteredData();
      this.impayesData = this.applySortDescriptors(filteredData);
    },

    // Trier les impayés (alias pour compatibilité)
    sortImpayes() {
      this.updateSortOrder();
    },
    
    // Obtenir les données groupées selon la vue actuelle
    getGroupedData() {
      const filteredData = this.getFilteredData();
      
      switch (this.currentView) {
        case 'facture':
          return this.groupByFacture(filteredData);
        case 'acteur':
          return this.groupByActeur(filteredData);
        case 'apporteur':
          return this.groupByApporteur(filteredData);
        case 'payeur':
        default:
          return this.groupByPayeur(filteredData);
      }
    },
    
    // Filtrer les données selon les filtres actuels
    getFilteredData() {
      const filtered = this.impayesData.filter(impaye => {
        // Filtre par terme de recherche
        const matchesSearch = !this.filters.searchTerm || 
          Object.values(impaye).some(value => 
            String(value).toLowerCase().includes(this.filters.searchTerm.toLowerCase())
          );
        
        // Filtre par payeur
        const matchesPayeur = !this.filters.selectedPayeur || 
          impaye.payeur_nom === this.filters.selectedPayeur;
        
        // Filtre par statut
        const matchesStatus = this.filters.statusFilter === 'all' ||
          (this.filters.statusFilter === 'overdue' && !impaye.facturesoldee) ||
          (this.filters.statusFilter === 'paid' && impaye.facturesoldee);
        
        // Filtre par séquences
        const matchesSequence = this.filters.sequenceFilter === 'all' ||
          (this.filters.sequenceFilter === 'with-sequence' && this.hasSequences(impaye)) ||
          (this.filters.sequenceFilter === 'without-sequence' && !this.hasSequences(impaye));
        
        return matchesSearch && matchesPayeur && matchesStatus && matchesSequence;
      });
      
      // Appliquer les descripteurs de tri
      return this.applySortDescriptors(filtered);
    },
    
    // Regrouper par payeur
    groupByPayeur(data) {
      return data.reduce((groups, impaye) => {
        const payeur = impaye.payeur_nom;
        if (!groups[payeur]) {
          groups[payeur] = [];
        }
        groups[payeur].push(impaye);
        return groups;
      }, {});
    },
    
    // Regrouper par facture
    groupByFacture(data) {
      return data.reduce((groups, impaye) => {
        const refpiece = impaye.refpiece;
        if (!groups[refpiece]) {
          groups[refpiece] = [];
        }
        groups[refpiece].push(impaye);
        return groups;
      }, {});
    },
    
    // Regrouper par acteur avec deux sous-groupes
    groupByActeur(data) {
      return data.reduce((groups, impaye) => {
        const acteurId = impaye.acteur_id || 'sans-acteur';
        if (!groups[acteurId]) {
          groups[acteurId] = {
            acteurInfo: {
              nom: impaye.acteur_nom || 'Acteur inconnu',
              id: acteurId
            },
            ownOverdueInvoices: [],  // Factures propres en retard
            broughtInvoices: []       // Factures où il est apporteur
          };
        }
        
        // Vérifier si la facture est en retard (non soldée)
        const isOverdue = !impaye.facturesoldee;
        
        // Vérifier si l'acteur est le payeur (facture propre)
        const isOwnInvoice = impaye.acteur_id === impaye.payeur_nom;
        
        if (isOwnInvoice && isOverdue) {
          // Facture propre en retard
          groups[acteurId].ownOverdueInvoices.push(impaye);
        } else if (impaye.payeur_isApporteur && impaye.acteur_id === impaye.payeur_nom) {
          // Facture où l'acteur est apporteur d'affaires
          groups[acteurId].broughtInvoices.push(impaye);
        }
        
        return groups;
      }, {});
    },
    
    // Regrouper par apporteur d'affaires
    groupByApporteur(data) {
      const apporteurs = data.filter(impaye => impaye.payeur_isApporteur);
      return apporteurs.reduce((groups, impaye) => {
        const payeur = impaye.payeur_nom;
        if (!groups[payeur]) {
          groups[payeur] = {
            payeurInfo: {
              nom: impaye.payeur_nom,
              email: impaye.payeur_email,
              telephone: impaye.payeur_telephone,
              isApporteur: true
            },
            ownImpayes: [],
            broughtImpayes: []
          };
        }
        
        // Séparer les impayés propres et ceux apportés
        if (impaye.acteur_id === impaye.payeur_nom) {
          groups[payeur].ownImpayes.push(impaye);
        } else {
          groups[payeur].broughtImpayes.push(impaye);
        }
        
        return groups;
      }, {});
    },
    
    // Basculer l'expansion d'un groupe
    toggleGroupExpansion(viewName, groupId) {
      if (!this.viewStates[viewName]) {
        // Initialize with the correct property name based on view
        let expandedProperty = 'expandedItems';
        if (viewName === 'payeur') expandedProperty = 'expandedPayeurs';
        else if (viewName === 'facture') expandedProperty = 'expandedFactures';
        else if (viewName === 'acteur') expandedProperty = 'expandedActeurs';
        
        this.viewStates[viewName] = { [expandedProperty]: [] };
      }
      
      // Get the correct expanded items array
      let expandedItems;
      switch(viewName) {
        case 'payeur':
          expandedItems = this.viewStates[viewName].expandedPayeurs;
          break;
        case 'facture':
          expandedItems = this.viewStates[viewName].expandedFactures;
          break;
        case 'acteur':
          expandedItems = this.viewStates[viewName].expandedActeurs;
          break;
        default:
          expandedItems = this.viewStates[viewName].expandedItems;
          break;
      }
      
      const index = expandedItems.indexOf(groupId);
      if (index === -1) {
        expandedItems.push(groupId);
      } else {
        expandedItems.splice(index, 1);
      }
    },
    
    // Vérifier si un groupe est expansé
    isGroupExpanded(viewName, groupId) {
      if (!this.viewStates[viewName]) {
        return false;
      }
      
      // Get the correct expanded items array based on view name
      let expandedItems = [];
      switch(viewName) {
        case 'payeur':
          expandedItems = this.viewStates[viewName].expandedPayeurs || [];
          break;
        case 'facture':
          expandedItems = this.viewStates[viewName].expandedFactures || [];
          break;
        case 'acteur':
          expandedItems = this.viewStates[viewName].expandedActeurs || [];
          break;
        default:
          expandedItems = this.viewStates[viewName].expandedItems || [];
          break;
      }
      
      return expandedItems.includes(groupId);
    },
    
    // Ouvrir le drawer de détails
    openDetailsDrawer(item) {
      if (!this.viewStates[this.currentView]) {
        this.viewStates[this.currentView] = {};
      }
      this.viewStates[this.currentView].selectedItemForDetails = item;
      this.isDetailsDrawerOpen = true;
    },
    
    // Fermer le drawer de détails
    closeDetailsDrawer() {
      if (this.viewStates[this.currentView]) {
        this.viewStates[this.currentView].selectedItemForDetails = null;
      }
      this.isDetailsDrawerOpen = false;
    },

    // Ouvrir une facture PDF
    async openInvoice(invoiceUrl) {
      if (!invoiceUrl) {
        console.error('No invoice URL provided');
        return;
      }

      this.isInvoiceDrawerOpen = true;
      this.invoiceDrawerLoading = true;
      this.invoiceDrawerError = null;
      this.invoiceDrawerPdfContent = null;

      try {
        console.log('Loading invoice from:', invoiceUrl);
        // Extract filename from URL
        this.invoiceDrawerFilename = invoiceUrl.split('/').pop() || 'facture.pdf';
        this.invoiceDrawerTitle = `Facture - ${this.invoiceDrawerFilename}`;

        // Appel à l'API getInvoice
        const response = await fetch('/scripts/getInvoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ invoice_url: invoiceUrl })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'error') {
          throw new Error(result.message || 'Erreur lors de la récupération de la facture');
        }
        
        // Utiliser le contenu base64 retourné par l'API
        this.invoiceDrawerPdfContent = result.content;
        
      } catch (error) {
        this.invoiceDrawerError = 'Erreur lors du chargement de la facture: ' + error.message;
        console.error('Error loading invoice:', error);
      } finally {
        this.invoiceDrawerLoading = false;
      }
    },

    // Fermer le drawer de facture
    closeInvoiceDrawer() {
      this.isInvoiceDrawerOpen = false;
      this.invoiceDrawerPdfContent = null;
      this.invoiceDrawerError = null;
    },
    
    // Formater une date (gestion du format Parse)
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      // Gestion du format Parse {__type: "Date", iso: "..."}
      let dateToParse = dateString;
      if (typeof dateString === 'object' && dateString.iso) {
        dateToParse = dateString.iso;
      }
      
      const date = new Date(dateToParse);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      return date.toLocaleDateString('fr-FR');
    },
    
    // Formater un montant
    formatCurrency(amount) {
      if (amount === undefined || amount === null) return '0,00 €';
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    },
    
    // Calculer le retard maximum pour un groupe
    calculateMaxDaysLate(group) {
      if (!group || !group.length) return 0;
      
      const today = new Date();
      let maxDays = 0;
      
      group.forEach(impaye => {
        if (impaye.datepiece && !impaye.facturesoldee) {
          // Gestion du format Parse {__type: "Date", iso: "..."}
          let dateToParse = impaye.datepiece;
          if (typeof impaye.datepiece === 'object' && impaye.datepiece.iso) {
            dateToParse = impaye.datepiece.iso;
          }
          
          const dueDate = new Date(dateToParse);
          
          // Vérifier que la date est valide
          if (isNaN(dueDate.getTime())) {
            console.warn('Date invalide pour impayé:', impaye.objectId, 'datepiece:', impaye.datepiece);
            return;
          }
          
          // Ajouter 30 jours (délai de paiement standard)
          dueDate.setDate(dueDate.getDate() + 30);
          const diffTime = today - dueDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > maxDays) {
            maxDays = diffDays;
          }
        }
      });
      
      return maxDays > 0 ? maxDays : 0;
    },
    
    // Obtenir les informations d'un groupe pour l'affichage
    getGroupDisplayInfo(group, groupKey) {
      switch (this.currentView) {
        case 'facture':
          // Pour le regroupement par facture, utiliser les infos de la première facture
          const firstImpaye = group[0];
          return {
            title: firstImpaye.refpiece || groupKey,
            icon: 'fa-regular fa-file-invoice',
            subtitle: `${group.length} élément(s) - Total: ${this.formatCurrency(group.reduce((sum, imp) => sum + (imp.resteapayer || 0), 0))}`,
            type: 'facture'
          };
        
        case 'acteur':
          // Pour le regroupement par acteur avec sous-groupes
          const ownCount = group.ownOverdueInvoices.length;
          const broughtCount = group.broughtInvoices.length;
          const totalAmount = group.ownOverdueInvoices.reduce((sum, imp) => sum + (imp.resteapayer || 0), 0) +
                             group.broughtInvoices.reduce((sum, imp) => sum + (imp.resteapayer || 0), 0);
          
          return {
            title: group.acteurInfo.nom || groupKey,
            icon: 'fa-regular fa-users',
            subtitle: `${ownCount + broughtCount} facture(s) - Propres en retard: ${ownCount} - Apportées: ${broughtCount} - Total: ${this.formatCurrency(totalAmount)}`,
            type: 'acteur'
          };
        
        case 'apporteur':
          // Pour les apporteurs d'affaires
          return {
            title: group.payeurInfo.nom || groupKey,
            icon: 'fa-regular fa-handshake',
            subtitle: `${group.ownImpayes.length + group.broughtImpayes.length} facture(s) - Propres: ${group.ownImpayes.length} - Apportées: ${group.broughtImpayes.length}`,
            type: 'apporteur'
          };
        
        case 'payeur':
        default:
          // Regroupement par payeur (comportement par défaut)
          const firstItem = group[0];
          return {
            title: firstItem.payeur_nom || groupKey,
            icon: firstItem.payeur_typePersonne === 'P' ? 'fa-regular fa-user' : 'fa-regular fa-building',
            subtitle: `${group.length} facture(s) - Total: ${this.formatCurrency(group.reduce((sum, imp) => sum + (imp.resteapayer || 0), 0))}`,
            type: 'payeur'
          };
      }
    },
    
    // Obtenir les éléments d'un groupe (pour les templates)
    getGroupItems(group) {
      if (this.currentView === 'apporteur') {
        // Pour les apporteurs, retourner tous les impayés (propres + apportés)
        return [...group.ownImpayes, ...group.broughtImpayes];
      }
      if (this.currentView === 'acteur') {
        // Pour les acteurs, retourner tous les impayés des deux sous-groupes
        return [...group.ownOverdueInvoices, ...group.broughtInvoices];
      }
      return group; // Pour les autres vues, retourner le groupe tel quel
    },
    
    // Méthodes pour la sélection multiple
    toggleImpayeSelection(impayeId) {
      const index = this.selectedImpayes.indexOf(impayeId);
      if (index === -1) {
        this.selectedImpayes.push(impayeId);
      } else {
        this.selectedImpayes.splice(index, 1);
      }
      this.isBulkMode = this.selectedImpayes.length > 0;
    },
    
    clearSelection() {
      this.selectedImpayes = [];
      this.isBulkMode = false;
    },
    
    toggleBulkMode() {
      if (this.isBulkMode) {
        // Si le mode bulk est actif, le désactiver et tout désélectionner
        this.clearSelection();
      } else {
        // Si le mode bulk est inactif, l'activer (sans sélectionner automatiquement)
        this.isBulkMode = true;
      }
    },
    
    isImpayeSelected(impayeId) {
      return this.selectedImpayes.includes(impayeId);
    },
    
    selectSingleImpaye(impayeId) {
      // Sélectionner une seule facture et activer le mode bulk
      this.selectedImpayes = [impayeId];
      this.isBulkMode = true;
    },
    
    // Sélectionner toutes les factures d'un groupe
    selectAllInGroup(group) {
      console.log('selectAllInGroup appelé avec:', group);
      const groupItems = this.getGroupItems(group);
      console.log('groupItems:', groupItems);
      const allItemIds = groupItems.map(item => item.objectId);
      console.log('allItemIds:', allItemIds);
      
      // Ajouter toutes les factures du groupe à la sélection
      allItemIds.forEach(id => {
        if (!this.selectedImpayes.includes(id)) {
          this.selectedImpayes.push(id);
        }
      });
      
      console.log('selectedImpayes après ajout:', this.selectedImpayes);
      this.isBulkMode = this.selectedImpayes.length > 0;
    },
    
    // Désélectionner toutes les factures d'un groupe
    deselectAllInGroup(group) {
      const groupItems = this.getGroupItems(group);
      const allItemIds = groupItems.map(item => item.objectId);
      
      // Retirer toutes les factures du groupe de la sélection
      this.selectedImpayes = this.selectedImpayes.filter(
        id => !allItemIds.includes(id)
      );
      
      this.isBulkMode = this.selectedImpayes.length > 0;
    },
    
    // Récupérer les tags de séquences pour une facture
    // Vérifier si toutes les factures d'un groupe sont sélectionnées
    isGroupFullySelected(group) {
      const groupItems = this.getGroupItems(group);
      if (groupItems.length === 0) return false;
      
      return groupItems.every(item => 
        this.selectedImpayes.includes(item.objectId)
      );
    },
    
    // Obtenir les noms des séquences pour une facture
    getSequenceNames(impaye) {
      if (!this.hasSequences(impaye)) return [];
      
      // Gérer différents formats
      if (Array.isArray(impaye.sequence)) {
        return impaye.sequence.map(s => s.nom || s.name || 'Séquence sans nom');
      }
      
      if (typeof impaye.sequence === 'object' && impaye.sequence !== null) {
        return Object.values(impaye.sequence).map(s => s.nom || s.name || 'Séquence sans nom');
      }
      
      if (typeof impaye.sequence === 'string') {
        return [impaye.sequence];
      }
      
      return [];
    },
    
    // Vérifier si un groupe a des séquences attribuées
    groupHasSequences(group) {
      const groupItems = this.getGroupItems(group);
      return groupItems.some(item => this.hasSequences(item));
    },
    
    // Obtenir toutes les séquences uniques pour un groupe
    getGroupSequences(group) {
      const groupItems = this.getGroupItems(group);
      const allSequences = [];
      
      groupItems.forEach(item => {
        if (this.hasSequences(item)) {
          allSequences.push(...this.getSequenceNames(item));
        }
      });
      
      return [...new Set(allSequences)]; // Retourner les séquences uniques
    },
    
    // Méthodes pour le drawer de séquences
    async openSequenceDrawer() {
      console.log('openSequenceDrawer appelé');
      console.log('selectedImpayes:', this.selectedImpayes);
      this.isSequenceDrawerOpen = true;
      try {
        await this.loadAvailableSequences();
        console.log('Séquences chargées:', this.availableSequences);
      } catch (error) {
        console.error('Échec du chargement des séquences, mais le drawer reste ouvert:', error);
        // Le drawer reste ouvert même en cas d'erreur
      }
    },
    
    closeSequenceDrawer() {
      this.isSequenceDrawerOpen = false;
      this.selectedSequenceForAdd = null;
      this.newSequenceName = '';
    },
    
    async loadAvailableSequences() {
      try {
        // Charger les séquences depuis Parse Server
        if (!window.parseAxios) {
          throw new Error("parseAxios n'est pas disponible");
        }
        
        const response = await window.parseAxios.get('/classes/Sequences');
        this.availableSequences = response.data.results || [];
      } catch (error) {
        console.error('Erreur lors du chargement des séquences:', error);
        this.availableSequences = [];
      }
    },
    
    async addToSequence() {
      if (this.selectedImpayes.length === 0) {
        return { success: false, message: 'Aucune facture sélectionnée' };
      }
      
      if (!this.selectedSequenceForAdd && !this.newSequenceName) {
        return { success: false, message: 'Veuillez sélectionner ou créer une séquence' };
      }
      
      try {
        const sequenceId = this.selectedSequenceForAdd || 'new';
        const sequenceName = this.newSequenceName || this.availableSequences.find(s => s.id === sequenceId)?.name;
        
        const response = await axios.post('/api/sequences/add-impayes', {
          sequenceId: sequenceId,
          sequenceName: sequenceName,
          impayeIds: this.selectedImpayes
        });
        
        if (response.data.success) {
          // Mettre à jour localement les factures avec les nouvelles séquences
          this.selectedImpayes.forEach(id => {
            const impaye = this.impayesData.find(i => i.objectId === id);
            if (impaye) {
              if (!impaye.sequences) {
                impaye.sequences = [];
              }
              impaye.sequences.push({
                id: sequenceId,
                nom: sequenceName
              });
            }
          });
          
          this.closeSequenceDrawer();
          return { success: true, message: 'Factures ajoutées à la séquence avec succès' };
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout à la séquence:', error);
        return { success: false, message: 'Erreur lors de l\'ajout à la séquence' };
      }
    },
    
    // Méthode pour archiver les factures sélectionnées
    async archiveSelectedImpayes() {
      if (this.selectedImpayes.length === 0) return;
      
      try {
        const response = await fetch('/script/archive-impayes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ impaye_ids: this.selectedImpayes })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
          // Mettre à jour le statut localement
          this.selectedImpayes.forEach(id => {
            const impaye = this.impayesData.find(i => i.objectId === id);
            if (impaye) {
              impaye.statut = 'archived';
              impaye.facturesoldee = true;
            }
          });
          
          this.clearSelection();
          return { success: true, message: data.message };
        } else {
          return { success: false, message: data.message || 'Erreur lors de l\'archivage' };
        }
      } catch (error) {
        console.error('Erreur lors de l\'archivage:', error);
        return { success: false, message: 'Erreur réseau lors de l\'archivage' };
      }
    }
  });
  
  // Initialiser le store quand la page est prête
  document.addEventListener('DOMContentLoaded', () => {
    if (window.parseAxios) {
      console.log('Initialisation du store impayesStore');
      Alpine.store('impayesStore').init();
    } else {
      console.log('parseAxios non disponible, initialisation reportée');
      // Réessayer toutes les 500ms jusqu'à ce que parseAxios soit disponible
      const initInterval = setInterval(() => {
        if (window.parseAxios) {
          clearInterval(initInterval);
          console.log('Initialisation du store impayesStore (reportée)');
          Alpine.store('impayesStore').init();
        }
      }, 500);
    }
  });
});
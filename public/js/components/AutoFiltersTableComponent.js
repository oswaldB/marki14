/**
 * AutoFiltersTableComponent.js - Composant Alpine.js pour gérer les filtres par colonne
 * Affiche un tableau complet des impayés avec possibilité de filtrer chaque colonne
 * Sauvegarde la requête complète dans la base de données
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('autoFiltersTableComponent', () => ({
    // État interne
    sequenceId: null,
    columns: [],
    visibleColumns: [],
    allInvoices: [],
    filteredInvoices: [],
    columnFilters: {},
    globalSearchTerm: '',
    activeFilterColumn: null,
    forceErase: false,
    isSaving: false,
    isLoading: false,
    isLoadingMore: false,
    isPreviewLoading: false,
    showPreview: false,
    previewResults: [],
    pageSize: 20,
    currentPage: 1,
    isInitialized: false,

    // Initialisation
    init() {
      this.loadSequenceIdFromURL();
      this.loadColumnsFromJSON();
      this.loadExistingFilters();
      this.loadInitialInvoices();
      this.isInitialized = true;
    },

    // Charger l'ID de séquence depuis l'URL
    loadSequenceIdFromURL() {
      const urlParams = new URLSearchParams(window.location.search);
      this.sequenceId = urlParams.get('id');
    },

    // Charger les colonnes depuis le fichier JSON
    async loadColumnsFromJSON() {
      try {
        const response = await fetch('/configs/impayes_colonnes.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const columnsData = await response.json();
        
        // Le fichier contient un tableau simple de colonnes
        if (Array.isArray(columnsData)) {
          this.columns = columnsData;
        } else {
          // Fallback si le format est différent
          this.columns = Object.keys(columnsData);
        }

        // Définir les colonnes visibles par défaut avec les colonnes clés pour les séquences
        const keyColumns = ['nfacture', 'payeur_nom', 'resteapayer', 'facturesoldee', 'datepiece', 'totalttcnet', 'reference', 'payeur_email'];
        
        // Filtrer les colonnes clés qui existent dans le jeu de données
        const availableKeyColumns = keyColumns.filter(col => this.columns.includes(col));
        
        // Ajouter d'autres colonnes pour atteindre environ 15 colonnes visibles
        const additionalColumns = this.columns.filter(col => 
          !availableKeyColumns.includes(col) && 
          (col.includes('nom') || col.includes('date') || col.includes('montant') || col.includes('total') || col.includes('email'))
        ).slice(0, 15 - availableKeyColumns.length);
        
        this.visibleColumns = [...availableKeyColumns, ...additionalColumns];
      } catch (error) {
        console.error('Erreur lors du chargement des colonnes depuis JSON:', error);
        this.useDefaultColumns();
      }
    },

    // Utiliser les colonnes par défaut
    useDefaultColumns() {
      this.columns = [
        'idDossier', 'reference', 'totalhtnet', 'statut_intitule', 'dateDebutMission',
        'payeur_nom', 'payeur_email', 'montant', 'date_echeance', 'datecre',
        'nfacture', 'totalttcnet', 'resteapayer', 'facturesoldee', 'adresse'
      ];
      this.visibleColumns = [...this.columns];
    },

    // Charger les filtres existants depuis la base de données
    async loadExistingFilters() {
      if (!this.sequenceId) return;

      try {
        const sequence = await this.fetchSequence();
        if (sequence) {
          this.forceErase = sequence.force_erase || false;
          
          // Charger les filtres existants
          if (sequence.requete_auto) {
            // Convertir l'ancien format si nécessaire
            if (sequence.requete_auto.include) {
              // Ancien format - convertir vers le nouveau format
              Object.keys(sequence.requete_auto.include).forEach(column => {
                this.columnFilters[column] = {
                  operator: sequence.requete_auto.operators?.include?.[column] || 'contains',
                  value: sequence.requete_auto.include[column]
                };
              });
            } else {
              // Nouveau format
              this.columnFilters = sequence.requete_auto.columnFilters || {};
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la séquence:', error);
      }
    },

    // Récupérer la séquence depuis la base de données
    async fetchSequence() {
      const Sequence = Parse.Object.extend('Sequences');
      const query = new Parse.Query(Sequence);
      return await query.get(this.sequenceId);
    },

    // Charger les factures initiales
    async loadInitialInvoices() {
      this.isLoading = true;
      
      try {
        const invoices = await this.fetchInvoices();
        this.allInvoices = invoices;
        this.filteredInvoices = [...invoices];
        this.applyAllFilters();
      } catch (error) {
        console.error('Erreur lors du chargement des factures:', error);
      } finally {
        this.isLoading = false;
      }
    },

    // Charger plus de factures
    async loadMoreInvoices() {
      this.isLoadingMore = true;
      
      try {
        this.currentPage++;
        const invoices = await this.fetchInvoices(this.currentPage);
        this.allInvoices = [...this.allInvoices, ...invoices];
        this.applyAllFilters();
      } catch (error) {
        console.error('Erreur lors du chargement de plus de factures:', error);
      } finally {
        this.isLoadingMore = false;
      }
    },

    // Récupérer les factures depuis la base de données
    async fetchInvoices(page = 1) {
      const Invoice = Parse.Object.extend('Impayes');
      const query = new Parse.Query(Invoice);
      
      // Limiter le nombre de résultats
      query.limit(this.pageSize);
      query.skip((page - 1) * this.pageSize);
      
      // Trier par date de création
      query.descending('datecre');
      
      const results = await query.find();
      
      // Convertir les résultats Parse en objets JavaScript simples
      return results.map(invoice => {
        const data = invoice.toJSON();
        return {
          objectId: invoice.id,
          ...data
        };
      });
    },

    // Appliquer tous les filtres
    applyAllFilters() {
      let filtered = [...this.allInvoices];
      
      // Appliquer les filtres par colonne
      Object.keys(this.columnFilters).forEach(column => {
        const filter = this.columnFilters[column];
        if (filter && filter.operator && (filter.value || filter.value === '' || filter.value === false)) {
          filtered = this.applyColumnFilterToArray(filtered, column, filter);
        }
      });
      
      // Appliquer la recherche globale
      if (this.globalSearchTerm) {
        filtered = this.applyGlobalSearchToArray(filtered);
      }
      
      this.filteredInvoices = filtered;
      this.updatePreview();
    },

    // Appliquer un filtre de colonne à un tableau
    applyColumnFilterToArray(invoices, column, filter) {
      if (!filter || !filter.operator) {
        return invoices;
      }
      
      return invoices.filter(invoice => {
        const value = invoice[column];
        
        // Handle empty/null values
        if (value === undefined || value === null || value === '') {
          return filter.operator === 'isEmpty' || filter.operator === 'isNotEmpty';
        }
        
        // Convert values to comparable formats
        const stringValue = this.normalizeValueForComparison(value);
        const filterValue = filter.value ? this.normalizeValueForComparison(filter.value) : '';
        
        // Debug logging for filter issues
        console.log(`Applying filter: ${filter.operator} on column ${column}, value: ${stringValue}, filter: ${filterValue}`);
        
        switch (filter.operator) {
          case 'equals':
            return stringValue === filterValue;
          case 'contains':
            return stringValue.includes(filterValue);
          case 'doesNotContain':
            return !stringValue.includes(filterValue);
          case 'startsWith':
            return stringValue.startsWith(filterValue);
          case 'endsWith':
            return stringValue.endsWith(filterValue);
          case 'isEmpty':
            return !value || value === '' || value === null || value === undefined;
          case 'isNotEmpty':
            return value && value !== '' && value !== null && value !== undefined;
          case 'greaterThan':
            return this.compareValues(value, filter.value) > 0;
          case 'lessThan':
            return this.compareValues(value, filter.value) < 0;
          case 'between':
            if (filter.value?.min && filter.value?.max) {
              const minVal = this.parseValue(filter.value.min);
              const maxVal = this.parseValue(filter.value.max);
              const currentVal = this.parseValue(value);
              return currentVal >= minVal && currentVal <= maxVal;
            }
            return true;
          default:
            console.warn(`Unknown filter operator: ${filter.operator}`);
            return true;
        }
      });
    },
    
    // Normalize value for string comparison
    normalizeValueForComparison(value) {
      if (value === undefined || value === null) return '';
      if (typeof value === 'object') {
        // Handle date objects
        if (value instanceof Date) {
          return value.toISOString().toLowerCase();
        }
        // Handle other objects (like Parse objects)
        return String(value).toLowerCase();
      }
      return String(value).toLowerCase();
    },

    // Appliquer la recherche globale
    applyGlobalSearchToArray(invoices) {
      const searchLower = this.globalSearchTerm.toLowerCase();
      return invoices.filter(invoice => {
        return this.columns.some(column => {
          const value = invoice[column];
          if (value === undefined || value === null) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    },

    // Appliquer la recherche globale
    applyGlobalSearch() {
      this.applyAllFilters();
    },

    // Basculer l'affichage du filtre de colonne
    toggleColumnFilter(column) {
      this.activeFilterColumn = this.activeFilterColumn === column ? null : column;
      
      // Initialiser le filtre si nécessaire
      if (!this.columnFilters[column]) {
        this.columnFilters[column] = {
          operator: 'contains',
          value: ''
        };
      }
    },

    // Basculer la visibilité d'une colonne
    toggleColumnVisibility(column) {
      if (this.visibleColumns.includes(column)) {
        this.visibleColumns = this.visibleColumns.filter(col => col !== column);
      } else {
        this.visibleColumns.push(column);
      }
    },

    // Appliquer un filtre de colonne
    applyColumnFilter(column) {
      this.activeFilterColumn = null;
      this.applyAllFilters();
    },

    // Effacer un filtre de colonne
    clearColumnFilter(column) {
      delete this.columnFilters[column];
      this.activeFilterColumn = null;
      this.applyAllFilters();
    },

    // Réinitialiser tous les filtres
    resetAllFilters() {
      this.columnFilters = {};
      this.globalSearchTerm = '';
      this.applyAllFilters();
    },

    // Comparer des valeurs (pour les opérateurs numériques/dates)
    compareValues(a, b) {
      // Handle null/undefined
      if (a === undefined || a === null || a === '') return -1;
      if (b === undefined || b === null || b === '') return 1;
      
      // Try numeric comparison first
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      // Try date comparison
      const dateA = new Date(a);
      const dateB = new Date(b);
      
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateA - dateB;
      }
      
      // String comparison as fallback
      return String(a).localeCompare(String(b));
    },

    // Parser une valeur pour la comparaison
    parseValue(value) {
      if (value === undefined || value === null || value === '') return 0;
      
      const num = parseFloat(value);
      if (!isNaN(num)) return num;
      
      const date = new Date(value);
      if (!isNaN(date.getTime())) return date.getTime();
      
      return String(value);
    },

    // Formater la valeur d'une cellule
    formatCellValue(value, column) {
      if (value === undefined || value === null) return '';
      
      // Handle objects that might be Parse objects or other complex objects
      if (typeof value === 'object' && value !== null) {
        // Try to extract meaningful information from Parse objects
        if (value.id) {
          return value.id;
        }
        if (value.toString) {
          return value.toString();
        }
        return '[Objet]';
      }
      
      // Formater les dates - improved detection
      if (this.isDateColumn(column) || this.isDateValue(value)) {
        return this.formatDate(value);
      }
      
      // Formater les montants
      if (this.isCurrencyColumn(column)) {
        return this.formatCurrency(value);
      }
      
      // Formater les booléens
      if (typeof value === 'boolean') {
        return value ? 'Oui' : 'Non';
      }
      
      return String(value);
    },
    
    // Helper: Check if column name suggests it contains dates
    isDateColumn(column) {
      const dateKeywords = ['date', 'Date', 'cre', 'piece', 'echeance', 'debut', 'fin'];
      return dateKeywords.some(keyword => column.toLowerCase().includes(keyword));
    },
    
    // Helper: Check if value looks like a date
    isDateValue(value) {
      if (typeof value === 'string') {
        // Check for ISO date format or other common date patterns
        return (value.includes('T') && value.length > 10) || 
               value.match(/^\d{4}-\d{2}-\d{2}$/) ||
               value.match(/^\d{2}\/\d{2}\/\d{4}$/);
      } else if (value instanceof Date) {
        return true;
      } else if (typeof value === 'object' && value !== null) {
        // Could be a Parse date object
        return true;
      }
      return false;
    },
    
    // Helper: Check if column contains currency/money values
    isCurrencyColumn(column) {
      const currencyKeywords = ['montant', 'total', 'reste', 'prix', 'ttc', 'ht', 'net'];
      return currencyKeywords.some(keyword => column.toLowerCase().includes(keyword));
    },

    // Formater une date
    formatDate(dateString) {
      if (!dateString) return '';
      
      // Handle different date formats
      let date;
      
      try {
        // Try ISO format first
        if (typeof dateString === 'string' && dateString.includes('T')) {
          date = new Date(dateString);
        } else if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Handle YYYY-MM-DD format
          date = new Date(dateString);
        } else if (typeof dateString === 'object' && dateString !== null) {
          // Handle date objects or Parse date objects
          if (dateString.iso) {
            // Parse date object
            date = new Date(dateString.iso);
          } else if (dateString.toString) {
            date = new Date(dateString.toString());
          } else {
            date = new Date(dateString);
          }
        } else {
          date = new Date(dateString);
        }
        
        if (isNaN(date.getTime())) {
          return dateString;
        }
        
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric'
        });
      } catch (error) {
        console.error('Error formatting date:', error, 'Original value:', dateString);
        return dateString;
      }
    },

    // Formater une devise
    formatCurrency(value) {
      const num = parseFloat(value);
      if (isNaN(num)) return value;
      return num.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'});
    },

    // Vérifier si un opérateur est "vide"
    isEmptyOperator(operator) {
      return operator === 'isEmpty' || operator === 'isNotEmpty';
    },

    // Obtenir le placeholder pour un opérateur
    getOperatorPlaceholder(operator) {
      const placeholders = {
        'equals': 'Valeur exacte...',
        'contains': 'Contient...',
        'doesNotContain': 'Ne contient pas...',
        'startsWith': 'Commence par...',
        'endsWith': 'Finit par...',
        'greaterThan': 'Supérieur à...',
        'lessThan': 'Inférieur à...',
        'between': 'Valeur min et max...'
      };
      return placeholders[operator] || 'Valeur...';
    },

    // Obtenir le nombre de filtres actifs (uniquement ceux avec des valeurs significatives)
    get activeFiltersCount() {
      let count = 0;
      for (const [column, filter] of Object.entries(this.columnFilters)) {
        if (this.isFilterActive(filter)) {
          count++;
        }
      }
      return count;
    },

    // Vérifier si un filtre est actif (a une valeur significative)
    isFilterActive(filter) {
      if (!filter || !filter.operator) return false;
      
      // Les opérateurs isEmpty et isNotEmpty sont toujours actifs
      if (filter.operator === 'isEmpty' || filter.operator === 'isNotEmpty') {
        return true;
      }
      
      // Pour les autres opérateurs, vérifier que la valeur n'est pas vide
      if (filter.operator === 'between') {
        return (filter.value?.min !== '' && filter.value?.min !== undefined) || 
               (filter.value?.max !== '' && filter.value?.max !== undefined);
      }
      
      return filter.value !== '' && filter.value !== undefined && filter.value !== null;
    },

    // Obtenir uniquement les filtres actifs
    get activeFilters() {
      const active = {};
      for (const [column, filter] of Object.entries(this.columnFilters)) {
        if (this.isFilterActive(filter)) {
          active[column] = filter;
        }
      }
      return active;
    },

    // Obtenir une description lisible d'un filtre
    getFilterDescription(filter) {
      if (!filter || !filter.operator) return '';
      
      const operatorTexts = {
        'contains': 'contient',
        'equals': '=',
        'doesNotContain': 'ne contient pas',
        'startsWith': 'commence par',
        'endsWith': 'finit par',
        'isEmpty': 'est vide',
        'isNotEmpty': 'n\'est pas vide',
        'greaterThan': '>',
        'lessThan': '<',
        'between': 'entre'
      };
      
      const operatorText = operatorTexts[filter.operator] || filter.operator;
      
      if (filter.operator === 'isEmpty' || filter.operator === 'isNotEmpty') {
        return operatorText;
      }
      
      if (filter.operator === 'between') {
        if (filter.value?.min && filter.value?.max) {
          return `${operatorText} ${filter.value.min} et ${filter.value.max}`;
        }
        if (filter.value?.min) {
          return `${operatorText} ≥ ${filter.value.min}`;
        }
        if (filter.value?.max) {
          return `${operatorText} ≤ ${filter.value.max}`;
        }
        return operatorText;
      }
      
      return `${operatorText} ${filter.value || ''}`;
    },

    // Sauvegarder force_erase
    async saveForceErase() {
      if (!this.sequenceId) return;

      try {
        await this.updateSequenceProperty('force_erase', this.forceErase);
        this.showNotification('Succès', `Paramètre force_erase ${this.forceErase ? 'activé' : 'désactivé'}`, 'success');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de force_erase:', error);
        this.showNotification('Erreur', 'Impossible de sauvegarder force_erase', 'error');
      }
    },

    // Sauvegarder tous les filtres
    async saveAllFilters() {
      if (!this.sequenceId) return;

      this.isSaving = true;

      try {
        const queryData = {
          columnFilters: this.columnFilters,
          globalSearch: this.globalSearchTerm,
          visibleColumns: this.visibleColumns
        };

        await this.updateSequenceProperty('requete_auto', queryData);
        this.showNotification('Succès', 'Requête sauvegardée avec succès', 'success');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des filtres:', error);
        this.showNotification('Erreur', 'Impossible de sauvegarder la requête', 'error');
      } finally {
        this.isSaving = false;
      }
    },

    // Mettre à jour une propriété de la séquence
    async updateSequenceProperty(property, value) {
      const Sequence = Parse.Object.extend('Sequences');
      const sequence = new Sequence();
      sequence.id = this.sequenceId;
      sequence.set(property, value);
      await sequence.save();
    },

    // Mettre à jour l'aperçu
    async updatePreview() {
      if (!this.showPreview) return;
      
      this.isPreviewLoading = true;
      
      try {
        // Utiliser les résultats filtrés actuels pour l'aperçu
        this.previewResults = [...this.filteredInvoices.slice(0, 6)];
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'aperçu:', error);
      } finally {
        this.isPreviewLoading = false;
      }
    },

    // Helper methods for filter binding (to avoid optional chaining in x-model)
    getFilterOperator(column) {
      if (!this.columnFilters[column]) {
        this.columnFilters[column] = { operator: 'contains', value: '' };
      }
      return this.columnFilters[column].operator;
    },

    setFilterOperator(column, value) {
      if (!this.columnFilters[column]) {
        this.columnFilters[column] = { operator: 'contains', value: '' };
      }
      this.columnFilters[column].operator = value;
    },

    getFilterValue(column) {
      if (!this.columnFilters[column]) {
        this.columnFilters[column] = { operator: 'contains', value: '' };
      }
      return this.columnFilters[column].value;
    },

    setFilterValue(column, value) {
      if (!this.columnFilters[column]) {
        this.columnFilters[column] = { operator: 'contains', value: '' };
      }
      this.columnFilters[column].value = value;
    },

    getFilterValueMin(column) {
      if (!this.columnFilters[column]) {
        this.columnFilters[column] = { operator: 'contains', value: { min: '', max: '' } };
      }
      return this.columnFilters[column].value?.min || '';
    },

    setFilterValueMin(column, value) {
      if (!this.columnFilters[column]) {
        this.columnFilters[column] = { operator: 'contains', value: { min: '', max: '' } };
      }
      if (!this.columnFilters[column].value) {
        this.columnFilters[column].value = { min: '', max: '' };
      }
      this.columnFilters[column].value.min = value;
    },

    getFilterValueMax(column, value) {
      if (!this.columnFilters[column]) {
        this.columnFilters[column] = { operator: 'contains', value: { min: '', max: '' } };
      }
      return this.columnFilters[column].value?.max || '';
    },

    setFilterValueMax(column, value) {
      if (!this.columnFilters[column]) {
        this.columnFilters[column] = { operator: 'contains', value: { min: '', max: '' } };
      }
      if (!this.columnFilters[column].value) {
        this.columnFilters[column].value = { min: '', max: '' };
      }
      this.columnFilters[column].value.max = value;
    },

    // Notification simple
    showNotification(title, message, type = 'success') {
      const notification = document.createElement('div');
      notification.className = `fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
        type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`;
      notification.innerHTML = `
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <span class="text-xl">${type === 'success' ? '✅' : '❌'}</span>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">${title}</p>
            <p class="text-sm mt-1">${message}</p>
          </div>
        </div>
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.remove();
      }, 5000);
    }
  }));
});
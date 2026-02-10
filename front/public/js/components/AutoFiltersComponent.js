/**
 * AutoFiltersComponent.js - Composant Alpine.js pour gérer les filtres automatiques
 * Ce fichier doit être importé dans le layout principal ou la page
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('autoFiltersComponent', () => ({
    // État interne
    sequenceId: null,
    columns: [],
    searchTerm: '',
    filters: {
      include: {},
      operators: {}
    },
    filterValues: {},
    filteredColumns: [],
    suggestions: {},
    isSaving: false,
    forceErase: false,
    isInitialized: false,

    // Initialisation
    init() {
      this.loadSequenceIdFromURL();
      this.loadColumnsFromJSON();
      this.loadExistingFilters();
      this.setupDefaultOperators();
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

        this.filteredColumns = [...this.columns];
      } catch (error) {
        console.error('Erreur lors du chargement des colonnes depuis JSON:', error);
        this.useDefaultColumns();
      }
    },

    // Utiliser les colonnes par défaut
    useDefaultColumns() {
      this.columns = [
        'idDossier', 'reference', 'totalhtnet', 'statut_intitule', 'dateDebutMission',
        'payeur_nom', 'payeur_email', 'montant', 'date_echeance', 'datecre'
      ];
      this.filteredColumns = [...this.columns];
    },

    // Charger les filtres existants depuis la base de données
    async loadExistingFilters() {
      if (!this.sequenceId) return;

      try {
        const sequence = await this.fetchSequence();
        if (sequence) {
          this.filters.include = sequence.requete_auto?.include || {};
          this.filters.operators = sequence.requete_auto?.operators?.include || {};
          this.forceErase = sequence.force_erase || false;
          this.filterValues = { ...this.filters.include };
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

    // Configuration des opérateurs par défaut
    setupDefaultOperators() {
      this.columns.forEach(col => {
        if (!this.filters.operators[col]) {
          this.filters.operators[col] = 'contains';
        }
      });
    },

    // Méthodes de filtrage
    filterColumns() {
      if (!this.searchTerm) {
        this.filteredColumns = [...this.columns];
        return;
      }

      const searchLower = this.searchTerm.toLowerCase();
      this.filteredColumns = this.columns.filter(col =>
        col.toLowerCase().includes(searchLower)
      );
    },

    isEmptyOperator(operator) {
      return operator === 'isEmpty' || operator === 'isNotEmpty';
    },

    getOperatorPlaceholder(operator) {
      const placeholders = {
        'equals': 'Valeur exacte...',
        'contains': 'Contient...',
        'doesNotContain': 'Ne contient pas...',
        'startsWith': 'Commence par...',
        'endsWith': 'Finit par...'
      };
      return placeholders[operator] || 'Valeur...';
    },

    // Vérifier si un filtre est actif (a une valeur significative)
    isFilterActive(column) {
      const value = this.filters.include[column];
      return value !== '' && value !== undefined && value !== null;
    },

    // Obtenir le nombre de filtres actifs (uniquement ceux avec des valeurs significatives)
    get activeFiltersCount() {
      let count = 0;
      for (const column in this.filters.include) {
        if (this.isFilterActive(column)) {
          count++;
        }
      }
      return count;
    },

    // Gestion des filtres
    removeFilter(column) {
      delete this.filters.include[column];
      delete this.filterValues[column];
    },

    // Réinitialiser tous les filtres
    resetFilters() {
      this.filters.include = {};
      this.filters.operators = {};
      this.filterValues = {};
      this.forceErase = false;
      this.setupDefaultOperators();
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
    async saveFilters() {
      if (!this.sequenceId) return;

      this.isSaving = true;

      try {
        const filtersWithOperators = {
          include: this.filters.include,
          operators: {
            include: this.filters.operators
          }
        };

        await this.updateSequenceProperty('requete_auto', filtersWithOperators);
        this.showNotification('Succès', 'Filtres sauvegardés avec succès', 'success');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des filtres:', error);
        this.showNotification('Erreur', 'Impossible de sauvegarder les filtres', 'error');
      } finally {
        this.isSaving = false;
      }
    },

    // Prévisualiser les résultats
    async previewFilters() {
      await this.fetchPreviewResults();
      
      // Mettre à jour l'interface utilisateur avec les résultats
      const previewContainer = document.getElementById('preview-results-container');
      if (previewContainer) {
        previewContainer.innerHTML = this.generatePreviewHTML();
      }
    },

    // Mettre à jour une propriété de la séquence
    async updateSequenceProperty(property, value) {
      const Sequence = Parse.Object.extend('Sequences');
      const sequence = new Sequences();
      sequence.id = this.sequenceId;
      sequence.set(property, value);
      await sequence.save();
    },

    // Prévisualisation des résultats
    previewResults: [],
    isPreviewLoading: false,

    // Récupérer les résultats de prévisualisation
    async fetchPreviewResults() {
      if (!this.sequenceId) return;

      this.isPreviewLoading = true;

      try {
        // Simuler une requête pour récupérer les résultats
        // Dans un environnement réel, cela serait une requête Parse
        const Invoice = Parse.Object.extend('Impayes');
        const query = new Parse.Query(Invoice);

        // Appliquer les filtres
        Object.keys(this.filters.include).forEach(column => {
          const value = this.filters.include[column];
          const operator = this.filters.operators[column];

          if (operator === 'contains') {
            query.contains(column, value);
          } else if (operator === 'equals') {
            query.equalTo(column, value);
          } else if (operator === 'doesNotContain') {
            query.doesNotMatch(column, new RegExp(value));
          } else if (operator === 'startsWith') {
            query.startsWith(column, value);
          } else if (operator === 'endsWith') {
            query.endsWith(column, value);
          } else if (operator === 'isEmpty') {
            query.doesNotExist(column);
          } else if (operator === 'isNotEmpty') {
            query.exists(column);
          }
        });

        // Limiter à 10 résultats pour la prévisualisation
        query.limit(10);
        const results = await query.find();

        // Convertir les résultats Parse en objets JavaScript simples
        this.previewResults = results.map(invoice => {
          const data = invoice.toJSON();
          return {
            objectId: invoice.id,
            ...data
          };
        });

      } catch (error) {
        console.error('Erreur lors de la récupération des résultats de prévisualisation:', error);
        this.showNotification('Erreur', 'Impossible de récupérer les résultats de prévisualisation', 'error');
      } finally {
        this.isPreviewLoading = false;
      }
    },

    // Formater la date
    formatDate(dateString) {
      if (!dateString) return 'Date inconnue';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    },

    // Formater l'adresse
    formatAddress(invoice) {
      const parts = [];
      if (invoice.adresse) parts.push(invoice.adresse);
      if (invoice.codepostal) parts.push(invoice.codepostal);
      if (invoice.ville) parts.push(invoice.ville);
      return parts.join(', ') || 'Adresse inconnue';
    },

    // Calculer les jours de retard
    calculateDaysOverdue(dateString) {
      if (!dateString) return 0;
      const dueDate = new Date(dateString);
      const today = new Date();
      const diffTime = Math.abs(today - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    },

    // Générer le HTML pour la prévisualisation
    generatePreviewHTML() {
      if (this.isPreviewLoading) {
        return '<div class="text-center py-8"><div class="w-12 h-12 border-4 border-[#00BDCF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p class="text-gray-600">Chargement de la prévisualisation...</p></div>';
      }

      if (this.previewResults.length === 0) {
        return '<div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center"><h3 class="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3><p class="text-gray-600 mb-4">Aucune facture ne correspond à vos filtres.</p></div>';
      }

      // Générer le HTML pour chaque résultat
      const itemsHTML = this.previewResults.map(invoice => {
        const statusClass = invoice.facturesoldee ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
        const statusText = invoice.facturesoldee ? 'Payée' : 'Impayée';
        const sequenceClass = invoice.sequence_is_automatic ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
        const daysOverdue = this.calculateDaysOverdue(invoice.datepiece);
        const overdueClass = daysOverdue > 30 ? 'text-red-600' : 'text-yellow-600';

        return `
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div class="p-4">
              <!-- Header with status -->
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center space-x-2">
                  <span class="px-2 py-1 text-xs rounded-full font-medium ${statusClass}">${statusText}</span>
                  <span class="px-2 py-1 text-xs rounded-full ${sequenceClass}">${invoice.sequence_name || 'Aucune'}</span>
                  ${invoice.sequence_is_automatic ? '<span class="text-purple-600"><FileText class="w-4 h-4" /></span>' : ''}
                </div>
                <span class="text-xs text-gray-500">${this.formatDate(invoice.datepiece)}</span>
              </div>

              <!-- Invoice info -->
              <div class="mb-3">
                <h3 class="font-semibold text-gray-900 mb-1">Facture #${invoice.nfacture}</h3>
                <p class="text-sm text-gray-600 mb-2">${invoice.reference || 'Sans référence'}</p>

                <!-- Address information -->
                <div class="mb-2">
                  <p class="text-xs text-gray-500 mb-1">Adresse:</p>
                  <p class="text-xs text-gray-600">${this.formatAddress(invoice)}</p>
                  ${invoice.dateDebutMission ? '<p class="text-xs text-gray-600"><span class="text-gray-500">Intervention: </span><span>' + this.formatDate(invoice.dateDebutMission) + '</span></p>' : ''}
                </div>

                <div class="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p class="text-gray-500">Payeur:</p>
                    <p class="font-medium text-gray-900">${invoice.payeur_nom || 'Inconnu'}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Propriétaire:</p>
                    <p class="font-medium text-gray-900">${invoice.proprietaire_nom || 'Inconnu'}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Apporteur:</p>
                    <p class="font-medium text-gray-900">${invoice.apporteur_nom || 'Inconnu'}</p>
                  </div>
                </div>
              </div>

              <!-- Financial info -->
              <div class="border-t border-gray-100 pt-3">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm text-gray-500">Total TTC:</span>
                  <span class="font-semibold text-gray-900">${(invoice.totalttcnet || 0).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'})}</span>
                </div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm text-gray-500">Reste à payer:</span>
                  <span class="font-bold text-lg text-[#007ACE]">${(invoice.resteapayer || 0).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'})}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500">Retard:</span>
                  <span class="font-medium text-sm ${overdueClass}">${daysOverdue} jours</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="border-t border-gray-100 px-4 py-3 bg-gray-50">
              <div class="flex justify-end space-x-2">
                <button class="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm transition-colors flex items-center space-x-1" title="Voir la facture PDF">
                  <FileText class="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button class="px-3 py-1 bg-[#007ACE] text-white rounded-md hover:bg-[#006BCE] text-sm transition-colors flex items-center space-x-1" title="Gérer la séquence">
                  <Plus class="w-4 h-4" />
                  <span>Séquence</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${itemsHTML}
        </div>
      `;
    },

    // Helper methods for operator binding (to avoid array access in x-model)
    getOperator(column) {
      if (!this.filters.operators[column]) {
        this.filters.operators[column] = 'contains';
      }
      return this.filters.operators[column];
    },

    setOperator(column, value) {
      this.filters.operators[column] = value;
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
            <i class="material-icons">${type === 'success' ? 'check_circle' : 'error'}</i>
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

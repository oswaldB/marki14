// public/js/components/FiltresSequencesScript.js
// Script Alpine.js pour le composant FiltresSequences
// Contient uniquement la logique JavaScript pour une meilleure séparation des préoccupations

document.addEventListener('alpine:init', () => {
  Alpine.data('filtresSequencesState', () => ({
    // État du composant
    isLoading: true,
    error: null,
    colonnesConfig: [],
    sequenceId: null,
    showFormatRecoveryOptions: false,
    missingSequenceId: false,
    
    // Données des filtres avec opérateurs logiques
    filterGroups: [
      {
        logicalOperator: 'AND',
        filters: [
          {
            field: '',
            operator: 'equals',
            value: '',
            value2: ''
          }
        ]
      }
    ],
    
    // Configuration principale
    forceErase: false,
    
    // Prévisualisation
    isPreviewing: false,
    previewResultsData: [],
    resultCount: 0,
    
    // Détection du type de champ
    getFieldType(field) {
      const dateFields = ['datepiece', 'dateDebutMission', 'datecre'];
      const numberFields = ['totalhtnet', 'totalttcnet', 'resteapayer', 'idDossier'];
      const booleanFields = ['facturesoldee'];
      const statusFields = ['statut_intitule', 'idStatut'];
      const typeFields = ['payeur_type', 'proprietaire_typePersonne', 'payeur_typePersonne'];
      
      if (dateFields.includes(field)) return 'date';
      if (numberFields.includes(field)) return 'number';
      if (booleanFields.includes(field)) return 'boolean';
      if (statusFields.includes(field)) return 'status';
      if (typeFields.includes(field)) return 'type';
      return 'text';
    },
    
    // Cache pour les valeurs de champ analysées
    fieldValuesCache: {},
    
    // Modèles de formulaire pour chaque type de champ
    formModels: [],
    
    // Générer les modèles de formulaire
    generateFormModels() {
      // Les modèles sont maintenant gérés par les composants spécifiques
      // Cette méthode est conservée pour la compatibilité mais ne fait rien
      return [];
    },
    
    // Obtenir le modèle de formulaire pour un champ donné (simplifié)
    getFormModel(field, operator) {
      const fieldType = this.getFieldType(field);
      
      // Les modèles sont maintenant gérés par les composants spécifiques
      // Retourner un modèle vide pour la compatibilité
      return {
        fieldType: fieldType,
        operator: operator,
        modelType: `${fieldType}-${operator}`,
        label: 'Valeur',
        inputType: fieldType === 'date' ? 'date' : fieldType === 'number' ? 'number' : 'text',
        inputName: 'value',
        placeholder: fieldType === 'number' ? 'Montant' : 'Valeur'
      };
    },
    
    // Méthode vide pour éviter les erreurs
    getFormModel() {
      return {};
    },
      
      // Les modèles sont maintenant gérés par les composants spécifiques
      // Ce code est conservé pour référence mais n'est plus utilisé
      // this.formModels = models;
      return [];
    },
      

      
      models.push({
        fieldType: 'date',
        operator: 'between',
        modelType: 'date-range',
        inputs: [
          { label: 'Valeur min', inputType: 'date', inputName: 'value' },
          { label: 'Valeur max', inputType: 'date', inputName: 'value2' }
        ]
      });
      
      models.push({
        fieldType: 'date',
        operator: 'greater_than',
        modelType: 'date-after',
        label: 'Après',
        inputType: 'date',
        inputName: 'value',
        placeholder: ''
      });
      
      models.push({
        fieldType: 'date',
        operator: 'less_than',
        modelType: 'date-before',
        label: 'Avant',
        inputType: 'date',
        inputName: 'value',
        placeholder: ''
      });
      
      models.push({
        fieldType: 'date',
        operator: 'in_last_days',
        modelType: 'date-days-ago',
        label: 'Dans les derniers X jours',
        inputType: 'number',
        inputName: 'value',
        placeholder: 'Nombre de jours'
      });
      
      models.push({
        fieldType: 'date',
        operator: 'older_than_days',
        modelType: 'date-older-than',
        label: 'Plus vieux que X jours',
        inputType: 'number',
        inputName: 'value',
        placeholder: 'Nombre de jours'
      });
      
      // Modèles pour les nombres
      models.push({
        fieldType: 'number',
        operator: 'equals',
        modelType: 'number-single',
        label: 'Valeur',
        inputType: 'number',
        inputName: 'value',
        placeholder: 'Montant'
      });
      
      models.push({
        fieldType: 'number',
        operator: 'not_equals',
        modelType: 'number-single',
        label: 'Valeur différente',
        inputType: 'number',
        inputName: 'value',
        placeholder: 'Montant'
      });
      
      models.push({
        fieldType: 'number',
        operator: 'between',
        modelType: 'number-range',
        inputs: [
          { label: 'Valeur min', inputType: 'number', inputName: 'value', placeholder: 'Montant min' },
          { label: 'Valeur max', inputType: 'number', inputName: 'value2', placeholder: 'Montant max' }
        ]
      });
      
      models.push({
        fieldType: 'number',
        operator: 'greater_than',
        modelType: 'number-greater',
        label: 'Supérieur à',
        inputType: 'number',
        inputName: 'value',
        placeholder: 'Montant'
      });
      
      models.push({
        fieldType: 'number',
        operator: 'less_than',
        modelType: 'number-less',
        label: 'Inférieur à',
        inputType: 'number',
        inputName: 'value',
        placeholder: 'Montant'
      });
      
      // Modèles pour le texte
      models.push({
        fieldType: 'text',
        operator: 'equals',
        modelType: 'text-single',
        label: 'Valeur',
        inputType: 'text',
        inputName: 'value',
        placeholder: 'Valeur'
      });
      
      models.push({
        fieldType: 'text',
        operator: 'not_equals',
        modelType: 'text-single',
        label: 'Valeur différente',
        inputType: 'text',
        inputName: 'value',
        placeholder: 'Valeur'
      });
      
      models.push({
        fieldType: 'text',
        operator: 'contains',
        modelType: 'text-contains',
        label: 'Contient',
        inputType: 'text',
        inputName: 'value',
        placeholder: 'Texte à rechercher'
      });
      
      models.push({
        fieldType: 'text',
        operator: 'not_contains',
        modelType: 'text-not-contains',
        label: 'Ne contient pas',
        inputType: 'text',
        inputName: 'value',
        placeholder: 'Texte à exclure'
      });
      
      models.push({
        fieldType: 'text',
        operator: 'starts_with',
        modelType: 'text-starts',
        label: 'Commence par',
        inputType: 'text',
        inputName: 'value',
        placeholder: 'Début du texte'
      });
      
      models.push({
        fieldType: 'text',
        operator: 'ends_with',
        modelType: 'text-ends',
        label: 'Finit par',
        inputType: 'text',
        inputName: 'value',
        placeholder: 'Fin du texte'
      });
      
      // Modèles pour les sélections
      models.push({
        fieldType: 'select',
        operator: 'equals',
        modelType: 'select-single',
        label: 'Valeur',
        inputType: 'select',
        inputName: 'value',
        options: [] // Sera peuplé dynamiquement
      });
      
      models.push({
        fieldType: 'select',
        operator: 'not_equals',
        modelType: 'select-single',
        label: 'Valeur différente',
        inputType: 'select',
        inputName: 'value',
        options: [] // Sera peuplé dynamiquement
      });
      
      models.push({
        fieldType: 'select',
        operator: 'in',
        modelType: 'select-multi',
        label: 'Est dans la liste',
        inputType: 'multi-select',
        inputName: 'value',
        options: [] // Sera peuplé dynamiquement
      });
      
      // Modèles pour les booléens
      models.push({
        fieldType: 'boolean',
        operator: 'equals',
        modelType: 'boolean-single',
        label: 'Valeur',
        inputType: 'select',
        inputName: 'value',
        options: [
          { value: true, label: 'Oui' },
          { value: false, label: 'Non' }
        ]
      });
      
      // Modèles sans valeur
      models.push({
        fieldType: 'any',
        operator: 'is_empty',
        modelType: 'no-value',
        inputType: 'none',
        label: 'Est vide',
        noValue: true
      });
      
      models.push({
        fieldType: 'any',
        operator: 'is_not_empty',
        modelType: 'no-value',
        inputType: 'none',
        label: 'N\'est pas vide',
        noValue: true
      });
      
      this.formModels = models;
      return models;
    },
    
    // Obtenir le modèle de formulaire pour un champ donné
    getFormModel(field, operator) {
      const fieldType = this.getFieldType(field);
      
      // Trouver le modèle correspondant
      let model = this.formModels.find(m => 
        m.fieldType === fieldType && m.operator === operator
      );
      
      // Si aucun modèle spécifique trouvé, essayer avec le type "any"
      if (!model) {
        model = this.formModels.find(m => 
          m.fieldType === 'any' && m.operator === operator
        );
      }
      
      // Si toujours aucun modèle trouvé, retourner un modèle générique
      if (!model) {
        // Vérifier si c'est un opérateur sans valeur
        const noValueOperators = ['is_empty', 'is_not_empty'];
        const isNoValue = noValueOperators.includes(operator);
        
        if (isNoValue) {
          return {
            fieldType: fieldType,
            operator: operator,
            modelType: `${fieldType}-${operator}`,
            inputType: 'none',
            label: operator === 'is_empty' ? 'Est vide' : 'N\'est pas vide',
            noValue: true
          };
        }
        
        return {
          fieldType: fieldType,
          operator: operator,
          modelType: `${fieldType}-${operator}`,
          label: 'Valeur',
          inputType: fieldType === 'date' ? 'date' : fieldType === 'number' ? 'number' : 'text',
          inputName: 'value',
          placeholder: fieldType === 'number' ? 'Montant' : 'Valeur'
        };
      }
      
      // Pour les sélections, peupler les options dynamiquement
      if (model.inputType === 'select' && field && model.options.length === 0) {
        model.options = this.getFieldValues(field);
      }
      
      return model;
    },
    
    // Obtenir les valeurs possibles pour un champ (version synchrone pour les templates)
    getFieldValues(field) {
      // Retourner les valeurs du cache si disponibles
      if (this.fieldValuesCache[field]) {
        return this.fieldValuesCache[field];
      }
      
      // Valeurs prédéfinies pour les champs connus
      const predefinedValues = {
        'statut_intitule': [
          { value: 'Impayé', label: 'Impayé' },
          { value: 'Partiellement payé', label: 'Partiellement payé' },
          { value: 'Payé', label: 'Payé' },
          { value: 'Annulé', label: 'Annulé' },
          { value: 'En attente', label: 'En attente' }
        ],
        'payeur_type': [
          { value: 'Propriétaire', label: 'Propriétaire' },
          { value: 'Locataire', label: 'Locataire' },
          { value: 'Syndic', label: 'Syndic' },
          { value: 'Autre', label: 'Autre' }
        ],
        'proprietaire_typePersonne': [
          { value: 'Propriétaire', label: 'Propriétaire' },
          { value: 'Locataire', label: 'Locataire' },
          { value: 'Syndic', label: 'Syndic' },
          { value: 'Autre', label: 'Autre' }
        ],
        'payeur_typePersonne': [
          { value: 'Propriétaire', label: 'Propriétaire' },
          { value: 'Locataire', label: 'Locataire' },
          { value: 'Syndic', label: 'Syndic' },
          { value: 'Autre', label: 'Autre' }
        ]
      };
      
      // Retourner les valeurs prédéfinies si disponibles
      if (predefinedValues[field]) {
        return predefinedValues[field];
      }
      
      // Si pas dans le cache et pas prédéfini, retourner un tableau vide
      // Les valeurs seront chargées de manière asynchrone
      return [];
    },
    
    // Analyser les valeurs réelles d'un champ à partir des données (version asynchrone)
    async analyzeFieldValuesFromData(field) {
      // Vérifier d'abord le cache
      if (this.fieldValuesCache[field]) {
        return this.fieldValuesCache[field];
      }
      
      try {
        console.log(`🔍 Analyse des valeurs pour le champ: ${field}`);
        
        // Vérifier que Parse est disponible
        if (typeof Parse === 'undefined') {
          await this.initParse();
        }
        
        const Impaye = Parse.Object.extend('Impayes');
        const query = new Parse.Query(Impaye);
        
        // Limiter à 1000 résultats pour l'analyse
        query.limit(1000);
        query.exists(field);
        query.notEqualTo(field, '');
        query.notEqualTo(field, null);
        
        // Ajouter un filtre pour exclure les valeurs nulles/vides
        const results = await query.find();
        
        console.log(`📊 Trouvé ${results.length} enregistrements avec des valeurs pour ${field}`);
        
        // Extraire les valeurs uniques
        const valueSet = new Set();
        const valueCounts = {};
        
        results.forEach(item => {
          const value = item.get(field);
          if (value) {
            const stringValue = String(value).trim();
            if (stringValue) {
              valueSet.add(stringValue);
              valueCounts[stringValue] = (valueCounts[stringValue] || 0) + 1;
            }
          }
        });
        
        // Convertir en tableau trié par fréquence
        const sortedValues = Array.from(valueSet).sort((a, b) => {
          return valueCounts[b] - valueCounts[a]; // Tri par fréquence décroissante
        });
        
        // Créer les options
        const options = sortedValues.map(value => ({
          value: value,
          label: value
        }));
        
        // Mettre en cache les résultats
        this.fieldValuesCache[field] = options;
        
        console.log(`✅ Valeurs analysées pour ${field}:`, options.length, 'valeurs uniques');
        
        return options;
      } catch (error) {
        console.error(`❌ Erreur lors de l'analyse des valeurs pour ${field}:`, error);
        return [];
      }
    },
    
    // Analyser les valeurs réelles d'un champ à partir des données
    async analyzeFieldValuesFromData(field) {
      if (this.fieldValuesCache[field]) {
        return this.fieldValuesCache[field];
      }
      
      try {
        console.log(`🔍 Analyse des valeurs pour le champ: ${field}`);
        
        // Vérifier que Parse est disponible
        if (typeof Parse === 'undefined') {
          await this.initParse();
        }
        
        const Impaye = Parse.Object.extend('Impayes');
        const query = new Parse.Query(Impaye);
        
        // Limiter à 1000 résultats pour l'analyse
        query.limit(1000);
        query.exists(field);
        query.notEqualTo(field, '');
        query.notEqualTo(field, null);
        
        // Ajouter un filtre pour exclure les valeurs nulles/vides
        const results = await query.find();
        
        console.log(`📊 Trouvé ${results.length} enregistrements avec des valeurs pour ${field}`);
        
        // Extraire les valeurs uniques
        const valueSet = new Set();
        const valueCounts = {};
        
        results.forEach(item => {
          const value = item.get(field);
          if (value) {
            const stringValue = String(value).trim();
            if (stringValue) {
              valueSet.add(stringValue);
              valueCounts[stringValue] = (valueCounts[stringValue] || 0) + 1;
            }
          }
        });
        
        // Convertir en tableau trié par fréquence
        const sortedValues = Array.from(valueSet).sort((a, b) => {
          return valueCounts[b] - valueCounts[a]; // Tri par fréquence décroissante
        });
        
        // Créer les options
        const options = sortedValues.map(value => ({
          value: value,
          label: value
        }));
        
        // Mettre en cache les résultats
        this.fieldValuesCache[field] = options;
        
        console.log(`✅ Valeurs analysées pour ${field}:`, options.length, 'valeurs uniques');
        
        return options;
      } catch (error) {
        console.error(`❌ Erreur lors de l'analyse des valeurs pour ${field}:`, error);
        return [];
      }
    },
    
    // Opérateurs disponibles par type de champ
    getOperatorsForField(field) {
      const fieldType = this.getFieldType(field);
      
      switch (fieldType) {
        case 'date':
          return [
            { value: 'equals', label: 'Est égal à', inputType: 'date' },
            { value: 'not_equals', label: 'Est différent de', inputType: 'date' },
            { value: 'greater_than', label: 'Après', inputType: 'date' },
            { value: 'less_than', label: 'Avant', inputType: 'date' },
            { value: 'between', label: 'Entre', inputType: 'date-range' },
            { value: 'in_last_days', label: 'Dans les derniers X jours', inputType: 'number' },
            { value: 'older_than_days', label: 'Plus vieux que X jours', inputType: 'number' }
          ];
        
        case 'number':
          return [
            { value: 'equals', label: 'Est égal à', inputType: 'number' },
            { value: 'not_equals', label: 'Est différent de', inputType: 'number' },
            { value: 'greater_than', label: 'Supérieur à', inputType: 'number' },
            { value: 'less_than', label: 'Inférieur à', inputType: 'number' },
            { value: 'between', label: 'Entre', inputType: 'number-range' }
          ];
        
        case 'boolean':
          return [
            { value: 'equals', label: 'Est égal à', inputType: 'select', options: [{value: true, label: 'Oui'}, {value: false, label: 'Non'}] },
            { value: 'not_equals', label: 'Est différent de', inputType: 'select', options: [{value: true, label: 'Oui'}, {value: false, label: 'Non'}] }
          ];
        
        case 'status':
          return [
            { value: 'equals', label: 'Est égal à', inputType: 'select', options: this.getFieldValues(field) },
            { value: 'not_equals', label: 'Est différent de', inputType: 'select', options: this.getFieldValues(field) },
            { value: 'in', label: 'Est dans la liste', inputType: 'multi-select', options: this.getFieldValues(field) }
          ];
        
        case 'type':
          return [
            { value: 'equals', label: 'Est égal à', inputType: 'select', options: this.getFieldValues(field) },
            { value: 'not_equals', label: 'Est différent de', inputType: 'select', options: this.getFieldValues(field) }
          ];
        
        default:
          // Pour les champs texte, vérifier s'il s'agit d'un champ avec des valeurs prédéfinies
          if (field === 'statut_intitule' || field === 'idStatut') {
            return [
              { value: 'equals', label: 'Est égal à', inputType: 'select' },
              { value: 'not_equals', label: 'Est différent de', inputType: 'select' }
            ];
          }
          
          return [
            { value: 'equals', label: 'Est égal à', inputType: 'text' },
            { value: 'not_equals', label: 'Est différent de', inputType: 'text' },
            { value: 'contains', label: 'Contient', inputType: 'text' },
            { value: 'not_contains', label: 'Ne contient pas', inputType: 'text' },
            { value: 'starts_with', label: 'Commence par', inputType: 'text' },
            { value: 'ends_with', label: 'Finit par', inputType: 'text' },
            { value: 'is_empty', label: 'Est vide', inputType: 'none' },
            { value: 'is_not_empty', label: 'N\'est pas vide', inputType: 'none' }
          ];
      }
    },
    
    // Initialisation
    init() {
      this.extractSequenceIdFromUrl();
      
      // Générer les modèles de formulaire
      this.generateFormModels();
      
      // Vérifier que l'ID est présent dans l'URL
      if (!this.sequenceId) {
        this.error = 'Aucun ID de séquence spécifié dans l\'URL. Veuillez fournir un ID valide.';
        this.missingSequenceId = true;
        return; // Arrêter l'initialisation
      }
      
      this.loadConfig();
      
      // Watchers supprimés car nous ne générons plus le JSON
    },
    
    // Extraire l'ID de séquence de l'URL
    extractSequenceIdFromUrl() {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        this.sequenceId = urlParams.get('id') || null;
        console.log('ID de séquence extrait:', this.sequenceId);
      }
    },
    
    // Charger la configuration
    async loadConfig() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const configResponse = await fetch('/configs/impayes_colonnes.json');
        
        if (!configResponse.ok) {
          throw new Error(`Failed to load config: ${configResponse.status} ${configResponse.statusText}`);
        }
        
        const colonnesRaw = await configResponse.json();
        this.colonnesConfig = this.organizeColumnsByCategory(colonnesRaw);
        
        if (this.colonnesConfig.length > 0) {
          this.filterGroups[0].filters[0].field = this.colonnesConfig[0].field;
        }
        
        if (this.sequenceId) {
          await this.loadExistingSequence();
        }

      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    
    // Organiser les colonnes par catégories
    organizeColumnsByCategory(colonnesRaw) {
      const categories = [
        { name: 'Identifiants', fields: ['idDossier', 'reference', 'refpiece', 'nfacture'] },
        { name: 'Montants', fields: ['totalhtnet', 'totalttcnet', 'resteapayer'] },
        { name: 'Dates', fields: ['datepiece', 'dateDebutMission', 'datecre'] },
        { name: 'Statut', fields: ['statut_intitule', 'idStatut', 'facturesoldee'] },
        { name: 'Client/Payeur', fields: ['payeur_nom', 'payeur_type', 'payeur_email', 'payeur_telephone'] },
        { name: 'Propriétaire', fields: ['proprietaire_nom', 'proprietaire_email', 'proprietaire_telephone'] },
        { name: 'Adresse', fields: ['adresse', 'codePostal', 'ville', 'typeVoie', 'numVoie'] },
        { name: 'Contact', fields: ['contactPlace', 'payeur_contact_nom', 'payeur_contact_email'] }
      ];
      
      return categories.flatMap(category => {
        return colonnesRaw
          .filter(field => category.fields.includes(field))
          .map(field => ({
            field: field,
            label: field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            category: category.name
          }));
      });
    },
    
    // Charger une séquence existante avec gestion d'erreur améliorée
    async loadExistingSequence() {
      if (!this.sequenceId) return;
      
      // Réinitialiser les erreurs
      this.error = null;
      
      try {
        // Vérifier que Parse est disponible
        if (typeof Parse === 'undefined') {
          await this.initParse();
        }
        
        const Sequence = Parse.Object.extend('Sequences');
        const query = new Parse.Query(Sequence);
        
        // Charger la séquence
        const sequence = await query.get(this.sequenceId);
        
        if (sequence) {
          const data = sequence.toJSON();
          
          // Vérifier si la séquence a des données valides
          if (data && data.requete_auto) {
            // Vérifier si requete_auto est vide (chaîne vide, objet vide, null)
            const isEmptyData = !data.requete_auto || 
                                data.requete_auto === '' ||
                                (typeof data.requete_auto === 'object' && Object.keys(data.requete_auto).length === 0);
            
            if (isEmptyData) {
              // Séquence vide - ce n'est pas une erreur, on initialise avec des valeurs par défaut
              console.log('Séquence vide trouvée, initialisation avec des valeurs par défaut');
              return; // Garder les valeurs par défaut déjà définies
            }
            
            const parseResult = this.safeParseSequenceData(data.requete_auto);
            
            if (parseResult.success) {
              this.filterGroups = parseResult.data.filterGroups;
              this.forceErase = parseResult.data.forceErase || false;
              console.log('Séquence chargée avec succès:', data);
            } else {
              this.error = parseResult.error;
              this.showFormatRecoveryOptions = true;
              console.warn('Séquence chargée mais avec des données incompatibles:', {
                error: parseResult.error,
                rawData: data.requete_auto
              });
            }
          } else {
            // Pas de requete_auto du tout - séquence vide
            console.log('Séquence sans requete_auto, initialisation avec des valeurs par défaut');
            // Garder les valeurs par défaut déjà définies
          }
        }
      } catch (error) {
        this.error = this.getUserFriendlyError(error);
        console.error('Erreur de chargement de la séquence:', error);
      }
    },
    
    // Réinitialiser et créer une nouvelle séquence
    resetAndCreateNew() {
      if (confirm('Voulez-vous vraiment réinitialiser et créer une nouvelle séquence ? Les modifications non sauvegardées seront perdues.')) {
        this.filterGroups = [
          {
            logicalOperator: 'AND',
            filters: [
              {
                field: this.colonnesConfig[0]?.field || '',
                operator: 'equals',
                value: '',
                value2: ''
              }
            ]
          }
        ];
        this.forceErase = false;
        this.error = null;
        this.showFormatRecoveryOptions = false;
      }
    },
    
    // Essayer de corriger automatiquement le format
    tryAutoFixFormat() {
      // Logique de correction automatique pourrait être ajoutée ici
      // Pour l'instant, même comportement que réinitialiser
      this.resetAndCreateNew();
    },
    
    // Parsing sécurisé des données de séquence
    safeParseSequenceData(requeteAuto) {
      try {
        // Cas 1: Déjà un objet
        if (typeof requeteAuto === 'object' && requeteAuto !== null) {
          return this.validateSequenceData(requeteAuto);
        }
        
        // Cas 2: Chaîne JSON
        if (typeof requeteAuto === 'string') {
          const parsed = JSON.parse(requeteAuto);
          return this.validateSequenceData(parsed);
        }
        
        // Cas invalide
        return {
          success: false,
          error: 'Format de données invalide: doit être un objet ou une chaîne JSON'
        };
        
      } catch (e) {
        return {
          success: false,
          error: 'Erreur de parsing JSON: ' + e.message
        };
      }
    },
    
    // Validation des données de séquence
    validateSequenceData(data) {
      // Vérifier la structure minimale
      if (!data || typeof data !== 'object') {
        return {
          success: false,
          error: 'Les données de séquence doivent être un objet'
        };
      }
      
      // Convertir l'ancien format si nécessaire
      if (data.filters && !data.filterGroups) {
        return {
          success: true,
          data: {
            filterGroups: [{
              logicalOperator: 'AND',
              filters: data.filters
            }],
            forceErase: data.forceErase || false
          }
        };
      }
      
      // Vérifier le nouveau format
      if (data.filterGroups && Array.isArray(data.filterGroups)) {
        return {
          success: true,
          data: {
            filterGroups: data.filterGroups,
            forceErase: data.forceErase || false
          }
        };
      }
      
      // Format inconnu
      return {
        success: false,
        error: 'Format de données de séquence non reconnu'
      };
    },
    
    // Messages d'erreur conviviaux
    getUserFriendlyError(error) {
      if (error.code) {
        switch (error.code) {
          case Parse.Error.OBJECT_NOT_FOUND:
            return 'Séquence introuvable (ID: ' + this.sequenceId + ')';
          case Parse.Error.CONNECTION_FAILED:
            return 'Impossible de se connecter au serveur';
          case Parse.Error.TIMEOUT:
            return 'Timeout lors du chargement de la séquence';
          default:
            return 'Erreur (' + error.code + '): ' + error.message;
        }
      }
      
      if (error.message) {
        if (error.message.includes('Network')) {
          return 'Problème de connexion réseau';
        }
        return error.message;
      }
      
      return 'Une erreur inconnue est survenue';
    },
    
    // Initialiser Parse SDK
    async initParse() {
      return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.parseConfig) {
          Parse.initialize(window.parseConfig.appId, window.parseConfig.javascriptKey);
          Parse.serverURL = window.parseConfig.serverURL;
          console.log('Parse SDK initialisé');
          resolve();
        } else {
          const checkParse = setInterval(() => {
            if (typeof Parse !== 'undefined' && Parse.serverURL) {
              clearInterval(checkParse);
              resolve();
            }
          }, 100);
        }
      });
    },
    
    // Ajouter un groupe de filtres
    addFilterGroup() {
      this.filterGroups.push({
        logicalOperator: 'AND',
        filters: [
          {
            field: this.colonnesConfig[0]?.field || '',
            operator: 'equals',
            value: '',
            value2: ''
          }
        ]
      });
    },
    
    // Supprimer un groupe de filtres
    removeFilterGroup(index) {
      if (this.filterGroups.length > 1) {
        this.filterGroups.splice(index, 1);
      }
    },
    
    // Ajouter un filtre à un groupe
    addFilterToGroup(groupIndex) {
      this.filterGroups[groupIndex].filters.push({
        field: this.colonnesConfig[0]?.field || '',
        operator: 'equals',
        value: '',
        value2: ''
      });
    },
    
    // Supprimer un filtre d'un groupe
    removeFilterFromGroup(groupIndex, filterIndex) {
      const group = this.filterGroups[groupIndex];
      if (group.filters.length > 1) {
        group.filters.splice(filterIndex, 1);
      }
    },
    

    
    // Prévisualiser les résultats avec Parse
    async previewResults() {
      this.isPreviewing = true;
      this.previewResultsData = [];
      this.resultCount = 0;
      
      try {
        if (typeof Parse === 'undefined') {
          await this.initParse();
        }
        
        const Impaye = Parse.Object.extend('Impayes');
        const query = new Parse.Query(Impaye);
        
        this.applyFiltersToParseQuery(query);
        
        const results = await query.find();
        
        this.previewResultsData = results.slice(0, 100).map(item => {
          const data = item.toJSON();
          return {
            id: data.idDossier || data.objectId,
            reference: data.reference || '-',
            client: data.payeur_nom || data.proprietaire_nom || '-',
            proprietaire: data.proprietaire_nom || 'Non',
            apporteur: data.apporteur_nom || '',
            montant: data.totalttcnet ? `${data.totalttcnet} €` : '-',
            date: data.datepiece || '-',
            statut: data.statut_intitule || '-',
            reste: data.resteapayer ? `${data.resteapayer} €` : '-'
          };
        });
        
        const countQuery = new Parse.Query(Impaye);
        this.applyFiltersToParseQuery(countQuery);
        countQuery.limit(0);
        this.resultCount = await countQuery.count();
        
      } catch (error) {
        console.error('Erreur lors de la prévisualisation:', error);
        alert('Erreur lors de la prévisualisation des résultats: ' + error.message);
      } finally {
        this.isPreviewing = false;
      }
    },
    
    // Appliquer les filtres à une requête Parse
    applyFiltersToParseQuery(query) {
      this.filterGroups.forEach((group, groupIndex) => {
        const groupQuery = new Parse.Query('Impayes');
        
        group.filters.forEach(filter => {
          if (!filter.field || !filter.value) return;
          
          const fieldName = filter.field;
          const operator = filter.operator;
          const value = filter.value;
          const value2 = filter.value2;
          
          switch (operator) {
            case 'equals':
              groupQuery.equalTo(fieldName, value);
              break;
            case 'not_equals':
              groupQuery.notEqualTo(fieldName, value);
              break;
            case 'contains':
              groupQuery.contains(fieldName, value);
              break;
            case 'not_contains':
              groupQuery.doesNotMatchKeyInQuery(fieldName, 'dummy', new Parse.Query('dummy'));
              break;
            case 'greater_than':
              groupQuery.greaterThan(fieldName, value);
              break;
            case 'less_than':
              groupQuery.lessThan(fieldName, value);
              break;
            case 'between':
              if (value && value2) {
                // Convertir les valeurs selon le type de champ
                const fieldType = this.getFieldType(fieldName);
                let convertedValue = value;
                let convertedValue2 = value2;
                
                // Validation supplémentaire
                let isValid = true;
                
                if (fieldType === 'date') {
                  // Convertir les chaînes de date en objets Date pour Parse
                  convertedValue = new Date(value);
                  convertedValue2 = new Date(value2);
                  
                  // Vérifier que les dates sont valides
                  if (isNaN(convertedValue.getTime()) || isNaN(convertedValue2.getTime())) {
                    isValid = false;
                  } else {
                    // Ajouter 23h59m59s à la date max pour inclure toute la journée
                    convertedValue2.setHours(23, 59, 59, 999);
                  }
                } else if (fieldType === 'number') {
                  // Convertir en nombre (gestion des décimales)
                  convertedValue = parseFloat(value);
                  convertedValue2 = parseFloat(value2);
                  
                  // Vérifier que les nombres sont valides
                  if (isNaN(convertedValue) || isNaN(convertedValue2)) {
                    isValid = false;
                  }
                }
                
                // Appliquer les filtres avec les valeurs converties si elles sont valides
                if (isValid) {
                  groupQuery.greaterThanOrEqualTo(fieldName, convertedValue);
                  groupQuery.lessThanOrEqualTo(fieldName, convertedValue2);
                }
              }
              break;
            case 'is_empty':
              groupQuery.doesNotExist(fieldName);
              break;
            case 'is_not_empty':
              groupQuery.exists(fieldName);
              break;
            case 'in_last_days':
              if (value) {
                const date = new Date();
                date.setDate(date.getDate() - parseInt(value));
                groupQuery.greaterThanOrEqualTo(fieldName, date);
              }
              break;
            case 'older_than_days':
              if (value) {
                const date = new Date();
                date.setDate(date.getDate() - parseInt(value));
                groupQuery.lessThan(fieldName, date);
              }
              break;
          }
        });
        
        if (groupIndex === 0) {
          query._where = groupQuery._where;
        } else {
          const combineQuery = new Parse.Query.or(...[query, groupQuery]);
          query._where = combineQuery._where;
        }
      });
    },
    
    // Valider les filtres avant sauvegarde
    validateFilters() {
      const errors = [];
      
      this.filterGroups.forEach((group, groupIndex) => {
        group.filters.forEach((filter, filterIndex) => {
          // Vérifier que le champ est sélectionné
          if (!filter.field) {
            errors.push(`Groupe ${groupIndex + 1}, Filtre ${filterIndex + 1}: Aucun champ sélectionné`);
            return;
          }
          
          // Vérifier que l'opérateur est sélectionné
          if (!filter.operator) {
            errors.push(`Groupe ${groupIndex + 1}, Filtre ${filterIndex + 1}: Aucun opérateur sélectionné`);
            return;
          }
          
          // Vérifier les valeurs requises
          const operatorInfo = this.getOperatorsForField(filter.field).find(op => op.value === filter.operator);
          
          if (operatorInfo && operatorInfo.inputType !== 'none') {
            // Vérifier la valeur principale
            if (!filter.value && filter.value !== 0 && filter.value !== false) {
              errors.push(`Groupe ${groupIndex + 1}, Filtre ${filterIndex + 1}: Valeur requise pour l'opérateur "${operatorInfo.label}"`);
            }
            
            // Vérifier la valeur secondaire pour les plages
            if (filter.operator === 'between' && (!filter.value2 && filter.value2 !== 0)) {
              errors.push(`Groupe ${groupIndex + 1}, Filtre ${filterIndex + 1}: Valeur maximale requise pour l'opérateur "Entre"`);
            }
          }
        });
      });
      
      return errors;
    },
    
    // Sauvegarder la séquence
    async saveSequence() {
      try {
        // Valider les filtres avant sauvegarde
        const validationErrors = this.validateFilters();
        
        if (validationErrors.length > 0) {
          this.error = 'Veuillez corriger les erreurs suivantes avant de sauvegarder:';
          validationErrors.forEach(error => console.warn(error));
          alert(validationErrors.join('\n'));
          return;
        }
        
        if (typeof Parse === 'undefined') {
          await this.initParse();
        }
        
        const Sequence = Parse.Object.extend('Sequences');
        let sequence;
        
        if (this.sequenceId) {
          sequence = new Sequence({ id: this.sequenceId });
        } else {
          sequence = new Sequence();
        }
        
        sequence.set('force_erase', this.forceErase);
        // Générer la requete_auto au moment de la sauvegarde
        const query = {
          filterGroups: this.filterGroups,
          forceErase: this.forceErase
        };
        sequence.set('requete_auto', JSON.stringify(query, null, 2));
        sequence.set('type', 'automatique');
        sequence.set('nom', `Séquence Auto - ${new Date().toISOString().split('T')[0]}`);
        
        const saved = await sequence.save();
        
        this.sequenceId = saved.id;
        alert('Séquence sauvegardée avec succès!');
        
        if (typeof window !== 'undefined') {
          const url = new URL(window.location);
          url.searchParams.set('id', saved.id);
          window.history.pushState({}, '', url);
        }
        
        return saved;
      } catch (error) {
        console.error('Erreur de sauvegarde:', error);
        alert('Erreur lors de la sauvegarde: ' + error.message);
        throw error;
      }
    }
  }));
});

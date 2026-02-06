// public/js/components/question-components.js
// Composants spécifiques pour chaque type de question
// Ce fichier contient tous les composants de question par type

document.addEventListener('alpine:init', () => {
  
  // Composant pour les questions de type Date
  Alpine.data('dateQuestion', (filter, field, operator, fieldValuesCache, getFieldType, analyzeFieldValuesFromData) => ({
    filter: filter,
    field: field,
    operator: operator,
    fieldValuesCache: fieldValuesCache,
    getFieldType: getFieldType,
    analyzeFieldValuesFromData: analyzeFieldValuesFromData,
    
    getFormModel() {
      const models = {
        'equals': {
          modelType: 'date-single',
          label: 'Valeur',
          inputType: 'date',
          inputName: 'value',
          placeholder: ''
        },
        'not_equals': {
          modelType: 'date-single',
          label: 'Valeur différente',
          inputType: 'date',
          inputName: 'value',
          placeholder: ''
        },
        'between': {
          modelType: 'date-range',
          inputs: [
            { label: 'Valeur min', inputType: 'date', inputName: 'value' },
            { label: 'Valeur max', inputType: 'date', inputName: 'value2' }
          ]
        },
        'greater_than': {
          modelType: 'date-after',
          label: 'Après',
          inputType: 'date',
          inputName: 'value',
          placeholder: ''
        },
        'less_than': {
          modelType: 'date-before',
          label: 'Avant',
          inputType: 'date',
          inputName: 'value',
          placeholder: ''
        },
        'in_last_days': {
          modelType: 'date-days-ago',
          label: 'Dans les derniers X jours',
          inputType: 'number',
          inputName: 'value',
          placeholder: 'Nombre de jours'
        },
        'older_than_days': {
          modelType: 'date-older-than',
          label: 'Plus vieux que X jours',
          inputType: 'number',
          inputName: 'value',
          placeholder: 'Nombre de jours'
        }
      };
      
      return models[this.operator] || models['equals'];
    }
  }));
  
  // Composant pour les questions de type Number
  Alpine.data('numberQuestion', (filter, field, operator, fieldValuesCache, getFieldType, analyzeFieldValuesFromData) => ({
    filter: filter,
    field: field,
    operator: operator,
    fieldValuesCache: fieldValuesCache,
    getFieldType: getFieldType,
    analyzeFieldValuesFromData: analyzeFieldValuesFromData,
    
    getFormModel() {
      const models = {
        'equals': {
          modelType: 'number-single',
          label: 'Valeur',
          inputType: 'number',
          inputName: 'value',
          placeholder: 'Montant'
        },
        'not_equals': {
          modelType: 'number-single',
          label: 'Valeur différente',
          inputType: 'number',
          inputName: 'value',
          placeholder: 'Montant'
        },
        'between': {
          modelType: 'number-range',
          inputs: [
            { label: 'Valeur min', inputType: 'number', inputName: 'value', placeholder: 'Montant min' },
            { label: 'Valeur max', inputType: 'number', inputName: 'value2', placeholder: 'Montant max' }
          ]
        },
        'greater_than': {
          modelType: 'number-greater',
          label: 'Supérieur à',
          inputType: 'number',
          inputName: 'value',
          placeholder: 'Montant'
        },
        'less_than': {
          modelType: 'number-less',
          label: 'Inférieur à',
          inputType: 'number',
          inputName: 'value',
          placeholder: 'Montant'
        }
      };
      
      return models[this.operator] || models['equals'];
    }
  }));
  
  // Composant pour les questions de type Text
  Alpine.data('textQuestion', (filter, field, operator, fieldValuesCache, getFieldType, analyzeFieldValuesFromData) => ({
    filter: filter,
    field: field,
    operator: operator,
    fieldValuesCache: fieldValuesCache,
    getFieldType: getFieldType,
    analyzeFieldValuesFromData: analyzeFieldValuesFromData,
    
    getFormModel() {
      const models = {
        'equals': {
          modelType: 'text-single',
          label: 'Valeur',
          inputType: 'text',
          inputName: 'value',
          placeholder: 'Valeur'
        },
        'not_equals': {
          modelType: 'text-single',
          label: 'Valeur différente',
          inputType: 'text',
          inputName: 'value',
          placeholder: 'Valeur'
        },
        'contains': {
          modelType: 'text-contains',
          label: 'Contient',
          inputType: 'text',
          inputName: 'value',
          placeholder: 'Texte à rechercher'
        },
        'not_contains': {
          modelType: 'text-not-contains',
          label: 'Ne contient pas',
          inputType: 'text',
          inputName: 'value',
          placeholder: 'Texte à exclure'
        },
        'starts_with': {
          modelType: 'text-starts',
          label: 'Commence par',
          inputType: 'text',
          inputName: 'value',
          placeholder: 'Début du texte'
        },
        'ends_with': {
          modelType: 'text-ends',
          label: 'Finit par',
          inputType: 'text',
          inputName: 'value',
          placeholder: 'Fin du texte'
        }
      };
      
      return models[this.operator] || models['equals'];
    }
  }));
  
  // Composant pour les questions de type Select
  Alpine.data('selectQuestion', (filter, field, operator, fieldValuesCache, getFieldType, analyzeFieldValuesFromData) => ({
    filter: filter,
    field: field,
    operator: operator,
    fieldValuesCache: fieldValuesCache,
    getFieldType: getFieldType,
    analyzeFieldValuesFromData: analyzeFieldValuesFromData,
    
    getFormModel() {
      const models = {
        'equals': {
          modelType: 'select-single',
          label: 'Valeur',
          inputType: 'select',
          inputName: 'value',
          options: this.getOptions()
        },
        'not_equals': {
          modelType: 'select-single',
          label: 'Valeur différente',
          inputType: 'select',
          inputName: 'value',
          options: this.getOptions()
        },
        'in': {
          modelType: 'select-multi',
          label: 'Est dans la liste',
          inputType: 'multi-select',
          inputName: 'value',
          options: this.getOptions()
        }
      };
      
      return models[this.operator] || models['equals'];
    },
    
    getOptions() {
      // Retourner les valeurs du cache si disponibles
      if (this.fieldValuesCache[this.field]) {
        return this.fieldValuesCache[this.field];
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
      if (predefinedValues[this.field]) {
        return predefinedValues[this.field];
      }
      
      // Si pas dans le cache et pas prédéfini, retourner un tableau vide
      return [];
    },
    
    async loadOptions() {
      if (!this.fieldValuesCache[this.field]) {
        const options = await this.analyzeFieldValuesFromData(this.field);
        this.fieldValuesCache[this.field] = options;
        return options;
      }
      return this.fieldValuesCache[this.field];
    }
  }));
  
  // Composant pour les questions de type Boolean
  Alpine.data('booleanQuestion', (filter, field, operator, fieldValuesCache, getFieldType, analyzeFieldValuesFromData) => ({
    filter: filter,
    field: field,
    operator: operator,
    fieldValuesCache: fieldValuesCache,
    getFieldType: getFieldType,
    analyzeFieldValuesFromData: analyzeFieldValuesFromData,
    
    getFormModel() {
      const models = {
        'equals': {
          modelType: 'boolean-single',
          label: 'Valeur',
          inputType: 'select',
          inputName: 'value',
          options: [
            { value: true, label: 'Oui' },
            { value: false, label: 'Non' }
          ]
        },
        'not_equals': {
          modelType: 'boolean-single',
          label: 'Valeur différente',
          inputType: 'select',
          inputName: 'value',
          options: [
            { value: true, label: 'Oui' },
            { value: false, label: 'Non' }
          ]
        }
      };
      
      return models[this.operator] || models['equals'];
    }
  }));
  
  // Composant pour les questions sans valeur (is_empty, is_not_empty)
  Alpine.data('noValueQuestion', (filter, field, operator, fieldValuesCache, getFieldType, analyzeFieldValuesFromData) => ({
    filter: filter,
    field: field,
    operator: operator,
    fieldValuesCache: fieldValuesCache,
    getFieldType: getFieldType,
    analyzeFieldValuesFromData: analyzeFieldValuesFromData,
    
    getFormModel() {
      const models = {
        'is_empty': {
          modelType: 'no-value',
          inputType: 'none',
          label: 'Est vide',
          noValue: true
        },
        'is_not_empty': {
          modelType: 'no-value',
          inputType: 'none',
          label: 'N\'est pas vide',
          noValue: true
        }
      };
      
      return models[this.operator] || models['is_empty'];
    }
  }));
});
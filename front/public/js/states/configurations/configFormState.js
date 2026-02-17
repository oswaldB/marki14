/**
 * État Alpine.js pour le formulaire de configuration
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('configFormState', (configId = '') => ({
    // État initial
    form: {
      name: '',
      configId: '',
      description: '',
      dbConfig: {
        host: '',
        database: '',
        username: '',
        password: '',
        query: ''
      },
      parseConfig: {
        targetClass: '',
        mappings: ''
      },
      validationRules: {
        requiredFields: ''
      },
      frequency: '',
      status: true
    },
    loading: false,
    error: null,
    isEdit: !!configId,

    // Méthodes du cycle de vie
    init() {
      console.log('Initialisation du state configFormState');
      if (this.isEdit) {
        this.loadConfig(configId);
      } else {
        // Générer un ID unique pour les nouvelles configurations
        this.form.configId = this.generateConfigId();
      }
    },

    /**
     * Génère un ID unique pour la configuration
     * @returns {string} L'ID généré
     */
    generateConfigId() {
      return 'config_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Charge une configuration existante
     * @param {string} configId - L'ID de la configuration
     */
    async loadConfig(configId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`/api/configurations/${configId}`);
        if (!response.ok) throw new Error('Failed to load configuration');

        const data = await response.json();
        this.form = {
          name: data.name,
          configId: data.configId,
          description: data.description || '',
          dbConfig: data.dbConfig,
          parseConfig: data.parseConfig,
          validationRules: data.validationRules,
          frequency: data.frequency,
          status: data.status === 'Activé'
        };
      } catch (error) {
        console.error('Error loading configuration:', error);
        this.error = 'Failed to load configuration. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Valide le formulaire
     * @returns {boolean} True si le formulaire est valide
     */
    validateForm() {
      // Vérifier les champs requis
      if (!this.form.name || !this.form.configId) {
        alert('Veuillez remplir tous les champs requis.');
        return false;
      }

      // Valider la requête SQL (vérification basique contre les injections)
      const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'EXEC'];
      const upperQuery = this.form.dbConfig.query.toUpperCase();
      
      for (const keyword of dangerousKeywords) {
        if (upperQuery.includes(keyword)) {
          alert(`Requête SQL non autorisée: ${keyword} détecté.`);
          return false;
        }
      }

      return true;
    },

    /**
     * Enregistre la configuration
     */
    async saveConfig() {
      if (!this.validateForm()) return;

      this.loading = true;
      this.error = null;

      try {
        // Préparer les données
        const configData = {
          ...this.form,
          status: this.form.status ? 'Activé' : 'Désactivé',
          // Convertir les mappings en objet
          parseConfig: {
            ...this.form.parseConfig,
            mappings: this.parseMappings(this.form.parseConfig.mappings)
          },
          // Convertir les champs requis en tableau
          validationRules: {
            ...this.form.validationRules,
            requiredFields: this.form.validationRules.requiredFields.split(',').map(f => f.trim())
          }
        };

        const url = this.isEdit ? `/api/configurations/${configData.configId}` : '/api/configurations';
        const method = this.isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(configData)
        });

        if (response.ok) {
          const result = await response.json();
          alert(result.message || 'Configuration enregistrée avec succès');
          window.location.href = '/admin/configurations';
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save configuration');
        }
      } catch (error) {
        console.error('Error saving configuration:', error);
        this.error = error.message || 'Failed to save configuration. Please try again.';
        alert(this.error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Parse les mappings depuis le format texte
     * @param {string} mappingsText - Le texte des mappings
     * @returns {Object} L'objet des mappings
     */
    parseMappings(mappingsText) {
      const mappings = {};
      if (!mappingsText) return mappings;

      const pairs = mappingsText.split(',');
      for (const pair of pairs) {
        const [source, target] = pair.split('→').map(s => s.trim());
        if (source && target) {
          mappings[source] = target;
        }
      }

      return mappings;
    },

    /**
     * Navigue vers la page précédente
     */
    navigateBack() {
      window.location.href = '/admin/configurations';
    }
  }));
});
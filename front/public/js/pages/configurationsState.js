/**
 * État Alpine.js pour la page de gestion des configurations
 * Utilise Alpine.state() pour une gestion d'état globale conforme aux bonnes pratiques
 */

if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    Alpine.state('configurations', {
      // État initial
      configs: [],
      loading: false,
      showCreateForm: false,
      showEditForm: false,
      showTestModal: false,
      currentConfig: {
        name: '',
        configId: '',
        description: '',
        dbConfig: {
          host: '',
          database: '',
          query: ''
        },
        credentials: {
          username: '',
          password: ''
        },
        parseConfig: {
          mappings: '',
          targetClass: 'Impayes'
        },
        validationRules: {
          requiredFields: ''
        },
        frequency: 'Quotidienne',
        isActive: true
      },
      testResults: {
        sampleData: [],
        recordCount: 0
      },
      alert: {
        message: '',
        type: '' // 'success' ou 'error'
      },

      // Cycle de vie
      init() {
        console.log('State configurations initialisé - Chargement des configurations');
        this.loadConfigs();
      },

      // Méthodes
      
      /**
       * Charge toutes les configurations
       */
      async loadConfigs() {
        console.log('Chargement des configurations depuis Parse REST API');
        this.loading = true;
        try {
          const response = await axios.get('/parse/functions/getAllSyncConfigs', {
            headers: {
              'X-Parse-Application-Id': import.meta.env.VITE_PARSE_APP_ID,
              'X-Parse-Javascript-Key': import.meta.env.VITE_PARSE_JS_KEY
            }
          });
          
          console.log('Configurations chargées:', response.data.result?.length || 0);
          this.configs = response.data.result || [];
        } catch (error) {
          console.error('Erreur lors du chargement des configurations:', error.message);
          this.showAlert('Erreur lors du chargement des configurations', 'error');
        } finally {
          this.loading = false;
        }
      },

      /**
       * Crée une nouvelle configuration
       */
      async createConfig() {
        console.log('Création d\'une nouvelle configuration:', this.currentConfig.configId);
        try {
          // Validation de la requête SQL
          if (this.currentConfig.dbConfig.query && /\b(DROP|DELETE|TRUNCATE|ALTER)\b/i.test(this.currentConfig.dbConfig.query)) {
            console.warn('Tentative de requête SQL dangereuse bloquée');
            this.showAlert('Requête SQL non autorisée', 'error');
            return;
          }

          const response = await axios.post('/parse/functions/createSyncConfig', {
            configData: {
              configId: this.currentConfig.configId,
              name: this.currentConfig.name,
              description: this.currentConfig.description,
              dbConfig: this.currentConfig.dbConfig,
              parseConfig: this.currentConfig.parseConfig,
              validationRules: this.currentConfig.validationRules,
              frequency: this.currentConfig.frequency,
              isActive: this.currentConfig.isActive
            },
            credentials: {
              username: this.currentConfig.credentials.username,
              encryptedPassword: this.currentConfig.credentials.password // Note: Dans un vrai projet, il faudrait chiffrer cela
            }
          }, {
            headers: {
              'X-Parse-Application-Id': import.meta.env.VITE_PARSE_APP_ID,
              'X-Parse-Javascript-Key': import.meta.env.VITE_PARSE_JS_KEY
            }
          });

          if (response.data.result.success) {
            console.log('Configuration créée avec succès:', this.currentConfig.configId);
            this.showAlert('Configuration enregistrée avec succès', 'success');
            this.showCreateForm = false;
            this.loadConfigs();
            this.resetCurrentConfig();
          } else {
            throw new Error(response.data.result.error || 'Erreur inconnue');
          }
        } catch (error) {
          console.error('Erreur lors de la création de configuration:', error.message);
          this.showAlert(error.message || 'Erreur lors de la création de la configuration', 'error');
        }
      },

      /**
       * Met à jour une configuration
       */
      async updateConfig() {
        console.log('Mise à jour de configuration:', this.currentConfig.configId);
        try {
          const response = await axios.post('/parse/functions/updateSyncConfig', {
            configId: this.currentConfig.configId,
            updates: {
              name: this.currentConfig.name,
              description: this.currentConfig.description,
              dbConfig: this.currentConfig.dbConfig,
              parseConfig: this.currentConfig.parseConfig,
              validationRules: this.currentConfig.validationRules,
              frequency: this.currentConfig.frequency,
              isActive: this.currentConfig.isActive
            }
          }, {
            headers: {
              'X-Parse-Application-Id': import.meta.env.VITE_PARSE_APP_ID,
              'X-Parse-Javascript-Key': import.meta.env.VITE_PARSE_JS_KEY
            }
          });

          if (response.data.result.success) {
            console.log('Configuration mise à jour avec succès:', this.currentConfig.configId);
            this.showAlert('Configuration mise à jour avec succès', 'success');
            this.showEditForm = false;
            this.loadConfigs();
            this.resetCurrentConfig();
          } else {
            throw new Error(response.data.result.error || 'Erreur inconnue');
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour de configuration:', error.message);
          this.showAlert(error.message || 'Erreur lors de la mise à jour de la configuration', 'error');
        }
      },

      /**
       * Supprime une configuration
       * @param {string} configId - ID de la configuration
       */
      async deleteConfig(configId) {
        console.log('Demande de suppression de configuration:', configId);
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette configuration ?')) {
          console.log('Suppression annulée par l\'utilisateur');
          return;
        }

        try {
          const response = await axios.post('/parse/functions/deleteSyncConfig', {
            configId: configId
          }, {
            headers: {
              'X-Parse-Application-Id': import.meta.env.VITE_PARSE_APP_ID,
              'X-Parse-Javascript-Key': import.meta.env.VITE_PARSE_JS_KEY
            }
          });

          if (response.data.result.success) {
            console.log('Configuration supprimée avec succès:', configId);
            this.showAlert('Configuration supprimée avec succès', 'success');
            this.loadConfigs();
          } else {
            throw new Error(response.data.result.error || 'Erreur inconnue');
          }
        } catch (error) {
          console.error('Erreur lors de la suppression de configuration:', error.message);
          this.showAlert(error.message || 'Erreur lors de la suppression de la configuration', 'error');
        }
      },

      /**
       * Teste une configuration
       * @param {string} configId - ID de la configuration
       */
      async testConfig(configId) {
        console.log('Test de configuration:', configId);
        try {
          const response = await axios.post('/parse/functions/testSyncConfig', {
            configId: configId
          }, {
            headers: {
              'X-Parse-Application-Id': import.meta.env.VITE_PARSE_APP_ID,
              'X-Parse-Javascript-Key': import.meta.env.VITE_PARSE_JS_KEY
            }
          });

          if (response.data.result.success) {
            console.log('Test réussi - Enregistrements trouvés:', response.data.result.recordCount);
            this.testResults = response.data.result;
            this.showTestModal = true;
          } else {
            throw new Error(response.data.result.error || 'Erreur inconnue');
          }
        } catch (error) {
          console.error('Erreur lors du test de configuration:', error.message);
          this.showAlert(error.message || 'Erreur lors du test de la configuration', 'error');
        }
      },

      /**
       * Charge une configuration pour édition
       * @param {string} configId - ID de la configuration
       */
      async editConfig(configId) {
        console.log('Chargement de configuration pour édition:', configId);
        try {
          const config = this.configs.find(c => c.objectId === configId);
          if (config) {
            console.log('Configuration chargée:', config.objectId);
            this.currentConfig = {
              ...config.toJSON(),
              credentials: {
                username: '',
                password: ''
              }
            };
            this.showEditForm = true;
          }
        } catch (error) {
          console.error('Erreur lors du chargement de la configuration:', error.message);
          this.showAlert('Erreur lors du chargement de la configuration', 'error');
        }
      },

      /**
       * Réinitialise le formulaire
       */
      resetCurrentConfig() {
        console.log('Réinitialisation du formulaire de configuration');
        this.currentConfig = {
          name: '',
          configId: '',
          description: '',
          dbConfig: {
            host: '',
            database: '',
            query: ''
          },
          credentials: {
            username: '',
            password: ''
          },
          parseConfig: {
            mappings: '',
            targetClass: 'Impayes'
          },
          validationRules: {
            requiredFields: ''
          },
          frequency: 'Quotidienne',
          isActive: true
        };
      },

      /**
       * Affiche une alerte
       * @param {string} message - Message de l'alerte
       * @param {'success'|'error'} type - Type de l'alerte
       */
      showAlert(message, type) {
        console.log(`Alerte ${type}:`, message);
        this.alert = { message, type };
        setTimeout(() => {
          console.log('Fermeture automatique de l\'alerte');
          this.alert = { message: '', type: '' };
        }, 5000);
      }
    });
  });
}
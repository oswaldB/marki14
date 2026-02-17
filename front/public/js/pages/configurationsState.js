/**
 * État Alpine.js pour la page de gestion des configurations
 * Conforme aux bonnes pratiques du projet
 */

if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    Alpine.data('configurationsState', () => ({
      // État initial
      configs: [],
      loading: false,
      error: null,
      showForm: false,
      showTestResults: false,
      currentConfig: {
        configId: '',
        name: '',
        description: '',
        dbConfig: {
          host: '',
          database: '',
          user: '',
          password: '',
          query: ''
        },
        parseConfig: {
          mappings: '',
          targetClass: 'Impayes'
        },
        validationRules: {
          requiredFields: '',
          roleValues: ''
        },
        frequency: 'Quotidienne',
        status: 'Actif'
      },
      searchQuery: '',
      filterStatus: 'all',
      alerts: [],
      testData: [],
      testColumns: [],
      testError: null,
      testSuccessMessage: '',

      // Getters
      get filteredConfigs() {
        return this.configs
          .filter(config => {
            if (this.filterStatus === 'all') return true;
            return this.filterStatus === 'active' ? config.status === 'Actif' : config.status === 'Désactivé';
          })
          .filter(config => {
            if (!this.searchQuery) return true;
            const query = this.searchQuery.toLowerCase();
            return config.name.toLowerCase().includes(query) ||
                   config.dbConfig.database.toLowerCase().includes(query) ||
                   config.configId.toLowerCase().includes(query);
          });
      },

      get formTitle() {
        return this.currentConfig.configId ? 'Modifier Configuration' : 'Nouvelle Configuration';
      },

      // Méthodes
      async init() {
        console.log('Initialisation du state des configurations');
        await this.loadConfigs();
      },

      async loadConfigs() {
        this.loading = true;
        this.error = null;
        
        try {
          console.log('Chargement des configurations depuis l\'API');
          const response = await axios.get('/api/sync-configs', {
            headers: {
              'X-Parse-Session-Token': Alpine.store('auth').sessionToken
            }
          });
          this.configs = response.data;
        } catch (error) {
          console.error('Erreur lors du chargement des configurations:', error);
          this.error = 'Failed to load configurations';
          this.showAlert('Erreur lors du chargement des configurations', 'error');
        } finally {
          this.loading = false;
        }
      },

      async refreshConfigs() {
        console.log('Rafraîchissement des configurations');
        await this.loadConfigs();
        this.showAlert('Configurations rafraîchies', 'success');
      },

      showNewConfigForm() {
        console.log('Ouverture du formulaire de nouvelle configuration');
        this.currentConfig = {
          configId: `config_${Date.now()}`,
          name: '',
          description: '',
          dbConfig: {
            host: '',
            database: '',
            user: '',
            password: '',
            query: ''
          },
          parseConfig: {
            mappings: '',
            targetClass: 'Impayes'
          },
          validationRules: {
            requiredFields: '',
            roleValues: ''
          },
          frequency: 'Quotidienne',
          status: 'Actif'
        };
        this.showForm = true;
      },

      closeForm() {
        console.log('Fermeture du formulaire');
        this.showForm = false;
      },

      async saveConfig() {
        console.log('Enregistrement de la configuration:', this.currentConfig);
        
        try {
          // Validation des champs requis
          if (!this.currentConfig.name || !this.currentConfig.configId) {
            this.showAlert('Nom et ID sont requis', 'error');
            return;
          }

          // Vérification de l'injection SQL
          if (this.hasSqlInjection(this.currentConfig.dbConfig.query)) {
            this.showAlert('Requête SQL non autorisée', 'error');
            return;
          }

          // Préparation des données
          const configData = {
            configId: this.currentConfig.configId,
            name: this.currentConfig.name,
            description: this.currentConfig.description,
            dbConfig: {
              host: this.currentConfig.dbConfig.host,
              database: this.currentConfig.dbConfig.database,
              user: this.currentConfig.dbConfig.user,
              query: this.currentConfig.dbConfig.query
            },
            parseConfig: {
              mappings: this.currentConfig.parseConfig.mappings,
              targetClass: this.currentConfig.parseConfig.targetClass
            },
            validationRules: {
              requiredFields: this.currentConfig.validationRules.requiredFields.split(',').map(f => f.trim()),
              roleValues: this.currentConfig.validationRules.roleValues
            },
            frequency: this.currentConfig.frequency,
            status: this.currentConfig.status,
            createdBy: Alpine.store('auth').user.objectId
          };

          const credentials = {
            username: this.currentConfig.dbConfig.user,
            password: this.currentConfig.dbConfig.password
          };

          // Appel à l'API backend
          const response = await axios.post('/api/sync-configs', {
            configData,
            credentials
          }, {
            headers: {
              'X-Parse-Session-Token': Alpine.store('auth').sessionToken
            }
          });
          
          this.showAlert('Configuration enregistrée avec succès', 'success');
          this.closeForm();
          await this.loadConfigs();
          
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement:', error);
          this.showAlert(error.message || 'Erreur lors de l\'enregistrement', 'error');
        }
      },

      async testConfig(configId) {
        console.log('Test de la configuration:', configId);
        
        try {
          this.loading = true;
          
          const response = await axios.get(`/api/sync-configs/${configId}/test`, {
            headers: {
              'X-Parse-Session-Token': Alpine.store('auth').sessionToken
            }
          });
          
          this.testData = response.data.results;
          this.testColumns = response.data.columns;
          this.testSuccessMessage = response.data.message;
          this.testError = null;
          this.showTestResults = true;
          
        } catch (error) {
          console.error('Erreur lors du test:', error);
          this.testError = error.message || 'Erreur lors du test de la configuration';
          this.testData = [];
          this.testColumns = [];
          this.showTestResults = true;
        } finally {
          this.loading = false;
        }
      },

      closeTestResults() {
        console.log('Fermeture des résultats de test');
        this.showTestResults = false;
      },

      async editConfig(configId) {
        console.log('Édition de la configuration:', configId);
        
        try {
          // Récupérer la configuration depuis l'API
          const response = await axios.get(`/api/sync-configs?configId=${configId}`, {
            headers: {
              'X-Parse-Session-Token': Alpine.store('auth').sessionToken
            }
          });
          
          if (response.data.length > 0) {
            const config = response.data[0];
            this.currentConfig = {
              configId: config.configId,
              name: config.name,
              description: config.description,
              dbConfig: {
                host: config.dbConfig.host,
                database: config.dbConfig.database,
                user: config.dbConfig.user,
                password: '', // Ne pas charger le mot de passe pour des raisons de sécurité
                query: config.dbConfig.query
              },
              parseConfig: {
                mappings: config.parseConfig.mappings,
                targetClass: config.parseConfig.targetClass
              },
              validationRules: {
                requiredFields: config.validationRules.requiredFields.join(', '),
                roleValues: config.validationRules.roleValues
              },
              frequency: config.frequency,
              status: config.status
            };
            this.showForm = true;
          }
          
        } catch (error) {
          console.error('Erreur lors de la récupération de la configuration:', error);
          this.showAlert(error.message || 'Erreur lors de la récupération de la configuration', 'error');
        }
      },

      async deleteConfig(configId) {
        console.log('Suppression de la configuration:', configId);
        
        if (confirm('Êtes-vous sûr de vouloir supprimer cette configuration ?')) {
          try {
            await axios.delete(`/api/sync-configs/${configId}`, {
              headers: {
                'X-Parse-Session-Token': Alpine.store('auth').sessionToken
              }
            });
            
            this.showAlert('Configuration supprimée avec succès', 'success');
            await this.loadConfigs();
            
          } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            this.showAlert(error.message || 'Erreur lors de la suppression', 'error');
          }
        }
      },

      showAlert(message, type = 'success') {
        const id = Date.now();
        this.alerts.push({ id, message, type });
        
        setTimeout(() => {
          this.alerts = this.alerts.filter(alert => alert.id !== id);
        }, 5000);
      },

      hasSqlInjection(query) {
        // Implémentation basique de détection d'injection SQL
        const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'INSERT', 'UPDATE', 'ALTER', 'EXEC', 'UNION'];
        const upperQuery = query.toUpperCase();
        
        return dangerousKeywords.some(keyword => {
          // Vérifier si le mot-clé est présent en tant que mot complet (pas dans un commentaire ou une chaîne)
          const regex = new RegExp(`\\b${keyword}\\b`, 'i');
          return regex.test(upperQuery) && !upperQuery.includes(`-- ${keyword}`);
        });
      }
    }));
  });
}
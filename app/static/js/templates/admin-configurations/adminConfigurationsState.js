document.addEventListener('alpine:init', () => {
    Alpine.data('configurationsState', () => ({
        // État initial
        configurations: [],
        filteredConfigurations: [],
        showCreateForm: false,
        editingConfig: null,
        showTestModal: false,
        testResults: [],
        testError: null,
        searchQuery: '',
        filterStatus: 'all',
        
        // Structure de la configuration actuelle
        currentConfig: {
            objectId: null,
            nom: '',
            configId: '',
            description: '',
            dbConfig: {
                host: '',
                database: '',
                user: '',
                password: '',
                query: ''
            },
            parseConfig: {
                targetClass: 'Impayes',
                mappings: ''
            },
            validationRules: {
                requiredFields: ''
            },
            frequence: 'Quotidienne',
            isActif: true
        },
        
        // Initialisation
        init() {
            this.refreshConfigurations();
        },
        
        // Rafraîchir la liste des configurations
        async refreshConfigurations() {
            try {
                const response = await window.parseAxios.get('classes/SyncConfigs');
                this.configurations = response.data.results || [];
                this.filteredConfigurations = [...this.configurations];
                this.filterConfigurations();
            } catch (error) {
                console.error('Erreur lors du chargement des configurations:', error);
                Alpine.store('notifications').addNotification({
                    type: 'error',
                    message: 'Erreur lors du chargement des configurations'
                });
            }
        },
        
        // Filtrer les configurations
        filterConfigurations() {
            let filtered = this.configurations;
            
            // Filtre par statut
            if (this.filterStatus === 'active') {
                filtered = filtered.filter(config => config.isActif);
            } else if (this.filterStatus === 'inactive') {
                filtered = filtered.filter(config => !config.isActif);
            }
            
            // Filtre par recherche
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(config =>
                    config.nom.toLowerCase().includes(query) ||
                    (config.dbConfig?.database || '').toLowerCase().includes(query)
                );
            }
            
            this.filteredConfigurations = filtered;
        },
        
        // Créer une nouvelle configuration
        async createConfiguration() {
            try {
                // Validation de base
                if (!this.currentConfig.nom || !this.currentConfig.configId) {
                    throw new Error('Nom et ID de configuration sont requis');
                }
                
                // Vérification de la requête SQL (basique)
                const forbiddenKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER'];
                const queryUpper = this.currentConfig.dbConfig.query.toUpperCase();
                const hasForbiddenKeyword = forbiddenKeywords.some(keyword => 
                    queryUpper.includes(keyword)
                );
                
                if (hasForbiddenKeyword) {
                    throw new Error('Requête SQL non autorisée - mots-clés dangereux détectés');
                }
                
                // Préparation des données pour Parse
                const configData = {
                    nom: this.currentConfig.nom,
                    configId: this.currentConfig.configId,
                    description: this.currentConfig.description,
                    dbConfig: {
                        host: this.currentConfig.dbConfig.host,
                        database: this.currentConfig.dbConfig.database,
                        user: this.currentConfig.dbConfig.user,
                        query: this.currentConfig.dbConfig.query
                    },
                    parseConfig: {
                        targetClass: this.currentConfig.parseConfig.targetClass,
                        mappings: this.currentConfig.parseConfig.mappings
                    },
                    validationRules: {
                        requiredFields: this.currentConfig.validationRules.requiredFields.split(',').map(f => f.trim())
                    },
                    frequence: this.currentConfig.frequence,
                    isActif: this.currentConfig.isActif
                };
                
                // Création dans Parse
                const response = await window.parseAxios.post('classes/SyncConfigs', configData);
                
                // Création des credentials (simplifiée - dans un vrai scénario, il faudrait chiffrer)
                const credentialsData = {
                    configId: this.currentConfig.configId,
                    username: this.currentConfig.dbConfig.user,
                    password: this.currentConfig.dbConfig.password // Note: Dans une vraie app, il faudrait chiffrer
                };
                
                await window.parseAxios.post('classes/DBCredentials', credentialsData);
                
                // Mise à jour des variables globales (simplifiée)
                await this.updateGlobalVariables();
                
                // Réinitialisation et rafraîchissement
                this.cancelForm();
                this.refreshConfigurations();
                
                Alpine.store('notifications').addNotification({
                    type: 'success',
                    message: 'Configuration enregistrée avec succès'
                });
                
            } catch (error) {
                console.error('Erreur lors de la création:', error);
                Alpine.store('notifications').addNotification({
                    type: 'error',
                    message: error.message || 'Erreur lors de l\'enregistrement'
                });
                
                // Log d'erreur dans SyncLogs
                await this.logError(error.message || 'Erreur de création');
            }
        },
        
        // Mettre à jour une configuration
        async updateConfiguration() {
            try {
                if (!this.currentConfig.objectId) {
                    throw new Error('ID de configuration manquant');
                }
                
                // Validation similaire à la création
                const forbiddenKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER'];
                const queryUpper = this.currentConfig.dbConfig.query.toUpperCase();
                const hasForbiddenKeyword = forbiddenKeywords.some(keyword => 
                    queryUpper.includes(keyword)
                );
                
                if (hasForbiddenKeyword) {
                    throw new Error('Requête SQL non autorisée');
                }
                
                const configData = {
                    nom: this.currentConfig.nom,
                    configId: this.currentConfig.configId,
                    description: this.currentConfig.description,
                    dbConfig: {
                        host: this.currentConfig.dbConfig.host,
                        database: this.currentConfig.dbConfig.database,
                        user: this.currentConfig.dbConfig.user,
                        query: this.currentConfig.dbConfig.query
                    },
                    parseConfig: {
                        targetClass: this.currentConfig.parseConfig.targetClass,
                        mappings: this.currentConfig.parseConfig.mappings
                    },
                    validationRules: {
                        requiredFields: this.currentConfig.validationRules.requiredFields.split(',').map(f => f.trim())
                    },
                    frequence: this.currentConfig.frequence,
                    isActif: this.currentConfig.isActif
                };
                
                await window.parseAxios.put(
                    `classes/SyncConfigs/${this.currentConfig.objectId}`,
                    configData
                );
                
                // Mise à jour des credentials si nécessaire
                await window.parseAxios.put(
                    `classes/DBCredentials/${this.currentConfig.configId}`,
                    {
                        username: this.currentConfig.dbConfig.user,
                        password: this.currentConfig.dbConfig.password
                    }
                );
                
                this.cancelForm();
                this.refreshConfigurations();
                
                Alpine.store('notifications').addNotification({
                    type: 'success',
                    message: 'Configuration mise à jour avec succès'
                });
                
            } catch (error) {
                console.error('Erreur lors de la mise à jour:', error);
                Alpine.store('notifications').addNotification({
                    type: 'error',
                    message: error.message || 'Erreur lors de la mise à jour'
                });
                await this.logError(error.message || 'Erreur de mise à jour');
            }
        },
        
        // Éditer une configuration
        async editConfiguration(configId) {
            try {
                const response = await window.parseAxios.get(`classes/SyncConfigs/${configId}`);
                const config = response.data;
                
                // Remplir le formulaire
                this.currentConfig = {
                    objectId: config.objectId,
                    nom: config.nom,
                    configId: config.configId,
                    description: config.description || '',
                    dbConfig: {
                        host: config.dbConfig?.host || '',
                        database: config.dbConfig?.database || '',
                        user: config.dbConfig?.user || '',
                        password: '', // Ne pas charger le mot de passe pour des raisons de sécurité
                        query: config.dbConfig?.query || ''
                    },
                    parseConfig: {
                        targetClass: config.parseConfig?.targetClass || 'Impayes',
                        mappings: config.parseConfig?.mappings || ''
                    },
                    validationRules: {
                        requiredFields: config.validationRules?.requiredFields?.join(', ') || ''
                    },
                    frequence: config.frequence || 'Quotidienne',
                    isActif: config.isActif || false
                };
                
                this.editingConfig = config.objectId;
                this.showCreateForm = true;
                
            } catch (error) {
                console.error('Erreur lors du chargement de la configuration:', error);
                Alpine.store('notifications').addNotification({
                    type: 'error',
                    message: 'Erreur lors du chargement de la configuration'
                });
            }
        },
        
        // Tester une configuration
        async testConfiguration(configId) {
            try {
                this.testError = null;
                this.testResults = [];
                
                // Récupérer la configuration
                const configResponse = await window.parseAxios.get(`classes/SyncConfigs/${configId}`);
                const config = configResponse.data;
                
                // Récupérer les credentials
                const credsResponse = await window.parseAxios.get(`classes/DBCredentials/${config.configId}`);
                const credentials = credsResponse.data;
                
                // Simuler un test de connexion et d'exécution de requête
                // Dans une vraie implémentation, cela appellerait un endpoint backend
                // qui exécuterait la requête de manière sécurisée
                
                // Simulation de résultats
                const mockResults = [
                    { email: 'client@acme.com', amount: 1200.50, due_date: '2026-03-01' },
                    { email: 'client2@acme.com', amount: 850.00, due_date: '2026-03-15' }
                ];
                
                // Validation des colonnes requises
                const requiredFields = config.validationRules?.requiredFields || [];
                const resultColumns = Object.keys(mockResults[0] || {});
                
                const missingFields = requiredFields.filter(field => !resultColumns.includes(field));
                
                if (missingFields.length > 0) {
                    throw new Error(`Champs manquants dans les résultats: ${missingFields.join(', ')}`);
                }
                
                this.testResults = mockResults;
                this.showTestModal = true;
                
            } catch (error) {
                console.error('Erreur lors du test:', error);
                this.testError = error.message || 'Erreur lors du test de la configuration';
                this.showTestModal = true;
                
                await this.logError(`Test failed: ${error.message}`);
            }
        },
        
        // Annuler le formulaire
        cancelForm() {
            this.showCreateForm = false;
            this.editingConfig = null;
            
            // Réinitialiser le formulaire
            this.currentConfig = {
                objectId: null,
                nom: '',
                configId: '',
                description: '',
                dbConfig: {
                    host: '',
                    database: '',
                    user: '',
                    password: '',
                    query: ''
                },
                parseConfig: {
                    targetClass: 'Impayes',
                    mappings: ''
                },
                validationRules: {
                    requiredFields: ''
                },
                frequence: 'Quotidienne',
                isActif: true
            };
        },
        
        // Mettre à jour les variables globales
        async updateGlobalVariables() {
            try {
                // Dans une vraie implémentation, cela mettra à jour une classe VariablesGlobales
                // Pour cet exemple, nous simulons simplement
                console.log('Mise à jour des variables globales');
            } catch (error) {
                console.error('Erreur lors de la mise à jour des variables globales:', error);
            }
        },
        
        // Logger une erreur
        async logError(details) {
            try {
                await window.parseAxios.post('classes/SyncLogs', {
                    status: 'error',
                    details: details,
                    configId: this.currentConfig.configId || null,
                    timestamp: new Date().toISOString()
                });
            } catch (logError) {
                console.error('Erreur lors de l\'enregistrement du log:', logError);
            }
        }
    }));
});
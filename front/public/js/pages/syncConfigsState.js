// Sync Configurations State for Alpine.js
// This implements the state management for the sync configuration interface

document.addEventListener('alpine:init', () => {
  Alpine.data('syncConfigsState', () => ({
    // State
    configs: [],
    currentConfig: null,
    isLoading: false,
    error: null,
    showModal: false,
    modalType: 'create', // 'create', 'edit', 'test'
    testResults: [],
    showTestModal: false,
    activeTab: 'configs', // 'configs', 'logs'
    currentLogs: [],
    
    // Getters
    get activeConfigs() {
      return this.configs.filter(c => c.isActive)
    },
    
    get autoConfigs() {
      return this.configs.filter(c => c.isAuto)
    },
    
    // Initialization
    async init() {
      await this.loadConfigs()
    },
    
    // Load configurations
    async loadConfigs(filter = null) {
      this.isLoading = true
      this.error = null
      
      try {
        let url = '/api/sync-configs'
        if (filter) {
          url += `?filter=${filter}`
        }
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to load configurations: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          this.configs = data.data || []
        } else {
          throw new Error(data.message || 'Unknown error')
        }
      } catch (error) {
        this.error = error.message
        console.error('Error loading configs:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    // Open create modal
    openCreateModal() {
      this.currentConfig = {
        name: '',
        description: '',
        isActive: true,
        isAuto: false,
        frequency: 'Quotidienne',
        dbConfig: {
          host: '',
          database: '',
          user: '',
          query: ''
        },
        parseConfig: {
          targetClass: 'Impayes',
          mappings: {}
        },
        validationRules: {
          requiredFields: []
        }
      }
      this.modalType = 'create'
      this.showModal = true
      this.error = null
    },
    
    // Open edit modal
    openEditModal(config) {
      this.currentConfig = { ...config }
      this.modalType = 'edit'
      this.showModal = true
      this.error = null
    },
    
    // Open test modal
    async openTestModal(config) {
      this.currentConfig = config
      this.modalType = 'test'
      this.showTestModal = true
      this.error = null
      
      try {
        const response = await fetch(`/api/sync-configs/${config.configId}/test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`Test failed: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          this.testResults = data.sampleData || []
        } else {
          throw new Error(data.message || 'Test failed')
        }
      } catch (error) {
        this.error = error.message
        console.error('Error testing config:', error)
      }
    },
    
    // Close modals
    closeModal() {
      this.showModal = false
      this.showTestModal = false
      this.error = null
    },
    
    // Save configuration
    async saveConfig() {
      this.isLoading = true
      this.error = null
      
      try {
        // Validate form
        if (!this.validateConfig()) {
          return
        }
        
        const credentials = {
          username: this.currentConfig.dbConfig.user,
          password: document.getElementById('dbPassword')?.value || ''
        }
        
        const configData = { ...this.currentConfig }
        // Remove credentials from config data
        delete configData.dbConfig.user
        
        let url, method
        if (this.modalType === 'create') {
          url = '/api/sync-configs'
          method = 'POST'
        } else {
          url = `/api/sync-configs/${this.currentConfig.configId}`
          method = 'PUT'
        }
        
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({ configData, credentials })
        })
        
        if (!response.ok) {
          throw new Error(`Failed to save configuration: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          this.closeModal()
          await this.loadConfigs()
          
          // Show success message
          this.showSuccessMessage(`Configuration ${this.modalType === 'create' ? 'créée' : 'mise à jour'} avec succès`)
        } else {
          throw new Error(data.message || 'Unknown error')
        }
      } catch (error) {
        this.error = error.message
        console.error('Error saving config:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    // Delete configuration
    async deleteConfig(configId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette configuration ?')) {
        return
      }
      
      this.isLoading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/sync-configs/${configId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to delete configuration: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          await this.loadConfigs()
          this.showSuccessMessage('Configuration supprimée avec succès')
        } else {
          throw new Error(data.message || 'Unknown error')
        }
      } catch (error) {
        this.error = error.message
        console.error('Error deleting config:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    // Run sync manually
    async runSync(configId) {
      if (!confirm('Êtes-vous sûr de vouloir exécuter cette synchronisation maintenant ?')) {
        return
      }
      
      this.isLoading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/sync-configs/${configId}/run`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to run sync: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          this.showSuccessMessage(`Synchronisation exécutée: ${data.recordsProcessed} enregistrements traités`)
          
          // Load logs for this config
          await this.loadLogs(configId)
          this.activeTab = 'logs'
        } else {
          throw new Error(data.message || 'Unknown error')
        }
      } catch (error) {
        this.error = error.message
        console.error('Error running sync:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    // Load logs for a configuration
    async loadLogs(configId) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/sync-configs/${configId}/logs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to load logs: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          this.currentLogs = data.data || []
        } else {
          throw new Error(data.message || 'Unknown error')
        }
      } catch (error) {
        this.error = error.message
        console.error('Error loading logs:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    // Validate configuration
    validateConfig() {
      const errors = []
      
      if (!this.currentConfig.name.trim()) {
        errors.push('Le nom est requis')
      }
      
      if (!this.currentConfig.dbConfig.host.trim()) {
        errors.push('L\'hôte de la base de données est requis')
      }
      
      if (!this.currentConfig.dbConfig.database.trim()) {
        errors.push('Le nom de la base de données est requis')
      }
      
      if (!this.currentConfig.dbConfig.query.trim()) {
        errors.push('La requête SQL est requise')
      }
      
      if (!this.currentConfig.parseConfig.targetClass) {
        errors.push('La classe cible Parse est requise')
      }
      
      if (errors.length > 0) {
        this.error = errors.join(', ')
        return false
      }
      
      return true
    },
    
    // Show success message
    showSuccessMessage(message) {
      // You can implement a toast notification here
      alert(message)
    },
    
    // Format date for display
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    // Get status badge class
    getStatusBadgeClass(status) {
      const classes = {
        'success': 'bg-[#00CF9B] text-white',
        'error': 'bg-red-500 text-white',
        'warning': 'bg-yellow-500 text-white',
        'info': 'bg-blue-500 text-white'
      }
      return classes[status] || 'bg-gray-500 text-white'
    },
    
    // Get status text
    getStatusText(status) {
      const texts = {
        'success': 'Succès',
        'error': 'Erreur',
        'warning': 'Avertissement',
        'info': 'Info'
      }
      return texts[status] || status
    }
  }))
})
// Enregistrer un plan de relance
async saveSequence() {
    try {
        let parseAxios = Alpine.store('parseAxios');
        
        if (!parseAxios) {
            throw new Error('parseAxios n\'est pas disponible');
        }
        
        const sequenceData = {
            nom: this.currentSequence.nom,
            isAuto: this.currentSequence.isAuto,
            description: this.currentSequence.description,
            actions: this.currentSequence.actions,
            isActif: this.currentSequence.isActif
        };
        
        // Ajouter les champs spécifiques aux plans de relance automatiques
        if (this.currentSequence.isAuto) {
            sequenceData.triggerCondition = this.currentSequence.triggerCondition;
            sequenceData.triggerDelay = this.currentSequence.triggerDelay;
        }
        
        let response;
        
        if (this.editingSequence) {
            // Mise à jour d'un plan de relance existant
            response = await parseAxios.put(`/classes/Sequences/${this.currentSequence.objectId}`, sequenceData);
        } else {
            // Création d'un nouveau plan de relance
            response = await parseAxios.post('/classes/Sequences', sequenceData);
        }
        
        // Rafraîchir les données après sauvegarde
        await this.refreshData();
        
        // Fermer le drawer
        this.closeDrawer();
        
        // Redirection selon le type de plan de relance
        const sequenceId = this.editingSequence ? this.currentSequence.objectId : response.data.objectId;
        const sequenceType = this.currentSequence.isAuto;
        
        if (!sequenceType) {
            window.location.href = `/sequence/${sequenceId}/man`;
        } else {
            window.location.href = `/sequence/${sequenceId}/auto`;
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du plan de relance:', error);
        this.error = 'Impossible d\'enregistrer le plan de relance.';
    }
},

// Dupliquer un plan de relance
async duplicateSequence(sequence) {
    try {
        let parseAxios = Alpine.store('parseAxios');
        
        if (!parseAxios) {
            throw new Error('parseAxios n\'est pas disponible');
        }
        
        const duplicateData = {
            nom: `Copie de ${sequence.nom}`,
            isAuto: sequence.isAuto,
            description: sequence.description,
            actions: sequence.actions || [],
            isActif: false, // Désactivé par défaut
            triggerCondition: sequence.triggerCondition || '',
            triggerDelay: sequence.triggerDelay || 0
        };
        
        const response = await parseAxios.post('/classes/Sequences', duplicateData);
        
        // Rafraîchir les données
        await this.refreshData();
        
        // Redirection vers l'édition du plan de relance dupliqué
        const sequenceId = response.data.objectId;
        const sequenceType = sequence.isAuto;
        
        if (!sequenceType) {
            window.location.href = `/sequence/${sequenceId}/man`;
        } else {
            window.location.href = `/sequence/${sequenceId}/auto`;
        }
        
    } catch (error) {
        console.error('Erreur lors de la duplication du plan de relance:', error);
        this.error = 'Impossible de dupliquer le plan de relance.';
    }
},
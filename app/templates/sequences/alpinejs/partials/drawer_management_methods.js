// Ouvrir le drawer de création
openCreateDrawer() {
    this.currentSequence = {
        objectId: '',
        nom: '',
        isAuto: false,
        description: '',
        actions: [],
        triggerCondition: '',
        triggerDelay: 0,
        isActif: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    this.editingSequence = false;
    this.drawerOpen = true;
},

// Ouvrir la page d'édition
openEditDrawer(sequence) {
    // Rediriger vers la page d'édition en fonction du type
    if (sequence.isAuto) {
        window.location.href = `/sequence/${sequence.objectId}/auto`;
    } else {
        window.location.href = `/sequence/${sequence.objectId}/man`;
    }
},

// Fermer le drawer
closeDrawer() {
    this.drawerOpen = false;
},
// État
sequences: [],
filteredSequences: [],
isLoading: false,
error: null,
searchTerm: '',
selectedType: '',
selectedStatus: '',

// Drawer state
drawerOpen: false,
editingSequence: false,
deleteConfirmOpen: false,
sequenceToDelete: null,
currentSequence: {
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
},

// Pagination
currentPage: 1,
itemsPerPage: 20,
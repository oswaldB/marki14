// Initialisation
init() {
    // Attendre un peu pour que parseAxios soit disponible
    setTimeout(() => {
        this.refreshData();
    }, 100);
},
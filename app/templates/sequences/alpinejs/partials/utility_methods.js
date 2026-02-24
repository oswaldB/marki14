// Formater une date
formatDate(dateObj) {
    if (!dateObj) return 'N/A';
    
    // Gérer le format de date Parse
    if (dateObj.iso) {
        return new Date(dateObj.iso).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    // Gérer les chaînes de caractères
    if (typeof dateObj === 'string') {
        return new Date(dateObj).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    // Gérer les objets Date
    if (dateObj instanceof Date) {
        return dateObj.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    return 'N/A';
},
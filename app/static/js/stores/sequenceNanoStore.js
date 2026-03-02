import { atom } from 'https://cdn.jsdelivr.net/npm/nanostores@0.9.5/+esm';

// Store pour la séquence avec la structure de Back4App
export const sequenceStore = atom({
    objectId: null,
    nom: '',
    description: '',
    isAuto: false,
    isActif: true,
    actions: [],
    createdAt: null
});

// Charger la séquence depuis l'URL
export async function loadSequenceFromUrl() {
    try {
        const pathParts = window.location.pathname.split('/');
        const sequenceId = pathParts[pathParts.length - 2];
        
        if (sequenceId) {
            // Utilisation de parseAxios
            const parseAxios = window.parseAxios;
            if (parseAxios) {
                const response = await parseAxios.get(`/classes/Sequences/${sequenceId}`);
                
                // Structurer les données selon le modèle Back4App
                const sequenceData = {
                    objectId: response.data.objectId || null,
                    nom: response.data.nom || '',
                    description: response.data.description || '',
                    isAuto: response.data.isAuto || false,
                    isActif: response.data.isActif || true,
                    actions: response.data.actions || [],
                    createdAt: response.data.createdAt || null
                };
                
                sequenceStore.set(sequenceData);
                console.log('Séquence chargée:', sequenceData);
                return sequenceData;
            } else {
                console.error('parseAxios non disponible');
                return null;
            }
        }
        return null;
    } catch (error) {
        console.error('Erreur lors du chargement de la séquence:', error);
        return null;
    }
}

// Exposer le module globalement pour Alpine.js
window.sequenceNanoStoreModule = {
    sequenceStore,
    loadSequenceFromUrl
};
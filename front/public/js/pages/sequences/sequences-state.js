// sequences-state.js
// Gestion du state pour la page des séquences

export function createState() {
  return {
    sequences: [],
    loading: true,
    error: null
  };
}
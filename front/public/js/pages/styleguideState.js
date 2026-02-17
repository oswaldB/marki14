/**
 * État Alpine.js pour la page Styleguide
 */

// Vérifier que le code s'exécute côté client uniquement
if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    Alpine.data('styleguideState', () => ({
      
      // État des galets animés
      isAnimating: true,
      pebbleCount: 8,
      
      // État du drawer
      openDrawer: false,
      
      // Méthodes
      toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        console.log('Animation des galets:', this.isAnimating ? 'activée' : 'désactivée');
      },
      
      // Cycle de vie
      init() {
        console.log('Composant Styleguide Alpine.js initialisé');
        console.log('Nombre de galets:', this.pebbleCount);
        console.log('Animation initiale:', this.isAnimating ? 'activée' : 'désactivée');
      }
    }));
  });
}
/**
 * État Alpine.js pour la page Styleguide
 */

// Vérifier que le code s'exécute côté client uniquement
if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    if (typeof Alpine !== 'undefined' && typeof Alpine.data === 'function') {
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
        
        // Vérifications supplémentaires
        if (typeof this.isAnimating === 'undefined') {
          this.isAnimating = true;
        }
        if (typeof this.pebbleCount === 'undefined') {
          this.pebbleCount = 8;
        }
        
        console.log('Nombre de galets:', this.pebbleCount);
        console.log('Animation initiale:', this.isAnimating ? 'activée' : 'désactivée');
      }
    }));
  } else {
    console.error('Alpine.js non disponible pour le styleguide');
  }
  });
}
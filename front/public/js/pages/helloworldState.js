/**
 * État Alpine.js pour la page Hello World
 */

// Vérifier que le code s'exécute côté client uniquement
if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    Alpine.data('helloworldState', () => ({
      
      // État du composant
      message: 'Hello World depuis Alpine.js!',
      count: 0,
      showMessage: true,
      
      // Méthodes
      increment() {
        this.count++;
      },
      
      decrement() {
        this.count--;
      },
      
      toggleMessage() {
        this.showMessage = !this.showMessage;
      },
      
      // Cycle de vie
      init() {
        console.log('Composant Hello World Alpine.js initialisé');
      }
    }));
  });
}
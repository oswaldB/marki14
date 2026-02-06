/**
 * État Alpine.js pour la page dashboard
 * Gère la récupération des produits depuis Parse et l'état du dashboard
 */

// Vérifier que le code s'exécute côté client uniquement
if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
  Alpine.data('dashboardState', () => ({
  
  // Tableaux pour les produits achetés et non achetés
  purchasedProducts: [],
  nonPurchasedProducts: [],
  
  error: null,
  
  /**
   * Initialisation du composant
   */
  init() {
    // Parse est déjà initialisé dans BaseLayout, pas besoin de le réinitialiser
    
    // Charger les produits depuis Parse
    this.loadProducts();
  },
  
  /**
   * Charge les produits depuis Parse
   */
  async loadProducts() {
    try {
      this.error = null;
      
      // Réinitialiser les tableaux
      this.purchasedProducts = [];
      this.nonPurchasedProducts = [];
      
      // Récupérer les produits depuis Parse
      const Products = Parse.Object.extend('Products');
      const query = new Parse.Query(Products);
      const results = await query.find();
      
      console.log('✅ Produits chargés depuis Parse:', results.length);
      
      // Mettre à jour le statut des produits
      results.forEach((product) => {
        const productId = product.id;
        const productStatus = product.get('status');
        const productName = product.get('name') || `Fonctionnalité ${productId}`;
        const productType = product.get('type') || 'subscription';
        const productLink = product.get('link') || `/feature${productId}`;
        const isPurchased = product.get('isPurchased') || false;
        
        console.log(`📦 Produit ${productId}: ${productName}, isPurchased: ${isPurchased}`);
        
        // Créer l'objet produit
        const productData = {
          id: productId,
          name: productName,
          status: productStatus,
          link: productLink,
          type: productType,
          isPurchased: isPurchased
        };
      
        
        // Ajouter au tableau approprié en fonction de isPurchased
        if (isPurchased) {
          this.purchasedProducts.push(productData);
          console.log(`✅ Ajouté à purchasedProducts: ${productName}`);
        } else {
          this.nonPurchasedProducts.push(productData);
          console.log(`🛒 Ajouté à nonPurchasedProducts: ${productName}`);
        }
      });
      
      // Logs de débogage pour vérifier les tableaux
      console.log('📊 Résumé des produits chargés:');
      console.log(`- Produits achetés: ${this.purchasedProducts.length}`);
      console.log(`- Produits non achetés: ${this.nonPurchasedProducts.length}`);


    } catch (error) {
      console.error('❌ Erreur lors de la récupération des produits:', error);
      this.error = 'Impossible de charger les produits. Veuillez rafraîchir la page.';
    }
  },
  
  /**
   * Retourne le statut d'un produit
   * @param {string} productId - ID du produit
   * @returns {string} Statut du produit
   */
  getProductStatus(productId) {
    const product = this.products.find(p => p.id === productId);
    return product ? product.status : 'inactive';
  }
}));
});
}
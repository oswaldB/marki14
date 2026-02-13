/**
 * État Alpine.js pour la page dashboard
 * Gère la récupération des produits depuis Parse REST et l'état du dashboard
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
    // Parse REST est déjà configuré dans BaseLayout, pas besoin de le reconfigurer
    
    // Charger les produits depuis Parse
    this.loadProducts();
  },
  
  /**
   * Charge les produits depuis Parse REST API
   */
  async loadProducts() {
    try {
      this.error = null;
      
      // Réinitialiser les tableaux
      this.purchasedProducts = [];
      this.nonPurchasedProducts = [];
      
      // Vérifier que Parse REST est disponible
      if (typeof window.ParseRest === 'undefined' || !window.PARSE_AUTH_CONFIG) {
        throw new Error('Parse REST non configuré');
      }
      
      // Récupérer le token de session
      const sessionToken = sessionStorage.getItem('parseSessionToken') || localStorage.getItem('parseSessionToken');
      
      if (!sessionToken) {
        throw new Error('Aucun token de session trouvé');
      }
      
      // Récupérer les produits depuis Parse REST API
      const response = await axios.get(`${window.PARSE_AUTH_CONFIG.serverUrl}/classes/Products`, {
        headers: {
          'X-Parse-Application-Id': window.PARSE_AUTH_CONFIG.appId,
          'X-Parse-REST-API-Key': window.PARSE_AUTH_CONFIG.restApiKey,
          'X-Parse-Session-Token': sessionToken
        }
      });
      
      const results = response.data.results;
      
      console.log('✅ Produits chargés depuis Parse REST:', results.length);
      
      // Mettre à jour le statut des produits
      results.forEach((product) => {
        const productId = product.objectId;
        const productStatus = product.status || 'inactive';
        const productName = product.name || `Fonctionnalité ${productId}`;
        const productType = product.type || 'subscription';
        const productLink = product.link || `/feature${productId}`;
        const isPurchased = product.isPurchased || false;
        
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
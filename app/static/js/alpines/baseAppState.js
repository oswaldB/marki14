// baseAppState.js - État pour l'application de base
document.addEventListener('alpine:init', () => {
  Alpine.data('baseAppState', () => ({
    // État initial pour l'application de base
    sidebarCollapsed: false,
    currentPage: window.location.pathname,
    currentUser: null,
    
    // Éléments de navigation pour la sidebar
    navItems: [
      { path: '/', icon: 'fa-regular fa-home', label: 'Tableau de bord', active: false },
      { path: '/impayes', icon: 'fa-regular fa-file-invoice-dollar', label: 'Impayés', active: false },
      { path: '/sequences', icon: 'fa-regular fa-list-check', label: 'Séquences', active: false },
      { path: '/relances', icon: 'fa-regular fa-paper-plane', label: 'Relances', active: false },
      { path: '/admin/superadmin', icon: 'fa-regular fa-crown', label: 'Admin', active: false },
      { path: '/settings/profil-smtp', icon: 'fa-regular fa-envelope', label: 'Emails', active: false }
    ],
    
    // Méthodes
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    
    navigateTo(path) {
      window.location.href = path;
      this.currentPage = path;
      
      // Mettre à jour l'état actif
      this.navItems.forEach(item => {
        item.active = path === item.path || 
                     (item.path !== '/' && path.startsWith(item.path));
      });
    },
    
    logout() {
      window.location.href = '/login';
    },
    
    init() {
      console.log('Base app state initialized');
      
      // Déterminer la page active au chargement
      this.navItems.forEach(item => {
        item.active = this.currentPage === item.path || 
                     (item.path !== '/' && this.currentPage.startsWith(item.path));
      });
      
      // Vérifier la taille de l'écran
      this.checkScreenSize();
      window.addEventListener('resize', () => this.checkScreenSize());
    },
    
    checkScreenSize() {
      if (window.innerWidth <= 768) {
        this.sidebarCollapsed = true;
      }
    }
  }))
});
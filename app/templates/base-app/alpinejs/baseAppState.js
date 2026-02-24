<script>
document.addEventListener('alpine:init', () => {
    Alpine.data('baseAppState', () => ({
        // La sidebar est maintenant toujours visible sur desktop (sm:)
        // et remplacée par un dock sur mobile
        // Plus besoin de gestion complexe de l'état
        logout() {
            // Logique de déconnexion à implémenter
            console.log('Déconnexion');
            window.location.href = '/login';
        }
    }));

    // Initialiser le store Alpine pour les notifications si ce n'est pas déjà fait
    if (!Alpine.store('notifications')) {
        Alpine.store('notifications', {
            notifications: [],
            
            addNotification(notification) {
                this.notifications.push({
                    id: Date.now(),
                    type: notification.type || 'info',
                    message: notification.message,
                    timeout: notification.timeout || 5000
                });
                
                // Supprimer automatiquement après le timeout
                setTimeout(() => {
                    this.removeNotification(notification.id);
                }, notification.timeout);
            },
            
            removeNotification(id) {
                this.notifications = this.notifications.filter(n => n.id !== id);
            }
        });
    }
});
</script>

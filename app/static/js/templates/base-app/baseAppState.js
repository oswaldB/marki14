document.addEventListener("alpine:init", () => {
    Alpine.data("baseAppState", () => ({
        sidebarOpen: false,

        init() {
            // Vérification de l'authentification au chargement
            this.checkAuthentication();

            // Gestion de la sidebar pour desktop
            this.sidebarOpen = window.innerWidth >= 640; // sm breakpoint

            // Écouteur pour le redimensionnement
            window.addEventListener("resize", () => {
                this.sidebarOpen = window.innerWidth >= 640;
            });
        },

        toggleSidebar() {
            this.sidebarOpen = !this.sidebarOpen;
        },

        checkAuthentication() {
            // Vérification du token dans localStorage ou sessionStorage
            const parseToken =
                localStorage.getItem("parseToken") ||
                sessionStorage.getItem("parseToken");
            const currentPath = window.location.pathname;

            if (!parseToken) {
                // Redirection vers la page de login avec le chemin actuel
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            } else {
                // Validation du token via Parse Server
                this.validateTokenWithParse(parseToken);
            }
        },

        async validateTokenWithParse(token) {
            try {
                // Utilisation de parseAxios pour valider le token
                const response = await Alpine.store("parseAxios").get(
                    "users/me",
                    {
                        headers: {
                            "X-Parse-Session-Token": token,
                        },
                    },
                );

                // Si la requête réussit, le token est valide
                console.log(
                    "Token valide, utilisateur authentifié:",
                    response.data,
                );
            } catch (error) {
                console.error("Token invalide, redirection vers login:", error);
                localStorage.removeItem("parseToken");
                sessionStorage.removeItem("parseToken");
                window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
            }
        },

        logout() {
            // Déconnexion - à appeler depuis les liens de déconnexion
            localStorage.removeItem("parseToken");
            sessionStorage.removeItem("parseToken");
            window.location.href = "/login";
        },
    }));
});

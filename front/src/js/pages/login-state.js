// Login state for Alpine.js
document.addEventListener("alpine:init", () => {
    Alpine.data("loginState", () => ({
        email: "",
        password: "",
        loading: false,
        error: null,

        async login() {
            this.loading = true;
            this.error = null;

            try {
                console.log("Tentative de connexion avec:", this.email);

                // Importation de l'instance Axios configurée
                const { default: parseAxios } = await import("/scripts/parseAxios.js");

                const response = await parseAxios.get("/login", {
                    params: {
                        username: this.email,
                        password: this.password,
                    },
                });

                console.log("Réponse de l'API:", response.data);

                if (response.data && response.data.sessionToken) {
                    // Redirection vers le tableau de bord
                    window.location.href = "/dashboard";
                } else {
                    this.error = "Identifiants invalides";
                }
            } catch (error) {
                console.error("Erreur de connexion:", error);
                this.error =
                    error.response?.data?.error ||
                    "Une erreur est survenue lors de la connexion";
            } finally {
                this.loading = false;
            }
        },
    }));
});

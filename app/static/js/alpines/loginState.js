// loginState.js - État pour la page de connexion
document.addEventListener("alpine:init", () => {
    Alpine.data("loginState", () => ({
        username: "",
        password: "",
        rememberMe: false,
        errorMessage: "",
        isLoading: false,

        async login() {
            this.isLoading = true;
            this.errorMessage = "";

            try {
                const response = await fetch("/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        username: this.username,
                        password: this.password,
                        "remember-me": this.rememberMe ? "on" : "",
                    }),
                });

                if (response.redirected) {
                    window.location.href = response.url;
                } else {
                    const text = await response.text();
                    if (text.includes("Identifiants invalides")) {
                        this.errorMessage = "Identifiants invalides";
                    } else {
                        this.errorMessage = "Erreur de connexion";
                    }
                }
            } catch (error) {
                this.errorMessage = "Erreur de connexion";
                console.error("Erreur de connexion:", error);
            } finally {
                this.isLoading = false;
            }
        },
    }));
});

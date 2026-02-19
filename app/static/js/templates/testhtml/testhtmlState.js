document.addEventListener("alpine:init", () => {
    Alpine.data("testHtmlState", () => ({
        // État initial
        scriptName: "helloworld",
        paramName: "",
        isLoading: false,
        responseStatus: null,
        responseMessage: null,
        responseData: null,
        error: null,

        /**
         * Appelle un script via l'API /script/
         * Utilise parseAxios comme requis par les règles du projet
         */
        callScript() {
            // Réinitialiser les erreurs
            this.error = null;
            this.responseStatus = null;
            this.responseMessage = null;
            this.responseData = null;
            this.isLoading = true;

            // Préparer les paramètres
            const params = {};
            if (this.paramName) {
                params.name = this.paramName;
            }

            // Appeler le script via parseAxios comme requis par les règles
            const parseAxios = Alpine.store("parseAxios");
            parseAxios
                .post(`/script/${this.scriptName}`, params)
                .then((response) => {
                    const data = response.data;
                    this.responseStatus = data.status;
                    this.responseMessage = data.message;
                    this.responseData = data.data;
                })
                .catch((error) => {
                    console.error("Erreur lors de l'appel du script:", error);

                    if (error.response) {
                        // Erreur avec réponse du serveur
                        const errorData = error.response.data;
                        this.responseStatus = errorData.status || "error";
                        this.responseMessage =
                            errorData.message || "Erreur inconnue";
                        this.error =
                            errorData.error_details || errorData.message;
                    } else if (error.request) {
                        // Erreur sans réponse
                        this.error =
                            "Pas de réponse du serveur. Vérifiez votre connexion.";
                    } else {
                        // Erreur de configuration
                        this.error = `Erreur: ${error.message}`;
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },

        /**
         * Réinitialise le formulaire
         */
        resetForm() {
            this.scriptName = "helloworld";
            this.paramName = "";
            this.responseStatus = null;
            this.responseMessage = null;
            this.responseData = null;
            this.error = null;
        },
    }));
});

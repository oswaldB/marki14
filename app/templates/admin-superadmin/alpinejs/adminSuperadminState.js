<script>
document.addEventListener("alpine:init", () => {
    Alpine.data("adminSuperadminState", () => ({
        // État initial
        isLoading: false,
        statusMessage: "",
        resultData: null,

        // Méthode pour lancer la synchronisation
        runSynchronization() {
            this.isLoading = true;
            this.statusMessage = "Synchronisation en cours...";
            this.resultData = null;

            const requestData = {
                filters: {},
                global_search: null,
            };

            // Utiliser flaskAxios pour les appels à l'API Flask
            Alpine.store("flaskAxios")
                .post("/script/populateImpayes", requestData)
                .then((response) => {
                    console.log("Response received:", response);
                    console.log("Response data:", response.data);

                    if (response.data.status === "success") {
                        this.statusMessage =
                            "Synchronisation terminée avec succès";
                        this.resultData = response.data;

                        // Afficher une notification de succès
                        if (Alpine.store("toaster")) {
                            Alpine.store("toaster").show({
                                type: "success",
                                title: "Succès",
                                message:
                                    "Synchronisation des impayés terminée avec succès",
                            });
                        }
                    } else {
                        this.statusMessage =
                            "Erreur lors de la synchronisation";

                        // Afficher une notification d'erreur
                        if (Alpine.store("toaster")) {
                            Alpine.store("toaster").show({
                                type: "error",
                                title: "Erreur",
                                message:
                                    response.data.message ||
                                    "Une erreur est survenue",
                            });
                        }
                    }
                })
                .catch((error) => {
                    this.statusMessage = "Erreur lors de la synchronisation";
                    console.error("Error:", error);
                    console.error("Error response:", error.response);
                    console.error("Error data:", error.response?.data);

                    // Afficher une notification d'erreur
                    if (Alpine.store("toaster")) {
                        Alpine.store("toaster").show({
                            type: "error",
                            title: "Erreur",
                            message: error.message || "Une erreur est survenue",
                        });
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
    }));
});
</script>

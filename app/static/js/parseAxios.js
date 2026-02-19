// parseAxios.js - Instance Axios configurée pour Parse Server
// Comme requis par checkcontrole.md: "Tous les appels à Parse en REST en utilisant axios.instance parseAxios"

document.addEventListener("alpine:init", () => {
    // Créer l'instance parseAxios avec configuration de base pour Parse Server
    const parseAxios = axios.create({
        baseURL: "https://dev.parse.markidiags.com/", // URL de base de Parse Server
        headers: {
            "X-Parse-Application-Id": "marki", // Application ID from docker-compose
            "X-Parse-REST-API-Key":
                "Careless7-Gore4-Guileless0-Jogger5-Clubbed9", // REST API Key
            "Content-Type": "application/json",
        },
    });

    // Ajouter parseAxios à l'objet global Alpine pour accès dans les composants
    Alpine.store("parseAxios", parseAxios);

    console.log(
        "parseAxios instance initialized and available in Alpine.store",
    );
});

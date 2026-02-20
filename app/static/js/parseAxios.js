// parseAxios.js - Instance Axios configurée pour Parse Server
// Comme requis par checkcontrole.md: "Tous les appels à Parse en REST en utilisant axios.instance parseAxios"

// Fonction pour initialiser parseAxios
function initializeParseAxios() {
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

    // Stocker dans window pour accès global
    window.parseAxios = parseAxios;

    // Si Alpine est déjà chargé, ajouter au store
    if (window.Alpine && window.Alpine.store) {
        window.Alpine.store("parseAxios", parseAxios);
    }

    console.log("parseAxios instance initialized and available in window.parseAxios");
}

// Initialiser immédiatement si le DOM est déjà chargé
if (document.readyState === "complete" || document.readyState === "interactive") {
    initializeParseAxios();
} else {
    // Sinon, attendre que le DOM soit chargé
    document.addEventListener("DOMContentLoaded", initializeParseAxios);
}

// Également initialiser quand Alpine est prêt
if (window.Alpine) {
    document.addEventListener("alpine:init", () => {
        if (!window.Alpine.store("parseAxios")) {
            window.Alpine.store("parseAxios", window.parseAxios);
        }
    });
}

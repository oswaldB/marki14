// parseAxios.js - Instance Axios configurée pour Parse Server
// Comme requis par checkcontrole.md: "Tous les appels à Parse en REST en utilisant axios.instance parseAxios"

// Fonction pour initialiser parseAxios
function initializeParseAxios() {
  // Détecter si on accède via localhost ou domaine
  const isLocalhost =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost";

  // Déterminer la baseURL pour Flask selon l'environnement
  const flaskBaseURL = isLocalhost
    ? "http://127.0.0.1:5000/"
    : "https://dev.markidiags.com/";

  // Créer l'instance parseAxios avec configuration de base pour Parse Server
  const parseAxios = axios.create({
    baseURL: "https://parse.markidiags.com/parse/", // URL de base de Parse Server
    headers: {
      "X-Parse-Application-Id": "adti", // Application ID from docker-compose
      "X-Parse-REST-API-Key": "Careless7-Gore4-Guileless0-Jogger5-Clubbed9", // REST API Key
      "Content-Type": "application/json",
    },
  });

  // Créer l'instance flaskAxios pour les appels à l'API Flask
  const flaskAxios = axios.create({
    baseURL: flaskBaseURL, // URL de base de Flask app adaptative
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Stocker dans window pour accès global
  window.parseAxios = parseAxios;
  window.flaskAxios = flaskAxios;

  // Stocker aussi dans une variable globale pour Alpine.js à utiliser plus tard
  window.__parseAxiosForAlpine = parseAxios;
  window.__flaskAxiosForAlpine = flaskAxios;

  console.log(
    "parseAxios and flaskAxios instances initialized and available in window.parseAxios and window.flaskAxios",
  );
  console.log(
    `Environment: ${isLocalhost ? "Localhost" : "Domain"}, Flask API URL: ${flaskBaseURL}`,
  );
}

// Initialiser immédiatement
initializeParseAxios();

// Fonction pour s'assurer que parseAxios est disponible dans Alpine.store
function ensureParseAxiosInAlpineStore() {
  // Vérifier si Alpine est disponible et si parseAxios est dans le store
  if (window.Alpine && window.Alpine.store) {
    if (!window.Alpine.store("parseAxios") && window.__parseAxiosForAlpine) {
      window.Alpine.store("parseAxios", window.__parseAxiosForAlpine);
      console.log("parseAxios added to Alpine.store");
    }
    if (!window.Alpine.store("flaskAxios") && window.__flaskAxiosForAlpine) {
      window.Alpine.store("flaskAxios", window.__flaskAxiosForAlpine);
      console.log("flaskAxios added to Alpine.store");
    }
  }
}

// Essayer d'ajouter à Alpine.store immédiatement si Alpine est déjà chargé
ensureParseAxiosInAlpineStore();

// Également essayer quand Alpine est prêt
if (window.Alpine) {
  document.addEventListener("alpine:init", ensureParseAxiosInAlpineStore);
} else {
  // Si Alpine n'est pas encore chargé, attendre qu'il le soit
  document.addEventListener("alpine:init", ensureParseAxiosInAlpineStore);
}

// Ajouter aussi un fallback pour DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ensureParseAxiosInAlpineStore);
} else {
  // DOM déjà chargé, essayer immédiatement
  ensureParseAxiosInAlpineStore();
}

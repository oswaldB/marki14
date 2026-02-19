const parseAxios = axios.create({
    baseURL: "https://dev.parse.markidiags.com",
    headers: {
        "X-Parse-Application-Id": "marki",
        "X-Parse-Javascript-Key": "Careless7-Gore4-Guileless0-Jogger5-Clubbed9",
        "Content-Type": "application/json",
    },
});
window.parseAxios = parseAxios;

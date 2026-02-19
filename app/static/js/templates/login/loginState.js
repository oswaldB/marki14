document.addEventListener('alpine:init', () => {
    Alpine.data('loginState', () => ({
        username: '',
        password: '',
        rememberMe: false,
        errorMessage: '',

        async login() {
            try {
                this.errorMessage = '';

                // Appel à Parse pour la connexion
                const response = await Alpine.store('parseAxios').post('login', {
                    username: this.username,
                    password: this.password
                });

                // Stockage du token selon le choix de l'utilisateur
                const storage = this.rememberMe ? localStorage : sessionStorage;
                storage.setItem('parseToken', response.data.sessionToken);
                storage.setItem('userId', response.data.objectId);

                // Récupération de l'URL de redirection
                const redirectUrl = new URL(window.location).searchParams.get('redirect') || '/dashboard';

                // Redirection
                window.location.href = redirectUrl;

            } catch (error) {
                console.error('Erreur de connexion:', error);
                this.errorMessage = 'Identifiant ou mot de passe incorrect';
                if (error.response && error.response.data && error.response.data.error) {
                    this.errorMessage = error.response.data.error;
                }
            }
        }
    }));
});
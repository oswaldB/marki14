# A vérifier après chaque développement.
- [] aucune classe CSS maison uniquement du tailwindcss
- [] la couleur principale est le sky-500
- [] aucun js vanille uniquement du alpinejs
- [] chaque fichier html a son equivalent en pageState.js dans /static/js/templates/.../nompage/nompageState.js
- [] tous les fichiers pageState.js commence par:
``` js
document.addEventListener('alpine:init', () => {
      Alpine.data('nomPageState', () => ({
      ...
      }))
})
```
- [] les fichiers  html appelle leur fichier state.js en bas de page.
```html
{% block scripts %}
<script src="{{ url_for('static', filename='js/templates/.../nompage/nompageState.js') }}"></script>
{% endblock %}
```
- [] aucun :key= authorisé
- [] Tous les appels à Parse en REST en utilisant axios.instance parseAxios en alpine.store. @app/static/js/parseAxios.js
- [] Pas d'utils, librairies ou de méthodes pour surcharger parseAxios.
- [] Pas d'appels à parse serveur en passant par les routes flask sauf pour lancer un script sur le blueprint /script/. L'appel à parse par **Alpinejs est la voie royale**.
- [] Toutes les icones sont en  lineIcons - couleur sky-900. L'icones doit exister dans le fichier /app/templates/icons-regular.html
- [] Aucune icone lucid ou svg.
- [] Toutes les icones sont dans le pack gratuit de lineIcons
- [] Toutes les routes sont bien définies dans app.py
- [] L'outil /home/oswald/Desktop/marki14/webconsole-checker/check_routes.js n'a retourné aucune erreur.
- [] Il existe un script par script dans le folder scripts/. 
- [] Le blueprint /script/ importe tous les scripts et gère les routes pour appeler les scripts. 
- [] Les scripts sont appelé par le front avec Axios.
- [] tous les fichiers html utilisent un base. Si pas d'authentification alors base.html si authentification obligatoire alors base-app.html.

Si une condition n'est pas remplie alors tu corriges.

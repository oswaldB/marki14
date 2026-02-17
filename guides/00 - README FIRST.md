# Guide des Bonnes Pratiques et Règles d'Or

Ce document introduit les différents guides disponibles et définit les règles d'or à suivre pour le développement dans ce projet.

## Introduction aux Guides

Les guides suivants sont disponibles dans ce répertoire :

- **[ALPINEJS-STATE-DEVELOPMENT.md](ALPINEJS-STATE-DEVELOPMENT.md)** : Guide pour le développement avec Alpine.js et la gestion d'état.
- **[CREATE-A-NEWPAGE.md](CREATE-A-NEWPAGE.md)** : Guide pour créer une nouvelle page dans le projet.
- **[FASTIFY_DEVELOPMENT_GUIDE.md](FASTIFY_DEVELOPMENT_GUIDE.md)** : Guide pour le développement avec Fastify.
- **[FASTIFY_VS_PARSE_GUIDE.md](FASTIFY_VS_PARSE_GUIDE.md)** : Comparaison entre Fastify et Parse.
- **[PARSE-AXIOS-REST.md](PARSE-AXIOS-REST.md)** : Guide pour utiliser Parse via Axios et REST.
- **[POLITIQUE-DE-TESTS.md](POLITIQUE-DE-TESTS.md)** : Politique concernant les tests.
- **[STYLEGUIDE.md](STYLEGUIDE.md)** : Guide de style pour le projet.

## Règles d'Or

### 1. Interdiction d'utiliser Parse Cloud

**Règle** : Il est strictement interdit d'utiliser Parse Cloud pour le développement backend. Utilisez uniquement Fastify ou des appels Parse REST axios.

**Justification** : Parse Cloud est interdit.

### 2. Utilisation de Parse REST via Axios

**Règle** : Si vous devez interagir avec Parse, utilisez uniquement l'API REST via Axios. L'utilisation du SDK JavaScript de Parse est strictement interdite.

**Justification** : L'API REST offre une meilleure transparence et un meilleur contrôle sur les requêtes. Axios est une bibliothèque robuste et largement adoptée pour les requêtes HTTP.

**Exemple** :
```javascript
import axios from 'axios';

const response = await axios.get('https://votre-serveur.parse.com/parse/classes/VotreClasse', {
  headers: {
    'X-Parse-Application-Id': 'VOTRE_APP_ID',
    'X-Parse-REST-API-Key': 'VOTRE_REST_API_KEY'
  }
});
```

### 8. Utilisation de Fastify

**Règle** : Fastify ne doit être utilisé que si Parse REST via Axios ne peut pas répondre aux besoins du projet. Privilégiez toujours Parse REST avant d'envisager Fastify.

**Justification** : Parse REST via Axios est la solution préférée pour sa simplicité et son intégration avec l'écosystème existant. Fastify doit être réservé aux cas où Parse REST ne suffit pas (par exemple, pour des fonctionnalités backend complexes ou des intégrations spécifiques).

**Exemple** :
```javascript
// Exemple d'utilisation de Fastify uniquement si Parse REST ne peut pas gérer la requête
fastify.get('/api/custom-endpoint', async (request, reply) => {
  console.log('Requête reçue sur un endpoint personnalisé non gérable par Parse REST');
  // Logique spécifique
  return { message: 'Réponse personnalisée' };
});
```
**Exemple** :
```javascript
// Exemple d'utilisation Parse REST api pour le login pas besoin de fastify.
```

### 3. Interdiction de construire des composants Astro

**Règle** : Il est interdit de créer des composants Astro (`*.astro` dans `src/components/`). Utilisez uniquement des pages Astro (`*.astro` dans `src/pages/`).

**Justification** : Les composants Astro peuvent introduire des complexités inutiles et des problèmes de maintenance. Les pages Astro sont suffisantes pour structurer l'application.

### 4. Utilisation exclusive des icônes Lucide

**Règle** : Utilisez uniquement les icônes de la bibliothèque Lucide. Aucune autre bibliothèque d'icônes n'est autorisée.

**Justification** : Lucide offre une collection cohérente et moderne d'icônes. L'utilisation d'une seule bibliothèque simplifie la maintenance et garantit une apparence uniforme.

**Exemple** :
```astro
import { Icon } from '@lucide/astro';

<Icon name="home" />
```

### 5. Interdiction du CSS personnalisé

**Règle** : Il est strictement interdit d'écrire du CSS personnalisé. Utilisez uniquement les classes utilitaires de Tailwind CSS.

**Justification** : Tailwind CSS offre une approche utilitaire qui simplifie le styling et garantit une cohérence visuelle. Le CSS personnalisé peut introduire des conflits et des problèmes de maintenance.

**Exemple** :
```html
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Bouton
</button>
```

### 6. Interdiction des tests

**Règle** : Aucun test n'est autorisé dans ce projet. Cela inclut les tests unitaires, les tests d'intégration, les tests end-to-end, etc.

**Justification** : Les tests peuvent ralentir le processus de développement et introduire des complexités supplémentaires. Concentrez-vous sur la qualité du code et des revues de code.

### 7. Journalisation des interactions Alpine.js

**Règle** : Chaque fonction et chaque interaction dans Alpine.js doit donner lieu à un `console.log` pour faciliter le débogage. Les logs doivent être explicites et inclure des informations contextuelles.

**Justification** : Les logs aident à comprendre le flux d'exécution et à diagnostiquer rapidement les problèmes. Des logs détaillés améliorent la maintenabilité et le débogage.

**Exemple** :
```javascript
function handleClick(event) {
  console.log('Bouton cliqué - ID:', event.target.id, '| Classe:', event.target.className);
  // Logique de la fonction
}

function fetchData(url) {
  console.log('Récupération des données depuis:', url);
  // Logique pour récupérer les données
}
```

## Conclusion

Ces règles d'or sont conçues pour garantir la cohérence, la maintenabilité et la simplicité du code. Veillez à les respecter dans tous vos développements.

Pour toute question ou clarification, consultez les guides spécifiques ou contactez l'équipe de développement.

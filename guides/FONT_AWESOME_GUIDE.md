# Guide d'utilisation de Font Awesome dans le projet

Font Awesome est utilisé dans ce projet pour les icônes. Il est inclus via CDN dans le layout de base.

## Configuration actuelle

Font Awesome est chargé dans `front/src/layouts/BaseLayout.astro` via CDN:

```astro
<!-- Dans le head de BaseLayout.astro -->
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
  integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
/>
```

## Règles Importantes

### Interdiction de Lucide et autres bibliothèques

⚠️ **ATTENTION** : L'utilisation de Lucide ou de toute autre bibliothèque d'icônes est **strictement interdite**. Seule Font Awesome est autorisée dans ce projet. Consultez [STYLEGUIDE.md](STYLEGUIDE.md) pour plus de détails sur cette règle.

## Comment utiliser Font Awesome

### 1. Utilisation basique dans les composants

Pour utiliser une icône Font Awesome dans vos composants Astro ou fichiers HTML:

```html
<i class="fas fa-icon-name"></i>
```

Exemple avec une icône de maison:
```html
<i class="fas fa-home"></i>
```

### 2. Styles disponibles

Font Awesome propose plusieurs styles d'icônes:

- **Solid** (fas): `fas fa-icon-name` - style par défaut
- **Regular** (far): `far fa-icon-name` - version plus légère
- **Brands** (fab): `fab fa-brand-name` - pour les logos de marques

Exemples:
```html
<i class="fas fa-star"></i>  <!-- Étoile pleine -->
<i class="far fa-star"></i>  <!-- Étoile vide -->
<i class="fab fa-github"></i> <!-- Logo GitHub -->
```

### 3. Taille des icônes

Vous pouvez contrôler la taille des icônes avec les classes utilitaires:

```html
<i class="fas fa-home fa-xs"></i>  <!-- Très petite -->
<i class="fas fa-home fa-sm"></i>  <!-- Petite -->
<i class="fas fa-home fa-lg"></i>  <!-- Grande -->
<i class="fas fa-home fa-2x"></i>  <!-- 2x -->
<i class="fas fa-home fa-3x"></i>  <!-- 3x -->
<!-- Jusqu'à fa-10x -->
```

### 4. Couleur des icônes

Utilisez les classes de couleur de Tailwind ou du CSS:

```html
<i class="fas fa-home text-blue-500"></i>
<i class="fas fa-home text-red-400"></i>
<i class="fas fa-home text-green-600"></i>
```

### 5. Animation et transformations

Font Awesome inclut des classes pour animer et transformer les icônes:

```html
<i class="fas fa-spinner fa-spin"></i>  <!-- Rotation -->
<i class="fas fa-home fa-rotate-90"></i>  <!-- Rotation de 90° -->
<i class="fas fa-home fa-rotate-180"></i> <!-- Rotation de 180° -->
<i class="fas fa-home fa-rotate-270"></i> <!-- Rotation de 270° -->
<i class="fas fa-home fa-flip-horizontal"></i> <!-- Retournement horizontal -->
<i class="fas fa-home fa-flip-vertical"></i> <!-- Retournement vertical -->
```

## Bonnes pratiques

1. **Performance**: Comme Font Awesome est chargé via CDN, assurez-vous que votre connexion internet est disponible pour le développement local.

2. **Accessibilité**: Ajoutez toujours un texte alternatif pour les lecteurs d'écran:
   ```html
   <i class="fas fa-home" aria-hidden="true"></i>
   <span class="sr-only">Accueil</span>
   ```

3. **Consistance**: Essayez d'utiliser le même style (solid, regular) pour des icônes similaires dans la même vue.

4. **Documentation**: Consultez la [documentation officielle de Font Awesome](https://fontawesome.com/icons) pour trouver des icônes spécifiques.

## Recherche d'icônes

Pour trouver des icônes:
1. Visitez [https://fontawesome.com/icons](https://fontawesome.com/icons)
2. Utilisez la barre de recherche pour trouver l'icône souhaitée
3. Cliquez sur l'icône pour voir son nom et ses styles disponibles
4. Copiez le code HTML correspondant au style souhaité

## Exemple complet

```html
<button class="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2">
  <i class="fas fa-download fa-lg"></i>
  <span>Télécharger</span>
</button>
```

## Mise à jour de la version

Si vous devez mettre à jour la version de Font Awesome:

1. Visitez [https://fontawesome.com](https://fontawesome.com) pour trouver la dernière version stable
2. Mettez à jour l'URL dans `BaseLayout.astro`
3. Mettez à jour l'intégrité (integrity hash) - vous pouvez le générer sur [https://www.srihash.org](https://www.srihash.org)

## Dépannage

Si les icônes ne s'affichent pas:
1. Vérifiez que l'URL CDN est correcte dans BaseLayout.astro
2. Assurez-vous que votre connexion internet fonctionne
3. Vérifiez dans les outils de développement du navigateur que le fichier CSS est bien chargé
4. Confirmez que les noms de classes sont corrects (fas/far/fab + fa-icon-name)

# Vérification du Problème du Drawer des Séquences

## Problème Identifié

Le drawer des séquences n'affiche pas les séquences disponibles. Après analyse, le problème vient probablement du store qui ne fait pas correctement l'appel à Parse pour récupérer les séquences.

## Corrections Apportées

### 1. Correction du nom de la classe Parse

Le store utilisait initialement `sequences` (minuscule) mais la classe Parse s'appelle bien `Sequences` (avec un S majuscule). Cette correction a été appliquée dans `public/js/pages/sequencesState.js`.

### 2. Ajout de vérifications de Parse

J'ai ajouté des vérifications pour s'assurer que :
- Parse est disponible globalement
- Parse est bien initialisé avec les bonnes credentials
- La configuration est correcte avant d'effectuer des requêtes

### 3. Ajout de logs de débogage

Des logs ont été ajoutés pour suivre :
- L'initialisation de Parse
- Le chargement des séquences
- Le nombre de séquences trouvées
- Les erreurs éventuelles

## Comment Vérifier avec les DevTools

### Étapes pour diagnostiquer le problème :

1. **Ouvrir les DevTools** :
   - Appuyez sur `F12` ou `Ctrl+Shift+I` (Windows/Linux) ou `Cmd+Opt+I` (Mac)
   - Allez dans l'onglet "Console"

2. **Vérifier que Parse est disponible** :
   ```javascript
   console.log('Parse disponible:', typeof Parse !== 'undefined');
   console.log('Parse applicationId:', Parse.applicationId);
   console.log('Parse serverURL:', Parse.serverURL);
   ```

3. **Tester une requête manuelle** :
   ```javascript
   const testQuery = new Parse.Query('Sequences');
   testQuery.ascending('nom');
   testQuery.limit(10);
   testQuery.find()
     .then(results => {
       console.log('Séquences trouvées:', results.length);
       results.forEach(seq => {
         console.log('-', seq.get('nom'), '(ID:', seq.id, ')');
       });
     })
     .catch(error => {
       console.error('Erreur lors de la requête:', error);
     });
   ```

4. **Vérifier les erreurs courantes** :
   - **Erreur 1** : `Parse is not defined` → Parse SDK non chargé
   - **Erreur 2** : `Invalid class name` → La classe `Sequences` n'existe pas dans Parse
   - **Erreur 3** : `Uncaught ReferenceError: Parse is not defined` → Parse n'est pas disponible globalement
   - **Erreur 4** : `NetworkError` → Problème de connexion au serveur Parse

### Erreurs possibles et solutions :

#### 1. Parse non initialisé
**Symptôme** : `Parse.applicationId` est `undefined`

**Solution** :
- Vérifier que la configuration Parse est chargée avant l'initialisation
- S'assurer que `window.parseConfig` contient les bonnes valeurs

#### 2. Classe Sequences non trouvée
**Symptôme** : Erreur "Invalid class name: Sequences"

**Solution** :
- Vérifier que la classe existe dans Parse Server
- Créer la classe si nécessaire via l'interface d'administration Parse
- S'assurer que le nom est exactement "Sequences" (avec S majuscule)

#### 3. Problème de CORS
**Symptôme** : Erreurs CORS dans la console

**Solution** :
- Vérifier la configuration CORS du serveur Parse
- S'assurer que le domaine est autorisé

#### 4. Problème d'authentification
**Symptôme** : Erreur 401 ou "Unauthorized"

**Solution** :
- Vérifier que les clés Parse sont correctes
- S'assurer que l'application Parse est bien configurée

## Test avec le fichier HTML

Un fichier de test a été créé : `test_sequences_store.html`

Pour l'utiliser :
1. Placez le fichier dans le répertoire racine du projet
2. Ouvrez-le dans un navigateur : `http://localhost:3000/test_sequences_store.html`
3. Cliquez sur "Charger les séquences"
4. Observez les logs dans la console intégrée

## Vérification du Store dans l'Application

### Dans la page sequences.astro :

1. Ouvrez la page `/sequences`
2. Ouvrez les DevTools
3. Allez dans l'onglet "Console"
4. Vérifiez les messages de log :
   - "Parse initialisé avec: ..."
   - "Chargement des séquences depuis Parse..."
   - "Trouvé X séquences"

### Si aucune séquence n'apparaît :

1. Vérifiez que `this.sequences` est bien un tableau vide
2. Vérifiez les erreurs dans la console
3. Testez une requête manuelle comme montré ci-dessus

## Solution Complète

Si le problème persiste après ces vérifications, voici les étapes à suivre :

1. **Vérifier la base de données Parse** :
   - Allez dans l'interface d'administration Parse
   - Vérifiez que la classe `Sequences` existe
   - Vérifiez qu'elle contient des enregistrements

2. **Créer une séquence de test** :
   ```javascript
   const Sequences = Parse.Object.extend('Sequences');
   const testSequence = new Sequences();
   testSequence.set('nom', 'Test Sequence');
   testSequence.set('description', 'Séquence de test');
   testSequence.set('isActif', false);
   testSequence.set('actions', []);
   testSequence.save().then(result => {
     console.log('Séquence créée:', result.id);
   });
   ```

3. **Vérifier les permissions** :
   - Dans l'interface Parse, vérifiez les permissions CLP (Class Level Permissions)
   - Assurez-vous que les permissions de lecture sont activées pour le rôle approprié

4. **Tester avec un utilisateur connecté** :
   - Vérifiez que l'utilisateur est bien connecté
   - Testez avec `Parse.User.current()`

## Résumé des Corrections

✅ **Correction 1** : Utilisation du bon nom de classe (`Sequences` au lieu de `sequences`)
✅ **Correction 2** : Ajout de vérifications de Parse avant les requêtes
✅ **Correction 3** : Ajout de logs de débogage pour le suivi
✅ **Correction 4** : Création d'un fichier de test pour diagnostiquer le problème

Le store devrait maintenant fonctionner correctement et afficher les séquences disponibles dans le drawer.
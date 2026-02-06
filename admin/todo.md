# Fonction populateRelanceSequence - COMPLETÉE ✓

La fonction cloud `populateRelanceSequence(idSequence)` a été implémentée avec succès.

## Ce qui a été fait :

✓ **Création de la fonction principale** (`parse-server/cloud/populateRelanceSequence.js`)
- Récupère tous les impayés qui ont la colonne `sequence` (pointer) sur l'id de la séquence
- Pour chaque impayé, cherche toutes les relances qui ont dans la colonne `impaye` la valeur de l'impayé
- Si aucune relance n'existe (ou si seules des relances non envoyées existent) :
  - Supprime toutes les relances non envoyées (`is_sent = false`)
  - Remplace les valeurs `[[champ]]` dans les messages d'actions avec les données réelles de l'impayé
  - Crée une nouvelle relance dans la classe `Relances` avec toutes les informations nécessaires
- Si des relances envoyées existent, elles sont conservées

✓ **Création des classes nécessaires** (`parse-server/cloud/createRelanceClasses.js`)
- Fonction `createRelanceClasses` pour créer les classes `Relance` et `Relances` si elles n'existent pas
- Les classes doivent être créées manuellement avant d'utiliser la fonction principale

✓ **Documentation complète** (`parse-server/cloud/README_RELANCE_SEQUENCE.md`)
- Documentation détaillée de l'utilisation
- Exemples complets
- Liste des placeholders supportés
- Structure des classes

✓ **Intégration dans le système**
- Les fonctions sont importées dans `main.js`
- Prêtes à être utilisées via Parse Cloud Code

## Comment utiliser :

1. **Créer les classes nécessaires** (une seule fois) :
   ```javascript
   await Parse.Cloud.run('createRelanceClasses');
   ```

2. **Fonctionnement automatique** :
   - La fonction est **appelée automatiquement** lorsqu'une séquence est activée
   - Aucun appel manuel nécessaire dans la plupart des cas

3. **Appel manuel** (si nécessaire) :
   ```javascript
   const result = await Parse.Cloud.run('populateRelanceSequence', {
     idSequence: 'VOTRE_ID_DE_SEQUENCE'
   });
   ```

## Fichiers créés/modifiés :

- `parse-server/cloud/populateRelanceSequence.js` - Fonction de création des relances (activation)
- `parse-server/cloud/cleanupRelancesOnDeactivate.js` - Fonction de nettoyage des relances (désactivation)
- `parse-server/cloud/handleManualSequenceAssignment.js` - Fonction d'association manuelle
- `parse-server/cloud/createRelanceClasses.js` - Création des classes
- `parse-server/cloud/sequenceTriggers.js` - Triggers pour tous les événements
- `parse-server/cloud/README_RELANCE_SEQUENCE.md` - Documentation complète
- `parse-server/cloud/main.js` - Intégration de toutes les fonctions

## Placeholders supportés :

- `[[nfacture]]`, `[[datepiece]]`, `[[totalttcnet]]`, `[[resteapayer]]`
- `[[payeur_nom]]`, `[[payeur_email]]`, `[[payeur_telephone]]`
- `[[proprietaire_nom]]`, `[[proprietaire_email]]`, `[[proprietaire_telephone]]`
- Et aussi le format `{{impaye.champ}}` pour les mêmes champs

## Fonctionnement complet

Le système est maintenant **complètement automatisé** dans les trois scénarios :

### 1. Activation d'une séquence

1. **Création des classes** : Appeler `createRelanceClasses` une fois
2. **Création d'une séquence** : Avec des actions contenant des placeholders
3. **Assignation à des impayés** : Mettre à jour les impayés avec la séquence
4. **Activation de la séquence** : Mettre `isActif` à `true`
5. **Déclenchement automatique** : La fonction `populateRelanceSequence` est appelée
6. **Création des relances** : Les emails sont prêts à être envoyés

### 2. Désactivation d'une séquence

1. **Désactivation de la séquence** : Mettre `isActif` à `false`
2. **Déclenchement automatique** : La fonction `cleanupRelancesOnDeactivate` est appelée
3. **Nettoyage des relances** : Suppression des relances non envoyées
4. **Conservation de l'historique** : Les relances déjà envoyées sont conservées

### 3. Association manuelle d'une séquence à un impayé

1. **Depuis l'interface** : L'utilisateur associe une séquence à un impayé
2. **Déclenchement automatique** : Le trigger détecte le changement
3. **Appel de handleManualSequenceAssignment** : Création des relances si la séquence est active
4. **Comportement intelligent** :
   - Si séquence active → Crée les relances immédiatement
   - Si séquence inactive → Associe mais ne crée pas de relances
   - Si relances existantes non envoyées → Les supprime avant d'en créer
   - Si relances existantes envoyées → Les conserve

## Exemple complet avec tous les scénarios

```javascript
// 1. Créer les classes (une seule fois)
await Parse.Cloud.run('createRelanceClasses');

// 2. Créer une séquence (désactivée initialement)
const Sequence = Parse.Object.extend('sequences');
const sequence = new Sequence();
sequence.set('nom', 'Relance mensuelle');
sequence.set('isActif', false); // Désactivée au début
sequence.set('actions', [{
  type: 'email',
  emailSubject: 'Relance : Facture [[nfacture]] - [[totalttcnet]]',
  emailBody: 'Bonjour [[payeur_nom]],\n\nVotre facture n°[[nfacture]]...',
  emailTo: '[[payeur_email]]',
  senderEmail: 'comptabilite@marki.com'
}]);
await sequence.save();

// 3. Assigner à des impayés (déclenche handleManualSequenceAssignment)
const Impaye = Parse.Object.extend('Impayes');
const query = new Parse.Query(Impaye);
query.equalTo('facturesoldee', false);
const impayes = await query.find();

for (const impaye of impayes) {
  impaye.set('sequence', sequence);
  await impaye.save();
  // → Le trigger détecte l'association et appelle handleManualSequenceAssignment
  // → Comme la séquence est inactive, aucune relance n'est créée
}

// 4. Activer la séquence → Déclenche automatiquement populateRelanceSequence
sequence.set('isActif', true);
await sequence.save();
// → Les relances sont créées automatiquement pour tous les impayés

// 5. Association manuelle d'un nouvel impayé (séquence active)
const newImpaye = impayes[0]; // Un nouvel impayé
newImpaye.set('sequence', sequence);
await newImpaye.save();
// → Le trigger détecte l'association et appelle handleManualSequenceAssignment
// → Comme la séquence est active, une relance est créée immédiatement

// 6. Désactiver la séquence → Déclenche automatiquement cleanupRelancesOnDeactivate
sequence.set('isActif', false);
await sequence.save();
// → Les relances non envoyées sont supprimées automatiquement
```

## Système complet implémenté

Le système répond maintenant parfaitement aux exigences :

✅ **Activation d'une séquence** → Crée automatiquement les relances
✅ **Désactivation d'une séquence** → Supprime automatiquement les relances non envoyées
✅ **Conservation de l'historique** → Les relances envoyées sont toujours conservées
✅ **Gestion des erreurs** → Les erreurs sont loguées sans bloquer les opérations
✅ **Documentation complète** → Guide d'utilisation et exemples fournis

Le système est prêt pour les tests et la production !
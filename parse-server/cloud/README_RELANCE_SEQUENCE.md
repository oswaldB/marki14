# Fonction populateRelanceSequence

Ce module implémente la fonction cloud `populateRelanceSequence` qui permet de peupler automatiquement les relances pour une séquence donnée.

## Fonctionnalités

La fonction `populateRelanceSequence` fait les choses suivantes :

1. **Récupère tous les impayés** qui ont la colonne `sequence` (pointer) sur l'ID de la séquence spécifiée.
2. **Pour chaque impayé**, elle cherche toutes les relances qui ont dans la colonne `impaye` la valeur de l'impayé.
3. **Si aucune relance n'existe** (ou si seules des relances non envoyées existent) :
   - Elle supprime toutes les relances non envoyées (`is_sent = false`)
   - Elle remplace les valeurs `[[champ]]` dans les messages d'actions avec les données de l'impayé
   - Elle crée une nouvelle relance dans la classe `Relances` avec toutes les informations nécessaires pour envoyer l'email
4. **Si des relances envoyées existent**, elles sont conservées et aucune nouvelle relance n'est créée.

## Prérequis

Avant d'utiliser la fonction `populateRelanceSequence`, vous devez vous assurer que les classes suivantes existent :

- `Relance` : Classe pour stocker les relances individuelles
- `Relances` : Classe pour stocker les emails de relance prêts à être envoyés

### Création des classes

Vous pouvez créer ces classes manuellement en utilisant la fonction cloud `createRelanceClasses` :

```javascript
// Appeler cette fonction une fois pour créer les classes nécessaires
Parse.Cloud.run('createRelanceClasses');
```

Ou vous pouvez les créer manuellement via l'interface d'administration de Parse.

## Structure des classes

### Classe Relance

- `type` (String, requis) : Type de relance (ex: "email", "sms")
- `message` (String, requis) : Contenu du message
- `date` (Date, requis) : Date de création
- `isSent` (Boolean) : Indique si la relance a été envoyée
- `impaye` (Pointer vers Impayes) : Référence à l'impayé concerné
- `sequence` (Pointer vers sequences) : Référence à la séquence

### Classe Relances

- `email_sender` (String) : Adresse email de l'expéditeur
- `email_subject` (String) : Sujet de l'email
- `email_body` (String) : Corps de l'email
- `email_to` (String) : Destinataire principal
- `email_cc` (String) : Destinataires en copie carbone
- `send_date` (Date) : Date d'envoi prévue
- `is_sent` (Boolean) : Indique si l'email a été envoyé
- `relance` (Pointer vers Relance) : Référence à la relance associée
- `impaye` (Pointer vers Impayes) : Référence à l'impayé concerné
- `sequence` (Pointer vers sequences) : Référence à la séquence

## Utilisation

### Appel manuel de la fonction

```javascript
// Appeler la fonction avec l'ID de la séquence
const result = await Parse.Cloud.run('populateRelanceSequence', {
  idSequence: 'VOTRE_ID_DE_SEQUENCE'
});

console.log(result);
// Exemple de réponse:
// {
//   success: true,
//   message: 'Relances peuplées avec succès',
//   processed: 5,      // Nombre d'impayés traités
//   created: 3,       // Nombre de nouvelles relances créées
//   updated: 2        // Nombre de relances existantes conservées
// }
```

### Format des actions dans les séquences

Les séquences doivent avoir un champ `actions` qui est un tableau d'objets. Chaque objet représente une action de relance et doit contenir au moins les champs suivants :

```javascript
{
  type: 'email',                    // Type d'action (email, sms, etc.)
  emailSubject: 'Relance pour [[nfacture]]',  // Sujet avec placeholders
  emailBody: 'Bonjour [[payeur_nom]], ...',   // Corps avec placeholders
  emailTo: '[[payeur_email]]',      // Destinataire avec placeholders
  emailCc: '',                      // Copie carbone (optionnel)
  senderEmail: 'noreply@marki.com' // Email de l'expéditeur
}
```

### Placeholders supportés

La fonction supporte les placeholders dans les formats `[[champ]]` et `{{impaye.champ}}` :

- `[[nfacture]]` ou `{{impaye.nfacture}}` : Numéro de facture
- `[[datepiece]]` ou `{{impaye.datepiece}}` : Date de la facture
- `[[totalttcnet]]` ou `{{impaye.totalttcnet}}` : Montant total TTC
- `[[resteapayer]]` ou `{{impaye.resteapayer}}` : Montant restant à payer
- `[[payeur_nom]]` ou `{{impaye.payeur_nom}}` : Nom du payeur
- `[[payeur_email]]` ou `{{impaye.payeur_email}}` : Email du payeur
- `[[payeur_telephone]]` ou `{{impaye.payeur_telephone}}` : Téléphone du payeur
- `[[proprietaire_nom]]` ou `{{impaye.proprietaire_nom}}` : Nom du propriétaire
- `[[proprietaire_email]]` ou `{{impaye.proprietaire_email}}` : Email du propriétaire
- `[[proprietaire_telephone]]` ou `{{impaye.proprietaire_telephone}}` : Téléphone du propriétaire

## Exemple complet

1. **Créer les classes** (si elles n'existent pas) :
   ```javascript
   await Parse.Cloud.run('createRelanceClasses');
   ```

2. **Créer une séquence** avec des actions :
   ```javascript
   const Sequence = Parse.Object.extend('sequences');
   const sequence = new Sequence();
   sequence.set('nom', 'Relance automatique');
   sequence.set('description', 'Séquence de relance pour factures impayées');
   sequence.set('isActif', true);
   sequence.set('actions', [
     {
       type: 'email',
       emailSubject: 'Relance : Facture [[nfacture]] - [[totalttcnet]]',
       emailBody: 'Bonjour [[payeur_nom]],\n\nNous vous rappelons que votre facture n°[[nfacture]] du [[datepiece]] d\'un montant de [[totalttcnet]] n\'a pas encore été réglée.\n\nMerci de procéder au paiement du montant restant de [[resteapayer]].\n\nCordialement,'
       emailTo: '[[payeur_email]]',
       emailCc: '',
       senderEmail: 'comptabilite@marki.com'
     }
   ]);
   await sequence.save();
   ```

3. **Assigner la séquence à des impayés** :
   ```javascript
   const Impaye = Parse.Object.extend('Impayes');
   const query = new Parse.Query(Impaye);
   query.equalTo('facturesoldee', false);
   const impayes = await query.find();
   
   for (const impaye of impayes) {
     impaye.set('sequence', sequence);
     await impaye.save();
   }
   ```

4. **Exécuter la fonction de peuplement** :
   ```javascript
   const result = await Parse.Cloud.run('populateRelanceSequence', {
     idSequence: sequence.id
   });
   
   console.log(`Relances créées: ${result.created}`);
   ```

## Fonctionnement automatique

Le système utilise des triggers `afterSave` sur la classe `sequences` pour gérer automatiquement la création et le nettoyage des relances.

### Déclenchement automatique

1. **Lorsqu'une séquence est activée** (`isActif` passe de `false` à `true`) :
   - Le trigger détecte le changement
   - Appelle automatiquement `populateRelanceSequence` avec l'ID de la séquence
   - Crée les relances pour tous les impayés associés
   - Seules les relances non envoyées sont créées (les relances déjà envoyées sont conservées)

2. **Lors de la création d'une nouvelle séquence** :
   - Le trigger ne fait rien (attend que la séquence soit activée manuellement)
   - Permet de configurer complètement la séquence avant de l'activer

3. **Lors de la désactivation d'une séquence** (`isActif` passe de `true` à `false`) :
   - Le trigger détecte le changement
   - Appelle automatiquement `cleanupRelancesOnDeactivate` avec l'ID de la séquence
   - **Supprime toutes les relances non envoyées** (`is_sent = false`) pour les impayés associés
   - **Conserve les relances déjà envoyées** (`is_sent = true`) pour garder un historique
   - Empêche l'envoi de relances pour une séquence inactive

### Appel manuel

Vous pouvez toujours appeler la fonction manuellement si nécessaire :

```javascript
// Forcer le peuplement des relances pour une séquence
const result = await Parse.Cloud.run('populateRelanceSequence', {
  idSequence: 'VOTRE_ID_DE_SEQUENCE'
});
```

## Fonction handleManualSequenceAssignment

Cette fonction est appelée automatiquement lorsqu'un utilisateur associe manuellement une séquence à un impayé depuis l'interface.

### Fonctionnalités

- Détecte les changements de séquence sur les impayés via un trigger `afterSave`
- Crée automatiquement les relances pour l'impayé associé
- Vérifie que la séquence est active avant de créer les relances
- Supprime les relances non envoyées existantes
- Remplace les placeholders `[[champ]]` dans les messages
- Crée les objets Relance et Relances avec toutes les informations nécessaires

### Déclenchement automatique

Le trigger `afterSave` sur la classe `Impayes` détecte lorsque :

1. Un impayé existant est mis à jour
2. La propriété `sequence` est modifiée ou ajoutée
3. Une nouvelle séquence est associée à l'impayé

### Comportement

- **Si la séquence est active** : Crée immédiatement les relances
- **Si la séquence est inactive** : Associe la séquence mais ne crée pas de relances
- **Si des relances existantes non envoyées** : Les supprime avant d'en créer de nouvelles
- **Si des relances existantes envoyées** : Les conserve pour l'historique

### Appel manuel

```javascript
// Associer manuellement une séquence à un impayé
const result = await Parse.Cloud.run('handleManualSequenceAssignment', {
  impayeId: 'ID_DE_L_IMPAYE',
  sequenceId: 'ID_DE_LA_SEQUENCE'
});

console.log(result);
// Exemple de réponse:
// {
//   success: true,
//   message: 'Relance créée avec succès',
//   impayeId: 'abc123',
//   sequenceId: 'def456',
//   relanceId: 'ghi789',
//   relancesCreated: 1
// }
```

## Fonction cleanupRelancesOnDeactivate

Cette fonction est appelée automatiquement lors de la désactivation d'une séquence pour nettoyer les relances non envoyées.

### Fonctionnalités

- Supprime **uniquement** les relances non envoyées (`is_sent = false`)
- Conserve les relances déjà envoyées (`is_sent = true`) pour l'historique
- Traite tous les impayés associés à la séquence
- Retourne des statistiques sur les opérations effectuées

### Appel manuel

```javascript
// Nettoyer manuellement les relances pour une séquence
const result = await Parse.Cloud.run('cleanupRelancesOnDeactivate', {
  idSequence: 'VOTRE_ID_DE_SEQUENCE'
});

console.log(result);
// Exemple de réponse:
// {
//   success: true,
//   message: 'Nettoyage des relances terminé avec succès',
//   deleted: 15,    // Nombre de relances non envoyées supprimées
//   kept: 8        // Nombre de relances envoyées conservées
// }
```

## Gestion des erreurs

### populateRelanceSequence

- **Appel manuel** :
  - `idSequence manquant` : Si le paramètre idSequence n'est pas fourni
  - `Séquence non trouvée` : Si aucune séquence avec l'ID spécifié n'existe
  - `Aucune action dans la séquence` : Si la séquence ne contient aucune action
  - `Classe Relance ou Relances non trouvée` : Si les classes nécessaires n'existent pas

### cleanupRelancesOnDeactivate

- **Appel manuel** :
  - `idSequence manquant` : Si le paramètre idSequence n'est pas fourni
  - `Séquence non trouvée` : Si aucune séquence avec l'ID spécifié n'existe
  - `Aucun impayé trouvé` : Si aucun impayé n'est associé à la séquence

### Appel automatique (trigger)

- Les erreurs sont loguées mais n'empêchent pas la sauvegarde de la séquence
- Permet de corriger les problèmes et de relancer manuellement si nécessaire
- Les deux fonctions (activation et désactivation) sont protégées contre les échecs

## Journalisation

La fonction journalise les opérations suivantes dans la console :

- Début et fin du traitement
- Nombre d'impayés traités
- Création/suppression de relances
- Erreurs rencontrées

## Notes techniques

- La fonction utilise uniquement la **première action** de la séquence pour créer les relances
- Les relances **non envoyées** (`is_sent = false`) sont **supprimées** avant la création de nouvelles relances
- Les relances **déjà envoyées** (`is_sent = true`) sont **conservées**
- Les placeholders sont remplacés par les valeurs réelles des champs de l'impayé
- Les dates sont formatées au format français (JJ/MM/AAAA)
- Les montants sont formatés en euros avec 2 décimales
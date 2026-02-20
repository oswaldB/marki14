- **preparation**: 
   - [x] lancer le script: getParseData.sh et ensuite lire le fichier data-model.md.
   - [x] lire le contenu du dossier guides/. Tous les fichiers.
- **action  à faire en RESPECTANT les guides** : # **Gestion des Relances Automatiques - US3.2 Interface de Configuration**

## **Description Gherkin**

### **Scénario Principal : Création d'une nouvelle séquence de relance**
```
Scénario : Création complète d'une séquence de relance automatique
  Étant donné que je suis connecté en tant qu'admin sur "/admin/configurations"
  Quand je clique sur "Nouvelle Séquence"
  Et que je saisis les informations suivantes :
    | Champ               | Valeur                          |
    | Nom                 | Relance Standard                |
    | Description         | Séquence de relance automatique |
    | Type                | Automatique                     |
    | Statut              | Activé                          |
    | Actions             | 3 actions de relance             |
  Et que je configure les actions :
    | Action 1            | Email - Délai 1 jour            |
    | Action 2            | Email - Délai 3 jours           |
    | Action 3            | Email - Délai 7 jours           |
  Et que je clique sur "Enregistrer"
  Alors :
    1. Un nouvel objet est créé dans la classe "Sequences" avec :
       - nom: "Relance Standard"
       - description: "Séquence de relance automatique"
       - isAuto: true
       - isActif: true
       - actions: [array des 3 actions]
    2. La séquence est ajoutée à la liste des séquences actives
    3. Un message "Séquence enregistrée avec succès" s'affiche
    4. Je suis redirigé vers la liste des séquences
```

### **Scénario de Test**
```
Scénario : Test d'une séquence existante
  Étant donné que je suis sur la page de gestion des séquences
  Et que la séquence "Relance Standard" existe
  Quand je sélectionne cette séquence
  Et que je clique sur "Tester"
  Alors le système :
    1. Récupère la séquence depuis Parse
    2. Exécute un test avec des données factices
    3. Affiche un échantillon des résultats avec :
       | Action | Délai | Type   | Statut    |
       | 1      | 1 jour| Email  | Prêt      |
       | 2      | 3 jours| Email  | Prêt      |
       | 3      | 7 jours| Email  | Prêt      |
    4. Affiche un message "Séquence valide - 3 actions configurées"
```

### **Scénario d'Erreur**
```
Scénario : Tentative d'enregistrement avec des actions invalides
  Étant donné que je saisis une séquence sans actions
  Quand je clique sur "Enregistrer"
  Alors :
    1. Un message "La séquence doit contenir au moins une action" s'affiche
    2. La séquence n'est pas enregistrée
    3. Un log d'erreur est créé dans la classe "SyncLogs" avec :
       - status: "error"
       - details: "Séquence sans actions"
       - configId: null
```

## **Écrans ASCII**

### **1. Liste des Séquences**
```
+-------------------------------------------------------------+
| GESTION DES SÉQUENCES DE RELANCE                           |
|                                                             |
| [Nouvelle Séquence] [Rafraîchir] [Exporter]                 |
|                                                             |
| +----------------+------------+----------+---------+--------+
| | Nom            | Type       | Statut   | Actions |        |
| +----------------+------------+---------+---------+--------+
| | Relance Std    | Auto       | Activé   | 3       | [Éditer]|
| | Relance Jurid  | Manuel     | Désactiv | 5       | [Éditer]|
| | Test           | Auto       | Activé   | 2       | [Éditer]|
| +----------------+------------+---------+---------+--------+
|                                                             |
| Légende: [Actif] = Vert / [Désactivé] = Rouge               |
|                                                             |
| Filtres: [______Rechercher______] [Toutes] [Actives]        |
+-------------------------------------------------------------+
```

### **2. Formulaire de Nouvelle Séquence**
```
+-------------------------------------------------------------+
| NOUVELLE SÉQUENCE: Relance Standard                         |
|                                                             |
| Informations Générales:                                     |
| Nom: [Relance Standard] ___________________________        |
| Description: [Séquence automatique] _______________________ |
| Type: [Automatique] _________________________________       |
| Statut: [Actif] _____________________________________       |
|                                                             |
| Configuration des Actions:                                  |
| +---------------------------------------------------------+ |
| | Action 1: [Email] Délai: [1] jour                      | |
| | Sujet: [Rappel facture] _____________________________  | |
| | Expéditeur: [comptabilite@adti06.com] _______________  | |
| | Message: [Veuillez régler votre facture...] ________  | |
| +---------------------------------------------------------+ |
| | Action 2: [Email] Délai: [3] jours                     | |
| | Sujet: [2ème rappel] ________________________________  | |
| | Expéditeur: [comptabilite@adti06.com] _______________  | |
| | Message: [Dernier rappel avant relance...] ________  | |
| +---------------------------------------------------------+ |
| | Action 3: [Email] Délai: [7] jours                     | |
| | Sujet: [Relance finale] ______________________________  | |
| | Expéditeur: [comptabilite@adti06.com] _______________  | |
| | Message: [Relance finale avant poursuites...] _____  | |
| +---------------------------------------------------------+ |
|                                                             |
| [Ajouter Action] [Enregistrer] [Annuler]                   |
+-------------------------------------------------------------+
```

## **Classes Parse Utilisées**

- **Sequences** :
  ```javascript
  {
    objectId: String,
    nom: String,
    description: String,
    isAuto: Boolean,
    isActif: Boolean,
    actions: Array,
    isArchived: Boolean,
    requete_auto: Object
  }
  ```

- **Relances** :
  ```javascript
  {
    objectId: String,
    impaye: Pointer(Impayes),
    sequence: Pointer(Sequences),
    action_type: String,
    action_index: Number,
    isSent: Boolean,
    send_date: Date
  }
  ```

- **Impayes** :
  ```javascript
  {
    objectId: String,
    refpiece: String,
    resteapayer: Number,
    facturesoldee: Boolean,
    sequence: Pointer(Sequences)
  }
  ```

## **Logique Métier**

- **Création de séquence** :
  - Frontend (Alpine.js) :
    ```javascript
    // Après succès de la création
    Alpine.store('parseAxios').post('/classes/Sequences', sequenceData)
      .then(response => {
        showSuccess('Séquence enregistrée avec succès');
        navigateTo('/admin/configurations');
      })
      .catch(error => {
        showError('Erreur lors de l\'enregistrement');
      });
    ```

- **Exécution automatique** :
  - Backend (Flask) via blueprint /script/ :
    ```python
    # Dans scripts/relance_bp.py
    def execute_sequence(sequence_id):
        sequence = parseAxios.get(f'/classes/Sequences/{sequence_id}')
        impayes = parseAxios.get('/classes/Impayes', {
            'where': {'sequence': sequence_id, 'facturesoldee': False}
        })
        
        for action in sequence['actions']:
            for impaye in impayes['results']:
                # Créer une relance
                relance_data = {
                    'impaye': {'__type': 'Pointer', 'className': 'Impayes', 'objectId': impaye['objectId']},
                    'sequence': {'__type': 'Pointer', 'className': 'Sequences', 'objectId': sequence_id},
                    'action_type': action['type'],
                    'action_index': action['delay'],
                    'isSent': False
                }
                parseAxios.post('/classes/Relances', relance_data)
    ```

## **Règles de Validation**

1. Une séquence doit avoir au moins une action
2. Les délais doivent être des entiers positifs
3. Les actions doivent être triées par délai croissant
4. Une séquence automatique ne peut pas être modifiée manuellement
5. Les séquences archivées ne sont pas exécutées

## **Exemples de Données**

- **Séquence simple** :
  ```json
  {
    "nom": "Relance Standard",
    "description": "Séquence de relance automatique",
    "isAuto": true,
    "isActif": true,
    "actions": [
      {
        "type": "email",
        "delay": 1,
        "subject": "Rappel facture",
        "senderEmail": "comptabilite@adti06.com",
        "message": "Veuillez régler votre facture..."
      },
      {
        "type": "email",
        "delay": 3,
        "subject": "2ème rappel",
        "senderEmail": "comptabilite@adti06.com",
        "message": "Dernier rappel avant relance..."
      }
    ]
  }
  ```

- **Relance générée** :
  ```json
  {
    "impaye": {"__type": "Pointer", "className": "Impayes", "objectId": "nphWBUJ9JT"},
    "sequence": {"__type": "Pointer", "className": "Sequences", "objectId": "uIu3bFRuix"},
    "action_type": "email",
    "action_index": 1,
    "isSent": false,
    "send_date": {"__type": "Date", "iso": "2026-02-08T15:48:31.687Z"}
  }
  ```
 - **preparation**: 
   - [] lancer le script: getParseData.sh et ensuite lire le fichier data-model.md.
   - [] lire le contenu du dossier guides/. Tous les fichiers.
  - **action  à faire en RESPECTANT les guides** : # **Gestion des Configurations - US2.4 Interface Utilisateur**

## **Description Gherkin**

### **Scénario Principal : Création d'une nouvelle configuration**
```
Scénario : Création complète d'une configuration de synchronisation
  Étant donné que je suis connecté en tant qu'admin sur "/admin/configurations"
  Quand je clique sur "Nouvelle Configuration"
  Et que je saisis les informations suivantes :
    | Champ               | Valeur                          |
    | Nom                 | Configuration ACME              |
    | Hôte BDD            | sql.acme.com                    |
    | Base de données      | acme_prod                       |
    | Utilisateur BDD      | sync_user                       |
    | Mot de passe BDD     | *********                       |
    | Requête SQL         | SELECT email, amount FROM invoices WHERE status='overdue' |
    | Mappings            | email→email_contact, amount→montant |
    | Champs requis       | email, amount, due_date          |
    | Fréquence           | Quotidienne                     |
    | Statut              | Activé                         |
  Et que je clique sur "Enregistrer"
  Alors :
    1. Un nouvel objet est créé dans la classe "SyncConfigs" avec :
       - configId: "acme_prod_123"
       - dbConfig: {host, database, user, query}
       - parseConfig: {mappings, targetClass: "Impayes"}
       - validationRules: {requiredFields, roleValues}
    2. Un nouvel objet est créé dans "DBCredentials" avec :
       - configId: "acme_prod_123"
       - username: "sync_user"
       - encryptedPassword: "[chiffré]"
    3. La configuration est ajoutée à la liste des configs actives dans "VariablesGlobales"
    4. Un message "Configuration enregistrée avec succès" s'affiche
    5. Je suis redirigé vers la liste des configurations
```

### **Scénario de Test**
```
Scénario : Test d'une configuration existante
  Étant donné que je suis sur la page de gestion des configurations
  Et que la configuration "acme_prod_123" existe
  Quand je sélectionne cette configuration
  Et que je clique sur "Tester"
  Alors le système :
    1. Récupère la configuration et les credentials depuis Parse
    2. Décrypte le mot de passe
    3. Exécute la requête en mode test
    4. Affiche un échantillon des résultats avec :
       | Email          | Montant | Échéance   |
       | client@acme.com| 1200.50 | 01/03/2026 |
       | client2@acme.c.| 850.00  | 15/03/2026 |
    5. Valide que toutes les colonnes requises sont présentes
    6. Affiche un message "Configuration valide - 12 enregistrements trouvés"
```

### **Scénario d'Erreur**
```
Scénario : Tentative d'enregistrement avec une requête SQL invalide
  Étant donné que je saisis une requête contenant "DROP TABLE"
  Quand je clique sur "Enregistrer"
  Alors :
    1. Un message "Requête SQL non autorisée" s'affiche
    2. La configuration n'est pas enregistrée
    3. Un log d'erreur est créé dans la classe "SyncLogs" avec :
       - status: "error"
       - details: "Tentative d'injection SQL détectée"
       - configId: null
```

## **Écrans ASCII**

### **1. Liste des Configurations**
```
+-------------------------------------------------------------+
| GESTION DES CONFIGURATIONS DE SYNCHRONISATION              |
|                                                             |
| [Nouvelle Configuration] [Rafraîchir] [Exporter]           |
|                                                             |
| +----------------+------------+----------+---------+--------+
| | Nom            | BDD        | Fréquence| Statut  | Actions |
| +----------------+------------+----------+---------+--------+
| | ACME Prod      | acme_prod  | Quotidien| Activé  | [Éditer]|
| | Client Std     | std_db     | Hebdo    | Désactiv| [Éditer]|
| | Configuration  | dev_db     | Manuel   | Activé  | [Éditer]|
| | Test           | test_db    | Hebdo    | Désactiv| [Éditer]|
| +----------------+------------+----------+---------+--------+
|                                                             |
| Légende:                                                         |
| [Actif] = Vert / [Désactivé] = Rouge                           |
|                                                             |
| Filtres: [______Rechercher______] [Toutes] [Actives]        |
+-------------------------------------------------------------+
```

### **2. Formulaire de Nouvelle Configuration**
```
+-------------------------------------------------------------+
| NOUVELLE CONFIGURATION: ACME Production                     |
|                                                             |
| Informations Générales:                                     |
| Nom: [Configuration ACME] ___________________________       |
| ID: [acme_prod_123] _________________________________       |
| Description: [Synchronisation des factures ACME] ________  |
|                                                             |
| Configuration Base de Données:                             |
| +---------------------------------------------------------+ |
| | Hôte: [sql.acme.com] _____________________________     | |
| | Base: [acme_prod] ________________________________     | |
| | Utilisateur: [sync_user] _

 - **preparation**: 
   - [] lancer le script: getParseData.sh et ensuite lire le fichier data-model.md.
   - [] lire le contenu du dossier guides/. Tous les fichiers.
  - **action  à faire en RESPECTANT les guides** : Scénario : Synchronisation avec configuration stockée dans Parse
  Étant donné que la classe "SyncConfigs" contient :
    {
      "configId": "acme_prod",
      "name": "ACME Production",
      "dbConfig": {
        "host": "sql.acme.com",
        "database": "acme_prod",
        "query": "SELECT email, amount FROM invoices WHERE status='overdue'"
      },
      "parseConfig": {
        "targetClass": "Impayes",
        "roleField": "role_contact",
        "statusField": "statut"
      },
      "frequency": "daily",
      "enabled": true,
      "validationRules": {
        "requiredFields": ["email", "amount", "due_date"],
        "roleValues": ["payeur", "apport. affaires"]
      }
    }
  Quand le cron s'exécute
  Alors le service :
    1. Récupère la configuration depuis Parse
    2. Se connecte à la BDD avec les credentials stockés
    3. Crée les impayés dans Parse avec validation
    4. Logge l'opération

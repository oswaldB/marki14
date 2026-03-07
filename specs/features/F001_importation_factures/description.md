# F001 - Importation des Factures Impayées

## Description
Permettre l'importation des factures impayées via un script ou un upload de fichiers (PDF uniquement).

## Fonctionnalités
1. **Upload de fichiers** : Permettre aux utilisateurs de télécharger des fichiers PDF contenant des factures impayées.
2. **Script d'importation** : Intégrer un script pour importer automatiquement les factures depuis une base de données externe.
3. **Validation des fichiers** : Vérifier que les fichiers téléchargés sont bien des PDF et qu'ils contiennent des données valides.
4. **Stockage des données** : Enregistrer les factures importées dans la classe `Impayes` de la base de données.

## User Stories
- **US001** : En tant qu'utilisateur, je veux pouvoir télécharger un fichier PDF contenant des factures impayées afin de les importer dans le système.
- **US002** : En tant qu'utilisateur, je veux que le système valide les fichiers téléchargés pour m'assurer qu'ils sont corrects.
- **US003** : En tant qu'utilisateur, je veux que les factures importées soient stockées dans la base de données pour pouvoir les gérer.
- **US004** : En tant qu'utilisateur, je veux voir les résultats des logs d'importation pour identifier les succès, les échecs et les avertissements.
- **US005** : En tant qu'utilisateur, je veux pouvoir relancer le script d'importation depuis la page des logs.

## Critères d'Acceptation
- Les fichiers téléchargés doivent être au format PDF.
- Les factures importées doivent être validées et stockées dans la base de données.
- Le système doit fournir un feedback clair en cas d'erreur lors de l'importation.
- Les logs d'importation doivent être affichés avec les succès, les échecs et les avertissements.
- L'utilisateur doit pouvoir relancer le script d'importation depuis la page des logs.

## Notes
- Les factures importées doivent inclure des informations telles que le numéro de facture, la date, le montant, et les détails du contact.
- Les données importées doivent être accessibles via l'interface utilisateur pour une gestion ultérieure.
- Le script d'import doit être exécuté toutes les heures pour importer les factures impayées dans la classe `Impayes`.
- Le script doit également enregistrer l'URL de stockage FTP pour chaque facture. Voir le dossier `elements_importants` pour la requête SQL et le format de l'URL.
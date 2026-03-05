# Script getInvoice

## Description
Ce script permet de récupérer une facture depuis un serveur SFTP en utilisant son URL. Il télécharge le fichier PDF depuis le serveur, le convertit en base64, et retourne le contenu pour affichage ou téléchargement. Ce script est utilisé pour accéder aux factures stockées sur un serveur distant.

## Comportement
- **Connexion SFTP** : Établit une connexion sécurisée au serveur SFTP en utilisant les informations d'identification fournies dans les variables d'environnement.
- **Téléchargement du fichier** : Télécharge le fichier PDF depuis le serveur SFTP vers un fichier temporaire local.
- **Conversion en base64** : Lit le fichier téléchargé et le convertit en base64 pour faciliter son transfert via une API.
- **Gestion des erreurs** : Gère les erreurs de connexion, de téléchargement, et de conversion.
- **Nettoyage** : Supprime le fichier temporaire après conversion pour éviter les fuites de mémoire.

## Fonctions

### get_invoice_from_ftp(invoice_url)
@description Récupère une facture depuis le serveur SFTP.
@param {string} invoice_url - URL de la facture (ex: `/ADN/Reporting/Gco/Piece/2026/janvier/FA260121_50319/standard/FA260121 50319 (GCO PI FA).pdf`).
@returns {Tuple} Tuple contenant le chemin du fichier temporaire et un message d'erreur (si applicable).

@example
Pour récupérer une facture depuis le serveur SFTP, appelez la fonction `get_invoice_from_ftp()` avec l'URL de la facture. Cette fonction retourne un tuple contenant le chemin du fichier temporaire et un message d'erreur (si applicable). Vous pouvez vérifier le message d'erreur pour déterminer si l'opération a réussi.

### execute(invoice_url)
@description Fonction principale pour exécuter le script via l'API Flask.
@param {string} invoice_url - URL de la facture à récupérer.
@returns {dict} Résultat avec le fichier en base64 ou un message d'erreur.

@example
Pour exécuter le script via l'API Flask, appelez la fonction `execute()` avec l'URL de la facture à récupérer. Cette fonction retourne un dictionnaire avec un statut, un message, et le fichier en base64 (si l'opération a réussi). Vous pouvez vérifier le statut pour déterminer si l'opération a réussi ou échoué.

## Variables d'Environnement
- **FTP_HOST** : Hôte du serveur SFTP.
- **FTP_USERNAME** : Nom d'utilisateur pour la connexion SFTP.
- **FTP_PASSWORD** : Mot de passe pour la connexion SFTP.
- **FTP_PORT** : Port du serveur SFTP (par défaut : 2222).

## Dépendances
- **paramiko** : Bibliothèque Python pour les connexions SSH et SFTP.
- **tempfile** : Module Python pour la création de fichiers temporaires.
- **base64** : Module Python pour la conversion en base64.
- **os** : Module Python pour interagir avec le système de fichiers.
- **dotenv** : Bibliothèque pour charger les variables d'environnement depuis un fichier `.env`.

## Exemples d'Utilisation
- **En ligne de commande** : Exécuter le script pour télécharger une facture spécifique.
- **Via l'API Flask** : Intégrer le script dans une API Flask pour fournir des factures dynamiques aux templates HTML.
- **Avec des URLs dynamiques** : Utiliser des URLs générées dynamiquement pour accéder aux factures.

@example
Pour exécuter le script en ligne de commande, utilisez la commande `python getInvoice.py` suivie de l'URL de la facture et des options souhaitées (par exemple, `--debug` pour activer le mode débogage).

## Gestion des Erreurs
- **Configuration manquante** : Si les variables d'environnement pour la connexion SFTP sont manquantes.
- **Fichier introuvable** : Si le fichier demandé n'existe pas sur le serveur SFTP.
- **Erreur de connexion** : Si la connexion au serveur SFTP échoue.
- **Erreur de téléchargement** : Si le téléchargement du fichier échoue.

## Structure
```
app/
└── scripts/
    └── getInvoice.py
```

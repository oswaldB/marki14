# Alpine.js - impayesState

## Description
Composant Alpine.js pour la gestion des impayés. Ce composant sert d'interface entre les templates HTML et le store global `impayesStore`. Il expose des méthodes pour interagir avec le store, permettant ainsi de manipuler les données des impayés, de gérer les vues, et de formater les données pour l'affichage.

## Comportement
- **Initialisation** : Le composant est initialisé lors de l'événement `alpine:init` et s'enregistre dans Alpine.js sous le nom `impayesState`.
- **Accès au store** : Toutes les méthodes du composant interagissent avec le store global `impayesStore`, ce qui permet une gestion centralisée des données.
- **Réactivité** : Les méthodes exposées sont réactives et déclenchent des mises à jour de l'interface utilisateur lorsque les données du store changent.
- **Formatage des données** : Le composant fournit des méthodes pour formater les dates et les montants, assurant une présentation cohérente dans l'interface.

## Props
- **store** : Référence au store global `impayesStore`. Ce store contient toutes les données et la logique métier liées aux impayés.

## JSDoc

### @typedef {Object} ImpayesState
@property {Object} store - Référence au store global `impayesStore`. Ce store contient toutes les données et la logique métier liées aux impayés.

### @function refreshData
@description Rafraîchit les données des impayés en appelant la méthode correspondante du store. Cette méthode déclenche une nouvelle requête HTTP GET vers l'API backend pour récupérer les dernières données des impayés. Elle met également à jour l'état `isLoading` du store pendant le chargement.
@returns {Promise<void>} - Une promesse qui se résout lorsque les données sont rafraîchies.
@example
Pour rafraîchir les données des impayés, appelez la méthode `refreshData()`. Cette méthode déclenche une nouvelle requête HTTP GET vers l'API backend pour récupérer les dernières données des impayés. Elle met également à jour l'état `isLoading` du store pendant le chargement. Vous pouvez utiliser les promesses pour gérer les états de succès ou d'erreur.

### @function switchView
@description Change la vue actuelle des impayés. Les vues disponibles sont définies dans le store et peuvent inclure :
- `'byClient'` : Vue groupée par client.
- `'byDate'` : Vue groupée par date d'échéance.
- `'byStatus'` : Vue groupée par statut (impayé, relancé, payé).
- `'list'` : Vue liste simple sans groupement.
@param {string} viewName - Nom de la vue à afficher. Doit correspondre à l'une des vues disponibles dans le store.
@throws {Error} - Lance une erreur si la vue demandée n'est pas disponible.
@example
Pour changer la vue actuelle des impayés, appelez la méthode `switchView()` avec le nom de la vue souhaitée. Les vues disponibles incluent `'byClient'` pour une vue groupée par client, `'byDate'` pour une vue groupée par date d'échéance, `'byStatus'` pour une vue groupée par statut, et `'list'` pour une vue liste simple sans groupement. Si la vue demandée n'est pas disponible, une erreur est lancée.

### @function toggleGroupExpansion
@description Basculer l'état d'expansion d'un groupe d'impayés. Si le groupe est expansé, il sera réduit, et vice versa. Cette méthode met à jour l'état `expandedGroups` du store pour la vue actuelle.
@param {string} groupId - Identifiant unique du groupe à basculer. Cet identifiant est généralement généré par le store.
@returns {boolean} - Le nouvel état d'expansion du groupe (`true` si expansé, `false` sinon).
@example
Pour basculer l'état d'expansion d'un groupe d'impayés, appelez la méthode `toggleGroupExpansion()` avec l'identifiant unique du groupe. Cette méthode met à jour l'état `expandedGroups` du store pour la vue actuelle et retourne le nouvel état d'expansion du groupe (`true` si expansé, `false` sinon).

### @function isGroupExpanded
@description Vérifie si un groupe d'impayés est actuellement expansé dans la vue actuelle. Cette méthode interroge l'état `expandedGroups` du store.
@param {string} groupId - Identifiant unique du groupe à vérifier.
@returns {boolean} - Retourne `true` si le groupe est expansé dans la vue actuelle, `false` sinon.
@example
Pour vérifier si un groupe d'impayés est actuellement expansé dans la vue actuelle, appelez la méthode `isGroupExpanded()` avec l'identifiant unique du groupe. Cette méthode interroge l'état `expandedGroups` du store et retourne `true` si le groupe est expansé, `false` sinon. Vous pouvez utiliser cette méthode pour effectuer des actions conditionnelles en fonction de l'état d'expansion du groupe.

### @function openDetailsDrawer
@description Ouvre le tiroir de détails pour afficher les informations détaillées d'un impayé spécifique. Cette méthode met à jour l'état `detailsDrawer` du store avec les données de l'impayé et définit `isDetailsDrawerOpen` sur `true`.
@param {Object} item - Objet représentant l'impayé à afficher. Cet objet doit contenir les propriétés suivantes :
  - `objectId` (string) : Identifiant unique de l'impayé.
  - `refpiece` (string) : Référence de la facture.
  - `nfacture` (string) : Numéro de facture.
  - `datepiece` (string) : Date de la facture au format ISO.
  - `totalttcnet` (number) : Montant total TTC.
  - `resteapayer` (number) : Montant restant à payer.
  - `facturesoldee` (boolean) : Indique si la facture est soldée.
  - Autres propriétés spécifiques à l'impayé.
@returns {boolean} - Retourne `true` si le tiroir a été ouvert avec succès, `false` en cas d'erreur.
@example
Pour ouvrir le tiroir de détails et afficher les informations détaillées d'un impayé spécifique, appelez la méthode `openDetailsDrawer()` avec un objet représentant l'impayé. Cet objet doit contenir des propriétés comme `objectId`, `refpiece`, `nfacture`, `datepiece`, `totalttcnet`, `resteapayer`, et `facturesoldee`. La méthode met à jour l'état `detailsDrawer` du store avec les données de l'impayé et définit `isDetailsDrawerOpen` sur `true`. Elle retourne `true` si le tiroir a été ouvert avec succès, `false` en cas d'erreur.

### @function closeDetailsDrawer
@description Ferme le tiroir de détails en réinitialisant l'état `detailsDrawer` du store et en définissant `isDetailsDrawerOpen` sur `false`.
@returns {boolean} - Retourne `true` si le tiroir a été fermé avec succès, `false` s'il n'était pas ouvert.
@example
Pour fermer le tiroir de détails, appelez la méthode `closeDetailsDrawer()`. Cette méthode réinitialise l'état `detailsDrawer` du store et définit `isDetailsDrawerOpen` sur `false`. Elle retourne `true` si le tiroir a été fermé avec succès, `false` s'il n'était pas ouvert.

### @function formatDate
@description Formate une date sous forme de chaîne de caractères pour l'affichage. La date est formatée selon le format local français (JJ/MM/AAAA).
@param {string} dateString - Date à formater, au format ISO (YYYY-MM-DD).
@returns {string} - Date formatée selon le format local (par exemple, "15/03/2024"). Retourne une chaîne vide si la date est invalide.
@example
Pour formater une date sous forme de chaîne de caractères pour l'affichage, appelez la méthode `formatDate()` avec une date au format ISO (YYYY-MM-DD). La date est formatée selon le format local français (JJ/MM/AAAA). Si la date est invalide, la méthode retourne une chaîne vide.

### @function formatCurrency
@description Formate un montant numérique en une chaîne de caractères avec le symbole monétaire euro (€). Le montant est arrondi à deux décimales et utilise des séparateurs de milliers.
@param {number} amount - Montant à formater. Doit être un nombre valide.
@returns {string} - Montant formaté avec le symbole monétaire et les séparateurs de milliers (par exemple, "1 250,00 €"). Retourne "0,00 €" si le montant est invalide.
@example
Pour formater un montant numérique en une chaîne de caractères avec le symbole monétaire euro (€), appelez la méthode `formatCurrency()`. Le montant est arrondi à deux décimales et utilise des séparateurs de milliers. Si le montant est invalide, la méthode retourne "0,00 €".

### @function calculateMaxDaysLate
@description Calcule le nombre maximum de jours de retard pour un groupe d'impayés. Le retard est calculé en comparant la date d'échéance de chaque impayé avec la date actuelle. Seuls les impayés non soldés sont pris en compte.
@param {Object} group - Objet représentant un groupe d'impayés. Cet objet doit contenir une propriété `items` qui est un tableau d'impayés. Chaque impayé doit avoir les propriétés suivantes :
  - `dateecheance` (string) : Date d'échéance au format ISO.
  - `facturesoldee` (boolean) : Indique si la facture est soldée.
@returns {number} - Nombre de jours de retard maximum pour le groupe. Retourne `0` si tous les impayés sont soldés ou si le groupe est vide.
@example
Pour calculer le nombre maximum de jours de retard pour un groupe d'impayés, appelez la méthode `calculateMaxDaysLate()` avec un objet représentant le groupe. Cet objet doit contenir une propriété `items` qui est un tableau d'impayés. Chaque impayé doit avoir les propriétés `dateecheance` (date d'échéance au format ISO) et `facturesoldee` (indique si la facture est soldée). La méthode retourne le nombre de jours de retard maximum pour le groupe, en ne prenant en compte que les impayés non soldés. Si tous les impayés sont soldés ou si le groupe est vide, la méthode retourne `0`.

### @function updateSearchTerm
@description Met à jour le terme de recherche pour filtrer les impayés. Ce terme est utilisé pour filtrer les impayés par référence, numéro de facture, nom de client, ou autre critère pertinent. La recherche est sensible à la casse.
@param {string} term - Terme de recherche à appliquer. Une chaîne vide réinitialise le filtre.
@returns {void}
@example
Pour mettre à jour le terme de recherche et filtrer les impayés, appelez la méthode `updateSearchTerm()` avec le terme de recherche souhaité. Ce terme est utilisé pour filtrer les impayés par référence, numéro de facture, nom de client, ou autre critère pertinent. La recherche est sensible à la casse. Pour réinitialiser le filtre, passez une chaîne vide.

### @function updateSelectedPayeur
@description Met à jour le payeur sélectionné pour filtrer les impayés. Ce filtre permet de n'afficher que les impayés liés à un payeur spécifique. Une valeur `null` ou une chaîne vide réinitialise le filtre.
@param {string} payeur - Identifiant ou nom du payeur à sélectionner.
@returns {void}
@example
Pour mettre à jour le payeur sélectionné et filtrer les impayés, appelez la méthode `updateSelectedPayeur()` avec l'identifiant ou le nom du payeur. Ce filtre permet de n'afficher que les impayés liés à un payeur spécifique. Pour réinitialiser le filtre, passez `null` ou une chaîne vide.

### @function updateSortBy
@description Met à jour le champ de tri pour les impayés. Les valeurs possibles pour le tri sont :
- `'date'` : Trie par date d'échéance (du plus ancien au plus récent).
- `'montant'` : Trie par montant restant à payer (du plus élevé au plus bas).
- `'retard'` : Trie par nombre de jours de retard (du plus élevé au plus bas).
- `'refpiece'` : Trie par référence de facture (ordre alphabétique).
@param {string} sortField - Champ à utiliser pour le tri. Doit être l'une des valeurs valides.
@throws {Error} - Lance une erreur si le champ de tri est invalide.
@returns {void}
@example
Pour mettre à jour le champ de tri pour les impayés, appelez la méthode `updateSortBy()` avec le champ de tri souhaité. Les valeurs possibles incluent `'date'` pour trier par date d'échéance, `'montant'` pour trier par montant restant à payer, `'retard'` pour trier par nombre de jours de retard, et `'refpiece'` pour trier par référence de facture. Si le champ de tri est invalide, une erreur est lancée.

### @function updateStatusFilter
@description Met à jour le filtre de statut pour les impayés. Les valeurs possibles pour le statut sont :
- `'tous'` : Affiche tous les impayés.
- `'impayé'` : Affiche uniquement les impayés non soldés.
- `'relancé'` : Affiche uniquement les impayés qui ont été relancés.
- `'payé'` : Affiche uniquement les impayés soldés.
@param {string} status - Statut à filtrer. Doit être l'une des valeurs valides.
@throws {Error} - Lance une erreur si le statut est invalide.
@returns {void}
@example
Pour mettre à jour le filtre de statut pour les impayés, appelez la méthode `updateStatusFilter()` avec le statut souhaité. Les valeurs possibles incluent `'tous'` pour afficher tous les impayés, `'impayé'` pour afficher uniquement les impayés non soldés, `'relancé'` pour afficher uniquement les impayés qui ont été relancés, et `'payé'` pour afficher uniquement les impayés soldés. Si le statut est invalide, une erreur est lancée.

## Dépendances
- **Alpine.js** : Bibliothèque JavaScript utilisée pour la réactivité et la gestion des états dans l'interface utilisateur.
- **impayesStore** : Store global qui gère les données et la logique métier des impayés. Ce store est injecté dans le composant et utilisé pour toutes les opérations de données.

## Exemples d'utilisation
- Ce composant est généralement utilisé dans les templates HTML pour interagir avec les données des impayés.
- Il peut être utilisé pour rafraîchir les données, changer de vue, filtrer les résultats, et formater les données pour l'affichage.

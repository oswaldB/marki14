# US001 - Générer un Prompt pour ChatGPT

## Description
En tant qu'utilisateur, je veux générer un prompt pour ChatGPT basé sur mes données directement depuis l'interface editor de la séquence.

## Préconditions
- L'utilisateur est connecté.
- L'utilisateur a accès à l'interface editor de la séquence.

## Scénario Principal
1. L'utilisateur accède à l'interface editor de la séquence.
2. L'utilisateur clique sur un bouton 'Créer un email avec l'AI'.
3. Un drawer/slider s'ouvre avec les instructions suivantes :
   - Copier le prompt avec le bouton fourni.
   - Ouvrir ChatGPT en cliquant sur le bouton dédié.
   - Coller le texte de ChatGPT dans le textarea prévu à cet effet.
   - Cliquer sur 'Appliquer'.
4. Le système génère un prompt basé sur les anciens emails et toutes les variables possibles.
5. Le prompt force une réponse de ChatGPT dans un schéma markdown.
6. L'utilisateur copie le prompt et l'utilise dans ChatGPT.
7. L'utilisateur copie la réponse de ChatGPT et la colle dans le textarea.
8. Le système applique automatiquement le contenu du message markdown dans Toast UI.

## Scénario Alternatif
- **Données Insuffisantes** : Si les données sont insuffisantes, le système affiche un message d'avertissement et demande à l'utilisateur de vérifier les données.

## Écran ASCII
```
+-----------------------------------------------------+
| Génération de Prompt pour ChatGPT                  |
+-----------------------------------------------------+
|                                                     |
| Instructions :                                      |
| 1. Cliquez sur 'Copier le Prompt' pour copier le    |
|    prompt généré.                                    |
| 2. Ouvrez ChatGPT en cliquant sur 'Ouvrir ChatGPT'.  |
| 3. Collez le prompt dans ChatGPT et obtenez la      |
|    réponse.                                         |
| 4. Copiez la réponse de ChatGPT et collez-la dans   |
|    l'espace prévu ci-dessous.                      |
| 5. Cliquez sur 'Appliquer' pour appliquer le        |
|    contenu.                                         |
|                                                     |
| [Copier le Prompt] [Ouvrir ChatGPT]                 |
|                                                     |
| Réponse de ChatGPT :                                |
| [_________________________________________________] |
| [_________________________________________________] |
| [_________________________________________________] |
|                                                     |
| [Appliquer] [Annuler]                               |
|                                                     |
+-----------------------------------------------------+
```

## Postconditions
- Le prompt est généré et prêt à être utilisé dans ChatGPT.
- Le contenu markdown est appliqué dans Toast UI.

## Notes
- Les prompts doivent être basés sur les données de l'application.
- Les prompts doivent être clairs et précis pour une utilisation efficace dans ChatGPT.
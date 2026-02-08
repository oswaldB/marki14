#!/bin/bash

# Script pour exécuter le test Playwright des séquences

echo "🚀 Démarrage du test Playwright pour les séquences..."
echo ""

# Vérifier que Playwright est installé
if [ ! -d "node_modules/playwright" ]; then
    echo "⚠️  Playwright n'est pas installé. Installation en cours..."
    npm install playwright
fi

# Créer le dossier de screenshots s'il n'existe pas
mkdir -p tests/playwright/screenshots

# Exécuter le test
echo "📝 Exécution du test..."
echo ""
node tests/playwright/check-sequences-display.js

# Vérifier le code de retour
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Test terminé avec succès !"
    echo ""
    echo "📁 Résultats disponibles dans : tests/playwright/screenshots/"
    echo ""
    echo "📊 Pour voir les résultats :"
    echo "   - sequences-page.png : Capture d'écran de la page"
    echo "   - sequences-error.png : Capture en cas d'erreur"
else
    echo ""
    echo "❌ Le test a échoué. Voir les détails ci-dessus."
    echo ""
    echo "📁 Une capture d'écran de l'erreur a été sauvegardée dans :"
    echo "   tests/playwright/screenshots/sequences-error.png"
    exit 1
fi
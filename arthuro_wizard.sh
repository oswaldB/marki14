#!/bin/bash

# Arthuro Wizard - Assistant de tests Cypress en mode wizard
# Version 4.0 - Interface guidée étape par étape avec mode automatique

# Variables globales
TEST_FILE=""
TEST_NAME=""
MODE=""
REPORT_FILE=""
AUTO_MODE=false
MAX_RETRIES=5
RETRY_COUNT=0

display_header() {
    clear
    echo ""
    echo "  ************************************************************************"
    echo "  ARTHURO WIZARD - Assistant de Tests"
    echo "  Version 4.0 - Mode Guidé & Automatique"
    echo "  ************************************************************************"
    echo ""
}

# Étape 1: Menu principal
etape_menu_principal() {
    display_header
    echo "  ÉTAPE 1/4 - MENU PRINCIPAL"
    echo "  -------------------------------------------"
    echo ""
    echo "  Mode sélectionné : ${MODE}"
    echo "  Que souhaitez-vous faire ?"
    echo ""
    echo "  1. Exécuter un test spécifique"
    echo "  2. Exécuter tous les tests"
    echo "  3. Mode automatique (correction et relance)"
    echo "  4. Voir les statistiques"
    echo "  5. Quitter"
    echo ""
    
    while true; do
        read -p "  Votre choix (1-5) : " choice
        case $choice in
            1|2)
                return 0
                ;;
            3)
                AUTO_MODE=true
                return 0
                ;;
            4)
                display_stats
                return 1
                ;;
            5)
                echo ""
                echo "  👋 Merci d'avoir utilisé Arthuro Wizard !"
                exit 0
                ;;
            *)
                echo "  ❌ Choix invalide, veuillez réessayer."
                ;;
        esac
    done
}

# Étape 2: Choix du test
etape_choix_test() {
    display_header
    echo "  ÉTAPE 2/4 - CHOIX DU TEST"
    echo "  -------------------------------------------"
    echo ""
    echo "  Mode sélectionné : ${MODE}"
    
    # Lister les tests disponibles
    test_files=$(find cypress/e2e -name "*.spec.js" -type f | sort)
    
    if [ -z "$test_files" ]; then
        echo "  ⚠️  Aucun test trouvé dans cypress/e2e/"
        read -p "  Appuyez sur Entrée pour continuer..." -n 1 -s
        return 1
    fi
    
    echo "  Tests disponibles :"
    echo ""
    index=1
    for file in $test_files; do
        test_name=$(basename "$file" .spec.js)
        test_name=$(echo "$test_name" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++){ $i=toupper(substr($i,1,1)) substr($i,2) }}1')
        echo "  ${index}. ${test_name}"
        ((index++))
    done
    echo ""
    
    while true; do
        read -p "  Quel test voulez-vous exécuter ? (numéro) : " test_number
        
        # Vérifier si le numéro est valide
        if [ "$test_number" -ge 1 ] && [ "$test_number" -le $((index-1)) ]; then
            selected_file=$(echo "$test_files" | sed -n "${test_number}p")
            TEST_FILE="$selected_file"
            TEST_NAME=$(basename "$selected_file" .spec.js)
            TEST_NAME=$(echo "$TEST_NAME" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++){ $i=toupper(substr($i,1,1)) substr($i,2) }}1')
            return 0
        else
            echo "  ❌ Numéro de test invalide, veuillez réessayer."
        fi
    done
}

# Étape 0: Choix du mode d'exécution (déplacé en premier)
etape_choix_mode() {
    display_header
    echo "  ÉTAPE 0/4 - MODE D'EXÉCUTION"
    echo "  -------------------------------------------"
    echo ""
    echo "  Première question :"
    echo "  Comment voulez-vous exécuter les tests ?"
    echo ""
    echo "  1. Mode Headless (sans interface graphique)"
    echo "  2. Mode Navigateur (avec interface Cypress - npx cypress open --e2e)"
    echo ""
    
    while true; do
        read -p "  Votre choix (1-2) : " mode_choice
        case $mode_choice in
            1)
                MODE="headless"
                return 0
                ;;
            2)
                MODE="browser"
                # Si mode navigateur, lancer directement Cypress
                echo ""
                echo "  🚀 Lancement de Cypress en mode navigateur..."
                echo "  Commande : npx cypress open --e2e"
                echo ""
                npx cypress open --e2e
                # Après la fermeture de Cypress, revenir au début
                return 2
                ;;
            *)
                echo "  ❌ Choix invalide, veuillez réessayer."
                ;;
        esac
    done
}

# Étape 3: Confirmation avant exécution
etape_confirmation() {
    display_header
    echo "  ÉTAPE 3/4 - CONFIRMATION"
    echo "  -------------------------------------------"
    echo ""
    echo "  Configuration actuelle :"
    echo "  Test : ${TEST_NAME}"
    echo "  Mode : ${MODE}"
    if [ "$AUTO_MODE" = true ]; then
        echo "  Mode Automatique : ACTIF"
    fi
    echo ""
    
    read -p "  Êtes-vous prêt à exécuter ce test ? (o/n) : " confirmation
    if [ "$confirmation" = "o" ] || [ "$confirmation" = "O" ]; then
        return 0
    else
        return 1
    fi
}

# Exécution du test
execute_test() {
    display_header
    echo "  EXÉCUTION DU TEST"
    echo "  -------------------------------------------"
    echo ""
    echo "  Test : ${TEST_NAME}"
    echo "  Mode : ${MODE}"
    echo ""
    echo "  🔄 Exécution en cours..."
    echo ""
    
    # Créer un dossier pour les rapports s'il n'existe pas
    mkdir -p "./cypress/reports"
    
    # Générer un nom de rapport unique
    timestamp=$(date +"%Y%m%d_%H%M%S")
    REPORT_FILE="./cypress/reports/arthuro_report_${TEST_NAME}_${timestamp}.log"
    
    if [ "$MODE" = "headless" ]; then
        # Mode headless
        npx cypress run --spec "$TEST_FILE" --headless 2>&1 | tee "$REPORT_FILE"
        exit_code=${PIPESTATUS[0]}
    else
        # Mode navigateur
        npx cypress open --spec "$TEST_FILE" 2>&1 | tee "$REPORT_FILE"
        exit_code=$?
    fi
    
    # Vérifier que le rapport a bien été créé
    if [ ! -f "$REPORT_FILE" ]; then
        echo "  ⚠️  Le rapport n'a pas été créé au chemin attendu."
        echo "  Recherche du rapport..."
        # Trouver le dernier fichier log créé
        REPORT_FILE=$(find . -name "*.log" -type f -newermt "1 minute ago" | head -1)
        if [ -z "$REPORT_FILE" ]; then
            echo "  ❌ Impossible de trouver le rapport généré."
            return 1
        else
            echo "  ✅ Rapport trouvé : $REPORT_FILE"
        fi
    fi
    
    return $exit_code
}

# Gestion des erreurs
handle_error() {
    echo ""
    echo "  ❌ TEST ÉCHOUE !"
    echo ""
    echo "  📜 Rapport d'erreur enregistré :"
    echo "  ${REPORT_FILE}"
    echo ""
    
    # Vérifier que le rapport existe
    if [ ! -f "$REPORT_FILE" ]; then
        echo "  ❌ Le rapport n'existe pas au chemin : $REPORT_FILE"
        echo "  Tentative de recherche..."
        REPORT_FILE=$(find . -name "*.log" -type f -newermt "1 minute ago" | head -1)
        if [ -z "$REPORT_FILE" ]; then
            echo "  ❌ Impossible de trouver un rapport récent."
            return 1
        else
            echo "  ✅ Rapport trouvé : $REPORT_FILE"
        fi
    fi
    
    # Extraire les informations clés du rapport
    error_lines=$(grep -A 10 -B 5 "Error|Failed|AssertionError" "$REPORT_FILE" | head -20)
    
    if [ -z "$error_lines" ]; then
        error_lines="Erreur inconnue - Voir le rapport complet"
    fi
    
    echo "  Dernières erreurs détectées :"
    echo "  -------------------------------------------"
    echo "$error_lines"
    echo "  -------------------------------------------"
    echo ""
    
    # Menu de gestion des erreurs
    while true; do
        echo "  Que souhaitez-vous faire ?"
        echo ""
        echo "  1. Voir le rapport complet"
        echo "  2. Sauvegarder le rapport avec un nom personnalisé"
        echo "  3. Lancer la commande vibe pour corriger les erreurs"
        echo "  4. Réessayer le test"
        echo "  5. Retour au menu principal"
        echo "  6. Lancer la commande vibe (option alternative)"
        echo ""
        
        read -p "  Votre choix (1-6) : " error_choice
        
        case $error_choice in
            1)
                echo ""
                echo "  📄 Affichage du rapport complet..."
                if [ -f "$REPORT_FILE" ]; then
                    less "$REPORT_FILE"
                else
                    echo "  ❌ Le rapport n'est pas accessible."
                fi
                ;;
            2)
                read -p "  Entrez un nom pour le rapport (sans extension) : " custom_name
                if [ -f "$REPORT_FILE" ]; then
                    cp "$REPORT_FILE" "./reports/${custom_name}.log"
                    echo ""
                    echo "  ✅ Rapport sauvegardé sous : ./reports/${custom_name}.log"
                else
                    echo "  ❌ Impossible de sauvegarder, le rapport n'existe pas."
                fi
                ;;
            3)
                echo ""
                echo "  🔧 Lancement de la commande vibe pour correction..."
                echo ""
                
                # Vérifier que le rapport existe avant de lancer vibe
                if [ ! -f "$REPORT_FILE" ]; then
                    echo "  ❌ Le rapport n'existe pas, impossible de lancer vibe."
                    continue
                fi
                
                # Extraire un nom de rapport court
                report_basename=$(basename "$REPORT_FILE")
                
                # Lancer la commande vibe RÉELLEMENT
                echo "  Exécution : vibe --p \"corrige les erreurs du rapport @${report_basename}. Commit avant.\""
                echo ""
                
                # Exécution réelle de la commande vibe
                vibe --p "commit" --output streaming
                vibe --p "corrige les erreurs du rapport @${report_basename}. INTERDIT DE LANCER CYPRESS." --output streaming
                vibe --p "commit" --output streaming
                
                echo ""
                echo "  ✅ La commande vibe a été exécutée avec succès."
                ;;
            4)
                echo ""
                echo "  🔄 Réessayons le test..."
                execute_test
                if [ $? -eq 0 ]; then
                    return 0
                else
                    handle_error
                    return 1
                fi
                ;;
            5)
                echo ""
                echo "  🚪 Retour au menu principal..."
                return 1
                ;;
            6)
                echo ""
                echo "  🔧 Lancement de la commande vibe (option alternative)..."
                echo ""
                
                # Vérifier que le rapport existe avant de lancer vibe
                if [ ! -f "$REPORT_FILE" ]; then
                    echo "  ❌ Le rapport n'existe pas, impossible de lancer vibe."
                    continue
                fi
                
                # Extraire un nom de rapport court
                report_basename=$(basename "$REPORT_FILE")
                
                # Lancer la commande vibe avec une formulation différente
                echo "  Exécution : vibe --p \"corrige les erreurs du test @${report_basename}\""
                echo ""
                
                # Exécution réelle de la commande vibe
                vibe --p "commit" --output streaming
                vibe --p "corrige les erreurs du rapport @${report_basename}. INTERDIT DE LANCER CYPRESS." --output streaming
                vibe --p "commit" --output streaming
                
                echo ""
                echo "  ✅ La commande vibe a été exécutée avec succès."
                ;;
            *)
                echo "  ❌ Choix invalide, veuillez réessayer."
                ;;
        esac
    done
}

# Mode automatique - Exécution et correction en boucle
auto_mode_execution() {
    echo ""
    echo "  🤖 MODE AUTOMATIQUE ACTIVÉ"
    echo "  -------------------------------------------"
    echo "  Test : ${TEST_NAME}"
    echo "  Mode : headless (forcé)"
    echo "  Tentatives maximales : ${MAX_RETRIES}"
    echo ""
    
    # Forcer le mode headless pour le mode automatique
    MODE="headless"
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        echo "  Tentative $((RETRY_COUNT+1))/${MAX_RETRIES}"
        echo ""
        
        # Exécuter le test
        if execute_test; then
            echo ""
            echo "  ✅ TEST RÉUSSI !"
            echo "  Test : ${TEST_NAME}"
            echo "  Mode : ${MODE}"
            echo "  Rapport : ${REPORT_FILE}"
            
            # Enregistrer le résultat
            echo "✅ $(date) - ${TEST_NAME} (${MODE})" >> /tmp/arthuro_test_results.log
            
            read -p "  Appuyez sur Entrée pour continuer..." -n 1 -s
            echo ""
            return 0
        else
            # Gestion des erreurs en mode automatique
            echo ""
            echo "  ❌ TEST ÉCHOUE - Tentative $((RETRY_COUNT+1))/${MAX_RETRIES}"
            echo ""
            
            # Vérifier que le rapport existe
            if [ ! -f "$REPORT_FILE" ]; then
                echo "  ❌ Le rapport n'existe pas au chemin : $REPORT_FILE"
                echo "  Tentative de recherche..."
                REPORT_FILE=$(find . -name "*.log" -type f -newermt "1 minute ago" | head -1)
                if [ -z "$REPORT_FILE" ]; then
                    echo "  ❌ Impossible de trouver un rapport récent."
                    ((RETRY_COUNT++))
                    continue
                else
                    echo "  ✅ Rapport trouvé : $REPORT_FILE"
                fi
            fi
            
            # Extraire un nom de rapport court
            report_basename=$(basename "$REPORT_FILE")
            
            # Lancer la commande vibe pour corriger les erreurs
            echo "  🔧 Lancement de la commande vibe pour correction..."
            echo "  Exécution : vibe --p \"corrige les erreurs du rapport @${report_basename}. Commit avant.\""
            echo ""
            
            # Exécution réelle de la commande vibe
             vibe --p "commit" --output streaming
             vibe --p "corrige les erreurs du rapport @${report_basename}. INTERDIT DE LANCER CYPRESS." --output streaming
             vibe --p "commit" --output streaming
            
            echo ""
            echo "  ✅ Correction automatique terminée"
            echo "  🔄 Relance du test..."
            echo ""
            
            ((RETRY_COUNT++))
            sleep 3
        fi
    done
    
    echo ""
    echo "  ❌ Nombre maximal de tentatives atteint (${MAX_RETRIES})"
    echo "  Le test a échoué après plusieurs corrections automatiques"
    echo ""
    
    # Enregistrer l'échec
    echo "❌ $(date) - ${TEST_NAME} (${MODE}) - Échec après ${MAX_RETRIES} tentatives" >> /tmp/arthuro_test_results.log
    
    read -p "  Appuyez sur Entrée pour continuer..." -n 1 -s
    echo ""
    return 1
}

# Affichage des statistiques
display_stats() {
    display_header
    echo "  STATISTIQUES DES TESTS"
    echo "  -------------------------------------------"
    echo ""
    
    # Compter le nombre de tests
    test_count=$(find cypress/e2e -name "*.spec.js" -type f | wc -l)
    echo "  Nombre total de tests : ${test_count}"
    
    # Vérifier si des tests ont déjà été exécutés
    if [ -f "/tmp/arthuro_test_results.log" ]; then
        passed=$(grep -c "✅" /tmp/arthuro_test_results.log || echo "0")
        failed=$(grep -c "❌" /tmp/arthuro_test_results.log || echo "0")
        echo "  Tests passés : ${passed}"
        echo "  Tests échoués : ${failed}"
        if [ $((passed + failed)) -gt 0 ]; then
            success_rate=$(echo "scale=2; $passed*100/($passed+$failed)" | bc)
            echo "  Taux de réussite : ${success_rate}%"
        fi
    else
        echo "  Aucun résultat de test enregistré"
    fi
    
    echo ""
    read -p "  Appuyez sur Entrée pour continuer..." -n 1 -s
    echo ""
}

# Vérification des prérequis
check_prerequisites() {
    # Vérifier que Cypress est installé
    if [ ! -d "node_modules/cypress" ]; then
        echo "  ❌ Cypress n'est pas installé."
        echo "  Veuillez lancer 'npm install' d'abord."
        echo ""
        exit 1
    fi
    
    # Vérifier que le serveur est en cours d'exécution
    echo "  🔄 Vérification du serveur..."
    if ! curl -s http://localhost:5000 > /dev/null 2>&1; then
        echo "  ❌ Le serveur n'est pas accessible sur http://localhost:5000"
        echo "  Code d'erreur : $(curl -s -o /dev/null -w '%{http_code}' http://localhost:5000 2>/dev/null || echo 'N/A')"
        read -p "  Voulez-vous que je lance le serveur pour vous ? (o/n) " launch_server
        if [ "$launch_server" = "o" ] || [ "$launch_server" = "O" ]; then
            echo "  🌐 Lancement du serveur..."
            npm run dev &
            sleep 5
            
            # Vérifier que le serveur a bien démarré
            if ! curl -s http://localhost:5000 > /dev/null 2>&1; then
                echo "  ❌ Impossible de lancer le serveur automatiquement"
                echo "  Vérifiez les logs du serveur et relancez Arthuro"
                read -p "  Appuyez sur Entrée pour continuer..." -n 1 -s
                echo ""
                return 1
            fi
        else
            echo "  ⚠️  Veuillez lancer le serveur manuellement avant d'exécuter les tests."
            echo "  Commande suggérée : npm run dev"
            read -p "  Appuyez sur Entrée pour continuer..." -n 1 -s
            echo ""
            return 1
        fi
    fi
    
    # Vérifier que la page d'accueil est accessible
    echo "  ✅ Serveur accessible sur http://localhost:5000"
    return 0
}

# Fonction principale
main() {
    while true; do
        # Vérifier les prérequis
        if ! check_prerequisites; then
            continue
        fi
        
        # Étape 0: Choix du mode d'exécution (déplacé en premier)
        etape_choix_mode
        
        # Vérifier le code de retour
        case $? in
            2)
                # Mode navigateur a été sélectionné et exécuté
                # Retour au début du wizard
                continue
                ;;
            1)
                # Erreur dans le choix du mode
                continue
                ;;
            0)
                # Mode headless sélectionné, continuer normalement
                ;;
        esac
        
        # Étape 1: Menu principal
        if ! etape_menu_principal; then
            continue
        fi
        
        # Étape 2: Choix du test
        if ! etape_choix_test; then
            continue
        fi
        
        # Étape 3: Confirmation
        if ! etape_confirmation; then
            continue
        fi
        
        # Vérifier si le mode automatique est activé
        if [ "$AUTO_MODE" = true ]; then
            # Réinitialiser le compteur de tentatives
            RETRY_COUNT=0
            # Lancer le mode automatique
            auto_mode_execution
            # Réinitialiser le mode automatique
            AUTO_MODE=false
        else
            # Exécution normale du test
            if execute_test; then
                echo ""
                echo "  ✅ TEST RÉUSSI !"
                echo "  Test : ${TEST_NAME}"
                echo "  Mode : ${MODE}"
                echo "  Rapport : ${REPORT_FILE}"
                
                # Enregistrer le résultat
                echo "✅ $(date) - ${TEST_NAME} (${MODE})" >> /tmp/arthuro_test_results.log
                
                read -p "  Appuyez sur Entrée pour continuer..." -n 1 -s
                echo ""
            else
                # Gestion des erreurs
                handle_error
            fi
        fi
    done
}

# Lancer la fonction principale
main
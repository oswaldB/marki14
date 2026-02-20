#!/usr/bin/env python3
"""
Script de test pour la fonctionnalité d'historique des emails
Vérifie la conformité avec les règles de développement
"""

import os
import sys
import json
from pathlib import Path

def test_file_structure():
    """Teste la structure des fichiers créés"""
    print("🔍 Test de la structure des fichiers...")
    
    required_files = [
        'app/app.py',
        'app/templates/base.html',
        'app/templates/base-app.html',
        'app/templates/email-history.html',
        'app/templates/email-details.html',
        'app/templates/icons-regular.html',
        'app/templates/admin-configurations.html',
        'static/js/templates/email/emailHistoryState.js',
        'scripts/emailHistory.js',
        'scripts/emailHistoryRoute.js',
        'scripts/script_bp.py',
        'scripts/__init__.py'
    ]
    
    missing_files = []
    for file_path in required_files:
        full_path = Path(file_path)
        if not full_path.exists():
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Fichiers manquants: {', '.join(missing_files)}")
        return False
    else:
        print("✅ Tous les fichiers requis sont présents")
        return True

def test_template_conformity():
    """Teste la conformité des templates avec les règles"""
    print("\n🔍 Test de conformité des templates...")
    
    # Vérifier l'utilisation de base-app.html pour les pages authentifiées
    auth_pages = [
        'app/templates/email-history.html',
        'app/templates/email-details.html',
        'app/templates/admin-configurations.html'
    ]
    
    for page in auth_pages:
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'extends "base-app.html"' not in content:
                print(f"❌ {page} n'étend pas base-app.html")
                return False
    
    print("✅ Tous les templates authentifiés utilisent base-app.html")
    return True

def test_alpine_js_pattern():
    """Teste le pattern Alpine.js dans les fichiers state"""
    print("\n🔍 Test du pattern Alpine.js...")
    
    state_file = 'static/js/templates/email/emailHistoryState.js'
    
    with open(state_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Vérifier le pattern requis
    if 'document.addEventListener(\'alpine:init\'' not in content:
        print("❌ Le pattern alpine:init est manquant")
        return False
    
    if 'Alpine.data(' not in content:
        print("❌ Alpine.data() est manquant")
        return False
    
    print("✅ Le pattern Alpine.js est correct")
    return True

def test_tailwind_usage():
    """Teste l'utilisation de TailwindCSS"""
    print("\n🔍 Test de l'utilisation de TailwindCSS...")
    
    # Vérifier dans les templates principaux
    templates = [
        'app/templates/email-history.html',
        'app/templates/base.html',
        'app/templates/base-app.html'
    ]
    
    for template in templates:
        with open(template, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Vérifier l'absence de balises <style> ou de CSS inline
        if '<style>' in content:
            print(f"❌ {template} contient des balises <style>")
            return False
        
        if 'style="' in content:
            print(f"❌ {template} contient des styles inline")
            return False
        
        # Vérifier la présence de classes Tailwind
        if 'class="' not in content:
            print(f"⚠️  {template} ne semble pas utiliser TailwindCSS")
    
    print("✅ Utilisation correcte de TailwindCSS")
    return True

def test_sky_color_usage():
    """Teste l'utilisation de la couleur sky-500"""
    print("\n🔍 Test de l'utilisation de la couleur principale sky-500...")
    
    templates = [
        'app/templates/base-app.html',
        'app/templates/email-history.html'
    ]
    
    sky_500_found = False
    for template in templates:
        with open(template, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'sky-500' in content:
                sky_500_found = True
                break
    
    if not sky_500_found:
        print("❌ La couleur principale sky-500 n'est pas utilisée")
        return False
    
    print("✅ La couleur principale sky-500 est utilisée")
    return True

def test_line_icons_usage():
    """Teste l'utilisation des icônes LineAwesome"""
    print("\n🔍 Test de l'utilisation des icônes LineAwesome...")
    
    templates = [
        'app/templates/email-history.html',
        'app/templates/icons-regular.html'
    ]
    
    icons_found = False
    sky_900_found = False
    
    for template in templates:
        with open(template, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'las la-' in content:
                icons_found = True
            if 'text-sky-900' in content:
                sky_900_found = True
    
    if not icons_found:
        print("❌ Aucune icône LineAwesome trouvée")
        return False
    
    if not sky_900_found:
        print("❌ Les icônes ne sont pas en couleur sky-900")
        return False
    
    print("✅ Utilisation correcte des icônes LineAwesome en sky-900")
    return True

def test_route_definitions():
    """Teste la définition des routes dans app.py"""
    print("\n🔍 Test des définitions de routes...")
    
    with open('app/app.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    required_routes = [
        '@app.route(\'/\')',
        '@app.route(\'/email/<email_id>\')',
        '@app.route(\'/email/<email_id>/history\')',
        '@app.route(\'/admin/configurations\')'
    ]
    
    for route in required_routes:
        if route not in content:
            print(f"❌ Route manquante: {route}")
            return False
    
    print("✅ Toutes les routes requises sont définies")
    return True

def test_script_blueprint():
    """Teste l'intégration du blueprint des scripts"""
    print("\n🔍 Test du blueprint des scripts...")
    
    with open('app/app.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'script_bp' not in content:
        print("❌ Le blueprint script_bp n'est pas importé")
        return False
    
    if "app.register_blueprint(script_bp" not in content:
        print("❌ Le blueprint script_bp n'est pas enregistré")
        return False
    
    print("✅ Le blueprint des scripts est correctement intégré")
    return True

def test_parse_axios_usage():
    """Teste l'utilisation de parseAxios dans le frontend"""
    print("\n🔍 Test de l'utilisation de parseAxios...")
    
    with open('static/js/templates/email/emailHistoryState.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'Alpine.store(\'parseAxios\')' not in content:
        print("❌ parseAxios n'est pas configuré dans le store Alpine")
        return False
    
    if '/script/emailHistory' not in content:
        print("❌ Les appels ne passent pas par /script/")
        return False
    
    print("✅ Utilisation correcte de parseAxios")
    return True

def main():
    """Fonction principale pour exécuter tous les tests"""
    print("🚀 Début des tests de conformité pour l'historique des emails\n")
    
    tests = [
        test_file_structure,
        test_template_conformity,
        test_alpine_js_pattern,
        test_tailwind_usage,
        test_sky_color_usage,
        test_line_icons_usage,
        test_route_definitions,
        test_script_blueprint,
        test_parse_axios_usage
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Erreur dans {test.__name__}: {str(e)}")
            results.append(False)
    
    print("\n" + "="*50)
    print("📊 RÉSULTATS DES TESTS")
    print("="*50)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Tests passés: {passed}/{total}")
    
    if passed == total:
        print("🎉 Tous les tests ont passé ! La fonctionnalité est conforme aux règles.")
        return True
    else:
        print("❌ Certains tests ont échoué. Veuillez corriger les problèmes.")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
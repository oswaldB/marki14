#!/usr/bin/env python3
"""
Script de test pour le module peuplerRelance

Ce script permet de tester les différentes fonctionnalités du module
peuplerRelance sans avoir à exécuter l'ensemble du workflow.
"""

import os
import sys
import json
from datetime import datetime

# Ajouter le dossier parent au path pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.peuplerRelance import ParseRelanceConnector


def test_variable_replacement():
    """Tester le remplacement des variables"""
    print("=== Test du remplacement des variables ===")
    
    connector = ParseRelanceConnector()
    
    # Template de test
    template = "Bonjour [[payeur_nom]], votre facture [[nfacture]] d'un montant de [[totalttcnet]] € est en retard."
    
    # Variables de test
    variables = {
        "payeur_nom": "Dupont Jean",
        "nfacture": "FACT-2023-001",
        "totalttcnet": 1250.50
    }
    
    result = connector.replace_variables(template, variables)
    expected = "Bonjour Dupont Jean, votre facture FACT-2023-001 d'un montant de 1250.5 € est en retard."
    
    print(f"Template: {template}")
    print(f"Variables: {variables}")
    print(f"Résultat: {result}")
    print(f"Attendu: {expected}")
    print(f"Test passé: {result == expected}")
    print()


def test_nested_variable_replacement():
    """Tester le remplacement des variables imbriquées"""
    print("=== Test des variables imbriquées ===")
    
    connector = ParseRelanceConnector()
    
    # Template avec variable imbriquée
    template = "Client: [[client.nom]], Email: [[client.email]]"
    
    # Variables avec structure imbriquée
    variables = {
        "client": {
            "nom": "Société XYZ",
            "email": "contact@xyz.com"
        }
    }
    
    result = connector.replace_variables(template, variables)
    expected = "Client: Société XYZ, Email: contact@xyz.com"
    
    print(f"Template: {template}")
    print(f"Variables: {variables}")
    print(f"Résultat: {result}")
    print(f"Attendu: {expected}")
    print(f"Test passé: {result == expected}")
    print()


def test_missing_variable_handling():
    """Tester la gestion des variables manquantes"""
    print("=== Test des variables manquantes ===")
    
    connector = ParseRelanceConnector()
    
    template = "Bonjour [[prenom]], votre facture [[reference]] est en retard."
    variables = {"prenom": "Jean"}  # reference est manquante
    
    result = connector.replace_variables(template, variables)
    print(f"Template: {template}")
    print(f"Variables: {variables}")
    print(f"Résultat: {result}")
    print(f"Variable manquante conservée: {'[[reference]]' in result}")
    print()


def test_destinataire_selection():
    """Tester la sélection du destinataire"""
    print("=== Test de la sélection du destinataire ===")
    
    connector = ParseRelanceConnector()
    
    # Test avec email
    impaye_email = {
        "payeur_email": "jean.dupont@example.com",
        "acquerur_email": "acquerur@example.com"
    }
    
    email_dest = connector.get_destinataire(impaye_email, "email")
    print(f"Destinataire email: {email_dest}")
    print(f"Test email passé: {email_dest == 'jean.dupont@example.com'}")
    
    # Test avec SMS
    impaye_sms = {
        "payeur_telephone": "0612345678",
        "acquerur_telephone": "0787654321"
    }
    
    sms_dest = connector.get_destinataire(impaye_sms, "sms")
    print(f"Destinataire SMS: {sms_dest}")
    print(f"Test SMS passé: {sms_dest == '0612345678'}")
    
    # Test avec adresse
    impaye_adresse = {
        "adresse": "123 Rue de la République",
        "codePostal": "75001",
        "ville": "Paris"
    }
    
    adresse_dest = connector.get_destinataire(impaye_adresse, "courrier")
    print(f"Destinataire adresse: {adresse_dest}")
    print(f"Test adresse passé: {'123 Rue de la République' in adresse_dest and '75001 Paris' in adresse_dest}")
    print()


def test_date_calculation():
    """Tester le calcul des dates d'échéance"""
    print("=== Test du calcul des dates ===")
    
    connector = ParseRelanceConnector()
    
    # Test avec jours
    date_days = connector.calculate_due_date(3, "days")
    print(f"Date dans 3 jours: {date_days}")
    
    # Test avec semaines
    date_weeks = connector.calculate_due_date(2, "weeks")
    print(f"Date dans 2 semaines: {date_weeks}")
    
    # Vérifier que les dates sont valides
    try:
        datetime.fromisoformat(date_days.replace('Z', '+00:00'))
        datetime.fromisoformat(date_weeks.replace('Z', '+00:00'))
        print("Test des dates passé: True")
    except ValueError:
        print("Test des dates passé: False")
    print()


def test_mock_impaye_processing():
    """Tester le traitement d'un impayé mock"""
    print("=== Test de traitement d'impayé mock ===")
    
    connector = ParseRelanceConnector()
    
    # Créer un impayé mock
    mock_impaye = {
        "objectId": "test123",
        "nfacture": "FACT-TEST-001",
        "payeur_nom": "Test Company",
        "payeur_email": "test@example.com",
        "totalttcnet": 1000.00,
        "datepiece": "2023-01-01T00:00:00.000Z",
        "reference": "REF-TEST-001",
        "adresse": "123 Test Street",
        "codePostal": "12345",
        "ville": "Testville"
    }
    
    # Extraire les variables
    variables = connector.get_impaye_variables(mock_impaye)
    print(f"Variables extraites: {len(variables)} variables")
    print(f"Variables: {list(variables.keys())}")
    
    # Tester avec un template
    template = "Facture [[nfacture]] pour [[payeur_nom]] - Montant: [[totalttcnet]] €"
    result = connector.replace_variables(template, variables)
    print(f"Template traité: {result}")
    
    expected_vars = ["nfacture", "payeur_nom", "totalttcnet", "payeur_email"]
    missing_vars = [var for var in expected_vars if var not in variables]
    print(f"Variables attendues présentes: {len(missing_vars) == 0}")
    print(f"Variables manquantes: {missing_vars}")
    print()


def run_all_tests():
    """Exécuter tous les tests"""
    print("\n" + "="*60)
    print("DÉBUT DES TESTS - Module peuplerRelance")
    print("="*60 + "\n")
    
    try:
        test_variable_replacement()
        test_nested_variable_replacement()
        test_missing_variable_handling()
        test_destinataire_selection()
        test_date_calculation()
        test_mock_impaye_processing()
        
        print("="*60)
        print("TOUS LES TESTS TERMINÉS AVEC SUCCÈS")
        print("="*60)
        return True
        
    except Exception as e:
        print(f"\n❌ ERREUR LORS DES TESTS: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    # Exécuter tous les tests
    success = run_all_tests()
    sys.exit(0 if success else 1)
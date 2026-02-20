#!/usr/bin/env python3
"""
Tests pour la vérification des fichiers de facture
Conforme aux règles de développement du projet
"""

import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Ajouter le chemin des scripts au path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'scripts'))

class TestInvoiceVerification(unittest.TestCase):
    """Tests pour les fonctions de vérification des factures"""
    
    def setUp(self):
        """Configuration initiale pour les tests"""
        # Mock des modules nécessaires
        self.parse_mock = MagicMock()
        self.ftp_mock = MagicMock()
        
        # Configuration des mocks
        sys.modules['parse'] = self.parse_mock
        sys.modules['basic-ftp'] = self.ftp_mock
        
        # Import du module à tester (fichier .cjs)
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "invoiceVerification",
            os.path.join(os.path.dirname(__file__), 'scripts', 'invoiceVerification.cjs')
        )
        invoice_verification_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(invoice_verification_module)
        
        self.checkInvoiceFileExists = invoice_verification_module.checkInvoiceFileExists
        self.generateDownloadLink = invoice_verification_module.generateDownloadLink
        self.logEmailError = invoice_verification_module.logEmailError
        self.verifyAndGenerateDownloadLink = invoice_verification_module.verifyAndGenerateDownloadLink
        
        self.checkInvoiceFileExists = checkInvoiceFileExists
        self.generateDownloadLink = generateDownloadLink
        self.logEmailError = logEmailError
        self.verifyAndGenerateDownloadLink = verifyAndGenerateDownloadLink
    
    def tearDown(self):
        """Nettoyage après les tests"""
        # Supprimer les mocks
        if 'parse' in sys.modules:
            del sys.modules['parse']
        if 'basic-ftp' in sys.modules:
            del sys.modules['basic-ftp']
    
    @patch('invoiceVerification.getFtpConfig')
    @patch('invoiceVerification.connectFtp')
    @patch('invoiceVerification.checkFileExists')
    def test_check_invoice_file_exists_success(self, mock_check, mock_connect, mock_config):
        """Test: Fichier existant - devrait retourner exists=true"""
        # Configuration des mocks
        mock_config.return_value = {
            'host': 'ftp.example.com',
            'port': 21,
            'user': 'user',
            'password': 'pass',
            'basePath': '/invoices'
        }
        
        mock_client = MagicMock()
        mock_connect.return_value = mock_client
        mock_check.return_value = True
        
        # Appel de la fonction
        result = self.checkInvoiceFileExists('INV-2023-001', 'pdf')
        
        # Vérifications
        self.assertTrue(result['exists'])
        self.assertEqual(result['filePath'], '/invoices/INV-2023-001.pdf')
        self.assertIsNone(result['error'])
    
    @patch('invoiceVerification.getFtpConfig')
    @patch('invoiceVerification.connectFtp')
    @patch('invoiceVerification.checkFileExists')
    def test_check_invoice_file_not_found(self, mock_check, mock_connect, mock_config):
        """Test: Fichier inexistant - devrait retourner exists=false"""
        # Configuration des mocks
        mock_config.return_value = {
            'host': 'ftp.example.com',
            'port': 21,
            'user': 'user',
            'password': 'pass',
            'basePath': '/invoices'
        }
        
        mock_client = MagicMock()
        mock_connect.return_value = mock_client
        mock_check.return_value = False
        
        # Appel de la fonction
        result = self.checkInvoiceFileExists('INV-2023-999', 'pdf')
        
        # Vérifications
        self.assertFalse(result['exists'])
        self.assertIsNone(result['filePath'])
        self.assertEqual(result['error'], 'Fichier non trouvé')
    
    @patch('invoiceVerification.Parse.Object')
    def test_generate_download_link_success(self, mock_parse_object):
        """Test: Génération de lien de téléchargement"""
        # Configuration du mock
        mock_token_obj = MagicMock()
        mock_token_obj.save.return_value = None
        mock_token_obj.get.return_value = '2024-12-31T23:59:59.000Z'
        mock_parse_object.return_value = mock_token_obj
        
        # Appel de la fonction
        result = self.generateDownloadLink('/invoices/INV-2023-001.pdf')
        
        # Vérifications
        self.assertIn('downloadLink', result)
        self.assertIn('expiresAt', result)
        self.assertIn('/api/download?token=', result['downloadLink'])
    
    @patch('invoiceVerification.Parse.Object')
    def test_log_email_error_success(self, mock_parse_object):
        """Test: Journalisation d'une erreur d'email"""
        # Configuration du mock
        mock_error_obj = MagicMock()
        mock_error_obj.save.return_value = None
        mock_error_obj.id = 'error123'
        mock_parse_object.return_value = mock_error_obj
        
        # Appel de la fonction
        result = self.logEmailError('INV-2023-001', 'FILE_NOT_FOUND', 'Fichier introuvable')
        
        # Vérifications
        self.assertTrue(result['success'])
        self.assertEqual(result['objectId'], 'error123')
    
    @patch('invoiceVerification.checkInvoiceFileExists')
    @patch('invoiceVerification.generateDownloadLink')
    @patch('invoiceVerification.logEmailError')
    def test_verify_and_generate_link_success(self, mock_log, mock_generate, mock_check):
        """Test: Processus complet avec fichier existant"""
        # Configuration des mocks
        mock_check.return_value = {
            'exists': True,
            'filePath': '/invoices/INV-2023-001.pdf',
            'error': None
        }
        
        mock_generate.return_value = {
            'downloadLink': '/api/download?token=abc123&file=/invoices/INV-2023-001.pdf',
            'expiresAt': '2024-12-31T23:59:59.000Z'
        }
        
        # Appel de la fonction
        result = self.verifyAndGenerateDownloadLink('INV-2023-001', 'pdf')
        
        # Vérifications
        self.assertTrue(result['success'])
        self.assertIn('downloadLink', result)
        self.assertIn('expiresAt', result)
        self.assertIn('filePath', result)
    
    @patch('invoiceVerification.checkInvoiceFileExists')
    @patch('invoiceVerification.logEmailError')
    def test_verify_and_generate_link_file_not_found(self, mock_log, mock_check):
        """Test: Processus complet avec fichier inexistant"""
        # Configuration des mocks
        mock_check.return_value = {
            'exists': False,
            'filePath': None,
            'error': 'Fichier non trouvé'
        }
        
        # Appel de la fonction
        result = self.verifyAndGenerateDownloadLink('INV-2023-999', 'pdf')
        
        # Vérifications
        self.assertFalse(result['success'])
        self.assertEqual(result['error'], 'Fichier non trouvé')
        self.assertEqual(result['errorType'], 'FILE_NOT_FOUND')
        
        # Vérifier que l'erreur a été journalisée
        mock_log.assert_called_once()

if __name__ == '__main__':
    unittest.main()
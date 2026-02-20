#!/usr/bin/env python3
"""
Test script for invoice email functionality
"""

import requests
import json
from datetime import datetime

def test_invoice_email_endpoint():
    """Test the invoice email endpoint"""
    base_url = "http://localhost:5000/script/invoiceEmail"
    
    print("Testing invoice email endpoint...")
    
    # Test 1: Send invoice email with valid invoice
    print("\n1. Testing with valid invoice (INV-2023-001):")
    params = {
        'action': 'sendInvoiceEmail',
        'invoiceId': 'INV-2023-001',
        'recipientEmail': 'test@example.com',
        'recipientName': 'John Doe',
        'emailSubject': 'Your Invoice'
    }
    
    try:
        response = requests.get(base_url, params=params)
        result = response.json()
        
        if response.status_code == 200 and result.get('success'):
            print("✓ Success: Email sent successfully")
            print(f"  Email ID: {result.get('emailId')}")
            print(f"  Download Link: {result.get('downloadLink')}")
            print(f"  Expires At: {result.get('expiresAt')}")
        else:
            print(f"✗ Failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"✗ Error: {str(e)}")
    
    # Test 2: Send invoice email with invalid invoice
    print("\n2. Testing with invalid invoice (INV-2023-999):")
    params['invoiceId'] = 'INV-2023-999'
    
    try:
        response = requests.get(base_url, params=params)
        result = response.json()
        
        if response.status_code == 404 and not result.get('success'):
            print("✓ Success: Correctly handled missing invoice")
            print(f"  Error: {result.get('error')}")
            print(f"  Error Type: {result.get('errorType')}")
        else:
            print(f"✗ Failed: Expected 404 error, got {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error: {str(e)}")
    
    # Test 3: Missing required parameters
    print("\n3. Testing with missing parameters:")
    params = {
        'action': 'sendInvoiceEmail',
        'invoiceId': '',
        'recipientEmail': '',
        'recipientName': ''
    }
    
    try:
        response = requests.get(base_url, params=params)
        result = response.json()
        
        if response.status_code == 400 and not result.get('success'):
            print("✓ Success: Correctly handled missing parameters")
            print(f"  Error: {result.get('error')}")
        else:
            print(f"✗ Failed: Expected 400 error, got {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error: {str(e)}")

def test_invoice_verification_endpoint():
    """Test the invoice verification endpoint"""
    base_url = "http://localhost:5000/script/invoiceVerification"
    
    print("\n\nTesting invoice verification endpoint...")
    
    # Test: Verify and generate link
    print("\n1. Testing verify and generate link:")
    params = {
        'action': 'verifyAndGenerateLink',
        'invoiceId': 'INV-2023-001',
        'fileExtension': 'pdf'
    }
    
    try:
        response = requests.get(base_url, params=params)
        result = response.json()
        
        if response.status_code == 200 and result.get('success'):
            print("✓ Success: Invoice verified and link generated")
            print(f"  Download Link: {result.get('downloadLink')}")
            print(f"  Expires At: {result.get('expiresAt')}")
            print(f"  File Path: {result.get('filePath')}")
        else:
            print(f"✗ Failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"✗ Error: {str(e)}")

if __name__ == "__main__":
    print("=" * 60)
    print("INVOICE EMAIL FUNCTIONALITY TEST")
    print("=" * 60)
    
    test_invoice_email_endpoint()
    test_invoice_verification_endpoint()
    
    print("\n" + "=" * 60)
    print("Test completed!")
    print("=" * 60)
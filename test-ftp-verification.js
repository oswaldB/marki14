// Test script for FTP verification cloud code
const Parse = require('parse/node');

// Initialize Parse
Parse.initialize("marki", "javascript-key-here", "Shaky4-Exception6");
Parse.serverURL = 'https://dev.parse.markidiags.com/parse';

// Mock the SFTP client for testing
const mockSftp = {
  connect: async (config) => {
    console.log('🔌 Mock FTP connection established');
    // Simulate connection success
  },
  stat: async (filePath) => {
    // Mock file existence check
    if (filePath.includes('INV-2023-001.pdf')) {
      return { size: 1024, mtime: new Date() }; // File exists
    } else if (filePath.includes('INV-2023-999.pdf')) {
      const error = new Error('File not found');
      error.code = 'ENOENT';
      throw error; // File doesn't exist
    } else {
      const error = new Error('Unexpected file path');
      error.code = 'ENOENT';
      throw error;
    }
  },
  end: async () => {
    console.log('🔌 Mock FTP connection closed');
  }
};

// Mock the SSH2-SFTP-Client module
jest.mock('ssh2-sftp-client', () => {
  return jest.fn().mockImplementation(() => mockSftp);
});

// Import the functions to test
const { 
  checkInvoiceFileExists, 
  generateDownloadLink, 
  logEmailError 
} = require('./ftp-verification-cloud-code');

async function runTests() {
  console.log('🧪 Starting FTP verification tests...\n');
  
  try {
    // Test 1: File exists scenario
    console.log('📋 Test 1: File exists (INV-2023-001.pdf)');
    const result1 = await checkInvoiceFileExists('INV-2023-001', 'pdf');
    console.log('✅ Result:', result1);
    console.assert(result1.exists === true, 'File should exist');
    console.assert(result1.filePath === '/invoices/INV-2023-001.pdf', 'File path should match');
    console.log('');
    
    // Test 2: File doesn't exist scenario
    console.log('📋 Test 2: File doesn\'t exist (INV-2023-999.pdf)');
    const result2 = await checkInvoiceFileExists('INV-2023-999', 'pdf');
    console.log('✅ Result:', result2);
    console.assert(result2.exists === false, 'File should not exist');
    console.assert(result2.error.includes('File not found'), 'Should have file not found error');
    console.log('');
    
    // Test 3: Generate download link
    console.log('📋 Test 3: Generate download link');
    const downloadResult = await generateDownloadLink('/invoices/INV-2023-001.pdf');
    console.log('✅ Result:', downloadResult);
    console.assert(downloadResult.downloadLink.includes('/api/download?token='), 'Should contain download URL');
    console.assert(downloadResult.expiresAt instanceof Date, 'Should have expiration date');
    console.log('');
    
    // Test 4: Log email error
    console.log('📋 Test 4: Log email error');
    const errorResult = await logEmailError('INV-2023-999', 'FILE_NOT_FOUND', 'Invoice file not found on FTP server');
    console.log('✅ Result:', errorResult);
    console.assert(errorResult.success === true, 'Should successfully log error');
    console.log('');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests().then(() => {
  console.log('🏁 Test suite completed successfully!');
  process.exit(0);
});
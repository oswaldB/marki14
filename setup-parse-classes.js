// Script to create required Parse classes for FTP verification feature
const Parse = require('parse/node');

// Initialize Parse
Parse.initialize("marki", "javascript-key-here", "Shaky4-Exception6");
Parse.serverURL = 'https://dev.parse.markidiags.com/parse';

async function createParseClasses() {
  try {
    console.log('🚀 Starting Parse class setup...');
    
    // Create EmailErrors class
    await createEmailErrorsClass();
    
    // Create DownloadTokens class
    await createDownloadTokensClass();
    
    console.log('✅ All Parse classes created successfully!');
  } catch (error) {
    console.error('❌ Error setting up Parse classes:', error);
    process.exit(1);
  }
}

async function createEmailErrorsClass() {
  console.log('📋 Creating EmailErrors class...');
  
  // Check if class already exists
  const EmailErrors = Parse.Object.extend('EmailErrors');
  const query = new Parse.Query(EmailErrors);
  
  try {
    // Try to count objects in the class
    await query.count({ useMasterKey: true });
    console.log('ℹ️  EmailErrors class already exists, skipping creation');
    return;
  } catch (error) {
    // If class doesn't exist, we'll get an error - that's expected
    if (error.code === Parse.Error.INVALID_CLASS_NAME) {
      // Class doesn't exist, create it by saving a schema
      console.log('🔧 EmailErrors class does not exist, creating...');
      
      // Create a test object to establish the class
      const testError = new EmailErrors();
      testError.set('invoiceId', 'TEST-INVOICE');
      testError.set('errorType', 'TEST_ERROR');
      testError.set('details', 'Test error details');
      testError.set('timestamp', new Date());
      testError.set('status', 'TEST');
      
      try {
        await testError.save(null, { useMasterKey: true });
        console.log('✅ EmailErrors class created successfully');
        
        // Clean up the test object
        await testError.destroy({ useMasterKey: true });
        console.log('🧹 Cleaned up test object');
      } catch (saveError) {
        console.error('❌ Error creating EmailErrors class:', saveError);
        throw saveError;
      }
    } else {
      console.error('❌ Unexpected error checking EmailErrors class:', error);
      throw error;
    }
  }
}

async function createDownloadTokensClass() {
  console.log('📋 Creating DownloadTokens class...');
  
  // Check if class already exists
  const DownloadTokens = Parse.Object.extend('DownloadTokens');
  const query = new Parse.Query(DownloadTokens);
  
  try {
    // Try to count objects in the class
    await query.count({ useMasterKey: true });
    console.log('ℹ️  DownloadTokens class already exists, skipping creation');
    return;
  } catch (error) {
    // If class doesn't exist, we'll get an error - that's expected
    if (error.code === Parse.Error.INVALID_CLASS_NAME) {
      // Class doesn't exist, create it by saving a schema
      console.log('🔧 DownloadTokens class does not exist, creating...');
      
      // Create a test object to establish the class
      const testToken = new DownloadTokens();
      testToken.set('token', 'test-token-12345');
      testToken.set('filePath', '/test/invoice.pdf');
      testToken.set('expiresAt', new Date());
      testToken.set('isUsed', false);
      
      try {
        await testToken.save(null, { useMasterKey: true });
        console.log('✅ DownloadTokens class created successfully');
        
        // Clean up the test object
        await testToken.destroy({ useMasterKey: true });
        console.log('🧹 Cleaned up test object');
      } catch (saveError) {
        console.error('❌ Error creating DownloadTokens class:', saveError);
        throw saveError;
      }
    } else {
      console.error('❌ Unexpected error checking DownloadTokens class:', error);
      throw error;
    }
  }
}

// Run the setup
createParseClasses().then(() => {
  console.log('🎉 Parse class setup completed!');
  process.exit(0);
});
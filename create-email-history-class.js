#!/usr/bin/env node

/**
 * Script to create the EmailHistory class in Parse Server
 * This implements the schema required for tracking email modification history
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'https://dev.parse.markidiags.com';
const APP_ID = 'marki';
const MASTER_KEY = 'Shaky4-Exception6';

// EmailHistory class schema
const emailHistorySchema = {
  "className": "EmailHistory",
  "fields": {
    "objectId": {"type": "String"},
    "createdAt": {"type": "Date"},
    "updatedAt": {"type": "Date"},
    "ACL": {"type": "ACL"},
    "email": {
      "type": "Pointer",
      "targetClass": "EmailPlanifie"  // Assuming this will be the planned email class
    },
    "user": {
      "type": "Pointer",
      "targetClass": "_User"
    },
    "changes": {
      "type": "Object"
    },
    "timestamp": {
      "type": "Date"
    }
  },
  "classLevelPermissions": {
    "ACL": {"*": {"read": true, "write": true}},
    "find": {"*": true},
    "count": {"*": true},
    "get": {"*": true},
    "create": {"*": true},
    "update": {"*": true},
    "delete": {"*": true},
    "addField": {"*": true},
    "protectedFields": {"*": []}
  },
  "indexes": {
    "_id_": {"_id": 1},
    "email_1": {"email": 1},
    "user_1": {"user": 1},
    "timestamp_1": {"timestamp": -1}
  }
};

// Also need to create the EmailPlanifie class if it doesn't exist
const emailPlanifieSchema = {
  "className": "EmailPlanifie",
  "fields": {
    "objectId": {"type": "String"},
    "createdAt": {"type": "Date"},
    "updatedAt": {"type": "Date"},
    "ACL": {"type": "ACL"},
    "subject": {"type": "String"},
    "body": {"type": "String"},
    "recipients": {"type": "Array"},
    "scheduledDate": {"type": "Date"},
    "status": {"type": "String"},
    "createdBy": {
      "type": "Pointer",
      "targetClass": "_User"
    },
    "smtpProfile": {
      "type": "Pointer",
      "targetClass": "SMTPProfile"
    }
  },
  "classLevelPermissions": {
    "ACL": {"*": {"read": true, "write": true}},
    "find": {"*": true},
    "count": {"*": true},
    "get": {"*": true},
    "create": {"*": true},
    "update": {"*": true},
    "delete": {"*": true},
    "addField": {"*": true},
    "protectedFields": {"*": []}
  },
  "indexes": {
    "_id_": {"_id": 1},
    "createdBy_1": {"createdBy": 1},
    "scheduledDate_1": {"scheduledDate": 1},
    "status_1": {"status": 1}
  }
};

async function createClass(schema) {
  try {
    const response = await axios.post(`${BASE_URL}/schemas/${schema.className}`, schema, {
      headers: {
        'X-Parse-Application-Id': APP_ID,
        'X-Parse-Master-Key': MASTER_KEY,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Successfully created class ${schema.className}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400 && 
        error.response.data.error.includes('Class already exists')) {
      console.log(`ℹ️  Class ${schema.className} already exists, skipping creation`);
      return null;
    }
    console.error(`❌ Error creating class ${schema.className}:`, error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Email History class creation...');
  
  try {
    // First create EmailPlanifie class if it doesn't exist
    await createClass(emailPlanifieSchema);
    
    // Then create EmailHistory class
    await createClass(emailHistorySchema);
    
    console.log('🎉 All classes created successfully!');
    console.log('📝 You may need to run ./getParseData.sh to update data-model.md');
    
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  }
}

main();
# Parse Cloud Functions for Sync Configuration

This document describes the Parse Cloud Functions that need to be implemented on the Parse Server to support the sync configuration functionality.

## Required Cloud Functions

### 1. createSyncConfig

**Purpose**: Create a new sync configuration in the SyncConfigs class

**Parameters**:
```javascript
{
  configData: {
    configId: String,
    name: String,
    description: String,
    isActive: Boolean,
    isAuto: Boolean,
    frequency: String,
    dbConfig: Object,
    parseConfig: Object,
    validationRules: Object,
    createdBy: Pointer(_User),
    ACL: Object
  }
}
```

**Implementation**:
```javascript
Parse.Cloud.define('createSyncConfig', async (request) => {
  const { configData } = request.params
  
  const SyncConfig = Parse.Object.extend('SyncConfigs')
  const config = new SyncConfig()
  
  // Set all fields
  for (const [key, value] of Object.entries(configData)) {
    config.set(key, value)
  }
  
  await config.save(null, { useMasterKey: true })
  
  return { success: true, objectId: config.id }
})
```

### 2. updateSyncConfig

**Purpose**: Update an existing sync configuration

**Parameters**:
```javascript
{
  configId: String,
  updateData: {
    name: String,
    description: String,
    isActive: Boolean,
    isAuto: Boolean,
    frequency: String,
    dbConfig: Object,
    parseConfig: Object,
    validationRules: Object
  }
}
```

**Implementation**:
```javascript
Parse.Cloud.define('updateSyncConfig', async (request) => {
  const { configId, updateData } = request.params
  
  const query = new Parse.Query('SyncConfigs')
  query.equalTo('configId', configId)
  
  const config = await query.first({ useMasterKey: true })
  if (!config) {
    throw new Error('Configuration not found')
  }
  
  // Update fields
  for (const [key, value] of Object.entries(updateData)) {
    config.set(key, value)
  }
  
  await config.save(null, { useMasterKey: true })
  
  return { success: true }
})
```

### 3. deleteSyncConfig

**Purpose**: Delete a sync configuration

**Parameters**:
```javascript
{
  configId: String
}
```

**Implementation**:
```javascript
Parse.Cloud.define('deleteSyncConfig', async (request) => {
  const { configId } = request.params
  
  const query = new Parse.Query('SyncConfigs')
  query.equalTo('configId', configId)
  
  const config = await query.first({ useMasterKey: true })
  if (!config) {
    throw new Error('Configuration not found')
  }
  
  await config.destroy({ useMasterKey: true })
  
  return { success: true }
})
```

### 4. saveDBCredentials

**Purpose**: Save database credentials

**Parameters**:
```javascript
{
  credentials: {
    configId: String,
    username: String,
    encryptedPassword: String,
    ACL: Object
  }
}
```

**Implementation**:
```javascript
Parse.Cloud.define('saveDBCredentials', async (request) => {
  const { credentials } = request.params
  
  const DBCredentials = Parse.Object.extend('DBCredentials')
  const creds = new DBCredentials()
  
  // Set all fields
  for (const [key, value] of Object.entries(credentials)) {
    creds.set(key, value)
  }
  
  await creds.save(null, { useMasterKey: true })
  
  return { success: true, objectId: creds.id }
})
```

### 5. deleteDBCredentials

**Purpose**: Delete database credentials

**Parameters**:
```javascript
{
  configId: String
}
```

**Implementation**:
```javascript
Parse.Cloud.define('deleteDBCredentials', async (request) => {
  const { configId } = request.params
  
  const query = new Parse.Query('DBCredentials')
  query.equalTo('configId', configId)
  
  const results = await query.find({ useMasterKey: true })
  
  for (const cred of results) {
    await cred.destroy({ useMasterKey: true })
  }
  
  return { success: true }
})
```

### 6. createSyncLog

**Purpose**: Create a sync log entry

**Parameters**:
```javascript
{
  logData: {
    configId: String,
    status: String,
    details: String,
    recordsProcessed: Number,
    startTime: String,
    endTime: String,
    ACL: Object
  }
}
```

**Implementation**:
```javascript
Parse.Cloud.define('createSyncLog', async (request) => {
  const { logData } = request.params
  
  const SyncLog = Parse.Object.extend('SyncLogs')
  const log = new SyncLog()
  
  // Set all fields
  for (const [key, value] of Object.entries(logData)) {
    log.set(key, value)
  }
  
  await log.save(null, { useMasterKey: true })
  
  return { success: true, objectId: log.id }
})
```

### 7. updateGlobalVariables

**Purpose**: Update global variables with active sync configs

**Parameters**:
```javascript
{
  activeSyncConfigs: Array<String>
}
```

**Implementation**:
```javascript
Parse.Cloud.define('updateGlobalVariables', async (request) => {
  const { activeSyncConfigs } = request.params
  
  const query = new Parse.Query('VariablesGlobales')
  const globalVars = await query.first({ useMasterKey: true })
  
  if (!globalVars) {
    const VariablesGlobales = Parse.Object.extend('VariablesGlobales')
    const newVars = new VariablesGlobales()
    newVars.set('activeSyncConfigs', activeSyncConfigs)
    await newVars.save(null, { useMasterKey: true })
  } else {
    globalVars.set('activeSyncConfigs', activeSyncConfigs)
    await globalVars.save(null, { useMasterKey: true })
  }
  
  return { success: true }
})
```

## Required Parse Classes

### 1. SyncConfigs

**Fields**:
- `configId` (String) - Unique configuration ID
- `name` (String) - Configuration name
- `description` (String) - Optional description
- `isActive` (Boolean) - Active status
- `isAuto` (Boolean) - Automatic sync flag
- `frequency` (String) - Sync frequency
- `dbConfig` (Object) - Database configuration
- `parseConfig` (Object) - Parse mapping configuration
- `validationRules` (Object) - Validation rules
- `createdBy` (Pointer to _User) - User who created the config
- `ACL` (ACL) - Access control

**Class-Level Permissions**:
- `Find`: Require authentication
- `Get`: Require authentication
- `Create`: Require authentication
- `Update`: Require authentication
- `Delete`: Require authentication
- `Add Fields`: Require master key

### 2. DBCredentials

**Fields**:
- `configId` (String) - Reference to SyncConfigs
- `username` (String) - Database username
- `encryptedPassword` (String) - Encrypted password
- `ACL` (ACL) - Access control (restricted to admins)

**Class-Level Permissions**:
- `Find`: Require master key
- `Get`: Require master key
- `Create`: Require master key
- `Update`: Require master key
- `Delete`: Require master key
- `Add Fields`: Require master key

### 3. SyncLogs

**Fields**:
- `configId` (String) - Reference to SyncConfigs
- `status` (String) - "success", "error", "warning", "info"
- `details` (String) - Log details
- `recordsProcessed` (Number) - Number of records processed
- `startTime` (Date) - Start time
- `endTime` (Date) - End time
- `ACL` (ACL) - Access control

**Class-Level Permissions**:
- `Find`: Require authentication
- `Get`: Require authentication
- `Create`: Require authentication
- `Update`: Require authentication
- `Delete`: Require authentication
- `Add Fields`: Require master key

## Deployment Instructions

1. **Create Parse Classes**:
   - Go to Parse Dashboard
   - Create the three classes: `SyncConfigs`, `DBCredentials`, `SyncLogs`
   - Set up the fields and permissions as described above

2. **Deploy Cloud Functions**:
   - Add the cloud functions to your Parse Cloud code
   - Deploy using `parse deploy` or through the dashboard

3. **Set Up ACLs**:
   - Ensure proper ACLs are set for security
   - Restrict `DBCredentials` to admin-only access

4. **Test the Functions**:
   - Test each function individually
   - Verify that the Fastify routes can call these functions successfully

5. **Monitor Logs**:
   - Check Parse Server logs for any errors
   - Monitor the `SyncLogs` class for sync activity

## Security Considerations

1. **SQL Injection**: The Fastify routes already include SQL injection detection
2. **Credential Security**: Passwords are encrypted before storage
3. **Access Control**: Proper ACLs are implemented for all classes
4. **Master Key Usage**: Sensitive operations use the master key
5. **Input Validation**: All inputs are validated before processing

## Error Handling

All cloud functions should include proper error handling:
- Validate input parameters
- Handle database errors gracefully
- Return meaningful error messages
- Log errors for debugging

## Performance Considerations

1. **Indexing**: Add indexes to frequently queried fields
2. **Batch Operations**: Use batch operations where possible
3. **Caching**: Consider caching frequently accessed configurations
4. **Rate Limiting**: Implement rate limiting for API calls

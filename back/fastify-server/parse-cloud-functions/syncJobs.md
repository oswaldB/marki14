# Parse Cloud Jobs for Sync Configuration

This document describes the Parse Cloud Jobs that need to be implemented on the Parse Server to support automatic synchronization.

## Required Cloud Jobs

### 1. runAutoSyncs

**Purpose**: Execute all active automatic sync configurations according to their schedule

**Implementation**:
```javascript
Parse.Cloud.job('runAutoSyncs', async (request) => {
  const { params, headers, log, message } = request
  
  try {
    // Get all active and automatic configurations
    const query = new Parse.Query('SyncConfigs')
    query.equalTo('isActive', true)
    query.equalTo('isAuto', true)
    
    const configs = await query.find({ useMasterKey: true })
    
    if (configs.length === 0) {
      message('No active automatic sync configurations found')
      return
    }
    
    message(`Found ${configs.length} active automatic sync configuration(s)`)
    
    for (const config of configs) {
      try {
        const configId = config.get('configId')
        const configName = config.get('name')
        
        message(`Processing sync configuration: ${configName} (${configId})`)
        
        // Get credentials
        const credentialsQuery = new Parse.Query('DBCredentials')
        credentialsQuery.equalTo('configId', configId)
        const credentials = await credentialsQuery.first({ useMasterKey: true })
        
        if (!credentials) {
          message(`No credentials found for config ${configId}, skipping`)
          continue
        }
        
        // Decrypt password (assuming you have a decrypt function)
        const password = decryptPassword(credentials.get('encryptedPassword'))
        
        // Get database configuration
        const dbConfig = config.get('dbConfig')
        
        // Validate SQL injection
        if (hasSqlInjection(dbConfig.query)) {
          message(`SQL injection detected in config ${configId}, skipping`)
          
          // Create error log
          await createSyncLog(configId, 'error', 'SQL injection detected during automatic sync')
          continue
        }
        
        // Execute the sync query
        message(`Connecting to database: ${dbConfig.host}`)
        
        // In a real implementation, this would:
        // 1. Connect to the external database using dbConfig
        // 2. Execute the query with credentials
        // 3. Process the results
        
        // For simulation purposes, we'll generate random results
        const recordsProcessed = Math.floor(Math.random() * 50) + 1
        
        // Transform data to Parse format
        const parseConfig = config.get('parseConfig')
        const targetClass = parseConfig.targetClass
        
        message(`Transforming ${recordsProcessed} records for Parse class ${targetClass}`)
        
        // Create Parse objects (simulated)
        const parseObjects = []
        for (let i = 0; i < recordsProcessed; i++) {
          const parseObject = new Parse.Object(targetClass)
          parseObject.set('syncSource', configId)
          parseObject.set('syncTimestamp', new Date())
          // Add other fields based on mapping
          parseObjects.push(parseObject)
        }
        
        // Save to Parse
        if (parseObjects.length > 0) {
          message(`Saving ${parseObjects.length} objects to Parse`)
          await Parse.Object.saveAll(parseObjects, { useMasterKey: true })
        }
        
        // Create success log
        await createSyncLog(
          configId, 
          'success', 
          `Automatic sync completed successfully - ${recordsProcessed} records processed`,
          recordsProcessed
        )
        
        message(`Successfully processed ${recordsProcessed} records for config ${configId}`)
        
      } catch (error) {
        message(`Error processing config ${config.get('configId')}: ${error.message}`)
        
        // Create error log
        try {
          await createSyncLog(config.get('configId'), 'error', error.message)
        } catch (logError) {
          message(`Failed to create error log: ${logError.message}`)
        }
      }
    }
    
    message('Automatic sync job completed')
    
  } catch (error) {
    message(`Fatal error in runAutoSyncs job: ${error.message}`)
    throw error
  }
})

// Helper function for SQL injection detection
function hasSqlInjection(query) {
  const sqlKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'EXEC', 'INSERT INTO', 'UPDATE']
  const upperQuery = query.toUpperCase()
  return sqlKeywords.some(keyword => upperQuery.includes(keyword))
}

// Helper function for password decryption
function decryptPassword(encryptedPassword) {
  // Implement proper decryption here
  // This is a placeholder - use proper encryption in production
  return Buffer.from(encryptedPassword, 'base64').toString('utf8')
}

// Helper function to create sync logs
async function createSyncLog(configId, status, details, recordsProcessed = 0) {
  try {
    const SyncLog = Parse.Object.extend('SyncLogs')
    const log = new SyncLog()
    
    log.set('configId', configId)
    log.set('status', status)
    log.set('details', details)
    log.set('recordsProcessed', recordsProcessed)
    log.set('startTime', new Date())
    log.set('endTime', new Date())
    log.set('ACL', {
      '*': { read: false, write: false },
      'role:Admin': { read: true, write: true }
    })
    
    await log.save(null, { useMasterKey: true })
  } catch (error) {
    console.error('Error creating sync log:', error)
  }
}
```

### 2. cleanupOldLogs

**Purpose**: Clean up old sync logs to prevent database bloat

**Implementation**:
```javascript
Parse.Cloud.job('cleanupOldLogs', async (request) => {
  const { params, headers, log, message } = request
  
  try {
    // Default: keep logs for 30 days
    const retentionDays = params.retentionDays || 30
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    
    message(`Cleaning up sync logs older than ${retentionDays} days (before ${cutoffDate.toISOString()})`)
    
    // Query for old logs
    const query = new Parse.Query('SyncLogs')
    query.lessThan('createdAt', cutoffDate)
    
    const oldLogs = await query.find({ useMasterKey: true })
    
    if (oldLogs.length === 0) {
      message('No old logs found for cleanup')
      return
    }
    
    message(`Found ${oldLogs.length} old logs to delete`)
    
    // Delete in batches to avoid timeout
    const batchSize = 50
    for (let i = 0; i < oldLogs.length; i += batchSize) {
      const batch = oldLogs.slice(i, i + batchSize)
      message(`Deleting batch ${i/batchSize + 1} of ${Math.ceil(oldLogs.length/batchSize)}`)
      
      await Parse.Object.destroyAll(batch, { useMasterKey: true })
    }
    
    message(`Successfully deleted ${oldLogs.length} old sync logs`)
    
  } catch (error) {
    message(`Error in cleanupOldLogs job: ${error.message}`)
    throw error
  }
})
```

## Job Scheduling

### 1. runAutoSyncs

**Schedule**: Every hour (or according to business requirements)

**Command**:
```bash
parse jobs:run runAutoSyncs
```

**Cron Example**:
```bash
0 * * * * /usr/local/bin/parse jobs:run runAutoSyncs
```

### 2. cleanupOldLogs

**Schedule**: Daily at 2 AM

**Command**:
```bash
parse jobs:run cleanupOldLogs --retentionDays=30
```

**Cron Example**:
```bash
0 2 * * * /usr/local/bin/parse jobs:run cleanupOldLogs --retentionDays=30
```

## Fastify Integration

To provide a way to manually trigger these jobs from the Fastify API, add these routes:

```javascript
// POST /api/sync-jobs/run-auto-syncs - Manually trigger automatic syncs
export default async function (fastify) {
  fastify.post('/api/sync-jobs/run-auto-syncs', async (request, reply) => {
    try {
      // Call the Parse job via parseRequest
      const result = await parseRequest('runAutoSyncsJob', {})
      
      return {
        success: true,
        message: 'Automatic sync job triggered successfully',
        result: result
      }
    } catch (error) {
      fastify.log.error('Error triggering auto syncs:', error)
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Failed to trigger automatic syncs'
      })
    }
  })
  
  // POST /api/sync-jobs/cleanup-logs - Manually trigger log cleanup
  fastify.post('/api/sync-jobs/cleanup-logs', async (request, reply) => {
    try {
      const { retentionDays = 30 } = request.body
      
      // Call the Parse job via parseRequest
      const result = await parseRequest('cleanupOldLogsJob', { retentionDays })
      
      return {
        success: true,
        message: 'Log cleanup job triggered successfully',
        result: result
      }
    } catch (error) {
      fastify.log.error('Error triggering log cleanup:', error)
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Failed to trigger log cleanup'
      })
    }
  })
}
```

## Additional Cloud Functions for Job Management

### runAutoSyncsJob

**Purpose**: Wrapper function to trigger the runAutoSyncs job

```javascript
Parse.Cloud.define('runAutoSyncsJob', async (request) => {
  // This will queue the job for execution
  await Parse.Cloud.startJob('runAutoSyncs', {})
  return { success: true, message: 'Auto syncs job queued for execution' }
})
```

### cleanupOldLogsJob

**Purpose**: Wrapper function to trigger the cleanupOldLogs job

```javascript
Parse.Cloud.define('cleanupOldLogsJob', async (request) => {
  const { retentionDays = 30 } = request.params
  
  // This will queue the job for execution
  await Parse.Cloud.startJob('cleanupOldLogs', { retentionDays })
  return { success: true, message: 'Log cleanup job queued for execution' }
})
```

## Monitoring and Maintenance

### Job Monitoring

1. **Parse Dashboard**: Monitor job status and execution history
2. **Logs**: Check Parse Server logs for job execution details
3. **Alerts**: Set up alerts for job failures

### Performance Optimization

1. **Batch Processing**: Process configurations in batches for large numbers
2. **Error Handling**: Implement robust error handling and retries
3. **Resource Management**: Monitor resource usage during job execution
4. **Timeout Management**: Set appropriate timeouts for long-running jobs

### Error Recovery

1. **Retry Logic**: Implement retry logic for transient failures
2. **Manual Intervention**: Provide ways to manually retry failed jobs
3. **Notification**: Notify administrators of job failures
4. **Logging**: Maintain detailed logs for troubleshooting

## Security Considerations

1. **Job Authentication**: Ensure jobs are properly authenticated
2. **Access Control**: Restrict job execution to authorized users
3. **Input Validation**: Validate all job parameters
4. **Rate Limiting**: Prevent excessive job execution
5. **Audit Logging**: Log all job executions for audit purposes

## Deployment Checklist

1. **Implement Cloud Jobs**: Add the job definitions to Parse Cloud code
2. **Create Wrapper Functions**: Add the wrapper Cloud Functions
3. **Set Up Scheduling**: Configure cron jobs or scheduled tasks
4. **Test Jobs**: Test each job individually
5. **Monitor Initial Runs**: Closely monitor the first few job executions
6. **Set Up Alerts**: Configure monitoring and alerting
7. **Document Procedures**: Document job management procedures

## Troubleshooting

### Common Issues

1. **Job Timeout**: Increase timeout settings for long-running jobs
2. **Memory Limits**: Optimize memory usage or increase limits
3. **Permission Errors**: Verify proper ACLs and permissions
4. **Connection Issues**: Check database connections and network
5. **Data Consistency**: Implement proper transaction handling

### Debugging Tips

1. **Enable Verbose Logging**: Increase log level for detailed information
2. **Check Parse Logs**: Review Parse Server logs for errors
3. **Test Incrementally**: Test with small datasets first
4. **Monitor Resources**: Watch resource usage during execution
5. **Review Dependencies**: Ensure all dependencies are available

## Future Enhancements

1. **Job Prioritization**: Implement priority-based job execution
2. **Distributed Processing**: Support for distributed job processing
3. **Progress Tracking**: Real-time progress monitoring
4. **Job Chaining**: Support for dependent job execution
5. **Advanced Scheduling**: More sophisticated scheduling options

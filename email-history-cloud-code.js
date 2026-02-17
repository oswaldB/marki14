// Parse Cloud Code for Email History Tracking
// Implements US002 - Consulter l'historique des modifications d'un email planifié

// Import required modules
const Parse = require('parse/node');

// Initialize Parse
Parse.initialize("marki", "javascript-key-here", "Shaky4-Exception6");
Parse.serverURL = 'https://dev.parse.markidiags.com/parse';

/**
 * logEmailModification - Logs modifications to a planned email
 * @param {string} emailId - ID of the Parse.Object of the email
 * @param {Parse.User} user - User who made the modification
 * @param {Object} changes - Object containing the changes made
 * @param {Object} changes.subject - { old: String, new: String }
 * @param {Object} changes.body - { old: String, new: String }
 * @param {Object} changes.recipients - { added: Array<String>, removed: Array<String> }
 * @returns {Promise<Parse.Object>} - Created history object
 */
async function logEmailModification(emailId, user, changes) {
  // Validate parameters
  if (!emailId || !user || !changes) {
    throw new Error('Missing required parameters for logEmailModification');
  }

  // Create the EmailHistory object
  const EmailHistory = Parse.Object.extend('EmailHistory');
  const history = new EmailHistory();

  // Set the email pointer
  const EmailPlanifie = Parse.Object.extend('EmailPlanifie');
  const email = EmailPlanifie.createWithoutData(emailId);
  history.set('email', email);

  // Set the user pointer
  history.set('user', user);

  // Set the changes
  history.set('changes', changes);

  // Set the timestamp (current date/time)
  history.set('timestamp', new Date());

  // Set ACL - only the user and admin can read/write
  const acl = new Parse.ACL();
  acl.setPublicReadAccess(false);
  acl.setPublicWriteAccess(false);
  acl.setReadAccess(user.id, true);
  acl.setWriteAccess(user.id, true);
  // Allow admin access (you might want to add role-based access here)
  acl.setRoleReadAccess('admin', true);
  acl.setRoleWriteAccess('admin', true);
  history.setACL(acl);

  try {
    const result = await history.save(null, { useMasterKey: true });
    console.log(`📝 Email modification logged successfully for email ${emailId}`);
    return result;
  } catch (error) {
    console.error(`❌ Error logging email modification for ${emailId}:`, error);
    throw error;
  }
}

/**
 * fetchEmailHistory - Fetches the modification history for an email
 * @param {string} emailId - ID of the email
 * @param {number} limit - Maximum number of entries to return (default: 20)
 * @returns {Promise<Array<Parse.Object>>} - List of EmailHistory objects
 */
async function fetchEmailHistory(emailId, limit = 20) {
  if (!emailId) {
    throw new Error('emailId is required for fetchEmailHistory');
  }

  const EmailHistory = Parse.Object.extend('EmailHistory');
  const query = new Parse.Query(EmailHistory);

  // Filter by email
  const EmailPlanifie = Parse.Object.extend('EmailPlanifie');
  const email = EmailPlanifie.createWithoutData(emailId);
  query.equalTo('email', email);

  // Include user data
  query.include('user');

  // Sort by timestamp descending (newest first)
  query.descending('timestamp');

  // Limit results
  query.limit(limit);

  try {
    const results = await query.find({ useMasterKey: true });
    console.log(`📋 Found ${results.length} history entries for email ${emailId}`);
    return results;
  } catch (error) {
    console.error(`❌ Error fetching email history for ${emailId}:`, error);
    throw error;
  }
}

/**
 * getDiffForField - Gets the diff for a specific field in a history entry
 * @param {string} historyId - ID of the history entry
 * @param {string} field - Field to compare ('body', 'subject', etc.)
 * @returns {Promise<Object>} - { before: String, after: String, diffHtml: String }
 */
async function getDiffForField(historyId, field) {
  if (!historyId || !field) {
    throw new Error('historyId and field are required for getDiffForField');
  }

  const EmailHistory = Parse.Object.extend('EmailHistory');
  const query = new Parse.Query(EmailHistory);

  try {
    const historyEntry = await query.get(historyId, { useMasterKey: true });
    const changes = historyEntry.get('changes');

    if (!changes || !changes[field]) {
      throw new Error(`No changes found for field '${field}' in history entry ${historyId}`);
    }

    const fieldChanges = changes[field];
    const before = fieldChanges.old || '';
    const after = fieldChanges.new || '';

    // Simple diff generation (for production, use a proper diff library)
    let diffHtml = generateSimpleDiffHtml(before, after);

    return {
      before,
      after,
      diffHtml
    };
  } catch (error) {
    console.error(`❌ Error getting diff for field ${field} in history ${historyId}:`, error);
    throw error;
  }
}

/**
 * generateSimpleDiffHtml - Generates a simple HTML diff (placeholder for real diff algorithm)
 * @param {string} before - Original text
 * @param {string} after - Modified text
 * @returns {string} - HTML with diff markup
 */
function generateSimpleDiffHtml(before, after) {
  // This is a placeholder - in production, use a library like diff-match-patch
  // For now, just highlight the entire after text as new
  const escapedBefore = escapeHtml(before);
  const escapedAfter = escapeHtml(after);

  return `
    <div style="display: flex; width: 100%;">
      <div style="flex: 1; padding: 10px; background-color: #fff0f0; color: #d32f2f;">
        <strong>Avant:</strong><br>
        ${escapedBefore}
      </div>
      <div style="flex: 1; padding: 10px; background-color: #f0fff0; color: #388e3c;">
        <strong>Après:</strong><br>
        ${escapedAfter}
      </div>
    </div>
  `;
}

/**
 * escapeHtml - Escapes HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Export functions for Parse Cloud Code
module.exports = {
  logEmailModification,
  fetchEmailHistory,
  getDiffForField
};

// Register functions with Parse Cloud
Parse.Cloud.define('logEmailModification', async (request) => {
  const { emailId, changes } = request.params;
  const user = request.user;
  
  if (!user) {
    throw new Error('User must be logged in to log email modifications');
  }
  
  return await logEmailModification(emailId, user, changes);
});

Parse.Cloud.define('fetchEmailHistory', async (request) => {
  const { emailId, limit } = request.params;
  return await fetchEmailHistory(emailId, limit);
});

Parse.Cloud.define('getDiffForField', async (request) => {
  const { historyId, field } = request.params;
  return await getDiffForField(historyId, field);
});

console.log('🚀 Email History Cloud Code initialized');
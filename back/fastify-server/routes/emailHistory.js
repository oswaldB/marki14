// Fastify API routes for Email History functionality
// Implements the backend API for US002 - Email modification history

import { parseRequest } from '../utils/parseUtils.js';

/**
 * Get email modification history
 */
export async function getEmailHistory(request, reply) {
  try {
    const { emailId, limit = 20 } = request.query;
    
    if (!emailId) {
      return reply.badRequest('emailId query parameter is required');
    }
    
    // Call Parse Cloud function
    const result = await parseRequest('fetchEmailHistory', { emailId, limit });
    
    // Format the response
    const formattedHistory = result.map(entry => ({
      id: entry.id,
      timestamp: entry.get('timestamp'),
      user: {
        id: entry.get('user')?.id,
        username: entry.get('user')?.get('username'),
        name: entry.get('user')?.get('name') || entry.get('user')?.get('username'),
        // In a real app, you'd have avatar URL here
        avatar: '/assets/default-avatar.png'
      },
      changes: entry.get('changes')
    }));
    
    return {
      success: true,
      data: formattedHistory
    };
    
  } catch (error) {
    request.log.error('Error fetching email history:', error);
    return reply.internalServerError({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get diff for a specific field in a history entry
 */
export async function getFieldDiff(request, reply) {
  try {
    const { historyId, field } = request.params;
    
    if (!historyId || !field) {
      return reply.badRequest('historyId and field parameters are required');
    }
    
    // Call Parse Cloud function
    const result = await parseRequest('getDiffForField', { historyId, field });
    
    return {
      success: true,
      data: result
    };
    
  } catch (error) {
    request.log.error('Error getting field diff:', error);
    return reply.internalServerError({
      success: false,
      error: error.message
    });
  }
}

// Helper function to call Parse Cloud functions
async function parseRequest(functionName, params) {
  // In a real implementation, this would call the Parse Server
  // For now, we'll simulate it
  console.log(`Calling Parse Cloud function ${functionName} with params:`, params);
  
  // Mock response for development
  if (functionName === 'fetchEmailHistory') {
    return [
      {
        id: 'hist1',
        get: (field) => {
          const data = {
            timestamp: new Date().toISOString(),
            user: {
              id: 'user1',
              get: (userField) => userField === 'username' ? 'jdupont' : 'Jean Dupont'
            },
            changes: {
              subject: { old: 'Réunion', new: 'Réunion d\'équipe' },
              recipients: { added: ['manager@entreprise.com'], removed: [] }
            }
          };
          return data[field];
        }
      }
    ];
  } else if (functionName === 'getDiffForField') {
    return {
      before: 'Bonjour,',
      after: 'Bonjour l\'équipe,'
      diffHtml: '<div>Mock diff HTML</div>'
    };
  }
  
  throw new Error('Mock implementation - real Parse Server integration needed');
}
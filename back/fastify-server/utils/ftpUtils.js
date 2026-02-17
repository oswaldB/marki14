// FTP Utility functions for Fastify server
// These functions call the Parse Cloud functions

const Parse = require('parse/node');

// Initialize Parse
Parse.initialize("marki", "javascript-key-here", "Shaky4-Exception6");
Parse.serverURL = 'https://dev.parse.markidiags.com/parse';

/**
 * Get FTP configuration from Parse Server
 * @returns {Promise<Object|null>} FTP configuration or null
 */
async function getFtpConfig() {
  try {
    const result = await Parse.Cloud.run('getFtpConfig');
    return result;
  } catch (error) {
    console.error('Error getting FTP config from Parse:', error);
    throw new Error(`Failed to get FTP config: ${error.message}`);
  }
}

/**
 * Save FTP configuration to Parse Server
 * @param {Object} config - FTP configuration
 * @returns {Promise<Object>} Result object
 */
async function saveFtpConfig(config) {
  try {
    const result = await Parse.Cloud.run('saveFtpConfig', config);
    return result;
  } catch (error) {
    console.error('Error saving FTP config to Parse:', error);
    throw new Error(`Failed to save FTP config: ${error.message}`);
  }
}

/**
 * Test FTP connection
 * @param {Object} config - FTP configuration
 * @returns {Promise<Object>} Result object
 */
async function verifyFtpConnection(config) {
  try {
    const result = await Parse.Cloud.run('verifyFtpConnection', config);
    return result;
  } catch (error) {
    console.error('Error testing FTP connection:', error);
    throw new Error(`Failed to test FTP connection: ${error.message}`);
  }
}

module.exports = {
  getFtpConfig,
  saveFtpConfig,
  verifyFtpConnection
};
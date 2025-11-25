/**
 * Offscreen document script for WebLLM Worker
 * This runs in an offscreen HTML page that can create Web Workers
 */

// Simple logger that only outputs in development mode
const isDev = true; // Set based on environment
const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },
  error: (...args) => {
    if (isDev) console.error(...args);
  }
};

let llmWorker = null;

function initializeWorker(config = {}) {
  // If worker already exists, just send init message to it (for reinit from cache)
  if (llmWorker) {
    logger.log('[Offscreen] Worker already exists, sending init message to existing worker...');
    llmWorker.postMessage({
      type: 'INIT_MODEL',
      payload: config || {}
    });
    return;
  }
  
  logger.log('[Offscreen] Creating LLM worker from offscreen document...');
  // WXT bundles the worker to llm-worker.js in the output
  const workerUrl = chrome.runtime.getURL('llm-worker.js');
  logger.log('[Offscreen] Worker URL:', workerUrl);
  
  try {
    llmWorker = new Worker(
      workerUrl,
      { type: 'module' }
    );
    
    logger.log('[Offscreen] Worker created successfully');

    llmWorker.onmessage = (event) => {
      logger.log('[Offscreen] Message from worker:', event.data);
      chrome.runtime.sendMessage(event.data).catch((err) => {
        logger.log('[Offscreen] Background not available to receive message:', err);
      });
    };
    
    llmWorker.onerror = (error) => {
      logger.error('[Offscreen] Worker error event:', error);
      logger.error('[Offscreen] Error details:', {
        message: error.message,
        filename: error.filename,
        lineno: error.lineno,
        colno: error.colno,
        error: error.error
      });
      chrome.runtime.sendMessage({
        type: 'INIT_ERROR',
        error: error.message || 'Worker error (no message)',
        details: {
          filename: error.filename,
          lineno: error.lineno,
          colno: error.colno
        }
      }).catch(() => {});
    };
    
    llmWorker.postMessage({
      type: 'INIT_MODEL',
      payload: config || {}
    });
    
    logger.log('[Offscreen] Init message sent to worker');
    
  } catch (error) {
    logger.error('[Offscreen] Failed to create worker:', error);
    logger.error('[Offscreen] Error stack:', error.stack);
    chrome.runtime.sendMessage({
      type: 'INIT_ERROR',
      error: error.message || String(error),
      stack: error.stack
    }).catch(() => {});
  }
}

logger.log('Offscreen document loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  logger.log('Offscreen received message:', message);
  
  switch (message.type) {
    case 'INIT_MODEL':
      initializeWorker(message.payload);
      sendResponse({ success: true });
      return true; // Keep channel open
      
    case 'REWRITE_TEXT':
      if (llmWorker) {
        llmWorker.postMessage({
          type: 'REWRITE_TEXT',
          payload: message.payload
        });
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Worker not initialized' });
      }
      return true; // Keep channel open
      
    default:
      // Don't respond to messages not meant for offscreen document
      // Let the background script handle them
      logger.log('[Offscreen] Ignoring message type:', message.type);
      return false; // Don't keep channel open, we're not responding
  }
});


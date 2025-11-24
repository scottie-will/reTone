/**
 * Offscreen document script for WebLLM Worker
 * This runs in an offscreen HTML page that can create Web Workers
 */

let llmWorker = null;

function initializeWorker(config = {}) {
  if (llmWorker) {
    console.log('[Offscreen] Worker already exists');
    return;
  }
  
  console.log('[Offscreen] Creating LLM worker from offscreen document...');
  // WXT bundles the worker to llm-worker.js in the output
  const workerUrl = chrome.runtime.getURL('llm-worker.js');
  console.log('[Offscreen] Worker URL:', workerUrl);
  
  try {
    llmWorker = new Worker(
      workerUrl,
      { type: 'module' }
    );
    
    console.log('[Offscreen] Worker created successfully');
    
    llmWorker.onmessage = (event) => {
      console.log('[Offscreen] Message from worker:', event.data);
      chrome.runtime.sendMessage(event.data).catch((err) => {
        console.log('[Offscreen] Background not available to receive message:', err);
      });
    };
    
    llmWorker.onerror = (error) => {
      console.error('[Offscreen] Worker error event:', error);
      console.error('[Offscreen] Error details:', {
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
    
    console.log('[Offscreen] Init message sent to worker');
    
  } catch (error) {
    console.error('[Offscreen] Failed to create worker:', error);
    console.error('[Offscreen] Error stack:', error.stack);
    chrome.runtime.sendMessage({
      type: 'INIT_ERROR',
      error: error.message || String(error),
      stack: error.stack
    }).catch(() => {});
  }
}

console.log('Offscreen document loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Offscreen received message:', message);
  
  switch (message.type) {
    case 'INIT_MODEL':
      initializeWorker(message.payload);
      sendResponse({ success: true });
      break;
      
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
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
  
  return true;
});


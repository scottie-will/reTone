// Offscreen document script
// This page can create Web Workers (service workers cannot)

let llmWorker = null;

console.log('Offscreen document loaded');

// Listen for messages from background service worker
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

function initializeWorker(config) {
  if (llmWorker) {
    console.log('Worker already exists');
    return;
  }
  
  console.log('Creating LLM worker from offscreen document...');
  
  try {
    llmWorker = new Worker('llm-worker.js', { type: 'module' });
    
    llmWorker.onmessage = (event) => {
      // Forward all worker messages to background
      chrome.runtime.sendMessage(event.data).catch(() => {
        console.log('Background not available to receive message');
      });
    };
    
    llmWorker.onerror = (error) => {
      console.error('Worker error:', error);
      chrome.runtime.sendMessage({
        type: 'INIT_ERROR',
        error: error.message
      }).catch(() => {});
    };
    
    // Send init message to worker
    llmWorker.postMessage({
      type: 'INIT_MODEL',
      payload: config || {}
    });
    
    console.log('Worker created and init message sent');
    
  } catch (error) {
    console.error('Failed to create worker:', error);
    chrome.runtime.sendMessage({
      type: 'INIT_ERROR',
      error: error.message
    }).catch(() => {});
  }
}


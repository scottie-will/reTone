// Background service worker
// Manages extension state, LLM loading, and message routing

let extensionState = {
  enabled: false,
  rewriteMode: 'neutralize',
  behaviorMode: 'manual',
  modelLoaded: false
};

let offscreenDocumentCreated = false;

// Available rewriting modes
const MODES = {
  neutralize: 'Neutralize',
  decringe: 'De-cringe',
  debuzzword: 'De-buzzword',
  dehumblebrag: 'De-humblebrag',
  calm: 'Calm mode',
  facts: 'Just the Facts'
};

// Initialize extension state from storage
chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get(['enabled', 'rewriteMode', 'behaviorMode']);
  extensionState.enabled = stored.enabled || false;
  extensionState.rewriteMode = stored.rewriteMode || 'neutralize';
  extensionState.behaviorMode = stored.behaviorMode || 'manual';
  console.log('Extension installed, state:', extensionState);
});

// Load state on startup
chrome.runtime.onStartup.addListener(async () => {
  const stored = await chrome.storage.sync.get(['enabled', 'rewriteMode', 'behaviorMode']);
  extensionState.enabled = stored.enabled || false;
  extensionState.rewriteMode = stored.rewriteMode || 'neutralize';
  extensionState.behaviorMode = stored.behaviorMode || 'manual';
  console.log('Extension started, state:', extensionState);
});

// Create offscreen document for Web Worker
async function setupOffscreenDocument() {
  if (offscreenDocumentCreated) {
    console.log('Offscreen document already exists');
    return;
  }
  
  // Check if offscreen document already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
  
  if (existingContexts.length > 0) {
    offscreenDocumentCreated = true;
    console.log('Offscreen document already exists');
    return;
  }
  
  console.log('Creating offscreen document...');
  
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['WORKERS'],
      justification: 'Run WebLLM in Web Worker for local text rewriting'
    });
    
    offscreenDocumentCreated = true;
    console.log('Offscreen document created');
  } catch (error) {
    console.error('Failed to create offscreen document:', error);
    throw error;
  }
}

// Handle messages from offscreen document (worker messages forwarded)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Check if message is from offscreen document
  if (sender.url && sender.url.includes('offscreen.html')) {
    const { type, ...data } = message;
    console.log('Message from offscreen:', type, data);
    
    switch (type) {
      case 'INIT_PROGRESS':
        notifyPopups({ type: 'INIT_PROGRESS', progress: data.progress, percent: data.percent });
        break;
        
      case 'MODEL_INITIALIZED':
        if (data.success) {
          extensionState.modelLoaded = true;
          console.log('Model initialized successfully');
          notifyPopups({ type: 'STATE_UPDATED', state: extensionState });
        } else {
          console.error('Model initialization failed:', data.error);
          notifyPopups({ type: 'INIT_ERROR', error: data.error });
        }
        break;
        
      case 'REWRITE_COMPLETE':
        // Forward to popup or content script
        console.log('Rewrite complete:', data);
        notifyPopups({ type: 'REWRITE_COMPLETE', ...data });
        // TODO: Also forward to content script if needed
        break;
        
      case 'INIT_ERROR':
        console.error('Init error from offscreen:', data.error);
        notifyPopups({ type: 'INIT_ERROR', error: data.error });
        break;
    }
  }
});

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  switch (message.type) {
    case 'GET_STATE':
      sendResponse(extensionState);
      break;

    case 'INIT_MODEL':
      setupOffscreenDocument()
        .then(() => {
          // Send init message to offscreen document
          return chrome.runtime.sendMessage({ type: 'INIT_MODEL', payload: {} });
        })
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error('Failed to initialize:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep channel open for async response

    case 'SET_ENABLED':
      extensionState.enabled = message.enabled;
      chrome.storage.sync.set({ enabled: message.enabled });
      notifyContentScripts({ type: 'STATE_CHANGED', state: extensionState });
      sendResponse({ success: true });
      break;

    case 'SET_REWRITE_MODE':
      if (MODES[message.mode]) {
        extensionState.rewriteMode = message.mode;
        chrome.storage.sync.set({ rewriteMode: message.mode });
        notifyContentScripts({ type: 'STATE_CHANGED', state: extensionState });
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Invalid mode' });
      }
      break;

    case 'SET_BEHAVIOR_MODE':
      if (message.behavior === 'manual' || message.behavior === 'auto') {
        extensionState.behaviorMode = message.behavior;
        chrome.storage.sync.set({ behaviorMode: message.behavior });
        notifyContentScripts({ type: 'STATE_CHANGED', state: extensionState });
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Invalid behavior mode' });
      }
      break;

    case 'REWRITE_TEXT':
      console.log('Background handling REWRITE_TEXT:', message);
      if (!extensionState.modelLoaded) {
        sendResponse({ success: false, error: 'Model not loaded' });
      } else {
        // Forward to offscreen document
        const payload = {
          text: message.text,
          mode: message.mode || extensionState.rewriteMode,
          requestId: message.requestId
        };
        console.log('Forwarding to offscreen with payload:', payload);
        
        chrome.runtime.sendMessage({
          type: 'REWRITE_TEXT',
          payload: payload
        }).then(() => {
          sendResponse({ success: true });
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
      }
      return true; // Keep channel open for async response

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }

  return true; // Keep message channel open for async response
});

// Notify popup windows
function notifyPopups(message) {
  chrome.runtime.sendMessage(message).catch(() => {
    // Popup might not be open
  });
}

// Notify all content scripts of state changes
async function notifyContentScripts(message) {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.url?.startsWith('http')) {
      chrome.tabs.sendMessage(tab.id, message).catch(() => {
        // Ignore errors for tabs without content script
      });
    }
  }
}


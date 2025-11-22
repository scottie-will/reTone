// Background service worker
// Manages extension state, LLM loading, and message routing

let extensionState = {
  enabled: false,
  mode: 'neutralize',
  modelLoaded: false
};

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
  const stored = await chrome.storage.sync.get(['enabled', 'mode']);
  extensionState.enabled = stored.enabled || false;
  extensionState.mode = stored.mode || 'neutralize';
  console.log('Extension installed, state:', extensionState);
});

// Load state on startup
chrome.runtime.onStartup.addListener(async () => {
  const stored = await chrome.storage.sync.get(['enabled', 'mode']);
  extensionState.enabled = stored.enabled || false;
  extensionState.mode = stored.mode || 'neutralize';
  console.log('Extension started, state:', extensionState);
});

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  switch (message.type) {
    case 'GET_STATE':
      sendResponse(extensionState);
      break;

    case 'SET_ENABLED':
      extensionState.enabled = message.enabled;
      chrome.storage.sync.set({ enabled: message.enabled });
      // Notify all content scripts
      notifyContentScripts({ type: 'STATE_CHANGED', state: extensionState });
      sendResponse({ success: true });
      break;

    case 'SET_MODE':
      if (MODES[message.mode]) {
        extensionState.mode = message.mode;
        chrome.storage.sync.set({ mode: message.mode });
        // Notify all content scripts
        notifyContentScripts({ type: 'STATE_CHANGED', state: extensionState });
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Invalid mode' });
      }
      break;

    case 'REWRITE_TEXT':
      // TODO: Send to LLM worker for processing
      // For now, just echo back
      sendResponse({ 
        success: false, 
        error: 'LLM not yet implemented',
        originalText: message.text 
      });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }

  return true; // Keep message channel open for async response
});

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


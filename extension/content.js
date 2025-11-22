// Content script
// Injected into Reddit and LinkedIn pages to rewrite text

console.log('Social Media Rewriter content script loaded');

let extensionState = {
  enabled: false,
  mode: 'neutralize'
};

// Get initial state from background
chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
  if (response) {
    extensionState = response;
    console.log('Initial state:', extensionState);
    if (extensionState.enabled) {
      startRewriting();
    }
  }
});

// Listen for state changes from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STATE_CHANGED') {
    console.log('State changed:', message.state);
    extensionState = message.state;
    
    if (extensionState.enabled) {
      startRewriting();
    } else {
      stopRewriting();
    }
  }
});

let observer = null;

function startRewriting() {
  console.log('Starting rewriting in mode:', extensionState.mode);
  
  // TODO: Implement DOM scanning and rewriting
  // For now, just log that we're active
  
  // Example: Add a subtle indicator that extension is active
  addActiveIndicator();
}

function stopRewriting() {
  console.log('Stopping rewriting');
  
  // TODO: Stop DOM scanning and revert changes if needed
  
  removeActiveIndicator();
}

// Add a subtle indicator that extension is active
function addActiveIndicator() {
  if (document.getElementById('rewriter-indicator')) return;
  
  const indicator = document.createElement('div');
  indicator.id = 'rewriter-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 8px 12px;
    background: rgba(0, 123, 255, 0.9);
    color: white;
    border-radius: 4px;
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  indicator.textContent = `Rewriter Active: ${extensionState.mode}`;
  document.body.appendChild(indicator);
}

function removeActiveIndicator() {
  const indicator = document.getElementById('rewriter-indicator');
  if (indicator) {
    indicator.remove();
  }
}

// TODO: Implement these core functions
function scanDOM() {
  // Extract text nodes from posts/comments
}

function rewriteNode(node, originalText) {
  // Send text to background for LLM processing
  // Replace node content with rewritten version
}

function revertChanges() {
  // Restore original text
}


// Popup UI logic
// Manages the extension's popup interface

const initButton = document.getElementById('initButton');
const enableToggle = document.getElementById('enableToggle');
const rewriteModeSelect = document.getElementById('rewriteModeSelect');
const behaviorModeSelect = document.getElementById('behaviorModeSelect');
const statusDiv = document.getElementById('status');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const testSection = document.getElementById('testSection');
const testInput = document.getElementById('testInput');
const testButton = document.getElementById('testButton');
const testOutput = document.getElementById('testOutput');

// Load current state
chrome.runtime.sendMessage({ type: 'GET_STATE' }, (state) => {
  if (state) {
    updateUI(state);
  }
});

// Listen for state updates from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'STATE_UPDATED') {
    updateUI(message.state);
  } else if (message.type === 'INIT_PROGRESS') {
    updateProgress(message.progress, message.percent);
  } else if (message.type === 'REWRITE_COMPLETE') {
    handleRewriteComplete(message);
  }
});

function handleRewriteComplete(data) {
  if (data.requestId === window.pendingRewriteRequest) {
    testButton.disabled = false;
    testButton.textContent = 'Test Rewrite';
    
    if (data.success) {
      testOutput.style.display = 'block';
      testOutput.textContent = data.rewrittenText;
    } else {
      alert('Rewrite failed: ' + data.error);
    }
    
    window.pendingRewriteRequest = null;
  }
}

// Initialize model button
initButton.addEventListener('click', () => {
  initButton.disabled = true;
  initButton.textContent = 'Initializing...';
  progressContainer.style.display = 'block';
  statusDiv.className = 'status loading';
  statusDiv.textContent = 'Starting initialization...';
  
  chrome.runtime.sendMessage({ type: 'INIT_MODEL' }, (response) => {
    if (response && !response.success) {
      initButton.disabled = false;
      initButton.textContent = 'Initialize Model';
      progressContainer.style.display = 'none';
      statusDiv.className = 'status error';
      statusDiv.textContent = `Error: ${response.error}`;
    }
  });
});

// Handle toggle changes
enableToggle.addEventListener('change', () => {
  const enabled = enableToggle.checked;
  
  chrome.runtime.sendMessage(
    { type: 'SET_ENABLED', enabled },
    (response) => {
      if (response && response.success) {
        updateStatusText();
      }
    }
  );
});

// Handle rewrite mode changes
rewriteModeSelect.addEventListener('change', () => {
  const mode = rewriteModeSelect.value;
  
  chrome.runtime.sendMessage(
    { type: 'SET_REWRITE_MODE', mode },
    (response) => {
      if (response && response.success) {
        updateStatusText();
      }
    }
  );
});

// Handle behavior mode changes
behaviorModeSelect.addEventListener('change', () => {
  const behavior = behaviorModeSelect.value;
  
  chrome.runtime.sendMessage(
    { type: 'SET_BEHAVIOR_MODE', behavior },
    (response) => {
      if (response && response.success) {
        updateStatusText();
      }
    }
  );
});

// Handle test rewrite button
testButton.addEventListener('click', () => {
  const text = testInput.value.trim();
  
  if (!text) {
    alert('Please enter some text to test');
    return;
  }
  
  testButton.disabled = true;
  testButton.textContent = 'Rewriting...';
  testOutput.style.display = 'none';
  
  const requestId = Date.now().toString();
  const mode = rewriteModeSelect.value;
  
  // Store request to handle response
  window.pendingRewriteRequest = requestId;
  
  chrome.runtime.sendMessage(
    { 
      type: 'REWRITE_TEXT',
      text: text,
      mode: mode,
      requestId: requestId
    },
    (response) => {
      if (!response || !response.success) {
        testButton.disabled = false;
        testButton.textContent = 'Test Rewrite';
        alert('Failed to send rewrite request: ' + (response?.error || 'Unknown error'));
      }
    }
  );
});

function updateUI(state) {
  // Update model initialization state
  if (state.modelLoaded) {
    initButton.textContent = 'Model Ready';
    initButton.disabled = true;
    progressContainer.style.display = 'none';
    
    // Enable controls
    enableToggle.disabled = false;
    rewriteModeSelect.disabled = false;
    behaviorModeSelect.disabled = false;
    
    // Show test section
    testSection.style.display = 'block';
  } else {
    initButton.textContent = 'Initialize Model';
    initButton.disabled = false;
    
    // Disable controls
    enableToggle.disabled = true;
    rewriteModeSelect.disabled = true;
    behaviorModeSelect.disabled = true;
    
    // Hide test section
    testSection.style.display = 'none';
  }
  
  // Update values
  enableToggle.checked = state.enabled;
  rewriteModeSelect.value = state.rewriteMode || 'neutralize';
  behaviorModeSelect.value = state.behaviorMode || 'manual';
  
  updateStatusText();
}

function updateProgress(text, percent) {
  const percentValue = Math.round((percent || 0) * 100);
  progressBar.style.width = `${percentValue}%`;
  progressText.textContent = text || `${percentValue}%`;
  statusDiv.textContent = text || 'Loading model...';
}

function updateStatusText() {
  const state = {
    modelLoaded: initButton.textContent === 'Model Ready',
    enabled: enableToggle.checked,
    rewriteMode: rewriteModeSelect.value,
    behaviorMode: behaviorModeSelect.value
  };
  
  if (!state.modelLoaded) {
    statusDiv.className = 'status';
    statusDiv.textContent = 'Model not initialized';
  } else if (state.enabled) {
    statusDiv.className = 'status active';
    const mode = getModeLabel(state.rewriteMode);
    const behavior = state.behaviorMode === 'auto' ? 'Auto' : 'Manual';
    statusDiv.textContent = `Active: ${mode} (${behavior})`;
  } else {
    statusDiv.className = 'status';
    statusDiv.textContent = 'Model ready - toggle to enable';
  }
}

function getModeLabel(mode) {
  const labels = {
    neutralize: 'Neutralize',
    decringe: 'De-cringe',
    debuzzword: 'De-buzzword',
    dehumblebrag: 'De-humblebrag',
    calm: 'Calm mode',
    facts: 'Just the Facts'
  };
  return labels[mode] || mode;
}


// Popup UI logic
// Manages the extension's popup interface

const enableToggle = document.getElementById('enableToggle');
const modeSelect = document.getElementById('modeSelect');
const statusDiv = document.getElementById('status');

// Load current state
chrome.runtime.sendMessage({ type: 'GET_STATE' }, (state) => {
  if (state) {
    enableToggle.checked = state.enabled;
    modeSelect.value = state.mode;
    modeSelect.disabled = !state.enabled;
    updateStatus(state);
  }
});

// Handle toggle changes
enableToggle.addEventListener('change', () => {
  const enabled = enableToggle.checked;
  
  chrome.runtime.sendMessage(
    { type: 'SET_ENABLED', enabled },
    (response) => {
      if (response.success) {
        modeSelect.disabled = !enabled;
        updateStatus({ enabled, mode: modeSelect.value });
      }
    }
  );
});

// Handle mode changes
modeSelect.addEventListener('change', () => {
  const mode = modeSelect.value;
  
  chrome.runtime.sendMessage(
    { type: 'SET_MODE', mode },
    (response) => {
      if (response.success) {
        updateStatus({ enabled: enableToggle.checked, mode });
      }
    }
  );
});

function updateStatus(state) {
  if (state.enabled) {
    statusDiv.textContent = `Active: ${getModeLabel(state.mode)}`;
    statusDiv.className = 'status active';
  } else {
    statusDiv.textContent = 'Extension disabled';
    statusDiv.className = 'status';
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


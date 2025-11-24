import { defineBackground } from 'wxt/sandbox';
import { onMessage, broadcastToAllTabs } from '@/shared/utils/messaging';
import { getExtensionState, saveExtensionState } from '@/shared/utils/storage';
import type { ExtensionState, MessageToBackground } from '@/shared/types/messages';
import { DEFAULT_STATE } from '@/shared/constants/config';

let extensionState: ExtensionState = { ...DEFAULT_STATE };
let offscreenDocumentCreated = false;

console.log('Background service worker initialized');

// Load state immediately (service worker can wake up at any time)
(async () => {
  extensionState = await getExtensionState();
  console.log('State loaded from storage:', extensionState);
})();

// Initialize extension state from storage on install
chrome.runtime.onInstalled.addListener(async () => {
  extensionState = await getExtensionState();
  console.log('Extension installed, state:', extensionState);
});

// Load state on startup
chrome.runtime.onStartup.addListener(async () => {
  extensionState = await getExtensionState();
  console.log('Extension started, state:', extensionState);
});

/**
 * Create offscreen document for Web Worker
 */
async function setupOffscreenDocument(): Promise<void> {
  console.log('[DEBUG] setupOffscreenDocument called');
  
  if (offscreenDocumentCreated) {
    console.log('[DEBUG] Offscreen document flag already set to true');
    return;
  }
  
  // Check if offscreen document already exists
  console.log('[DEBUG] Checking for existing offscreen contexts...');
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT' as chrome.runtime.ContextType]
  });
  
  console.log('[DEBUG] Existing contexts:', existingContexts);
  
  if (existingContexts.length > 0) {
    offscreenDocumentCreated = true;
    console.log('[DEBUG] Offscreen document already exists in contexts');
    return;
  }
  
  console.log('[DEBUG] No existing offscreen document, creating new one...');
  
  try {
    const url = 'offscreen.html';
    console.log(`[DEBUG] Attempting to create offscreen document with URL: ${url}`);
    console.log('[DEBUG] Extension base URL:', chrome.runtime.getURL(''));
    console.log('[DEBUG] Full offscreen URL:', chrome.runtime.getURL(url));
    
    await chrome.offscreen.createDocument({
      url: url,
      reasons: ['WORKERS' as chrome.offscreen.Reason],
      justification: 'Run WebLLM in Web Worker for local text rewriting'
    });
    
    offscreenDocumentCreated = true;
    console.log(`[DEBUG] ✓ SUCCESS! Offscreen document created`);
    
  } catch (error) {
    console.error(`[DEBUG] ✗ FAILED to create offscreen document:`, error);
    console.error(`[DEBUG] Error type:`, typeof error);
    console.error(`[DEBUG] Error message:`, error instanceof Error ? error.message : String(error));
    console.error(`[DEBUG] Error stack:`, error instanceof Error ? error.stack : 'No stack');
    console.error(`[DEBUG] Error keys:`, Object.keys(error as any));
    console.error(`[DEBUG] Full error:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
}

/**
 * Handle messages from offscreen document
 */
chrome.runtime.onMessage.addListener((message, sender) => {
  // Check if message is from offscreen document
  if (sender.url && sender.url.includes('offscreen.html')) {
    const { type, ...data } = message;
    console.log('Message from offscreen:', type, data);
    
    switch (type) {
      case 'INIT_PROGRESS':
        // Forward progress updates to popup
        notifyPopups({ type: 'INIT_PROGRESS', progress: data.progress, percent: data.percent });
        break;
        
      case 'MODEL_INITIALIZED':
        (async () => {
          if (data.success) {
            extensionState.modelLoaded = true;
            await saveExtensionState({ modelLoaded: true });
            if (data.cached) {
              console.log('✓ Model loaded from cache (already downloaded)');
            } else {
              console.log('✓ Model initialized and downloaded successfully');
            }
            console.log('✓ State saved to storage:', extensionState);
            notifyPopups({ type: 'STATE_UPDATED', state: extensionState });
          } else {
            console.error('Model initialization failed:', data.error);
            notifyPopups({ type: 'INIT_ERROR', error: data.error });
          }
        })();
        break;
        
      case 'REWRITE_COMPLETE':
        // Forward to content scripts
        console.log('Rewrite complete:', data);
        broadcastToAllTabs({ 
          type: 'REWRITE_COMPLETE', 
          requestId: data.requestId,
          rewrittenText: data.rewrittenText 
        });
        break;
        
      case 'INIT_ERROR':
        console.error('Init error from offscreen:', data.error);
        console.error('Full error details:', data);
        notifyPopups({ type: 'INIT_ERROR', error: data.error, details: data.details });
        break;
    }
  }
});

/**
 * Main message handler
 */
onMessage(async (message: MessageToBackground) => {
  console.log('Background received message:', message);

  switch (message.type) {
    case 'GET_STATE':
      // Always fetch fresh state from storage to avoid race conditions
      extensionState = await getExtensionState();
      console.log('GET_STATE returning:', extensionState);
      return extensionState;

    case 'INIT_MODEL':
      await setupOffscreenDocument();
      // Send init message to offscreen document
      await chrome.runtime.sendMessage({ type: 'INIT_MODEL', payload: {} });
      return { success: true };

    case 'SET_ENABLED':
      extensionState.enabled = message.enabled;
      await saveExtensionState({ enabled: message.enabled });
      await broadcastToAllTabs({ type: 'STATE_CHANGED', state: extensionState });
      return { success: true };

    case 'SET_REWRITE_MODE':
      extensionState.rewriteMode = message.mode;
      await saveExtensionState({ rewriteMode: message.mode });
      await broadcastToAllTabs({ type: 'STATE_CHANGED', state: extensionState });
      return { success: true };

    case 'SET_BEHAVIOR_MODE':
      extensionState.behaviorMode = message.behavior;
      await saveExtensionState({ behaviorMode: message.behavior });
      await broadcastToAllTabs({ type: 'STATE_CHANGED', state: extensionState });
      return { success: true };

    case 'REWRITE_TEXT':
      if (!extensionState.modelLoaded) {
        throw new Error('Model not loaded');
      }
      
      // Forward to offscreen document
      const payload = {
        text: message.text,
        mode: message.mode || extensionState.rewriteMode,
        requestId: message.requestId
      };
      
      console.log('Forwarding to offscreen with payload:', payload);
      await chrome.runtime.sendMessage({
        type: 'REWRITE_TEXT',
        payload: payload
      });
      
      return { success: true };

    default:
      throw new Error('Unknown message type');
  }
});

/**
 * Notify popup windows
 */
function notifyPopups(message: any): void {
  chrome.runtime.sendMessage(message).catch(() => {
    // Popup might not be open
  });
}

export default defineBackground(() => {
  console.log('Background script initialized');
});


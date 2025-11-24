import { defineBackground } from 'wxt/sandbox';
import { broadcastToAllTabs } from '@/shared/utils/messaging';
import { getExtensionState, saveExtensionState } from '@/shared/utils/storage';
import type { ExtensionState } from '@/shared/types/messages';
import { DEFAULT_STATE } from '@/shared/constants/config';

let extensionState: ExtensionState = { ...DEFAULT_STATE };
let offscreenDocumentCreated = false;
let creatingOffscreenDocument = false; // Lock to prevent concurrent creation

console.log('Background service worker initialized');

/**
 * Update extension icon based on enabled state
 */
async function updateIcon(enabled: boolean): Promise<void> {
  try {
    const iconPath = enabled ? '/icons/Logo128.png' : '/icons/Logo_inactive128.png';
    
    await chrome.action.setIcon({
      path: iconPath
    });
    console.log(`[ICON] Updated to ${enabled ? 'active' : 'inactive'} icon`);
  } catch (error: any) {
    // Ignore error in dev environment (WXT's fake browser doesn't implement this)
    if (!error?.message?.includes('not implemented')) {
      console.error('[ICON] Failed to update icon:', error);
      console.error('[ICON] Try checking if icons exist and are valid PNGs');
    }
  }
}

// Function to check and restore state
async function checkAndRestoreState() {
  console.log('[STATE] Checking and restoring state...');
  extensionState = await getExtensionState();
  console.log('[STATE] Loaded from storage:', extensionState);
  
  // Update icon based on enabled state
  await updateIcon(extensionState.enabled);
  
  // If model was loaded but offscreen document doesn't exist, recreate it and reinitialize
  // (When service worker restarts, offscreen document is destroyed, but model cache persists in IndexedDB)
  if (extensionState.modelLoaded) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT' as chrome.runtime.ContextType]
    });
    
    console.log('[STATE] Model was marked as loaded, checking offscreen document...');
    console.log('[STATE] Existing contexts:', contexts.length);
    
    if (contexts.length === 0) {
      console.log('[STATE] ⚠ Model was loaded but offscreen document destroyed.');
      console.log('[STATE] Auto-restoring: Creating offscreen document and reinitializing from cache...');
      try {
        await setupOffscreenDocument();
        // Give offscreen document a moment to load
        await new Promise(resolve => setTimeout(resolve, 100));
        // Reinitialize model from cache (should be instant)
        await chrome.runtime.sendMessage({ type: 'INIT_MODEL', payload: {} });
        console.log('[STATE] ✓ Offscreen document recreated and model reinitialized from cache');
      } catch (error) {
        console.error('[STATE] Failed to restore offscreen document:', error);
        // Only reset state if we can't recreate the document
        extensionState.modelLoaded = false;
        await saveExtensionState({ modelLoaded: false });
      }
    } else {
      console.log('[STATE] ✓ Offscreen document still exists, model accessible');
    }
  } else {
    console.log('[STATE] Model not loaded, user needs to initialize');
  }
}

// Load state immediately when script first runs
checkAndRestoreState();

// Initialize extension state from storage on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[LIFECYCLE] Extension installed');
  await checkAndRestoreState();
});

// Load state on startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('[LIFECYCLE] Chrome started');
  await checkAndRestoreState();
});

/**
 * Create offscreen document for Web Worker
 */
async function setupOffscreenDocument(): Promise<void> {
  console.log('[DEBUG] setupOffscreenDocument called');
  
  // If already creating, wait a bit and return
  if (creatingOffscreenDocument) {
    console.log('[DEBUG] Already creating offscreen document, waiting...');
    await new Promise(resolve => setTimeout(resolve, 100));
    return;
  }
  
  try {
    creatingOffscreenDocument = true;
    
    // Check if offscreen document already exists
    console.log('[DEBUG] Checking for existing offscreen document...');
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT' as chrome.runtime.ContextType]
    });
    
    console.log('[DEBUG] Existing contexts:', existingContexts.length);
    
    if (existingContexts.length > 0) {
      offscreenDocumentCreated = true;
      console.log('[DEBUG] ✓ Offscreen document already exists');
      return;
    }
    
    console.log('[DEBUG] No existing offscreen document, creating new one...');
    
    const url = 'offscreen.html';
    console.log('[DEBUG] Full offscreen URL:', chrome.runtime.getURL(url));
    
    await chrome.offscreen.createDocument({
      url: url,
      reasons: ['WORKERS' as chrome.offscreen.Reason],
      justification: 'Run WebLLM in Web Worker for local text rewriting'
    });
    
    offscreenDocumentCreated = true;
    console.log('[DEBUG] ✓ Offscreen document created successfully');
    
  } catch (error) {
    // If error is "already exists", that's actually fine
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes('Only a single offscreen document')) {
      console.log('[DEBUG] ✓ Offscreen document already exists (caught creation race)');
      offscreenDocumentCreated = true;
      return;
    }
    
    // Otherwise, it's a real error
    console.error('[DEBUG] ✗ Failed to create offscreen document:', error);
    throw error;
  } finally {
    creatingOffscreenDocument = false;
  }
}

/**
 * Unified message handler for all message types
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message, 'from:', sender.url || 'extension');
  
  // Handle messages from offscreen document
  if (sender.url && sender.url.includes('offscreen.html')) {
    const { type, ...data } = message;
    
    switch (type) {
      case 'INIT_PROGRESS':
        notifyPopups({ type: 'INIT_PROGRESS', progress: data.progress, percent: data.percent });
        sendResponse({ success: true });
        return;
        
      case 'MODEL_INITIALIZED':
        (async () => {
          if (data.success) {
            extensionState.modelLoaded = true;
            await saveExtensionState({ modelLoaded: true });
            
            // Verify it was saved
            const verification = await chrome.storage.local.get('modelLoaded');
            console.log('[VERIFY] Storage after save:', verification);
            
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
        sendResponse({ success: true });
        return;
        
      case 'REWRITE_COMPLETE':
        console.log('Rewrite complete:', data);
        broadcastToAllTabs({ 
          type: 'REWRITE_COMPLETE', 
          requestId: data.requestId,
          rewrittenText: data.rewrittenText 
        });
        sendResponse({ success: true });
        return;
        
      case 'INIT_ERROR':
        console.error('Init error from offscreen:', data.error);
        console.error('Full error details:', data);
        notifyPopups({ type: 'INIT_ERROR', error: data.error, details: data.details });
        sendResponse({ success: true });
        return;
    }
  }
  
  // Handle messages from popup/content scripts
  (async () => {
    try {
      const { type } = message;
      
      switch (type) {
        case 'GET_STATE':
          // Always load fresh from storage
          extensionState = await getExtensionState();
          console.log('[GET_STATE] Fresh state from storage:', extensionState);
          
          // If model was loaded, check if offscreen document exists and restore if needed
          if (extensionState.modelLoaded) {
            const contexts = await chrome.runtime.getContexts({
              contextTypes: ['OFFSCREEN_DOCUMENT' as chrome.runtime.ContextType]
            });
            
            console.log('[GET_STATE] modelLoaded=true, checking offscreen contexts:', contexts.length);
            
            if (contexts.length === 0) {
              console.log('[GET_STATE] Offscreen document missing, auto-restoring...');
              try {
                await setupOffscreenDocument();
                await new Promise(resolve => setTimeout(resolve, 100));
                // Reinitialize model from cache in background
                chrome.runtime.sendMessage({ type: 'INIT_MODEL', payload: {} }).catch(err => {
                  console.error('[GET_STATE] Failed to reinit model:', err);
                });
                console.log('[GET_STATE] Restoration started');
              } catch (error) {
                console.error('[GET_STATE] Failed to restore:', error);
                extensionState.modelLoaded = false;
                await saveExtensionState({ modelLoaded: false });
              }
            }
          }
          
          sendResponse(extensionState);
          break;

        case 'INIT_MODEL':
          console.log('[INIT] Starting model initialization...');
          await setupOffscreenDocument();
          console.log('[INIT] Offscreen document ready, sending INIT_MODEL message...');
          await chrome.runtime.sendMessage({ type: 'INIT_MODEL', payload: {} });
          console.log('[INIT] Init message sent successfully');
          sendResponse({ success: true });
          break;

        case 'SET_ENABLED':
          extensionState.enabled = message.enabled;
          await saveExtensionState({ enabled: message.enabled });
          await updateIcon(message.enabled); // Update icon to reflect enabled state
          await broadcastToAllTabs({ type: 'STATE_CHANGED', state: extensionState });
          sendResponse({ success: true });
          break;

        case 'SET_REWRITE_MODE':
          extensionState.rewriteMode = message.mode;
          await saveExtensionState({ rewriteMode: message.mode });
          await broadcastToAllTabs({ type: 'STATE_CHANGED', state: extensionState });
          sendResponse({ success: true });
          break;

        case 'SET_BEHAVIOR_MODE':
          extensionState.behaviorMode = message.behavior;
          await saveExtensionState({ behaviorMode: message.behavior });
          await broadcastToAllTabs({ type: 'STATE_CHANGED', state: extensionState });
          sendResponse({ success: true });
          break;

        case 'REWRITE_TEXT':
          if (!extensionState.modelLoaded) {
            sendResponse({ success: false, error: 'Model not loaded' });
            break;
          }
          
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
          
          sendResponse({ success: true });
          break;

        default:
          console.warn('Unknown message type:', type);
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  })();
  
  return true; // Keep channel open for async response
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


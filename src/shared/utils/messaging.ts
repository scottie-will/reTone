import type { MessageResponse } from '../types/messages';

/**
 * Send a message and get a Promise response
 */
export function sendMessage<T = any>(message: any): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      // Check for errors
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      
      // Check for error in response
      if (response && response.success === false) {
        reject(new Error(response.error || 'Unknown error'));
        return;
      }
      
      resolve(response);
    });
  });
}

/**
 * Send message to specific tab
 */
export function sendTabMessage<T = any>(
  tabId: number, 
  message: any
): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

/**
 * Message handler wrapper for async handlers
 */
export function onMessage(
  handler: (
    message: any, 
    sender: chrome.runtime.MessageSender
  ) => Promise<any> | any
) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Execute handler and handle both sync and async returns
    Promise.resolve(handler(message, sender))
      .then(sendResponse)
      .catch((error) => {
        sendResponse({ 
          success: false, 
          error: error.message || String(error) 
        });
      });
    
    return true; // Always return true for async
  });
}

/**
 * Send message with timeout
 */
export function sendMessageWithTimeout<T = any>(
  message: any,
  timeoutMs: number = 5000
): Promise<T> {
  return Promise.race([
    sendMessage<T>(message),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Message timeout')), timeoutMs);
    })
  ]);
}

/**
 * Broadcast message to all tabs
 */
export async function broadcastToAllTabs(message: any): Promise<void> {
  const tabs = await chrome.tabs.query({});
  
  await Promise.allSettled(
    tabs.map(async (tab) => {
      if (!tab.id || !tab.url?.startsWith('http')) return;
      
      try {
        await sendTabMessage(tab.id, message);
      } catch (error) {
        // Tab doesn't have content script, ignore
      }
    })
  );
}


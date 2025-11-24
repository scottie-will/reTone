import type { ExtensionState } from '../types/messages';
import { DEFAULT_STATE } from '../constants/config';
import { logger } from './logger';

/**
 * Get extension state from storage
 * Using chrome.storage.local (not sync) for better reliability and speed
 */
export async function getExtensionState(): Promise<ExtensionState> {
  const stored = await chrome.storage.local.get([
    'enabled',
    'rewriteMode',
    'behaviorMode',
    'modelLoaded'
  ]);
  
  logger.log('[STORAGE] Raw stored values:', stored);
  
  const state = {
    enabled: stored.enabled ?? DEFAULT_STATE.enabled,
    rewriteMode: stored.rewriteMode ?? DEFAULT_STATE.rewriteMode,
    behaviorMode: stored.behaviorMode ?? DEFAULT_STATE.behaviorMode,
    modelLoaded: stored.modelLoaded ?? DEFAULT_STATE.modelLoaded
  };
  
  logger.log('[STORAGE] Returning state:', state);
  return state;
}

/**
 * Save extension state to storage
 * Using chrome.storage.local for immediate persistence
 */
export async function saveExtensionState(
  state: Partial<ExtensionState>
): Promise<void> {
  logger.log('[STORAGE] Saving to local storage:', state);
  await chrome.storage.local.set(state);
  logger.log('[STORAGE] Save complete');
}

/**
 * Clear all extension storage
 */
export async function clearStorage(): Promise<void> {
  await chrome.storage.local.clear();
}


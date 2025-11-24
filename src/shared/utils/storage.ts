import type { ExtensionState } from '../types/messages';
import { DEFAULT_STATE } from '../constants/config';

/**
 * Get extension state from storage
 */
export async function getExtensionState(): Promise<ExtensionState> {
  const stored = await chrome.storage.sync.get([
    'enabled',
    'rewriteMode',
    'behaviorMode',
    'modelLoaded'
  ]);
  
  return {
    enabled: stored.enabled ?? DEFAULT_STATE.enabled,
    rewriteMode: stored.rewriteMode ?? DEFAULT_STATE.rewriteMode,
    behaviorMode: stored.behaviorMode ?? DEFAULT_STATE.behaviorMode,
    modelLoaded: stored.modelLoaded ?? DEFAULT_STATE.modelLoaded
  };
}

/**
 * Save extension state to storage
 */
export async function saveExtensionState(
  state: Partial<ExtensionState>
): Promise<void> {
  await chrome.storage.sync.set(state);
}

/**
 * Clear all extension storage
 */
export async function clearStorage(): Promise<void> {
  await chrome.storage.sync.clear();
}


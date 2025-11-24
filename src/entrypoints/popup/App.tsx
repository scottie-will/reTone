import { useState, useEffect } from 'react';
import { sendMessage } from '@/shared/utils/messaging';
import type { ExtensionState, MessageFromBackground } from '@/shared/types/messages';
import { DEFAULT_STATE } from '@/shared/constants/config';
import { MODEL_DISPLAY_NAME } from '@/shared/types/models';
import ModelStatus from './components/ModelStatus';
import ModeSelector from './components/ModeSelector';
import BehaviorToggle from './components/BehaviorToggle';
import EnableToggle from './components/EnableToggle';
import InitButton from './components/InitButton';

export default function App() {
  const [state, setState] = useState<ExtensionState>(DEFAULT_STATE);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initProgress, setInitProgress] = useState({ text: '', percent: 0 });
  const [error, setError] = useState<string>('');

  // Load initial state
  useEffect(() => {
    loadState();
  }, []);

  // Listen for state updates
  useEffect(() => {
    const listener = (message: MessageFromBackground) => {
      if (message.type === 'STATE_UPDATED') {
        setState(message.state);
      } else if (message.type === 'INIT_PROGRESS') {
        setInitProgress({ text: message.progress, percent: message.percent });
      } else if (message.type === 'INIT_ERROR') {
        setError(message.error);
        setIsInitializing(false);
      } else if (message.type === 'MODEL_INITIALIZED') {
        if (message.success) {
          setIsInitializing(false);
          loadState();
        } else {
          setError(message.error || 'Model initialization failed');
          setIsInitializing(false);
        }
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  async function loadState() {
    try {
      const response = await sendMessage<ExtensionState>({ type: 'GET_STATE' });
      setState(response);
    } catch (err) {
      console.error('[POPUP] Failed to load state:', err);
    }
  }

  async function handleInitModel() {
    setIsInitializing(true);
    setError('');
    setInitProgress({ text: 'Starting initialization...', percent: 0 });

    try {
      await sendMessage({ type: 'INIT_MODEL' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Initialization failed');
      setIsInitializing(false);
    }
  }

  async function handleToggleEnabled(enabled: boolean) {
    try {
      await sendMessage({ type: 'SET_ENABLED', enabled });
      setState(prev => ({ ...prev, enabled }));
    } catch (err) {
      console.error('Failed to toggle enabled:', err);
    }
  }

  async function handleModeChange(mode: ExtensionState['rewriteMode']) {
    try {
      await sendMessage({ type: 'SET_REWRITE_MODE', mode });
      setState(prev => ({ ...prev, rewriteMode: mode }));
    } catch (err) {
      console.error('Failed to change mode:', err);
    }
  }

  async function handleBehaviorChange(behavior: ExtensionState['behaviorMode']) {
    try {
      await sendMessage({ type: 'SET_BEHAVIOR_MODE', behavior });
      setState(prev => ({ ...prev, behaviorMode: behavior }));
    } catch (err) {
      console.error('Failed to change behavior:', err);
    }
  }

  return (
    <div className="w-[380px] bg-white">
      {/* Grammarly-style Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img 
            src={state.enabled ? '/icons/Logo128.png' : '/icons/Logo_inactive128.png'}
            alt="reTone" 
            className="w-6 h-6"
          />
          <h1 className="text-base font-semibold text-gray-900">
            reTone
          </h1>
        </div>
        <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
          Free
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">{/* Will wrap rest of content */}

        {/* Model Status */}
        <ModelStatus 
          modelLoaded={state.modelLoaded}
          isInitializing={isInitializing}
          progress={initProgress}
          error={error}
        />

        {/* Initialize Button */}
        {!state.modelLoaded && (
          <InitButton 
            isInitializing={isInitializing}
            onClick={handleInitModel}
          />
        )}

        {/* Controls - only enabled when model is loaded */}
        {state.modelLoaded && (
          <div className="space-y-3">
            {/* Enable/Disable Toggle */}
            <EnableToggle 
              enabled={state.enabled}
              onChange={handleToggleEnabled}
            />

            {/* Mode Selector */}
            <ModeSelector 
              currentMode={state.rewriteMode}
              onChange={handleModeChange}
              disabled={!state.enabled}
            />

            {/* Behavior Toggle */}
            <BehaviorToggle 
              currentBehavior={state.behaviorMode}
              onChange={handleBehaviorChange}
              disabled={!state.enabled}
            />
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Running locally with {MODEL_DISPLAY_NAME}
        </p>
      </div>
    </div>
  );
}


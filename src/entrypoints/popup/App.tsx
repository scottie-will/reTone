import { useState, useEffect } from 'react';
import { sendMessage } from '@/shared/utils/messaging';
import type { ExtensionState, MessageFromBackground } from '@/shared/types/messages';
import { DEFAULT_STATE } from '@/shared/constants/config';
import { MODEL_DISPLAY_NAME, MODEL_HUGGINGFACE_URL } from '@/shared/types/models';
import ModelStatus from './components/ModelStatus';
import ModeSelector from './components/ModeSelector';
import BehaviorToggle from './components/BehaviorToggle';
import EnableToggle from './components/EnableToggle';
import InitButton from './components/InitButton';

export default function App() {
  const [state, setState] = useState<ExtensionState>(DEFAULT_STATE);
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
      } else if (message.type === 'MODEL_INITIALIZED') {
        if (message.success) {
          loadState();
        } else {
          setError(message.error || 'Model initialization failed');
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
    setError('');
    setInitProgress({ text: 'Starting initialization...', percent: 0 });

    try {
      await sendMessage({ type: 'INIT_MODEL' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Initialization failed');
      loadState(); // Reload state to get updated isInitializing flag
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
    <div className="w-[320px] bg-white">
      {/* Grammarly-style Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img 
            src={state.enabled ? '/icons/Logo128.png' : '/icons/Logo_inactive128.png'}
            alt="reTone" 
            className="w-5 h-5"
          />
          <h1 className="text-sm font-semibold text-gray-900">
            reTone
          </h1>
          {state.modelLoaded && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-500">Ready</span>
            </div>
          )}
        </div>
        <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-gray-200 text-gray-800
                         rounded-tr-full rounded-tl-full rounded-br-full rounded-bl-none">
          Free
        </span>
      </div>

      {/* Content */}
      <div className="px-3 py-2.5">{/* Will wrap rest of content */}

        {/* Model Status */}
        <ModelStatus
          modelLoaded={state.modelLoaded}
          isInitializing={state.isInitializing}
          progress={initProgress}
          error={error}
        />

        {/* Initialize Button */}
        {!state.modelLoaded && (
          <InitButton
            isInitializing={state.isInitializing}
            onClick={handleInitModel}
          />
        )}

        {/* Controls - only enabled when model is loaded */}
        {state.modelLoaded && (
          <div className="space-y-2">
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
      <div className="px-3 py-1.5 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Powered by{' '}
          <a 
            href={MODEL_HUGGINGFACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            {MODEL_DISPLAY_NAME}
          </a>
        </p>
      </div>
    </div>
  );
}


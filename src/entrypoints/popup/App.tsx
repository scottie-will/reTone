import { useState, useEffect } from 'react';
import { sendMessage } from '@/shared/utils/messaging';
import type { ExtensionState, MessageFromBackground } from '@/shared/types/messages';
import { DEFAULT_STATE } from '@/shared/constants/config';
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
    <div className="w-[400px] min-h-[500px] bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Social Media Rewriter
        </h1>
        <p className="text-sm text-slate-600">
          Rewrite posts using local AI
        </p>
      </div>

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
        <div className="space-y-4">
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

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          Running locally with SmolLM2-360M
        </p>
      </div>
    </div>
  );
}


import { useState } from 'react';
import type { RewriteMode } from '@/shared/types/messages';
import { MODE_BUTTON_TEXT } from '@/shared/constants/modeInstructions';

export type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface RewriteButtonProps {
  onRewrite: () => Promise<void>;
  onToggle?: () => void;
  showToggle?: boolean;
  mode?: RewriteMode;
  platform?: string;
}

export default function RewriteButton({ onRewrite, onToggle, showToggle = false, mode = 'tldr', platform }: RewriteButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');

  async function handleClick() {
    if (showToggle && onToggle) {
      onToggle();
      return;
    }

    setState('loading');
    
    try {
      await onRewrite();
      setState('success');
      
      // Reset to idle after showing success
      setTimeout(() => {
        setState('idle');
      }, 2000);
    } catch (error) {
      console.error('Rewrite error:', error);
      setState('error');
      
      // Reset to idle after showing error
      setTimeout(() => {
        setState('idle');
      }, 2000);
    }
  }

  const buttonStyles = {
    idle: 'bg-blue-600 hover:bg-blue-700 text-white',
    loading: 'bg-blue-600 text-white cursor-wait',
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white'
  };

  const buttonText = {
    idle: showToggle ? 'Show Original' : 'Rewrite',
    loading: 'Rewriting...',
    success: 'Rewritten!',
    error: 'Error'
  };

  const isLinkedIn = platform === 'linkedin';
  const buttonTextForMode = mode ? MODE_BUTTON_TEXT[mode] : null;
  const hasTextMode = buttonTextForMode && state === 'idle' && !showToggle;

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      title={buttonText[state]}
      className={`
        ${hasTextMode ? 'px-3 py-2' : 'w-10 h-10'}
        ${isLinkedIn ? 'ml-2' : ''}
        rounded-full shadow-lg
        transition-all duration-200 ease-in-out
        flex items-center justify-center
        disabled:cursor-not-allowed
        hover:scale-110 active:scale-95
        ${buttonStyles[state]}
      `}
    >
      {state === 'loading' && (
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {state === 'success' && (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {state === 'error' && (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {state === 'idle' && !showToggle && buttonTextForMode && (
        // Text mode - display button text for the mode
        <span className="text-xs font-bold whitespace-nowrap">{buttonTextForMode}</span>
      )}
      {state === 'idle' && !showToggle && !buttonTextForMode && (
        // Icon mode - display sparkle/wand icon
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      )}
      {state === 'idle' && showToggle && (
        // Undo/back arrow - click to show original
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
      )}
    </button>
  );
}


import { useState } from 'react';

export type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface RewriteButtonProps {
  onRewrite: () => Promise<void>;
  onToggle?: () => void;
  showToggle?: boolean;
}

export default function RewriteButton({ onRewrite, onToggle, showToggle = false }: RewriteButtonProps) {
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

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium shadow-sm
        transition-all duration-200 ease-in-out
        flex items-center gap-2
        disabled:cursor-not-allowed
        ${buttonStyles[state]}
      `}
    >
      {state === 'loading' && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {state === 'success' && (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {state === 'error' && (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {buttonText[state]}
    </button>
  );
}


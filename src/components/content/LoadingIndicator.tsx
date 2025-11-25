import { useEffect, useRef } from 'react';

type IndicatorState = 'loading' | 'success';

interface LoadingIndicatorProps {
  state?: IndicatorState;
  onComplete?: () => void;
}

/**
 * LoadingIndicator - Shows loading state while post is being rewritten in auto mode
 * Matches the manual mode button styling with spinning circle and success checkmark
 */
export default function LoadingIndicator({ state = 'loading', onComplete }: LoadingIndicatorProps) {
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (state === 'success' && onComplete) {
      timerRef.current = setTimeout(() => {
        onComplete();
      }, 2000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state, onComplete]);

  const buttonStyles = {
    loading: 'bg-blue-600 text-white',
    success: 'bg-green-600 text-white'
  };

  return (
    <div className="flex items-center gap-2">
      <button
        disabled
        className={`
          w-10 h-10
          rounded-full shadow-lg
          transition-all duration-200 ease-in-out
          flex items-center justify-center
          cursor-wait
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
      </button>
      <span className="text-sm text-gray-600">
        {state === 'loading' ? 'Rewriting...' : 'Rewritten!'}
      </span>
    </div>
  );
}

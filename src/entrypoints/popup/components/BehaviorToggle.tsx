import type { BehaviorMode } from '@/shared/types/messages';

interface BehaviorToggleProps {
  currentBehavior: BehaviorMode;
  onChange: (behavior: BehaviorMode) => void;
  disabled?: boolean;
}

export default function BehaviorToggle({ currentBehavior, onChange, disabled }: BehaviorToggleProps) {
  return (
    <div className="py-1.5">
      <label className="block text-sm font-medium text-gray-900 mb-1">
        Behavior Mode
      </label>
      
      <div className="flex gap-1.5">
        <button
          onClick={() => onChange('manual')}
          disabled={disabled}
          className={`flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors
                     ${currentBehavior === 'manual' 
                       ? 'bg-blue-600 text-white' 
                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                     ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Manual
        </button>
        
        <button
          onClick={() => onChange('auto')}
          disabled={disabled}
          className={`flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors
                     ${currentBehavior === 'auto' 
                       ? 'bg-blue-600 text-white' 
                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                     ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Auto
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-0.5">
        {currentBehavior === 'manual' 
          ? 'Show rewrite buttons on posts' 
          : 'Automatically rewrite all posts'}
      </p>
    </div>
  );
}


import type { BehaviorMode } from '@/shared/types/messages';

interface BehaviorToggleProps {
  currentBehavior: BehaviorMode;
  onChange: (behavior: BehaviorMode) => void;
  disabled?: boolean;
}

export default function BehaviorToggle({ currentBehavior, onChange, disabled }: BehaviorToggleProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
      <label className="block text-sm font-semibold text-slate-800 mb-3">
        Behavior Mode
      </label>
      
      <div className="flex gap-2">
        <button
          onClick={() => onChange('manual')}
          disabled={disabled}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200
                     ${currentBehavior === 'manual' 
                       ? 'bg-blue-600 text-white shadow-sm' 
                       : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
                     ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Manual
        </button>
        
        <button
          onClick={() => onChange('auto')}
          disabled={disabled}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200
                     ${currentBehavior === 'auto' 
                       ? 'bg-blue-600 text-white shadow-sm' 
                       : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
                     ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Auto
        </button>
      </div>
      
      <p className="text-xs text-slate-600 mt-2">
        {currentBehavior === 'manual' 
          ? 'Show rewrite buttons on posts' 
          : 'Automatically rewrite all posts'}
      </p>
    </div>
  );
}


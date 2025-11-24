import { REWRITE_MODES } from '@/shared/constants/prompts';
import type { RewriteMode } from '@/shared/types/messages';

interface ModeSelectorProps {
  currentMode: RewriteMode;
  onChange: (mode: RewriteMode) => void;
  disabled?: boolean;
}

export default function ModeSelector({ currentMode, onChange, disabled }: ModeSelectorProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
      <label className="block text-sm font-semibold text-slate-800 mb-2">
        Rewriting Mode
      </label>
      
      <select
        value={currentMode}
        onChange={(e) => onChange(e.target.value as RewriteMode)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500
                   bg-white text-slate-800"
      >
        {(Object.entries(REWRITE_MODES) as [RewriteMode, string][]).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      
      <p className="text-xs text-slate-600 mt-2">
        Choose how posts should be rewritten
      </p>
    </div>
  );
}


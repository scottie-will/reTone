import { REWRITE_MODES } from '@/shared/constants/prompts';
import type { RewriteMode } from '@/shared/types/messages';

interface ModeSelectorProps {
  currentMode: RewriteMode;
  onChange: (mode: RewriteMode) => void;
  disabled?: boolean;
}

export default function ModeSelector({ currentMode, onChange, disabled }: ModeSelectorProps) {
  return (
    <div className="py-2">
      <label className="block text-sm font-medium text-gray-900 mb-1.5">
        Rewriting Mode
      </label>
      
      <select
        value={currentMode}
        onChange={(e) => onChange(e.target.value as RewriteMode)}
        disabled={disabled}
        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm
                   focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                   disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
                   bg-white text-gray-900"
      >
        {(Object.entries(REWRITE_MODES) as [RewriteMode, string][]).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}


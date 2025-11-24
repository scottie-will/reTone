interface EnableToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function EnableToggle({ enabled, onChange }: EnableToggleProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-800">Enable Rewriting</h3>
          <p className="text-xs text-slate-600 mt-1">
            {enabled ? 'Extension is active' : 'Extension is inactive'}
          </p>
        </div>
        
        <button
          onClick={() => onChange(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            enabled ? 'bg-blue-600' : 'bg-slate-300'
          }`}
          role="switch"
          aria-checked={enabled}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}


interface EnableToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function EnableToggle({ enabled, onChange }: EnableToggleProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">Enable Extension</h3>
      </div>
      
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
          enabled ? 'bg-blue-600' : 'bg-gray-300'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}


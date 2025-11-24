interface ModelStatusProps {
  modelLoaded: boolean;
  isInitializing: boolean;
  progress: { text: string; percent: number };
  error: string;
}

export default function ModelStatus({ 
  modelLoaded, 
  isInitializing, 
  progress, 
  error 
}: ModelStatusProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium text-blue-800">
              Initializing Model...
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.round(progress.percent * 100)}%` }}
              />
            </div>
            <p className="text-xs text-blue-700">{progress.text}</p>
          </div>
        </div>
      </div>
    );
  }

  if (modelLoaded) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-green-800">
            Model Ready
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium text-slate-700">
          Model not initialized
        </span>
      </div>
    </div>
  );
}


interface InitButtonProps {
  isInitializing: boolean;
  onClick: () => void;
}

export default function InitButton({ isInitializing, onClick }: InitButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isInitializing}
      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed
                 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg 
                 transition-all duration-200 flex items-center justify-center gap-2"
    >
      {isInitializing ? (
        <>
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Initializing...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Initialize Model
        </>
      )}
    </button>
  );
}


/**
 * LoadingIndicator - Shows loading state while post is being rewritten in auto mode
 */

export default function LoadingIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <svg
        className="animate-spin h-4 w-4 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="text-sm text-gray-600">Rewriting...</span>
    </div>
  );
}

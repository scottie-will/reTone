/**
 * ErrorIndicator - Shows error state when auto-rewrite fails
 */

export default function ErrorIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <svg
        className="h-4 w-4 text-red-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="text-sm text-red-600">Rewrite failed</span>
    </div>
  );
}

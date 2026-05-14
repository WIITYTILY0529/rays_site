import type { ErrorMessageProps } from '../../services/types';

export function ErrorMessage({ message, onRetry, showRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700" role="alert">
      <p className="text-sm font-medium">{message}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          재시도
        </button>
      )}
    </div>
  );
}

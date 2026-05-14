interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<string, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
};

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className={`inline-block animate-spin rounded-full border-solid border-current border-r-transparent ${sizeClasses[size]}`}
    >
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}

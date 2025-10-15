'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'purple' | 'orange' | 'white' | 'gray';
  text?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  color = 'purple',
  text,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    white: 'text-white',
    gray: 'text-gray-500',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        xmlns="http://www.w3.org/2000/svg"
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
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  );
}

// Skeleton loader for cards
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-xl overflow-hidden ${className}`}>
      <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-700 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-4 w-16 bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="flex justify-between pt-3 border-t border-white/10">
          <div className="space-y-2">
            <div className="h-3 w-12 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-12 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Full page loader
export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <LoadingSpinner size="xl" color="purple" text={text} />
    </div>
  );
}

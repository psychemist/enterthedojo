'use client';

interface GameBadgeProps {
  name: string;
  icon: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  onClick?: () => void;
  className?: string;
}

export function GameBadge({
  name,
  icon,
  size = 'md',
  showName = true,
  onClick,
  className = '',
}: GameBadgeProps) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const containerSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Component
        onClick={onClick}
        className={`${containerSizeClasses[size]} rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center ${
          onClick ? 'hover:from-white/20 hover:to-white/10 transition-all cursor-pointer' : ''
        }`}
      >
        <span className={sizeClasses[size]}>{icon}</span>
      </Component>
      {showName && (
        <span className="text-white font-medium">{name}</span>
      )}
    </div>
  );
}

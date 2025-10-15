'use client';

interface RarityBadgeProps {
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical';
  size?: 'sm' | 'md' | 'lg';
  showBorder?: boolean;
  className?: string;
}

export function RarityBadge({
  rarity,
  size = 'md',
  showBorder = true,
  className = '',
}: RarityBadgeProps) {
  const getRarityStyles = (rarity: string) => {
    switch (rarity) {
      case 'Common':
        return {
          text: 'text-gray-400',
          bg: 'bg-gray-400/10',
          border: 'border-gray-400/20',
        };
      case 'Rare':
        return {
          text: 'text-blue-400',
          bg: 'bg-blue-400/10',
          border: 'border-blue-400/20',
        };
      case 'Epic':
        return {
          text: 'text-purple-400',
          bg: 'bg-purple-400/10',
          border: 'border-purple-400/20',
        };
      case 'Legendary':
        return {
          text: 'text-orange-400',
          bg: 'bg-orange-400/10',
          border: 'border-orange-400/20',
        };
      case 'Mythical':
        return {
          text: 'text-pink-400',
          bg: 'bg-pink-400/10',
          border: 'border-pink-400/20',
        };
      default:
        return {
          text: 'text-gray-400',
          bg: 'bg-gray-400/10',
          border: 'border-gray-400/20',
        };
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const styles = getRarityStyles(rarity);

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${styles.text} ${styles.bg} ${
        showBorder ? `border ${styles.border}` : ''
      } ${sizeClasses[size]} ${className}`}
    >
      {rarity}
    </span>
  );
}

// Utility function to get rarity color class (for text)
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'Common':
      return 'text-gray-400';
    case 'Rare':
      return 'text-blue-400';
    case 'Epic':
      return 'text-purple-400';
    case 'Legendary':
      return 'text-orange-400';
    case 'Mythical':
      return 'text-pink-400';
    default:
      return 'text-gray-400';
  }
}

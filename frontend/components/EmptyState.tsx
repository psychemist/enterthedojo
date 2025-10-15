'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode | string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {typeof icon === 'string' ? (
        <div className="text-6xl mb-4">{icon}</div>
      ) : (
        <div className="mb-4 flex justify-center">{icon}</div>
      )}
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Specialized empty states
export function NoAssetsFound({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon="🔍"
      title="No Assets Found"
      description="Try adjusting your filters or search query to find what you're looking for."
      action={onReset ? { label: 'Reset Filters', onClick: onReset } : undefined}
    />
  );
}

export function NoListings() {
  return (
    <EmptyState
      icon="🏪"
      title="No Listings Yet"
      description="Be the first to list an asset on the marketplace!"
    />
  );
}

export function WalletNotConnected({ onConnect }: { onConnect: () => void }) {
  return (
    <EmptyState
      icon="👛"
      title="Wallet Not Connected"
      description="Connect your wallet to view your assets and start trading."
      action={{ label: 'Connect Wallet', onClick: onConnect }}
    />
  );
}

export function NoGamesConnected() {
  return (
    <EmptyState
      icon="🎮"
      title="No Games Connected"
      description="Connect to Dojo-powered games to see your assets here."
    />
  );
}

'use client';

interface PriceDisplayProps {
  priceInBtc: string;
  showUsd?: boolean;
  usdRate?: number; // BTC to USD rate
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceDisplay({
  priceInBtc,
  showUsd = true,
  usdRate = 66765, // Default: ~$66,765 per BTC (approximate)
  size = 'md',
  className = '',
}: PriceDisplayProps) {
  const btcValue = parseFloat(priceInBtc);
  const usdValue = btcValue * usdRate;

  const sizeClasses = {
    sm: {
      btc: 'text-lg',
      usd: 'text-xs',
    },
    md: {
      btc: 'text-2xl',
      usd: 'text-sm',
    },
    lg: {
      btc: 'text-4xl',
      usd: 'text-base',
    },
  };

  return (
    <div className={className}>
      <div className={`text-orange-400 font-bold ${sizeClasses[size].btc}`}>
        {priceInBtc} BTC
      </div>
      {showUsd && (
        <div className={`text-gray-500 mt-1 ${sizeClasses[size].usd}`}>
          ≈ ${usdValue.toFixed(2).toLocaleString()} USD
        </div>
      )}
    </div>
  );
}

// Utility function to convert sats to BTC
export function satsToBtc(sats: number): string {
  return (sats / 100000000).toFixed(8);
}

// Utility function to format BTC price
export function formatBtcPrice(btc: string | number): string {
  const value = typeof btc === 'string' ? parseFloat(btc) : btc;
  return value.toFixed(8);
}

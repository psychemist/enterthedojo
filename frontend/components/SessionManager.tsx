'use client';

import { useEffect, useState } from 'react';
import { useBitcoinWallet } from '@/lib/bitcoin/BitcoinWalletContext';
import { useStarknetSession } from '@/lib/starknet/useStarknetSession';
import { Clock, X } from 'lucide-react';

/**
 * SessionManager component
 * Displays session expiry warnings and provides refresh options
 */
export function SessionManager() {
  const { sessionExpiry: btcExpiry, refreshSession: refreshBtc, isConnected: btcConnected } = useBitcoinWallet();
  const { sessionExpiry: starknetExpiry, sessionWarning, refreshSession: refreshStarknet, isConnected: starknetConnected } = useStarknetSession();
  
  const [showBtcWarning, setShowBtcWarning] = useState(false);
  const [btcTimeLeft, setBtcTimeLeft] = useState<string>('');
  const [starknetTimeLeft, setStarknetTimeLeft] = useState<string>('');

  // Format time remaining
  const formatTimeLeft = (expiryTime: number): string => {
    const diff = expiryTime - Date.now();
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Check Bitcoin session expiry
  useEffect(() => {
    if (!btcConnected || !btcExpiry) return;

    const checkExpiry = () => {
      const diff = btcExpiry - Date.now();
      const tenMinutes = 10 * 60 * 1000;
      
      if (diff < tenMinutes && diff > 0) {
        setShowBtcWarning(true);
        setBtcTimeLeft(formatTimeLeft(btcExpiry));
      } else {
        setShowBtcWarning(false);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [btcConnected, btcExpiry]);

  // Update Starknet time left
  useEffect(() => {
    if (!starknetConnected || !starknetExpiry) return;

    const updateTime = () => {
      setStarknetTimeLeft(formatTimeLeft(starknetExpiry));
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [starknetConnected, starknetExpiry]);

  // Don't render if no warnings
  if (!showBtcWarning && !sessionWarning) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {/* Bitcoin session warning */}
      {showBtcWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">
                Bitcoin Wallet Session Expiring
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                Your session will expire in {btcTimeLeft}. Refresh to stay connected.
              </p>
              <button
                onClick={() => {
                  refreshBtc();
                  setShowBtcWarning(false);
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Refresh Session
              </button>
            </div>
            <button
              onClick={() => setShowBtcWarning(false)}
              className="text-yellow-600 hover:text-yellow-800 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Starknet session warning */}
      {sessionWarning && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-1">
                Starknet Session Expiring
              </h3>
              <p className="text-sm text-purple-800 mb-3">
                Your session will expire in {starknetTimeLeft}. Refresh to stay connected.
              </p>
              <button
                onClick={() => {
                  refreshStarknet();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Refresh Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

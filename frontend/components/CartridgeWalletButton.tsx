'use client';

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useState } from "react";

export function CartridgeWalletButton() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);

  // Find Cartridge connector
  const cartridgeConnector = connectors.find(
    (c) => c.id === 'controller' || c.name?.toLowerCase().includes('cartridge')
  );

  const isCartridgeConnected = isConnected && connector?.id === 'controller';

  const handleConnect = async () => {
    if (!cartridgeConnector) {
      alert('Cartridge Controller not available');
      return;
    }

    setIsConnecting(true);
    try {
      await connect({ connector: cartridgeConnector });
    } catch (error) {
      console.error('Failed to connect Cartridge:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (isCartridgeConnected && address) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-mono text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Disconnect
          </button>
        </div>
        <div className="text-sm text-green-600 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Connected with Cartridge Controller
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleConnect}
        disabled={isConnecting || !cartridgeConnector}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2"
      >
        {isConnecting ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {cartridgeConnector ? 'Connect with Cartridge' : 'Cartridge Unavailable'}
          </>
        )}
      </button>
      
      <div className="text-xs text-gray-500 text-center">
        Cross-game identity and session management
      </div>
    </div>
  );
}

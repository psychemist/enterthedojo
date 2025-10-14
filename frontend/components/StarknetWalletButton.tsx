'use client';

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useState, useEffect, useRef } from "react";

export function StarknetWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowConnectors(false);
      }
    }

    if (showConnectors) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showConnectors]);

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-mono text-sm">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setShowConnectors(!showConnectors)}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition font-semibold w-full flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Connect Starknet Wallet
      </button>
      
      {showConnectors && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-full z-50 overflow-hidden animate-fadeIn">
          {connectors.length > 0 ? (
            <>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs text-gray-600 font-medium">Select Wallet</p>
              </div>
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => {
                    console.log('Connecting to:', connector.name);
                    connect({ connector });
                    setShowConnectors(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 active:bg-blue-100 transition flex items-center justify-between group"
                >
                  <span className="text-gray-900 font-medium">{connector.name}</span>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-4">
              <p className="text-gray-900 font-medium mb-2">No wallets detected</p>
              <p className="text-sm text-gray-500 mb-3">Please install a Starknet wallet:</p>
              <div className="space-y-2">
                <a 
                  href="https://www.argent.xyz/argent-x/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  → Install Argent X
                </a>
                <a 
                  href="https://braavos.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  → Install Braavos
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
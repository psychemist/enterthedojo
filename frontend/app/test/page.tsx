'use client';

import { useState } from 'react';
import { BitcoinWalletButton } from '@/components/BitcoinWalletButton';
import { PurchaseFlow } from '@/components/PurchaseFlow';

export default function TestPage() {
  const [showPurchase, setShowPurchase] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Phase 4 Testing</h1>
        
        {/* Wallet Connection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Bitcoin Wallet</h2>
          <BitcoinWalletButton />
        </div>

        {/* Test Asset */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Asset Purchase</h2>
          
          {!showPurchase ? (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
                <div>
                  <h3 className="font-bold">Test NFT Asset</h3>
                  <p className="text-gray-600">ID: test-001</p>
                  <p className="text-lg font-semibold">Price: 0.0001 BTC (10,000 sats)</p>
                </div>
              </div>
              <button
                onClick={() => setShowPurchase(true)}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Test Purchase Flow
              </button>
            </div>
          ) : (
            <PurchaseFlow
              assetId="test-001"
              assetName="Test NFT Asset"
              assetImage="https://via.placeholder.com/100"
              priceInSats={10000} // 0.0001 BTC
              sellerAddress="0x1234567890123456789012345678901234567890123456789012345678901234" // Test Starknet address
              onSuccess={(txHash) => {
                alert(`Purchase successful! TX: ${txHash}`);
                setShowPurchase(false);
              }}
              onCancel={() => setShowPurchase(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
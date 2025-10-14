'use client';

import { useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { StarknetWalletButton } from '@/components/StarknetWalletButton';
import { BitcoinWalletButton } from '@/components/BitcoinWalletButton';
import { useAssetPrice, useListAsset, useBuyAsset } from '@/lib/starknet/useMarketplace';

export default function DebugPage() {
  const { isConnected } = useAccount();
  const [listingId, setListingId] = useState('');
  const [gameContract, setGameContract] = useState('');
  const [assetId, setAssetId] = useState('');
  const [price, setPrice] = useState('');
  const [swapProof, setSwapProof] = useState('0x0');

  const {
    price: currentPrice,
    listing,
    isLoading: priceLoading,
    error,
    refetch,
  } = useAssetPrice(listingId ? listingId : null);
  const { listAsset, isPending: listPending } = useListAsset();
  const { buyAsset, isPending: buyPending } = useBuyAsset();

  const handleListAsset = async () => {
    if (!gameContract || !assetId || !price) {
      alert('Please enter game contract, asset ID, and price');
      return;
    }

    try {
      await listAsset({
        gameContract: gameContract as `0x${string}`,
        assetId,
        priceInSats: price,
      });
      alert('Asset listed successfully!');
      refetch();
    } catch (error) {
      console.error('Failed to list asset:', error);
      alert('Failed to list asset. Check console for details.');
    }
  };

  const handleBuyAsset = async () => {
    if (!listingId) {
      alert('Please enter listing ID');
      return;
    }

    try {
      const txHash = await buyAsset({ listingId, swapProof });
      alert(`Asset purchased! TX: ${txHash}`);
      refetch();
    } catch (error) {
      console.error('Failed to buy asset:', error);
      alert('Failed to buy asset. Check console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Contract Debugger</h1>
          <p className="text-gray-600">Test your smart contracts without writing code</p>
        </div>

        {/* Wallet Connections */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 relative">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">Starknet Wallet</h2>
            <StarknetWalletButton />
            {isConnected && (
              <p className="mt-3 text-sm text-green-600">✅ Connected to Starknet</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 relative">
            <h2 className="text-xl font-semibold mb-4 text-orange-900">Bitcoin Wallet</h2>
            <BitcoinWalletButton />
          </div>
        </div>

        {/* Contract Interactions */}
        <div className="space-y-6">
          {/* Read Contract */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">📖 Read Contract</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing ID
                </label>
                <input
                  type="text"
                  value={listingId}
                  onChange={(e) => setListingId(e.target.value)}
                  placeholder="Enter listing ID (u256 numeric)"
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {priceLoading ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span>Loading listing...</span>
                </div>
              ) : listing ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div>
                    <p className="text-sm text-blue-700">Price (sats)</p>
                    <p className="text-xl font-semibold text-blue-900 font-mono">{currentPrice?.toString() ?? '0'}</p>
                  </div>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>Seller: {listing.seller}</p>
                    <p>Game Contract: {listing.game_contract}</p>
                    <p>Asset ID (low/high): {listing.asset_id.low.toString()} / {listing.asset_id.high.toString()}</p>
                    <p>Status: {listing.is_active ? 'Active' : 'Inactive'}</p>
                    <p>Listed At (timestamp): {listing.listed_at.toString()}</p>
                  </div>
                </div>
              ) : listingId ? (
                <p className="text-gray-500">No listing found for this ID</p>
              ) : null}
              {error && <p className="text-sm text-red-600">{error.message}</p>}
            </div>
          </div>

          {/* Write Contract - List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">✏️ Write: List Asset</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Contract Address
                </label>
                <input
                  type="text"
                  value={gameContract}
                  onChange={(e) => setGameContract(e.target.value)}
                  placeholder="0x..."
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset ID (u256)
                </label>
                <input
                  type="text"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  placeholder="Enter asset ID"
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (satoshis)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price in sats (e.g., 100000)"
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleListAsset}
                disabled={!isConnected || listPending}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
              >
                {listPending ? 'Listing...' : 'List Asset'}
              </button>

              {!isConnected && (
                <p className="text-amber-600 text-sm">⚠️ Connect your Starknet wallet first</p>
              )}
            </div>
          </div>

          {/* Write Contract - Buy */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">🛒 Write: Buy Asset</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing ID
                </label>
                <input
                  type="text"
                  value={listingId}
                  onChange={(e) => setListingId(e.target.value)}
                  placeholder="Enter listing ID to buy"
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Swap Proof (felt)
                </label>
                <input
                  type="text"
                  value={swapProof}
                  onChange={(e) => setSwapProof(e.target.value)}
                  placeholder="0x0"
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleBuyAsset}
                disabled={!isConnected || buyPending}
                className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
              >
                {buyPending ? 'Buying...' : 'Buy Asset'}
              </button>

              {!isConnected && (
                <p className="text-amber-600 text-sm">⚠️ Connect your Starknet wallet first</p>
              )}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 How to Use</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Connect your Starknet wallet (ArgentX or Braavos)</li>
            <li>Enter a listing ID to check its status</li>
            <li>List an asset by providing game contract, asset ID, and price</li>
            <li>Buy an asset by entering listing ID and optional swap proof</li>
            <li>Approve transactions from your wallet when prompted</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
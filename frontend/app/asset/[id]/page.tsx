'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Shield, Clock } from 'lucide-react';
import { PurchaseFlow } from '@/components/PurchaseFlow';

// Mock data - will be replaced with contract data
interface AssetData {
  id: string;
  name: string;
  game: string;
  gameIcon: string;
  price: string;
  priceInSats: number;
  image: string;
  rarity: string;
  description: string;
  attributes: Record<string, string | number>;
  seller: string;
  contractAddress: string;
  tokenId: string;
  listedDate: string;
  history: Array<{
    type: string;
    date: string;
    price?: string;
    from: string;
  }>;
}

const MOCK_ASSETS: Record<string, AssetData> = {
  '1': {
    id: '1',
    name: 'Legendary Dragon Sword',
    game: 'Loot Survivor',
    gameIcon: '⚔️',
    price: '0.0085',
    priceInSats: 850000,
    image: '🗡️',
    rarity: 'Legendary',
    description: 'A mythical blade forged in dragon fire, said to grant its wielder immense power. Only the bravest warriors can wield this legendary weapon.',
    attributes: {
      attack: 95,
      durability: 88,
      critChance: 25,
      level: 50,
    },
    seller: '0x1234567890abcdef1234567890abcdef12345678',
    contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    tokenId: '42',
    listedDate: '2025-10-10T12:00:00Z',
    history: [
      { type: 'Listed', date: '2025-10-10T12:00:00Z', price: '0.0085', from: '0x1234...5678' },
      { type: 'Minted', date: '2025-09-15T08:30:00Z', from: 'Game Contract' },
    ],
  },
  '2': {
    id: '2',
    name: 'Ancient Kingdom',
    game: 'Eternum',
    gameIcon: '🏰',
    price: '0.0245',
    priceInSats: 2450000,
    image: '👑',
    rarity: 'Epic',
    description: 'A prosperous kingdom with rich resources and a loyal population. Perfect for strategic expansion.',
    attributes: {
      population: 1250,
      resources: 'High',
      defense: 85,
      income: 500,
    },
    seller: '0x2345678901bcdef2345678901bcdef23456789',
    contractAddress: '0xbcdef2345678901bcdef2345678901bcdef234',
    tokenId: '108',
    listedDate: '2025-10-12T15:30:00Z',
    history: [
      { type: 'Listed', date: '2025-10-12T15:30:00Z', price: '0.0245', from: '0x2345...6789' },
      { type: 'Upgraded', date: '2025-10-05T10:00:00Z', from: '0x2345...6789' },
      { type: 'Minted', date: '2025-08-20T14:00:00Z', from: 'Game Contract' },
    ],
  },
};

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  const assetId = params.id as string;
  const asset = MOCK_ASSETS[assetId] || MOCK_ASSETS['1'];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common':
        return 'text-gray-400 border-gray-400/20';
      case 'Rare':
        return 'text-blue-400 border-blue-400/20';
      case 'Epic':
        return 'text-purple-400 border-purple-400/20';
      case 'Legendary':
        return 'text-orange-400 border-orange-400/20';
      case 'Mythical':
        return 'text-pink-400 border-pink-400/20';
      default:
        return 'text-gray-400 border-gray-400/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Marketplace
        </button>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Asset Image */}
          <div>
            <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center text-[200px] border border-white/10 relative">
              {asset.image}
              <div className="absolute top-6 right-6 text-5xl">
                {asset.gameIcon}
              </div>
            </div>

            {/* Contract Info */}
            <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Contract Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Contract Address</span>
                  <a
                    href={`https://sepolia.starkscan.co/contract/${asset.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    {formatAddress(asset.contractAddress)}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Token ID</span>
                  <span className="text-white font-mono">{asset.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Game</span>
                  <span className="text-white">{asset.game}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Asset Info */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold text-white">{asset.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRarityColor(asset.rarity)}`}>
                  {asset.rarity}
                </span>
              </div>
              <p className="text-gray-400 text-lg">{asset.description}</p>
            </div>

            {/* Attributes */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4">Attributes</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(asset.attributes).map(([key, value]) => (
                  <div key={key} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="text-gray-400 text-sm capitalize mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-white font-semibold text-xl">{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price and Purchase */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-gray-400 mb-1">Current Price</div>
                  <div className="text-4xl font-bold text-orange-400">{asset.price} BTC</div>
                  <div className="text-gray-500 text-sm mt-1">≈ $567.50 USD</div>
                </div>
                <Shield className="w-12 h-12 text-purple-400/50" />
              </div>

              <button
                onClick={() => setShowPurchaseModal(true)}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                Buy Now
              </button>

              <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm">
                <Shield className="w-4 h-4" />
                Secure Bitcoin payment via Atomiq
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Seller Information</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Seller Address</div>
                  <Link
                    href={`/profile/${asset.seller}`}
                    className="text-purple-400 hover:text-purple-300 font-mono"
                  >
                    {formatAddress(asset.seller)}
                  </Link>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-sm mb-1">Listed</div>
                  <div className="text-white flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(asset.listedDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6">Transaction History</h3>
          <div className="space-y-4">
            {asset.history.map((event, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between py-4 border-b border-white/10 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    event.type === 'Listed' ? 'bg-purple-400' :
                    event.type === 'Minted' ? 'bg-green-400' :
                    'bg-blue-400'
                  }`} />
                  <div>
                    <div className="text-white font-medium">{event.type}</div>
                    <div className="text-gray-400 text-sm">{formatDate(event.date)}</div>
                  </div>
                </div>
                <div className="text-right">
                  {event.price && (
                    <div className="text-orange-400 font-semibold mb-1">{event.price} BTC</div>
                  )}
                  <div className="text-gray-400 text-sm font-mono">{event.from}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Assets */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">More from {asset.game}</h3>
            <Link
              href={`/marketplace?game=${asset.game}`}
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              View All
            </Link>
          </div>
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-gray-400">Similar assets will appear here</p>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full">
            <PurchaseFlow
              assetId={asset.id}
              assetName={asset.name}
              assetImage={asset.image}
              priceInSats={asset.priceInSats}
              sellerAddress={asset.seller}
              onSuccess={() => {
                setShowPurchaseModal(false);
                // Redirect to profile or show success message
              }}
              onCancel={() => setShowPurchaseModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

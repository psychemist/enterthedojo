'use client';

import { useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { CartridgeWalletButton } from '@/components/CartridgeWalletButton';
import { StarknetWalletButton } from '@/components/StarknetWalletButton';
import { BitcoinWalletButton } from '@/components/BitcoinWalletButton';

// Mock data for demonstration - will be replaced with actual game integrations
const MOCK_GAMES = [
  {
    id: 'eternum',
    name: 'Eternum',
    logo: '🏰',
    contract: '0x...',
    assets: [
      { id: '1', name: 'Realm #42', type: 'Territory', rarity: 'Legendary' },
      { id: '2', name: 'Dragon Sword', type: 'Weapon', rarity: 'Epic' },
    ],
    achievements: [
      { id: '1', name: 'First Conquest', earned: true },
      { id: '2', name: 'Master Builder', earned: true },
    ],
  },
  {
    id: 'loot-survivor',
    name: 'Loot Survivor',
    logo: '⚔️',
    contract: '0x...',
    assets: [
      { id: '101', name: 'Adventurer #7', type: 'Character', rarity: 'Rare' },
      { id: '102', name: 'Katana', type: 'Weapon', rarity: 'Common' },
    ],
    achievements: [
      { id: '1', name: 'Beast Slayer', earned: true },
    ],
  },
];

export default function ProfilePage() {
  const { isConnected, connector } = useAccount();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const isCartridgeConnected = isConnected && connector?.id === 'controller';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Your Gaming Profile
          </h1>
          <p className="text-gray-400 text-lg">
            Cross-game identity powered by Cartridge Controller
          </p>
        </div>

        {/* Wallet Connections */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Cartridge Controller */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Cartridge</h2>
                <p className="text-sm text-gray-400">Cross-Game Identity</p>
              </div>
            </div>
            <CartridgeWalletButton />
          </div>

          {/* Starknet Wallet */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Starknet</h2>
                <p className="text-sm text-gray-400">Contract Interactions</p>
              </div>
            </div>
            <StarknetWalletButton />
          </div>

          {/* Bitcoin Wallet */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-orange-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">₿</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Bitcoin</h2>
                <p className="text-sm text-gray-400">Payments</p>
              </div>
            </div>
            <BitcoinWalletButton />
          </div>
        </div>

        {/* Profile Content */}
        {!isCartridgeConnected ? (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-gray-700/50">
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3">Connect with Cartridge Controller</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Link your Cartridge account to view your cross-game assets, achievements, and unified gaming identity.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Account Overview */}
            <div className="bg-gradient-to-r from-purple-800/30 to-indigo-800/30 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold mb-4">Account Overview</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400">{MOCK_GAMES.length}</div>
                  <div className="text-gray-400 mt-1">Games Linked</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400">
                    {MOCK_GAMES.reduce((acc, game) => acc + game.assets.length, 0)}
                  </div>
                  <div className="text-gray-400 mt-1">Total Assets</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400">
                    {MOCK_GAMES.reduce((acc, game) => acc + game.achievements.filter(a => a.earned).length, 0)}
                  </div>
                  <div className="text-gray-400 mt-1">Achievements</div>
                </div>
              </div>
            </div>

            {/* Linked Games */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-6">Linked Games</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {MOCK_GAMES.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGame(selectedGame === game.id ? null : game.id)}
                    className={`p-4 rounded-xl border-2 transition text-left ${
                      selectedGame === game.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{game.logo}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{game.name}</h3>
                        <p className="text-sm text-gray-400">
                          {game.assets.length} assets • {game.achievements.filter(a => a.earned).length} achievements
                        </p>
                      </div>
                      <svg
                        className={`w-6 h-6 transition ${
                          selectedGame === game.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Expanded Game Details */}
                    {selectedGame === game.id && (
                      <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                        {/* Assets */}
                        <div>
                          <h4 className="font-semibold mb-2 text-purple-400">Assets</h4>
                          <div className="space-y-2">
                            {game.assets.map((asset) => (
                              <div
                                key={asset.id}
                                className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg"
                              >
                                <div>
                                  <div className="font-medium">{asset.name}</div>
                                  <div className="text-xs text-gray-400">{asset.type}</div>
                                </div>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    asset.rarity === 'Legendary'
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : asset.rarity === 'Epic'
                                      ? 'bg-purple-500/20 text-purple-400'
                                      : asset.rarity === 'Rare'
                                      ? 'bg-blue-500/20 text-blue-400'
                                      : 'bg-gray-500/20 text-gray-400'
                                  }`}
                                >
                                  {asset.rarity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Achievements */}
                        <div>
                          <h4 className="font-semibold mb-2 text-green-400">Achievements</h4>
                          <div className="space-y-2">
                            {game.achievements.map((achievement) => (
                              <div
                                key={achievement.id}
                                className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg"
                              >
                                <span className="text-xl">
                                  {achievement.earned ? '🏆' : '🔒'}
                                </span>
                                <span className={achievement.earned ? 'text-white' : 'text-gray-500'}>
                                  {achievement.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-500/30 text-center">
              <h3 className="text-2xl font-bold mb-3">Ready to Trade?</h3>
              <p className="text-gray-300 mb-6">
                List your game assets on the marketplace and trade with Bitcoin
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/debug"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
                >
                  Go to Marketplace
                </a>
                <a
                  href="/test"
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
                >
                  Test Trading
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

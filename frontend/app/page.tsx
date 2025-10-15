'use client';

import Link from 'next/link';
import { ArrowRight, Gamepad2, ShoppingBag, Wallet, TrendingUp } from 'lucide-react';
import { AssetCard } from '@/components';

export default function Home() {
  // Mock featured games
  const featuredGames = [
    {
      id: 1,
      name: 'Eternum',
      description: 'Strategic empire building on-chain',
      icon: '🏰',
      totalAssets: 1247,
      activeListings: 89,
    },
    {
      id: 2,
      name: 'Loot Survivor',
      description: 'Roguelike survival adventure',
      icon: '⚔️',
      totalAssets: 893,
      activeListings: 67,
    },
    {
      id: 3,
      name: 'Realm of Legends',
      description: 'Fantasy realm exploration',
      icon: '🗡️',
      totalAssets: 645,
      activeListings: 42,
    },
  ];

  // Mock recent listings
  const recentListings = [
    {
      id: '1',
      name: 'Legendary Sword',
      game: 'Loot Survivor',
      gameIcon: '⚔️',
      price: '0.005',
      image: '⚔️',
      rarity: 'Legendary' as const,
      seller: '0x1234...5678',
    },
    {
      id: '2',
      name: 'Rare Kingdom',
      game: 'Eternum',
      gameIcon: '🏰',
      price: '0.012',
      image: '🏰',
      rarity: 'Epic' as const,
      seller: '0x2345...6789',
    },
    {
      id: '3',
      name: 'Epic Shield',
      game: 'Realm of Legends',
      gameIcon: '🗡️',
      price: '0.008',
      image: '🛡️',
      rarity: 'Mythical' as const,
      seller: '0x3456...7890',
    },
    {
      id: '4',
      name: 'Ancient Armor',
      game: 'Loot Survivor',
      gameIcon: '⚔️',
      price: '0.015',
      image: '🦾',
      rarity: 'Epic' as const,
      seller: '0x4567...8901',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
              <span className="text-purple-400 text-sm font-medium">Powered by Dojo Engine</span>
              <span className="text-purple-300">×</span>
              <span className="text-orange-400 text-sm font-medium">Bitcoin Payments</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Your Universal
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 text-transparent bg-clip-text">
                On-Chain Gaming Hub
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Trade assets across multiple Dojo-powered games. One identity, one marketplace, infinite possibilities.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/marketplace"
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 flex items-center gap-2"
              >
                Explore Marketplace
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/profile"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full font-semibold text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                View Your Assets
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">2,785</div>
                <div className="text-gray-400">Total Assets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">198</div>
                <div className="text-gray-400">Active Listings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">3</div>
                <div className="text-gray-400">Supported Games</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">1,247</div>
                <div className="text-gray-400">Total Traders</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Trade your on-chain gaming assets seamlessly with Bitcoin payments
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <Wallet className="w-8 h-8" />,
                title: 'Connect Your Wallets',
                description: 'Link your Cartridge Controller and Bitcoin wallet',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: <Gamepad2 className="w-8 h-8" />,
                title: 'View Your Assets',
                description: 'See all your game assets in one unified profile',
                color: 'from-pink-500 to-orange-500',
              },
              {
                icon: <ShoppingBag className="w-8 h-8" />,
                title: 'List or Browse',
                description: 'List your items or discover assets from other players',
                color: 'from-orange-500 to-yellow-500',
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Trade with BTC',
                description: 'Buy and sell using Bitcoin with instant settlement',
                color: 'from-yellow-500 to-green-500',
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 text-white`}>
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-400">
                    {step.description}
                  </p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Featured Games
          </h2>
          <p className="text-gray-400 text-center mb-16">
            Trade assets from your favorite Dojo-powered games
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredGames.map((game) => (
              <Link
                key={game.id}
                href={`/marketplace?game=${game.name}`}
                className="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="text-6xl mb-4">{game.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {game.name}
                </h3>
                <p className="text-gray-400 mb-6">{game.description}</p>
                
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="text-gray-500">Total Assets</div>
                    <div className="text-white font-semibold">{game.totalAssets.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Listed</div>
                    <div className="text-purple-400 font-semibold">{game.activeListings}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">
                Recent Listings
              </h2>
              <p className="text-gray-400">
                Fresh items added to the marketplace
              </p>
            </div>
            <Link
              href="/marketplace"
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-2 group"
            >
              View All
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentListings.map((listing) => (
              <AssetCard
                key={listing.id}
                id={listing.id}
                name={listing.name}
                game={listing.game}
                gameIcon={listing.gameIcon}
                price={listing.price}
                image={listing.image}
                rarity={listing.rarity}
                seller={listing.seller}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/30">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Trading?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join the first universal marketplace for on-chain gaming assets
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/profile"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                Connect Wallet
              </Link>
              <Link
                href="/marketplace"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full font-semibold text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { AssetCard, NoAssetsFound } from '@/components';

// Mock data for now - will be replaced with real contract data
interface MockListing {
  id: string;
  name: string;
  game: string;
  gameIcon: string;
  price: string;
  image: string;
  rarity: string;
  attributes: Record<string, string | number | boolean>;
  seller: string;
}

const MOCK_LISTINGS: MockListing[] = [
  {
    id: '1',
    name: 'Legendary Dragon Sword',
    game: 'Loot Survivor',
    gameIcon: '⚔️',
    price: '0.0085',
    image: '🗡️',
    rarity: 'Legendary',
    attributes: { attack: 95, durability: 88 },
    seller: '0x1234...5678',
  },
  {
    id: '2',
    name: 'Ancient Kingdom',
    game: 'Eternum',
    gameIcon: '🏰',
    price: '0.0245',
    image: '👑',
    rarity: 'Epic',
    attributes: { population: 1250, resources: 'High' },
    seller: '0x2345...6789',
  },
  {
    id: '3',
    name: 'Mythical Shield',
    game: 'Realm of Legends',
    gameIcon: '🗡️',
    price: '0.0125',
    image: '🛡️',
    rarity: 'Mythical',
    attributes: { defense: 92, magic: 45 },
    seller: '0x3456...7890',
  },
  {
    id: '4',
    name: 'Epic Armor Set',
    game: 'Loot Survivor',
    gameIcon: '⚔️',
    price: '0.0198',
    image: '🦾',
    rarity: 'Epic',
    attributes: { defense: 88, health: 150 },
    seller: '0x4567...8901',
  },
  {
    id: '5',
    name: 'Rare Castle',
    game: 'Eternum',
    gameIcon: '🏰',
    price: '0.0156',
    image: '🏰',
    rarity: 'Rare',
    attributes: { level: 5, defense: 75 },
    seller: '0x5678...9012',
  },
  {
    id: '6',
    name: 'Enchanted Bow',
    game: 'Realm of Legends',
    gameIcon: '🗡️',
    price: '0.0089',
    image: '🏹',
    rarity: 'Rare',
    attributes: { attack: 78, range: 100 },
    seller: '0x6789...0123',
  },
  {
    id: '7',
    name: 'Fire Staff',
    game: 'Loot Survivor',
    gameIcon: '⚔️',
    price: '0.0134',
    image: '🪄',
    rarity: 'Epic',
    attributes: { magic: 90, mana: 200 },
    seller: '0x7890...1234',
  },
  {
    id: '8',
    name: 'Empire Token',
    game: 'Eternum',
    gameIcon: '🏰',
    price: '0.0067',
    image: '🪙',
    rarity: 'Common',
    attributes: { value: 100, tradeable: true },
    seller: '0x8901...2345',
  },
];

const GAMES = ['All Games', 'Eternum', 'Loot Survivor', 'Realm of Legends'];
const RARITIES = ['All Rarities', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythical'];
const SORT_OPTIONS = [
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'Name A-Z' },
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('All Games');
  const [selectedRarity, setSelectedRarity] = useState('All Rarities');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort listings
  const filteredListings = MOCK_LISTINGS.filter((listing) => {
    const matchesSearch = listing.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGame === 'All Games' || listing.game === selectedGame;
    const matchesRarity = selectedRarity === 'All Rarities' || listing.rarity === selectedRarity;
    return matchesSearch && matchesGame && matchesRarity;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGame('All Games');
    setSelectedRarity('All Rarities');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Marketplace
          </h1>
          <p className="text-gray-400 text-lg">
            Discover and trade assets from across the Dojo ecosystem
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white mb-4"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </button>

          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Game Filter */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Game</label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                >
                  {GAMES.map((game) => (
                    <option key={game} value={game} className="bg-gray-800">
                      {game}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rarity Filter */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Rarity</label>
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                >
                  {RARITIES.map((rarity) => (
                    <option key={rarity} value={rarity} className="bg-gray-800">
                      {rarity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-end">
                <div className="text-gray-400">
                  <span className="text-white font-semibold">{filteredListings.length}</span> assets found
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <AssetCard
                key={listing.id}
                id={listing.id}
                name={listing.name}
                game={listing.game}
                gameIcon={listing.gameIcon}
                price={listing.price}
                image={listing.image}
                rarity={listing.rarity as 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical'}
                attributes={listing.attributes}
                seller={listing.seller}
              />
            ))}
          </div>
        ) : (
          <NoAssetsFound onReset={handleResetFilters} />
        )}
      </div>
    </div>
  );
}

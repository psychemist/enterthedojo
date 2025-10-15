'use client';

import { useGames, useAssets, useListings } from '@/lib/api/hooks';
import { LoadingSpinner, EmptyState } from '@/components';

/**
 * Demo page showing API caching with SWR
 * This demonstrates how to use the caching hooks
 */
export default function ApiCacheDemoPage() {
  // Fetch games with caching
  const { games, isLoading: gamesLoading, isError: gamesError, mutate: refreshGames } = useGames(true);
  
  // Fetch assets with caching
  const { assets, isLoading: assetsLoading, isError: assetsError, mutate: refreshAssets } = useAssets({
    limit: 5,
  });
  
  // Fetch listings with caching
  const { listings, isLoading: listingsLoading, mutate: refreshListings } = useListings({
    limit: 5,
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            API Caching Demo
          </h1>
          <p className="text-gray-400">
            This page demonstrates SWR-powered API caching. Data is cached and automatically revalidated.
          </p>
        </div>

        {/* Games Section */}
        <section className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Verified Games</h2>
            <button
              onClick={() => refreshGames()}
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Refresh
            </button>
          </div>
          
          {gamesLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          )}
          
          {gamesError && (
            <div className="text-red-400 bg-red-900/20 rounded-lg p-4">
              Error loading games: {gamesError.message}
            </div>
          )}
          
          {!gamesLoading && !gamesError && games.length === 0 && (
            <EmptyState 
              icon="🎮"
              title="No Games Found"
              description="No verified games are currently available."
            />
          )}
          
          {!gamesLoading && games.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <div key={game.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{game.icon}</span>
                    <div>
                      <h3 className="font-semibold">{game.name}</h3>
                      <p className="text-sm text-gray-400">{game.totalAssets} assets</p>
                    </div>
                  </div>
                  {game.isVerified && (
                    <span className="inline-block px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                      Verified
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Assets Section */}
        <section className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Assets</h2>
            <button
              onClick={() => refreshAssets()}
              className="px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              Refresh
            </button>
          </div>
          
          {assetsLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" color="orange" />
            </div>
          )}
          
          {assetsError && (
            <div className="text-red-400 bg-red-900/20 rounded-lg p-4">
              Error loading assets: {assetsError.message}
            </div>
          )}
          
          {!assetsLoading && assets.length > 0 && (
            <div className="space-y-3">
              {assets.map((asset) => (
                <div key={asset.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{asset.name}</h3>
                    <p className="text-sm text-gray-400">
                      {asset.gameId} • {asset.assetType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Owner</p>
                    <p className="font-mono text-xs">{asset.owner.slice(0, 10)}...</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Listings Section */}
        <section className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Marketplace Listings</h2>
            <button
              onClick={() => refreshListings()}
              className="px-4 py-2 bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors text-sm"
            >
              Refresh
            </button>
          </div>
          
          {listingsLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" color="purple" />
            </div>
          )}
          
          {!listingsLoading && listings.length > 0 && (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Listing #{listing.id}</h3>
                      <p className="text-sm text-gray-400">
                        Asset ID: {listing.assetId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-400">{listing.price} STRK</p>
                      <p className="text-xs text-gray-400">
                        {listing.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Cache Info */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span>ℹ️</span>
            Cache Information
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Data is automatically cached and reused across page navigations</li>
            <li>• Cache is revalidated on window focus (disabled in this demo)</li>
            <li>• Cache is revalidated on reconnection</li>
            <li>• Failed requests are retried up to 3 times with 5s intervals</li>
            <li>• Click &quot;Refresh&quot; buttons to manually revalidate cached data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

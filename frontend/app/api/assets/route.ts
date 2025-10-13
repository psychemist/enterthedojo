import { NextRequest, NextResponse } from 'next/server';
import { getAdapterRegistry } from '../../../../indexer/adapters';
import { UniversalAsset } from '../../../../indexer/adapters/types';

/**
 * GET /api/assets
 * Get all assets with optional filters
 * 
 * Query params:
 * - owner: Filter by owner address
 * - gameId: Filter by game
 * - assetType: Filter by asset type
 * - limit: Max results (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const owner = searchParams.get('owner');
    const gameId = searchParams.get('gameId');
    const assetType = searchParams.get('assetType');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const registry = getAdapterRegistry();
    
    let assets: UniversalAsset[] = [];

    if (owner) {
      // Get assets for specific owner
      assets = await registry.getAllAssetsByOwner(owner);
    } else if (gameId) {
      // Get assets from specific game
      const adapter = registry.getAdapter(gameId);
      if (!adapter) {
        return NextResponse.json(
          { error: `Game not found: ${gameId}` },
          { status: 404 }
        );
      }
      
      // This would need to be implemented in adapters
      // For now, return empty array
      assets = [];
    } else {
      // Get all assets (limited)
      // This is a placeholder - would need pagination at adapter level (TODO)
      // for (const adapter of registry.getAllAdapters()) {
      //   const gameAssets: UniversalAsset[] = await adapter.getAllAssets(limit, offset);
      //   assets.push(...gameAssets);
      // }
      assets = [];
    }

    // Filter by asset type if specified
    if (assetType) {
      assets = assets.filter((asset: UniversalAsset) => asset.assetType === assetType);
    }

    // Apply pagination
    const paginatedAssets = assets.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedAssets,
      meta: {
        total: assets.length,
        limit,
        offset,
        hasMore: offset + limit < assets.length,
      },
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

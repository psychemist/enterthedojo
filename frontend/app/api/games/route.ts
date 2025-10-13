import { NextRequest, NextResponse } from 'next/server';
import { getAdapterRegistry } from '../../../../indexer/adapters';
import { GameMetadata } from '../../../../indexer/adapters/types';

/**
 * GET /api/games
 * Get all registered games
 * 
 * Query params:
 * - verifiedOnly: Only return verified games (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';

    const registry = getAdapterRegistry();
    let games: GameMetadata[] = registry.getAllGamesMetadata();

    // Filter for verified games if requested
    if (verifiedOnly) {
      games = games.filter((game: GameMetadata) => game.isVerified);
    }

    return NextResponse.json({
      data: games,
      meta: {
        total: games.length,
      },
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

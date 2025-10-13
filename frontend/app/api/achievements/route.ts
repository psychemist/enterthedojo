import { NextRequest, NextResponse } from 'next/server';
import { PlayerAchievement } from '../../../../indexer/adapters/types';

/**
 * GET /api/achievements
 * Get player achievements across all games
 * 
 * Query params:
 * - player: Player address (required)
 * - gameId: Filter by game
 * - limit: Max results (default: 50)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const player = searchParams.get('player');
    const gameId = searchParams.get('gameId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!player) {
      return NextResponse.json(
        { error: 'Player address is required' },
        { status: 400 }
      );
    }

    // TODO: Query Torii for achievements
    // This would query the achievement aggregator contract
    // const query = `
    //   query GetAchievements($player: String!, $gameId: String) {
    //     achievements(
    //       where: { 
    //         player: $player, 
    //         gameId: $gameId
    //       },
    //       limit: ${limit},
    //       offset: ${offset}
    //     ) {
    //       id
    //       player
    //       gameContract
    //       achievementId
    //       points
    //       unlockedAt
    //       metadata
    //     }
    //   }
    // `;

    // Placeholder response - would use gameId filter when implementing
    const achievements: PlayerAchievement[] = [];
    const totalPoints = 0;
    
    // Example: if (gameId) query.where.gameId = gameId;

    return NextResponse.json({
      data: {
        achievements,
        totalPoints,
        player,
      },
      meta: {
        total: achievements.length,
        limit,
        offset,
        hasMore: false,
      },
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import {
  GameAdapter,
  UniversalAsset,
  GameMetadata,
  AssetType,
} from './types';

/**
 * Abstract base class for game adapters
 * Provides common functionality and enforces interface implementation
 */
export abstract class BaseGameAdapter implements GameAdapter {
  abstract gameId: string;
  abstract gameName: string;
  abstract contractAddress: string;

  /**
   * Transform raw game data to universal format
   * Must be implemented by each game adapter
   */
  abstract transformAsset(rawData: any): UniversalAsset;

  /**
   * Get assets owned by a specific address
   */
  abstract getAssetsByOwner(owner: string): Promise<UniversalAsset[]>;

  /**
   * Get a specific asset by ID
   */
  abstract getAsset(assetId: string): Promise<UniversalAsset | null>;

  /**
   * Validate that data belongs to this game
   */
  abstract isValidGameData(data: any): boolean;

  /**
   * Get game metadata
   */
  abstract getGameMetadata(): GameMetadata;

  /**
   * Helper: Generate unique asset ID
   */
  protected generateAssetId(gameId: string, tokenId: string): string {
    return `${gameId}-${tokenId}`;
  }

  /**
   * Helper: Parse asset type from game data
   */
  protected parseAssetType(rawType: string): AssetType {
    const typeMap: Record<string, AssetType> = {
      'character': AssetType.CHARACTER,
      'item': AssetType.ITEM,
      'achievement': AssetType.ACHIEVEMENT,
      'currency': AssetType.CURRENCY,
      'nft': AssetType.NFT,
    };

    return typeMap[rawType.toLowerCase()] || AssetType.OTHER;
  }

  /**
   * Helper: Format image URL
   */
  protected formatImageUrl(url: string | undefined, fallback?: string): string {
    if (!url) return fallback || '/images/placeholder-asset.png';
    
    // Handle IPFS URLs
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }

    return url;
  }

  /**
   * Helper: Convert timestamp to ISO string
   */
  protected formatTimestamp(timestamp: number | string): string {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    return new Date(ts * 1000).toISOString();
  }

  /**
   * Helper: Clean and validate address
   */
  protected formatAddress(address: string): string {
    // Ensure address has 0x prefix
    if (!address.startsWith('0x')) {
      return `0x${address}`;
    }
    return address.toLowerCase();
  }
}

/**
 * Adapter Registry
 * Manages all game adapters and routes data to the appropriate adapter
 */
export class AdapterRegistry {
  private adapters: Map<string, GameAdapter> = new Map();

  /**
   * Register a game adapter
   */
  register(adapter: GameAdapter): void {
    this.adapters.set(adapter.gameId, adapter);
    console.log(`✅ Registered adapter for game: ${adapter.gameName}`);
  }

  /**
   * Get adapter for a specific game
   */
  getAdapter(gameId: string): GameAdapter | undefined {
    return this.adapters.get(gameId);
  }

  /**
   * Get all registered adapters
   */
  getAllAdapters(): GameAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Transform asset using appropriate adapter
   */
  async transformAsset(gameId: string, rawData: any): Promise<UniversalAsset | null> {
    const adapter = this.getAdapter(gameId);
    if (!adapter) {
      console.warn(`No adapter found for game: ${gameId}`);
      return null;
    }

    if (!adapter.isValidGameData(rawData)) {
      console.warn(`Invalid data for game: ${gameId}`);
      return null;
    }

    return adapter.transformAsset(rawData);
  }

  /**
   * Get assets for owner across all games
   */
  async getAllAssetsByOwner(owner: string): Promise<UniversalAsset[]> {
    const allAssets: UniversalAsset[] = [];

    for (const adapter of this.adapters.values()) {
      try {
        const assets = await adapter.getAssetsByOwner(owner);
        allAssets.push(...assets);
      } catch (error) {
        console.error(`Error fetching assets from ${adapter.gameName}:`, error);
      }
    }

    return allAssets;
  }

  /**
   * Get all game metadata
   */
  getAllGamesMetadata(): GameMetadata[] {
    return this.getAllAdapters().map(adapter => adapter.getGameMetadata());
  }
}

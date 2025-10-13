// Universal Asset Schema
// This interface normalizes data from different Dojo games

export interface UniversalAsset {
  id: string;
  gameId: string;
  gameName: string;
  assetType: AssetType;
  name: string;
  description: string;
  imageUrl: string;
  attributes: AssetAttribute[];
  owner: string;
  contractAddress: string;
  tokenId: string;
  listedForSale: boolean;
  price?: string;
  listedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AssetType {
  CHARACTER = 'character',
  ITEM = 'item',
  ACHIEVEMENT = 'achievement',
  CURRENCY = 'currency',
  NFT = 'nft',
  OTHER = 'other'
}

export interface AssetAttribute {
  traitType: string;
  value: string | number;
  displayType?: 'number' | 'string' | 'date' | 'percentage';
}

export interface GameMetadata {
  id: string;
  name: string;
  contractAddress: string;
  isVerified: boolean;
  description?: string;
  imageUrl?: string;
  website?: string;
}

// Base adapter interface that all game adapters must implement
export interface GameAdapter {
  gameId: string;
  gameName: string;
  contractAddress: string;

  // Transform raw game data to universal format
  transformAsset(rawData: any): UniversalAsset;

  // Get assets for a specific owner
  getAssetsByOwner(owner: string): Promise<UniversalAsset[]>;

  // Get a specific asset
  getAsset(assetId: string): Promise<UniversalAsset | null>;

  // Validate that data is from this game
  isValidGameData(data: any): boolean;

  // Get game metadata
  getGameMetadata(): GameMetadata;
}

// Achievement interface
export interface UniversalAchievement {
  id: string;
  gameId: string;
  name: string;
  description: string;
  points: number;
  isCrossGame: boolean;
  imageUrl?: string;
  requirements?: string;
}

export interface PlayerAchievement {
  achievementId: string;
  player: string;
  unlockedAt: string;
  gameContract: string;
}

// Marketplace Listing interface
export interface MarketplaceListing {
  id: string;
  seller: string;
  gameContract: string;
  assetId: string;
  priceBtcSats: string;
  isActive: boolean;
  listedAt: string;
}

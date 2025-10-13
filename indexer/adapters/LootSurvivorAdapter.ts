import { BaseGameAdapter } from './BaseAdapter';
import {
  UniversalAsset,
  GameMetadata,
  AssetType,
  AssetAttribute,
} from './types';

/**
 * Example Adapter for "Loot Survivor" - A Dojo adventure game
 * This is a template that should be customized based on the actual game's data structure
 */
export class LootSurvivorAdapter extends BaseGameAdapter {
  gameId = 'loot-survivor';
  gameName = 'Loot Survivor';
  contractAddress = '0x...'; // Replace with actual contract address

  /**
   * Transform Loot Survivor game data to universal format
   */
  transformAsset(rawData: any): UniversalAsset {
    // Loot Survivor-specific data structure (customize based on actual game)
    const {
      adventurer_id,
      owner,
      item_type,
      item_name,
      level,
      xp,
      health,
      gold,
      weapon,
      armor,
      created_at,
      last_action,
    } = rawData;

    // Build attributes from game-specific data
    const attributes: AssetAttribute[] = [];

    if (level) {
      attributes.push({
        traitType: 'Level',
        value: level,
        displayType: 'number',
      });
    }

    if (xp) {
      attributes.push({
        traitType: 'XP',
        value: xp,
        displayType: 'number',
      });
    }

    if (health) {
      attributes.push({
        traitType: 'Health',
        value: health,
        displayType: 'number',
      });
    }

    if (gold) {
      attributes.push({
        traitType: 'Gold',
        value: gold,
        displayType: 'number',
      });
    }

    if (weapon) {
      attributes.push({
        traitType: 'Weapon',
        value: weapon,
      });
    }

    if (armor) {
      attributes.push({
        traitType: 'Armor',
        value: armor,
      });
    }

    // Determine if this is an adventurer or an item
    const isAdventurer = adventurer_id && !item_type;
    const assetName = isAdventurer
      ? `Adventurer #${adventurer_id}`
      : item_name || `${item_type} #${adventurer_id}`;

    return {
      id: this.generateAssetId(this.gameId, adventurer_id),
      gameId: this.gameId,
      gameName: this.gameName,
      assetType: this.determineAssetType(item_type, isAdventurer),
      name: assetName,
      description: this.generateDescription(isAdventurer, level, item_type),
      imageUrl: this.formatImageUrl(this.getAssetImage(item_type, isAdventurer)),
      attributes,
      owner: this.formatAddress(owner),
      contractAddress: this.contractAddress,
      tokenId: adventurer_id.toString(),
      listedForSale: false, // Will be updated by marketplace indexer
      createdAt: this.formatTimestamp(created_at),
      updatedAt: this.formatTimestamp(last_action || Date.now()),
    };
  }

  /**
   * Get assets owned by a specific address
   */
  async getAssetsByOwner(owner: string): Promise<UniversalAsset[]> {
    // TODO: Implement actual GraphQL query to Torii
    const query = `
      query GetLootSurvivorAssets($owner: String!) {
        adventurers(where: { owner: $owner }) {
          adventurer_id
          owner
          level
          xp
          health
          gold
          weapon
          armor
          created_at
          last_action
        }
        items(where: { owner: $owner }) {
          adventurer_id
          owner
          item_type
          item_name
          created_at
        }
      }
    `;

    // Placeholder - would actually query Torii
    const rawAssets: any[] = []; // await queryTorii(query, { owner });

    return rawAssets.map(raw => this.transformAsset(raw));
  }

  /**
   * Get a specific asset
   */
  async getAsset(assetId: string): Promise<UniversalAsset | null> {
    // Extract tokenId from universal ID
    const tokenId = assetId.replace(`${this.gameId}-`, '');

    const query = `
      query GetLootSurvivorAsset($adventurerId: String!) {
        adventurer(id: $adventurerId) {
          adventurer_id
          owner
          level
          xp
          health
          gold
          weapon
          armor
          created_at
          last_action
        }
      }
    `;

    // Placeholder - would actually query Torii
    const rawAsset: any = null; // await queryTorii(query, { adventurerId: tokenId });

    return rawAsset ? this.transformAsset(rawAsset) : null;
  }

  /**
   * Validate that data is from Loot Survivor
   */
  isValidGameData(data: any): boolean {
    return (
      data &&
      typeof data.adventurer_id !== 'undefined' &&
      typeof data.owner !== 'undefined' &&
      (typeof data.level !== 'undefined' || typeof data.item_type !== 'undefined')
    );
  }

  /**
   * Get game metadata
   */
  getGameMetadata(): GameMetadata {
    return {
      id: this.gameId,
      name: this.gameName,
      contractAddress: this.contractAddress,
      isVerified: true,
      description: 'A play-to-die on-chain adventure game',
      imageUrl: '/images/games/loot-survivor.png',
      website: 'https://lootsurvivor.io',
    };
  }

  /**
   * Helper: Determine asset type
   */
  private determineAssetType(itemType: string | undefined, isAdventurer: boolean): AssetType {
    if (isAdventurer) {
      return AssetType.CHARACTER;
    }

    if (!itemType) {
      return AssetType.OTHER;
    }

    const typeMapping: Record<string, AssetType> = {
      'weapon': AssetType.ITEM,
      'armor': AssetType.ITEM,
      'potion': AssetType.ITEM,
      'loot': AssetType.NFT,
    };

    return typeMapping[itemType.toLowerCase()] || AssetType.OTHER;
  }

  /**
   * Helper: Generate description
   */
  private generateDescription(isAdventurer: boolean, level?: number, itemType?: string): string {
    if (isAdventurer) {
      return `A level ${level || 1} adventurer in Loot Survivor`;
    }
    return `A ${itemType || 'item'} from Loot Survivor`;
  }

  /**
   * Helper: Get asset image based on type
   */
  private getAssetImage(itemType: string | undefined, isAdventurer: boolean): string {
    if (isAdventurer) {
      return '/images/loot-survivor/adventurer.png';
    }

    if (!itemType) {
      return '/images/placeholder-item.png';
    }

    const imageMap: Record<string, string> = {
      'weapon': '/images/loot-survivor/weapon.png',
      'armor': '/images/loot-survivor/armor.png',
      'potion': '/images/loot-survivor/potion.png',
    };

    return imageMap[itemType.toLowerCase()] || '/images/placeholder-item.png';
  }
}

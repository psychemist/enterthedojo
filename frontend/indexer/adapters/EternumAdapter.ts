import { BaseGameAdapter } from './BaseAdapter';
import {
  UniversalAsset,
  GameMetadata,
  AssetType,
  AssetAttribute,
} from './types';

/**
 * Example Adapter for "Eternum" - A Dojo strategy game
 * This is a template that should be customized based on the actual game's data structure
 */
export class EternumAdapter extends BaseGameAdapter {
  gameId = 'eternum';
  gameName = 'Eternum';
  contractAddress = '0x...'; // Replace with actual contract address

  /**
   * Transform Eternum game data to universal format
   */
  transformAsset(rawData: any): UniversalAsset {
    // Eternum-specific data structure (customize based on actual game)
    const {
      entity_id,
      owner,
      resource_type,
      amount,
      position,
      created_at,
      metadata,
    } = rawData;

    // Build attributes from game-specific data
    const attributes: AssetAttribute[] = [];

    if (amount) {
      attributes.push({
        traitType: 'Amount',
        value: amount,
        displayType: 'number',
      });
    }

    if (position) {
      attributes.push({
        traitType: 'Position',
        value: `(${position.x}, ${position.y})`,
      });
    }

    if (resource_type) {
      attributes.push({
        traitType: 'Resource Type',
        value: resource_type,
      });
    }

    return {
      id: this.generateAssetId(this.gameId, entity_id),
      gameId: this.gameId,
      gameName: this.gameName,
      assetType: this.determineAssetType(resource_type),
      name: metadata?.name || `${resource_type} #${entity_id}`,
      description: metadata?.description || `Eternum ${resource_type}`,
      imageUrl: this.formatImageUrl(metadata?.image),
      attributes,
      owner: this.formatAddress(owner),
      contractAddress: this.contractAddress,
      tokenId: entity_id.toString(),
      listedForSale: false, // Will be updated by marketplace indexer
      createdAt: this.formatTimestamp(created_at),
      updatedAt: this.formatTimestamp(Date.now()),
    };
  }

  /**
   * Get assets owned by a specific address
   */
  async getAssetsByOwner(owner: string): Promise<UniversalAsset[]> {
    // TODO: Implement actual GraphQL query to Torii
    // This is a placeholder showing the structure
    
    const query = `
      query GetEternumAssets($owner: String!) {
        eternumEntities(where: { owner: $owner }) {
          entity_id
          owner
          resource_type
          amount
          position
          created_at
          metadata
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
      query GetEternumAsset($entityId: String!) {
        eternumEntity(id: $entityId) {
          entity_id
          owner
          resource_type
          amount
          position
          created_at
          metadata
        }
      }
    `;

    // Placeholder - would actually query Torii
    const rawAsset: any = null; // await queryTorii(query, { entityId: tokenId });

    return rawAsset ? this.transformAsset(rawAsset) : null;
  }

  /**
   * Validate that data is from Eternum
   */
  isValidGameData(data: any): boolean {
    return (
      data &&
      typeof data.entity_id !== 'undefined' &&
      typeof data.owner !== 'undefined' &&
      typeof data.resource_type !== 'undefined'
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
      description: 'An on-chain strategy game built with Dojo',
      imageUrl: '/images/games/eternum.png',
      website: 'https://eternum.game',
    };
  }

  /**
   * Helper: Determine asset type from resource type
   */
  private determineAssetType(resourceType: string): AssetType {
    const typeMapping: Record<string, AssetType> = {
      'resource': AssetType.CURRENCY,
      'unit': AssetType.CHARACTER,
      'building': AssetType.ITEM,
      'realm': AssetType.NFT,
    };

    return typeMapping[resourceType?.toLowerCase()] || AssetType.OTHER;
  }
}

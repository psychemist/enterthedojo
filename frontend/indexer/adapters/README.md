# Game Adapters

This directory contains adapters that normalize data from different Dojo games into a universal format.

## Overview

Each game has its own data structure and model. Adapters transform game-specific data into a standardized `UniversalAsset` format that can be used consistently across the marketplace.

## Architecture

```
adapters/
├── types.ts              # Type definitions and interfaces
├── BaseAdapter.ts        # Abstract base class for adapters
├── EternumAdapter.ts     # Adapter for Eternum game
├── LootSurvivorAdapter.ts # Adapter for Loot Survivor game
└── index.ts              # Registry and exports
```

## Creating a New Adapter

1. **Create a new file** for your game (e.g., `YourGameAdapter.ts`)

2. **Extend BaseGameAdapter:**

```typescript
import { BaseGameAdapter } from './BaseAdapter';
import { UniversalAsset, GameMetadata, AssetType } from './types';

export class YourGameAdapter extends BaseGameAdapter {
  gameId = 'your-game';
  gameName = 'Your Game Name';
  contractAddress = '0x...';

  transformAsset(rawData: any): UniversalAsset {
    // Transform game-specific data to universal format
    return {
      id: this.generateAssetId(this.gameId, rawData.token_id),
      gameId: this.gameId,
      gameName: this.gameName,
      assetType: AssetType.ITEM,
      name: rawData.name,
      description: rawData.description,
      imageUrl: this.formatImageUrl(rawData.image),
      attributes: [], // Map your game's attributes
      owner: this.formatAddress(rawData.owner),
      contractAddress: this.contractAddress,
      tokenId: rawData.token_id.toString(),
      listedForSale: false,
      createdAt: this.formatTimestamp(rawData.created_at),
      updatedAt: this.formatTimestamp(Date.now()),
    };
  }

  async getAssetsByOwner(owner: string): Promise<UniversalAsset[]> {
    // Query Torii for owner's assets
    // Transform and return
  }

  async getAsset(assetId: string): Promise<UniversalAsset | null> {
    // Query Torii for specific asset
    // Transform and return
  }

  isValidGameData(data: any): boolean {
    // Validate data structure
    return data && data.token_id && data.owner;
  }

  getGameMetadata(): GameMetadata {
    return {
      id: this.gameId,
      name: this.gameName,
      contractAddress: this.contractAddress,
      isVerified: true,
      description: 'Your game description',
      imageUrl: '/images/games/your-game.png',
      website: 'https://yourgame.com',
    };
  }
}
```

3. **Register in index.ts:**

```typescript
import { YourGameAdapter } from './YourGameAdapter';

export function initializeAdapters(): AdapterRegistry {
  const registry = new AdapterRegistry();
  
  registry.register(new EternumAdapter());
  registry.register(new LootSurvivorAdapter());
  registry.register(new YourGameAdapter()); // Add here
  
  return registry;
}
```

## Universal Asset Schema

All adapters transform data to this format:

```typescript
interface UniversalAsset {
  id: string;                    // Unique ID: "gameId-tokenId"
  gameId: string;                // Game identifier
  gameName: string;              // Display name
  assetType: AssetType;          // CHARACTER | ITEM | ACHIEVEMENT | CURRENCY | NFT | OTHER
  name: string;                  // Asset name
  description: string;           // Description
  imageUrl: string;              // Image URL (formatted with IPFS handling)
  attributes: AssetAttribute[];  // Game-specific attributes
  owner: string;                 // Formatted owner address
  contractAddress: string;       // Game contract address
  tokenId: string;               // Token ID as string
  listedForSale: boolean;        // Marketplace status
  price?: string;                // Price if listed
  listedAt?: string;             // Listing timestamp
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}
```

## Helper Methods

BaseAdapter provides utility methods:

- `generateAssetId(gameId, tokenId)` - Create unique asset ID
- `parseAssetType(rawType)` - Map game types to AssetType enum
- `formatImageUrl(url, fallback)` - Handle IPFS URLs and fallbacks
- `formatTimestamp(timestamp)` - Convert to ISO string
- `formatAddress(address)` - Ensure 0x prefix and lowercase

## Adapter Registry

The AdapterRegistry manages all adapters:

```typescript
import { getAdapterRegistry } from './adapters';

const registry = getAdapterRegistry();

// Get specific adapter
const eternumAdapter = registry.getAdapter('eternum');

// Get all adapters
const allAdapters = registry.getAllAdapters();

// Transform asset
const universalAsset = await registry.transformAsset('eternum', rawData);

// Get all assets for owner
const allAssets = await registry.getAllAssetsByOwner('0x123...');

// Get all games metadata
const games = registry.getAllGamesMetadata();
```

## Testing Adapters

Create test data matching your game's structure:

```typescript
const testData = {
  token_id: '123',
  owner: '0x1234...',
  name: 'Test Item',
  // ... your game's fields
};

const adapter = new YourGameAdapter();
const asset = adapter.transformAsset(testData);

console.log(asset);
// Should output a valid UniversalAsset
```

## Querying Torii

Adapters should query Torii GraphQL endpoint:

```typescript
async getAssetsByOwner(owner: string): Promise<UniversalAsset[]> {
  const query = `
    query GetAssets($owner: String!) {
      yourGameAssets(where: { owner: $owner }) {
        token_id
        owner
        name
        // ... fields
      }
    }
  `;
  
  const response = await fetch('http://localhost:8080/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { owner } }),
  });
  
  const { data } = await response.json();
  return data.yourGameAssets.map(raw => this.transformAsset(raw));
}
```

## Current Adapters

### Eternum
- **Game ID:** `eternum`
- **Type:** Strategy game
- **Assets:** Resources, units, buildings, realms
- **Status:** Example template

### Loot Survivor
- **Game ID:** `loot-survivor`
- **Type:** Adventure game
- **Assets:** Adventurers, weapons, armor, items
- **Status:** Example template

## Adding Real Game Data

1. Study the game's Dojo models and entities
2. Identify the fields you need
3. Map them to UniversalAsset fields
4. Test with real contract data
5. Update Torii config to index the game

## Best Practices

1. ✅ Always validate data with `isValidGameData()`
2. ✅ Handle missing/optional fields gracefully
3. ✅ Use helper methods from BaseAdapter
4. ✅ Add comprehensive attributes for rich display
5. ✅ Keep transformations consistent
6. ✅ Document game-specific logic
7. ✅ Test with real game data before deploying

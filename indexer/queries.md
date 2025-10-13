# Example GraphQL Queries for Game Asset Aggregation

## Get all assets for a player

```graphql
query GetPlayerAssets($owner: String!, $limit: Int, $offset: Int) {
  assets(owner: $owner, limit: $limit, offset: $offset) {
    id
    gameId
    gameName
    assetType
    name
    description
    imageUrl
    owner
    contractAddress
    tokenId
    attributes {
      traitType
      value
      displayType
    }
    listedForSale
    price
  }
}
```

Variables:
```json
{
  "owner": "0x1234...",
  "limit": 20,
  "offset": 0
}
```

---

## Get active marketplace listings

```graphql
query GetActiveListings($gameId: String, $limit: Int) {
  activeListings(gameId: $gameId, limit: $limit) {
    id
    seller
    gameContract
    assetId
    priceBtcSats
    isActive
    listedAt
  }
}
```

Variables:
```json
{
  "gameId": "game-1",
  "limit": 50
}
```

---

## Get player achievements

```graphql
query GetPlayerAchievements($player: String!, $gameId: String) {
  playerAchievements(player: $player, gameId: $gameId) {
    achievementId
    player
    unlockedAt
    gameContract
  }
  
  playerTotalPoints(address: $player)
}
```

Variables:
```json
{
  "player": "0x1234...",
  "gameId": "game-1"
}
```

---

## Get player profile with all data

```graphql
query GetPlayerProfile($address: String!) {
  playerProfile(address: $address) {
    address
    totalAssets
    totalAchievements
    totalPoints
    games
  }
  
  playerAssets(address: $address) {
    id
    gameName
    assetType
    name
    imageUrl
  }
  
  playerAchievements(player: $address) {
    achievementId
    unlockedAt
  }
  
  userListings(seller: $address) {
    id
    assetId
    priceBtcSats
    isActive
  }
}
```

---

## Get all verified games

```graphql
query GetVerifiedGames {
  verifiedGames {
    id
    contractAddress
    name
    isVerified
    totalAssets
    totalListings
    registeredAt
  }
}
```

---

## Get cross-game achievements

```graphql
query GetCrossGameAchievements {
  crossGameAchievements {
    id
    gameId
    name
    description
    points
    isCrossGame
    imageUrl
    unlockedBy
  }
}
```

---

## Get specific asset details

```graphql
query GetAsset($id: ID!) {
  asset(id: $id) {
    id
    gameId
    gameName
    assetType
    name
    description
    imageUrl
    owner
    contractAddress
    tokenId
    attributes {
      traitType
      value
      displayType
    }
    listedForSale
    price
    createdAt
    updatedAt
  }
}
```

Variables:
```json
{
  "id": "asset-123"
}
```

---

## Search assets by type and game

```graphql
query SearchAssets($gameId: String!, $assetType: AssetType!, $limit: Int) {
  assets(gameId: $gameId, assetType: $assetType, limit: $limit) {
    id
    name
    imageUrl
    owner
    listedForSale
    price
  }
}
```

Variables:
```json
{
  "gameId": "game-1",
  "assetType": "CHARACTER",
  "limit": 10
}
```

---

## Real-time subscriptions

### Subscribe to new listings

```graphql
subscription OnAssetListed {
  assetListed {
    id
    seller
    assetId
    priceBtcSats
    listedAt
  }
}
```

### Subscribe to sales

```graphql
subscription OnAssetSold {
  assetSold {
    id
    seller
    assetId
    priceBtcSats
  }
}
```

### Subscribe to achievement unlocks

```graphql
subscription OnAchievementUnlocked {
  achievementUnlocked {
    achievementId
    player
    unlockedAt
  }
}
```

### Subscribe to new assets

```graphql
subscription OnNewAssetMinted {
  newAssetMinted {
    id
    gameName
    name
    owner
  }
}
```

---

## Pagination example

```graphql
query GetAssetsWithPagination($limit: Int!, $offset: Int!) {
  assets(limit: $limit, offset: $offset) {
    id
    name
    gameId
    owner
  }
}
```

Usage:
- Page 1: `{"limit": 20, "offset": 0}`
- Page 2: `{"limit": 20, "offset": 20}`
- Page 3: `{"limit": 20, "offset": 40}`

---

## Combined query for marketplace page

```graphql
query MarketplacePage($limit: Int!, $offset: Int!) {
  # Get all active listings
  activeListings(limit: $limit, offset: $offset) {
    id
    seller
    assetId
    priceBtcSats
    gameContract
    listedAt
  }
  
  # Get verified games for filters
  verifiedGames {
    id
    name
    contractAddress
  }
}
```

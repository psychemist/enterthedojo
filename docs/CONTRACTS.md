# Smart Contracts Documentation

## Overview

The marketplace consists of three main contracts:

1. **GameMarketplace**: Handles asset listings, purchases, and transfers
2. **GameRegistry**: Maintains a registry of supported Dojo games
3. **AchievementAggregator**: Tracks and manages cross-game achievements

## GameMarketplace Contract

### Data Structures

#### Listing
```cairo
struct Listing {
    seller: ContractAddress,
    game_contract: ContractAddress,
    asset_id: u256,
    price_btc_sats: u64,
    is_active: bool,
    listed_at: u64,
}
```

### Functions

#### list_asset
Lists an asset for sale.

**Parameters:**
- `game_contract`: The contract address of the game
- `asset_id`: The ID of the asset in the game
- `price_btc_sats`: Price in Bitcoin satoshis

**Returns:** `listing_id` (u256)

**Events:** `AssetListed`

#### cancel_listing
Cancels an active listing.

**Parameters:**
- `listing_id`: The ID of the listing to cancel

**Requirements:**
- Caller must be the seller
- Listing must be active

**Events:** `ListingCancelled`

#### buy_asset
Purchases a listed asset.

**Parameters:**
- `listing_id`: The ID of the listing to purchase
- `swap_proof`: Proof of BTC payment (from Atomiq)

**Requirements:**
- Listing must be active
- Buyer cannot be the seller
- swap_proof must be valid

**Events:** `AssetSold`

#### update_price
Updates the price of an active listing.

**Parameters:**
- `listing_id`: The ID of the listing
- `new_price_btc_sats`: New price in satoshis

**Requirements:**
- Caller must be the seller
- Listing must be active
- Price must be > 0

**Events:** `PriceUpdated`

#### get_listing
Retrieves listing details.

**Parameters:**
- `listing_id`: The ID of the listing

**Returns:** `Listing` struct

#### get_active_listings
Gets all active listing IDs.

**Returns:** Array of listing IDs

#### get_user_listings
Gets all listing IDs for a specific user.

**Parameters:**
- `user`: The user's contract address

**Returns:** Array of listing IDs

## GameRegistry Contract

### Data Structures

#### GameInfo
```cairo
struct GameInfo {
    contract_address: ContractAddress,
    name: felt252,
    is_verified: bool,
    registered_at: u64,
}
```

### Functions

#### register_game
Registers a new game.

**Parameters:**
- `contract_address`: The game's contract address
- `name`: The game's name (felt252)

**Returns:** `game_id` (u256)

**Requirements:**
- Game not already registered

**Events:** `GameRegistered`

#### verify_game
Marks a game as verified.

**Parameters:**
- `game_id`: The ID of the game

**Requirements:**
- Caller must be the owner
- Game must not already be verified

**Events:** `GameVerified`

#### unverify_game
Removes verification from a game.

**Parameters:**
- `game_id`: The ID of the game

**Requirements:**
- Caller must be the owner
- Game must be verified

**Events:** `GameUnverified`

#### get_game
Retrieves game information.

**Parameters:**
- `game_id`: The ID of the game

**Returns:** `GameInfo` struct

#### get_all_games
Gets all registered game IDs.

**Returns:** Array of game IDs

#### get_verified_games
Gets all verified game IDs.

**Returns:** Array of verified game IDs

#### is_game_registered
Checks if a contract address is registered.

**Parameters:**
- `contract_address`: The contract address to check

**Returns:** `bool`

## Deployment

### Prerequisites

- Starknet wallet with testnet ETH
- Scarb 2.8.0+
- Starkli for deployment

### Build

```bash
cd contracts
scarb build
```

### Deploy

```bash
# Declare the contract
starkli declare target/dev/game_marketplace_GameMarketplace.contract_class.json \
  --account ~/.starkli-wallets/account.json \
  --rpc https://starknet-sepolia.public.blastapi.io

# Deploy marketplace
starkli deploy <MARKETPLACE_CLASS_HASH> <OWNER_ADDRESS> \
  --account ~/.starkli-wallets/account.json

# Deploy registry
starkli deploy <REGISTRY_CLASS_HASH> <OWNER_ADDRESS> \
  --account ~/.starkli-wallets/account.json
```

## Integration Notes

### Bitcoin Payment Flow

1. User selects asset and price is quoted in BTC
2. User initiates Atomiq swap (BTC → STRK)
3. Atomiq returns swap_proof upon completion
4. User calls `buy_asset()` with swap_proof
5. Contract verifies proof and transfers asset

### Game Integration

1. Game developer registers game via `register_game()`
2. Admin verifies game via `verify_game()`
3. Players can list assets from verified games
4. Marketplace queries game contract for ownership verification

## Security Considerations

1. **Access Control**: Only sellers can cancel/update their listings
2. **Payment Verification**: swap_proof must be validated before transfer
3. **Ownership Check**: Game contract should verify seller owns asset
4. **Reentrancy**: Consider adding reentrancy guards for future versions
5. **Emergency Pause**: Consider adding pause functionality

## Testing

```bash
cd contracts
scarb test
```

## AchievementAggregator Contract

### Data Structures

#### Achievement
```cairo
struct Achievement {
    id: u256,
    game_id: u256,
    name: felt252,
    description: felt252,
    points: u32,
    is_cross_game: bool,
}
```

#### PlayerAchievement
```cairo
struct PlayerAchievement {
    achievement_id: u256,
    player: ContractAddress,
    unlocked_at: u64,
    game_contract: ContractAddress,
}
```

### Functions

#### register_achievement
Registers a new achievement for a game.

**Parameters:**
- `game_id`: The ID of the game
- `name`: Achievement name
- `description`: Achievement description
- `points`: Points awarded for this achievement
- `is_cross_game`: Whether this achievement spans multiple games

**Returns:** `achievement_id` (u256)

**Events:** `AchievementRegistered`

#### unlock_achievement
Unlocks an achievement for a player.

**Parameters:**
- `achievement_id`: The ID of the achievement
- `player`: The player's address
- `game_contract`: The game contract where achievement was earned

**Requirements:**
- Player must not already have this achievement
- Achievement must exist

**Events:** `AchievementUnlocked`

#### get_achievement
Retrieves achievement details.

**Parameters:**
- `achievement_id`: The ID of the achievement

**Returns:** `Achievement` struct

#### get_player_achievements
Gets all achievement IDs for a player across all games.

**Parameters:**
- `player`: The player's address

**Returns:** Array of achievement IDs

#### get_player_achievements_for_game
Gets all achievement IDs for a player in a specific game.

**Parameters:**
- `player`: The player's address
- `game_id`: The game ID

**Returns:** Array of achievement IDs

#### get_player_total_points
Calculates total achievement points for a player.

**Parameters:**
- `player`: The player's address

**Returns:** Total points (u32)

#### has_achievement
Checks if a player has unlocked a specific achievement.

**Parameters:**
- `player`: The player's address
- `achievement_id`: The achievement ID

**Returns:** `bool`

#### get_cross_game_achievements
Gets all cross-game achievement IDs.

**Returns:** Array of achievement IDs

### Achievement Integration Flow

1. Game developer registers achievements via `register_achievement()`
2. When player completes achievement in-game, call `unlock_achievement()`
3. Achievement is tracked across all games
4. Players can view total points and badges
5. Cross-game achievements unlock based on multi-game progress

## Future Enhancements

1. Auction system
2. Bundle sales
3. Royalty payments to game developers
4. Escrow system for safer trades
5. Multi-asset swaps
6. Achievement-based rewards and NFT badges
7. Leaderboards for top achievers

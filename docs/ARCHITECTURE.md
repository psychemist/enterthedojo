# Architecture Overview

## System Components

### 1. Smart Contracts (Cairo/Starknet)

#### Marketplace Contract
- **Purpose**: Manages asset listings, purchases, and transfers
- **Key Functions**:
  - `list_asset()`: List an asset for sale
  - `cancel_listing()`: Remove a listing
  - `buy_asset()`: Purchase an asset with BTC payment verification
  - `update_price()`: Modify listing price

#### Game Registry Contract
- **Purpose**: Maintains a registry of supported Dojo games
- **Key Functions**:
  - `register_game()`: Add a new game to the registry
  - `update_game_metadata()`: Update game information
  - `verify_game()`: Verify game authenticity

### 2. Data Aggregation Layer

#### Torii Indexer
- Indexes on-chain data from multiple Dojo games
- Provides GraphQL API for querying game state
- Real-time event listening for asset changes

#### Game Adapters
- Normalize data from different game formats
- Transform game-specific assets into universal format
- Handle game-specific metadata extraction

### 3. Bitcoin Integration

#### Xverse Wallet
- Bitcoin wallet connectivity
- Transaction signing
- Balance checking

#### Atomiq SDK
- BTC to STRK swaps
- Price quotation
- Swap status tracking

### 4. Identity Layer

#### Cartridge Controller
- Cross-game identity management
- Session key handling
- Multi-game authentication

### 5. Frontend (Next.js)

#### Pages
- Landing page
- Marketplace
- User profile
- Asset details

#### State Management
- Wallet connections
- Transaction states
- API response caching

## Data Flow

### Asset Purchase Flow

```
1. User browses marketplace
   ↓
2. User selects asset → Get BTC price
   ↓
3. User connects Xverse wallet
   ↓
4. User confirms purchase
   ↓
5. Atomiq swap: BTC → STRK equivalent
   ↓
6. Smart contract: marketplace.buy_asset()
   ↓
7. Asset ownership transferred
   ↓
8. UI updated with new ownership
```

### Asset Aggregation Flow

```
1. Torii indexes game contracts
   ↓
2. Events captured (mint, transfer, etc.)
   ↓
3. Game adapters normalize data
   ↓
4. Data stored in cache/database
   ↓
5. GraphQL API serves unified data
   ↓
6. Frontend displays aggregated assets
```

## Technology Stack Details

### Smart Contract Layer
- **Language**: Cairo 2.x
- **Network**: Starknet Sepolia (testnet)
- **Package Manager**: Scarb
- **Testing**: Cairo Test

### Indexer Layer
- **Tool**: Torii (Dojo's native indexer)
- **Database**: PostgreSQL
- **API**: GraphQL
- **Real-time**: WebSocket subscriptions

### Frontend Layer
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **State**: React Context / Zustand
- **Blockchain**: starknet-react, wagmi

### Integration Layer
- **Bitcoin Wallet**: Xverse SDK
- **BTC Swaps**: Atomiq SDK
- **Identity**: Cartridge Controller SDK

## Security Considerations

1. **Smart Contract Security**
   - Access control for admin functions
   - Reentrancy guards
   - Input validation
   - Emergency pause mechanisms

2. **Bitcoin Payment Verification**
   - Verify swap completion before asset transfer
   - Handle failed swaps gracefully
   - Transaction status tracking

3. **User Data Privacy**
   - No sensitive data stored on-chain
   - Wallet addresses only
   - Metadata stored off-chain

## Scalability Considerations

1. **Indexer Performance**
   - Caching layer for frequently accessed data
   - Pagination for large result sets
   - Rate limiting on API endpoints

2. **Smart Contract Optimization**
   - Minimize storage reads/writes
   - Batch operations where possible
   - Efficient data structures

3. **Frontend Performance**
   - Image optimization
   - Lazy loading
   - Code splitting
   - CDN for static assets

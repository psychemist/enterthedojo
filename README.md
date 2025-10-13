# Universal On-Chain Gaming Hub

A unified platform that aggregates assets and achievements from multiple Dojo-powered games, enabling cross-game identity and a Bitcoin-powered marketplace.

## 🎮 Features

- **Cross-Game Asset Aggregation**: View all your gaming assets from multiple Dojo games in one place
- **Bitcoin Marketplace**: Buy and sell game assets using Bitcoin as the primary currency
- **Unified Identity**: Single identity across multiple games via Cartridge Controller
- **Achievement Tracking**: Track achievements across your gaming ecosystem

## 🛠 Tech Stack

- **Smart Contracts**: Cairo/Starknet
- **Game Framework**: Dojo
- **Identity**: Cartridge Controller
- **Bitcoin Payments**: Xverse Wallet + Atomiq SDK
- **Frontend**: Next.js, React, TailwindCSS
- **Indexing**: Torii (Dojo Indexer)

## 📁 Project Structure

```
/contracts          # Cairo smart contracts
/frontend          # Next.js web application
/indexer           # Torii indexer configuration
/docs              # Documentation
/scripts           # Deployment and utility scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Dojo toolchain
- Scarb (Cairo package manager)
- Xverse Wallet (for Bitcoin)

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd resolve
```

2. Install dependencies
```bash
# Frontend
cd frontend
npm install

# Contracts
cd ../contracts
scarb build
```

3. Set up environment variables
```bash
cp .env.example .env
# Add your API keys and configuration
```

### Development

```bash
# Start frontend development server
cd frontend
npm run dev

# Deploy contracts (testnet)
cd contracts
scarb build
starkli deploy ...
```

## 📚 Documentation

See the `/docs` folder for detailed documentation:
- [Architecture](./docs/ARCHITECTURE.md)
- [Smart Contracts](./docs/CONTRACTS.md)
- [API Reference](./docs/API.md)

## 🎯 Roadmap

- [x] Phase 1: Foundation & Setup
- [ ] Phase 2: Smart Contracts
- [ ] Phase 3: Data Aggregation
- [ ] Phase 4: Bitcoin Integration
- [ ] Phase 5: Identity Integration
- [ ] Phase 6: Frontend Development
- [ ] Phase 7: Testing
- [ ] Phase 8: Demo & Deployment

## 🤝 Contributing

This is a hackathon project. Contributions welcome!

## 📝 License

MIT

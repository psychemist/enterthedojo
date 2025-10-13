# Development Setup Guide

## Prerequisites

### Required Tools

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be >= 18
   ```

2. **Scarb** (Cairo package manager)
   ```bash
   scarb --version
   ```
   
   If not installed:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
   ```

3. **Dojo** (Game engine framework)
   ```bash
   dojo --version
   ```
   
   If not installed:
   ```bash
   curl -L https://install.dojoengine.org | bash
   dojoup
   ```

4. **Starkli** (Starknet CLI)
   ```bash
   starkli --version
   ```
   
   If not installed:
   ```bash
   curl https://get.starkli.sh | sh
   starkliup
   ```

### Recommended Tools

- **Git** for version control
- **VS Code** with Cairo extension
- **PostgreSQL** for Torii indexer

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <repo-url>
cd resolve

# Install frontend dependencies
cd frontend
npm install

# Build contracts
cd ../contracts
scarb build
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
# - Get Starknet RPC URL from Alchemy/Infura
# - Get Atomiq API key from atomiq.exchange
# - Get Cartridge App ID from cartridge.gg
```

### 3. Set Up Starknet Account

```bash
# Create a new account (testnet)
starkli account fetch <ACCOUNT_ADDRESS> --rpc https://starknet-sepolia.public.blastapi.io

# Or create from scratch
starkli account oz init ~/.starkli-wallets/account.json

# Get testnet ETH from faucet
# Visit: https://starknet-faucet.vercel.app/
```

### 4. Deploy Contracts

```bash
cd contracts
scarb build

# Deploy marketplace contract
starkli declare target/dev/game_marketplace_GameMarketplace.contract_class.json --account ~/.starkli-wallets/account.json

# Deploy instance
starkli deploy <CLASS_HASH> --account ~/.starkli-wallets/account.json
```

### 5. Start Development Server

```bash
# Frontend
cd frontend
npm run dev
# Visit http://localhost:3000

# Torii indexer (in separate terminal)
cd indexer
torii --world <WORLD_ADDRESS> --rpc https://starknet-sepolia.public.blastapi.io
```

## Wallet Setup

### Xverse Wallet (Bitcoin)

1. Install Xverse browser extension
2. Create/import wallet
3. Switch to testnet
4. Get testnet BTC from faucet

### Argent/Braavos (Starknet)

1. Install extension
2. Create wallet
3. Switch to Sepolia testnet
4. Get testnet ETH

### Cartridge Controller

1. Visit cartridge.gg
2. Create account
3. Note your App ID for `.env`

## Testing

```bash
# Test contracts
cd contracts
scarb test

# Test frontend
cd frontend
npm run test

# End-to-end tests
npm run test:e2e
```

## Troubleshooting

### "Scarb not found"
- Ensure Scarb is in your PATH
- Restart terminal after installation
- Run: `source ~/.bashrc` or `source ~/.zshrc`

### "RPC connection failed"
- Check your RPC URL in `.env`
- Verify internet connection
- Try alternative RPC provider

### "Transaction reverted"
- Check account has enough testnet ETH
- Verify contract addresses are correct
- Review transaction parameters

## Useful Commands

```bash
# Check all tool versions
node --version
npm --version
scarb --version
dojo --version
starkli --version

# Clean build
cd contracts && scarb clean
cd frontend && rm -rf .next node_modules && npm install

# View contract logs
starkli transaction <TX_HASH> --rpc <RPC_URL>

# Format code
cd contracts && scarb fmt
cd frontend && npm run lint
```

## Next Steps

1. Review [Architecture](./ARCHITECTURE.md)
2. Study [Smart Contracts](./CONTRACTS.md)
3. Check [API Reference](./API.md)
4. Start building! 🚀

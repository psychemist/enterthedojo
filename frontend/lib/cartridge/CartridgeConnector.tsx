'use client';

import { ControllerConnector } from '@cartridge/connector';

// Cartridge Controller configuration
export const cartridgeConnector = new ControllerConnector({
  policies: [
    {
      target: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT || '',
      method: 'list_asset',
      description: 'List your game assets for sale',
    },
    {
      target: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT || '',
      method: 'buy_asset',
      description: 'Purchase game assets',
    },
    {
      target: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT || '',
      method: 'cancel_listing',
      description: 'Cancel your asset listings',
    },
  ],
  // Configure RPC endpoint for Starknet Sepolia
  chains: [
    {
      rpcUrl: 'https://api.cartridge.gg/x/starknet/sepolia',
    },
  ],
});

// Helper to get Cartridge session
export function useCartridgeSession() {
  // This will be used to check if user is authenticated with Cartridge
  // and access their cross-game identity
  return {
    isConnected: false, // Will be updated based on connector status
    username: null,
    gamesLinked: [],
  };
}

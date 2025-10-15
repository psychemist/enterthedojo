'use client';

import { ControllerConnector } from '@cartridge/connector';

// Cartridge Controller configuration with defensive programming
let connector: ControllerConnector | null = null;

try {
  connector = new ControllerConnector({
    policies: [
      {
        target: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || '0x1',
        method: 'list_asset',
        description: 'List your game assets for sale',
      },
      {
        target: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || '0x1',
        method: 'buy_asset',
        description: 'Purchase game assets',
      },
      {
        target: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || '0x1',
        method: 'cancel_listing',
        description: 'Cancel your asset listings',
      },
    ],
    // Configure Cartridge Controller URL
    url: 'https://x.cartridge.gg',
  });
} catch (error) {
  console.error('Failed to initialize Cartridge Controller:', error);
}

// Export with fallback
export const cartridgeConnector = connector || ({
  id: 'controller',
  name: 'Cartridge Controller',
  // Provide minimal connector interface to prevent errors
} as unknown as ControllerConnector);

// Helper to safely get Cartridge username
export function getCartridgeUsername(account: unknown): string | null {
  try {
    // Cartridge stores username in different places depending on version
    const acc = account as Record<string, unknown>;
    return (acc?.username as string) || 
           ((acc?.controller as Record<string, unknown>)?.username as string) ||
           ((acc?.profile as Record<string, unknown>)?.name as string) ||
           null;
  } catch {
    return null;
  }
}

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

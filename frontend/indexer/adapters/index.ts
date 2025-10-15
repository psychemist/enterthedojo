/**
 * Game Adapters Index
 * Central registry for all game adapters
 */

import { AdapterRegistry } from './BaseAdapter';
import { EternumAdapter } from './EternumAdapter';
import { LootSurvivorAdapter } from './LootSurvivorAdapter';

// Export types
export * from './types';
export { BaseGameAdapter, AdapterRegistry } from './BaseAdapter';

// Export adapters
export { EternumAdapter } from './EternumAdapter';
export { LootSurvivorAdapter } from './LootSurvivorAdapter';

/**
 * Initialize and configure the adapter registry
 */
export function initializeAdapters(): AdapterRegistry {
  const registry = new AdapterRegistry();

  // Register all game adapters
  registry.register(new EternumAdapter());
  registry.register(new LootSurvivorAdapter());

  // Add more adapters here as they are created
  // registry.register(new AnotherGameAdapter());

  console.log(`📊 Initialized ${registry.getAllAdapters().length} game adapters`);

  return registry;
}

/**
 * Get the global adapter registry instance
 */
let globalRegistry: AdapterRegistry | null = null;

export function getAdapterRegistry(): AdapterRegistry {
  if (!globalRegistry) {
    globalRegistry = initializeAdapters();
  }
  return globalRegistry;
}

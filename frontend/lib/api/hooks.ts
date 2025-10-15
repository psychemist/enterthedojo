'use client';

import useSWR, { mutate as swrMutate } from 'swr';
import type { SWRConfiguration } from 'swr';

// SWR configuration
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

// Fetcher function for API calls
const fetcher = async (url: string) => {
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.') as Error & {
      info?: unknown;
      status?: number;
    };
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  
  return res.json();
};

// Asset types
export interface Asset {
  id: string;
  name: string;
  gameId: string;
  assetType: string;
  owner: string;
  imageUrl?: string;
  attributes: Record<string, string | number>;
}

export interface AssetsResponse {
  data: Asset[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Game types
export interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  isVerified: boolean;
  totalAssets: number;
  contractAddress?: string;
}

export interface GamesResponse {
  data: Game[];
  meta: {
    total: number;
  };
}

// Listing types
export interface Listing {
  id: string;
  assetId: string;
  gameContract: string;
  price: string;
  seller: string;
  isActive: boolean;
  createdAt: number;
}

export interface ListingsResponse {
  data: Listing[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Hook to fetch all games
 * @param verifiedOnly - Only return verified games
 * @param config - SWR configuration overrides
 */
export function useGames(
  verifiedOnly: boolean = false,
  config?: SWRConfiguration
) {
  const params = new URLSearchParams();
  if (verifiedOnly) params.append('verifiedOnly', 'true');
  
  const url = `/api/games?${params.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<GamesResponse>(
    url,
    fetcher,
    { ...defaultConfig, ...config }
  );

  return {
    games: data?.data || [],
    total: data?.meta.total || 0,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch assets with filters
 * @param filters - Filter parameters
 * @param config - SWR configuration overrides
 */
export function useAssets(
  filters?: {
    owner?: string;
    gameId?: string;
    assetType?: string;
    limit?: number;
    offset?: number;
  },
  config?: SWRConfiguration
) {
  const params = new URLSearchParams();
  if (filters?.owner) params.append('owner', filters.owner);
  if (filters?.gameId) params.append('gameId', filters.gameId);
  if (filters?.assetType) params.append('assetType', filters.assetType);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());
  
  const url = `/api/assets?${params.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<AssetsResponse>(
    url,
    fetcher,
    { ...defaultConfig, ...config }
  );

  return {
    assets: data?.data || [],
    total: data?.meta.total || 0,
    hasMore: data?.meta.hasMore || false,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch a single asset by ID
 * @param assetId - Asset ID
 * @param config - SWR configuration overrides
 */
export function useAsset(
  assetId: string | null,
  config?: SWRConfiguration
) {
  const url = assetId ? `/api/assets/${assetId}` : null;
  
  const { data, error, isLoading, mutate } = useSWR<Asset>(
    url,
    fetcher,
    { ...defaultConfig, ...config }
  );

  return {
    asset: data || null,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch marketplace listings
 * @param filters - Filter parameters
 * @param config - SWR configuration overrides
 */
export function useListings(
  filters?: {
    gameId?: string;
    seller?: string;
    minPrice?: string;
    maxPrice?: string;
    limit?: number;
    offset?: number;
  },
  config?: SWRConfiguration
) {
  const params = new URLSearchParams();
  if (filters?.gameId) params.append('gameId', filters.gameId);
  if (filters?.seller) params.append('seller', filters.seller);
  if (filters?.minPrice) params.append('minPrice', filters.minPrice);
  if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());
  
  const url = `/api/marketplace/listings?${params.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<ListingsResponse>(
    url,
    fetcher,
    { ...defaultConfig, ...config }
  );

  return {
    listings: data?.data || [],
    total: data?.meta.total || 0,
    hasMore: data?.meta.hasMore || false,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch a single listing by ID
 * @param listingId - Listing ID
 * @param config - SWR configuration overrides
 */
export function useListing(
  listingId: string | null,
  config?: SWRConfiguration
) {
  const url = listingId ? `/api/marketplace/listings/${listingId}` : null;
  
  const { data, error, isLoading, mutate } = useSWR<Listing>(
    url,
    fetcher,
    { ...defaultConfig, ...config }
  );

  return {
    listing: data || null,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to fetch user's achievements
 * @param address - User's Starknet address
 * @param config - SWR configuration overrides
 */
export function useAchievements(
  address: string | null,
  config?: SWRConfiguration
) {
  const url = address ? `/api/achievements?address=${address}` : null;
  
  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    { ...defaultConfig, ...config }
  );

  return {
    achievements: data?.data || [],
    total: data?.meta?.total || 0,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Mutate multiple cache keys at once
 * Useful after transactions that affect multiple endpoints
 */
export function mutateCacheKeys(keys: string[]) {
  return Promise.all(keys.map(key => swrMutate(key)));
}

// Re-export mutate for global cache updates
export { mutate } from 'swr';

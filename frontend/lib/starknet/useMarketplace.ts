import { useCallback, useMemo } from "react";
import { useContract, useReadContract, useSendTransaction } from "@starknet-react/core";
import { uint256 } from "starknet";
import { marketplaceAbi } from "./abis/marketplace";

const rawMarketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT;

const MARKETPLACE_ADDRESS: `0x${string}` | undefined =
  rawMarketplaceAddress && rawMarketplaceAddress.startsWith("0x")
    ? (rawMarketplaceAddress as `0x${string}`)
    : undefined;

type Uint256Input = bigint | string | number | { low: bigint; high: bigint };

function toUint256(value: Uint256Input) {
  if (typeof value === "object" && "low" in value && "high" in value) {
    return value;
  }

  const bn = typeof value === "bigint" ? value : BigInt(value);
  return uint256.bnToUint256(bn);
}

function toU64(value: bigint | string | number) {
  return BigInt(value);
}

export type Listing = {
  seller: `0x${string}`;
  game_contract: `0x${string}`;
  asset_id: { low: bigint; high: bigint };
  price_btc_sats: bigint;
  is_active: boolean;
  listed_at: bigint;
};

export function useMarketplaceContract() {
  return useContract({
    abi: marketplaceAbi,
    address: MARKETPLACE_ADDRESS,
  });
}

export function useListAsset() {
  const { contract } = useMarketplaceContract();
  const { sendAsync, isPending } = useSendTransaction({ calls: undefined });

  const listAsset = useCallback(
    async (
      params: {
        gameContract: `0x${string}`;
        assetId: Uint256Input;
        priceInSats: bigint | string | number;
      }
    ) => {
      if (!contract) {
        throw new Error("Marketplace contract is not ready");
      }

      const call = contract.populate("list_asset", [
        params.gameContract,
        toUint256(params.assetId),
        toU64(params.priceInSats),
      ]);

      const result = await sendAsync([call]);
      return result.transaction_hash;
    },
    [contract, sendAsync]
  );

  return { listAsset, isPending };
}

export function useBuyAsset() {
  const { contract } = useMarketplaceContract();
  const { sendAsync, isPending } = useSendTransaction({ calls: undefined });

  const buyAsset = useCallback(
    async (
      params: {
        listingId: Uint256Input;
        swapProof?: string;
      }
    ) => {
      if (!contract) {
        throw new Error("Marketplace contract is not ready");
      }

      const call = contract.populate("buy_asset", [
        toUint256(params.listingId),
        params.swapProof ?? "0x0",
      ]);

      const result = await sendAsync([call]);
      return result.transaction_hash;
    },
    [contract, sendAsync]
  );

  return { buyAsset, isPending };
}

export function useAssetPrice(listingId: Uint256Input | null) {
  const enabled = Boolean(MARKETPLACE_ADDRESS && listingId !== null);

  const args = useMemo(() => {
    if (!enabled || listingId === null) {
      return undefined;
    }

    return [toUint256(listingId)];
  }, [enabled, listingId]);

  const query = useReadContract({
    abi: marketplaceAbi,
    address: MARKETPLACE_ADDRESS,
    functionName: "get_listing",
    args,
    enabled,
  });

  const listingRaw = query.data as
    | (Listing & {
        price_btc_sats: bigint | string | number;
        listed_at: bigint | string | number;
      })
    | undefined;

  const listing = listingRaw
    ? (() => {
        const asset = listingRaw.asset_id as {
          low: bigint | string | number;
          high: bigint | string | number;
        };

        return {
          ...listingRaw,
          asset_id: {
            low: BigInt(asset.low),
            high: BigInt(asset.high),
          },
          price_btc_sats: BigInt(listingRaw.price_btc_sats),
          listed_at: BigInt(listingRaw.listed_at),
        };
      })()
    : undefined;

  const price = listing?.price_btc_sats;

  return {
    price,
    listing,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
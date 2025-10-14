import type { Abi } from "starknet";

export const marketplaceAbi: Abi = [
  {
    type: "struct",
    name: "Listing",
    members: [
      {
        name: "seller",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "game_contract",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "asset_id",
        type: "core::integer::u256",
      },
      {
        name: "price_btc_sats",
        type: "core::integer::u64",
      },
      {
        name: "is_active",
        type: "core::bool",
      },
      {
        name: "listed_at",
        type: "core::integer::u64",
      },
    ],
  },
  {
    type: "function",
    name: "list_asset",
    state_mutability: "external",
    inputs: [
      {
        name: "game_contract",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "asset_id",
        type: "core::integer::u256",
      },
      {
        name: "price_btc_sats",
        type: "core::integer::u64",
      },
    ],
    outputs: [
      {
        type: "core::integer::u256",
      },
    ],
  },
  {
    type: "function",
    name: "cancel_listing",
    state_mutability: "external",
    inputs: [
      {
        name: "listing_id",
        type: "core::integer::u256",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "buy_asset",
    state_mutability: "external",
    inputs: [
      {
        name: "listing_id",
        type: "core::integer::u256",
      },
      {
        name: "swap_proof",
        type: "core::felt252",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "update_price",
    state_mutability: "external",
    inputs: [
      {
        name: "listing_id",
        type: "core::integer::u256",
      },
      {
        name: "new_price_btc_sats",
        type: "core::integer::u64",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "get_listing",
    state_mutability: "view",
    inputs: [
      {
        name: "listing_id",
        type: "core::integer::u256",
      },
    ],
    outputs: [
      {
        type: "Listing",
      },
    ],
  },
  {
    type: "function",
    name: "get_active_listings",
    state_mutability: "view",
    inputs: [],
    outputs: [
      {
        type: "core::array::Array::<core::integer::u256>",
      },
    ],
  },
  {
    type: "function",
    name: "get_user_listings",
    state_mutability: "view",
    inputs: [
      {
        name: "user",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
    outputs: [
      {
        type: "core::array::Array::<core::integer::u256>",
      },
    ],
  },
];

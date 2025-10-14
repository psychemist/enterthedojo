// Atomiq SDK Integration Types

import type { SpvFromBTCSwapState, ToBTCSwapState } from '@atomiqlabs/sdk';

export interface AtomiqConfig {
  starknetRpcUrl: string;
  bitcoinNetwork: 'mainnet' | 'testnet' | 'testnet4';
  customMempoolUrl?: string;
  pricingFeeDifferencePPM?: bigint; // Default 20000 (2%)
}

// Quote information returned when creating a swap
export interface AtomiqQuote {
  id: string; // Unique quote/swap ID
  fromAmount: string; // BTC amount in satoshis (input without fees)
  toAmount: string; // STRK amount (output)
  totalInput: string; // Total BTC including fees
  fee: string; // Fee in source token (BTC)
  rate: string; // Exchange rate BTC:STRK
  expiresAt: number; // Unix timestamp in milliseconds
  slippage: number; // Slippage percentage
  priceInfo: {
    swapPrice: number;
    marketPrice: number;
    difference: number;
  };
}

// Parameters for initiating a swap
export interface AtomiqSwapParams {
  fromCurrency: 'BTC';
  toCurrency: 'STRK';
  fromAmount: number; // Amount in satoshis
  exactIn: boolean; // true = specify input, false = specify output
  recipient: string; // Starknet address to receive STRK
  gasAmount?: bigint; // Optional gas drop amount in STRK
}

// Result of an initiated swap
export interface AtomiqSwapResult {
  swapId: string;
  status: AtomiqSwapStatus;
  fromAmount: bigint; // satoshis
  toAmount: bigint; // STRK in smallest unit
  bitcoinTxId?: string; // Bitcoin transaction ID
  starknetTxHash?: string; // Starknet transaction hash
  createdAt: number;
  completedAt?: number;
}

// Bitcoin transaction update callback
export interface BitcoinTxUpdate {
  txId: string;
  confirmations: number;
  targetConfirmations: number;
  estimatedTimeMs: number;
}

// Swap status types based on SDK states
export type AtomiqSwapStatus = 
  // From BTC -> Starknet states
  | 'CLOSED' // -5: Catastrophic failure
  | 'FAILED' // -4: Bitcoin tx double-spent
  | 'DECLINED' // -3: LP declined to process
  | 'QUOTE_EXPIRED' // -2: Quote expired
  | 'QUOTE_SOFT_EXPIRED' // -1: Quote probably expired
  | 'CREATED' // 0: Quote created, waiting for BTC tx
  | 'SIGNED' // 1: BTC tx signed by client
  | 'POSTED' // 2: BTC tx posted to LP
  | 'BROADCASTED' // 3: LP broadcasted BTC tx
  | 'FRONTED' // 4: STRK deposited ahead of time
  | 'BTC_TX_CONFIRMED' // 5: BTC tx confirmed
  | 'CLAIM_CLAIMED' // 6: STRK claimed to wallet
  // To BTC states (for completeness)
  | 'REFUNDED' // -3: Swap refunded
  | 'COMMITED' // 1: Swap initiated
  | 'SOFT_CLAIMED' // 2: LP processed but unconfirmed
  | 'CLAIMED' // 3: Completed successfully
  | 'REFUNDABLE'; // 4: Can be refunded

export interface AtomiqSwapUpdate {
  swapId: string;
  status: AtomiqSwapStatus;
  state: SpvFromBTCSwapState | ToBTCSwapState;
  message?: string;
  bitcoinTxId?: string;
  starknetTxHash?: string;
  timestamp: number;
}

// PSBT signing data for external wallets
export interface PsbtSigningData {
  psbt: string; // Base64 or hex encoded PSBT
  signInputs: number[]; // Indices of inputs to sign
  encoding: 'base64' | 'hex';
}

// Swap limits from the LP
export interface SwapLimits {
  input: {
    min: bigint;
    max: bigint;
  };
  output: {
    min: bigint;
    max: bigint;
  };
}

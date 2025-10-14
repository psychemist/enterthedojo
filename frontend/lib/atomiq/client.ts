import { 
  SwapperFactory, 
  BitcoinNetwork,
  SpvFromBTCSwapState,
} from '@atomiqlabs/sdk';
import { 
  StarknetInitializer, 
  type StarknetInitializerType 
} from '@atomiqlabs/chain-starknet';
import type {
  AtomiqConfig,
  AtomiqQuote,
  AtomiqSwapResult,
  AtomiqSwapStatus,
  AtomiqSwapUpdate,
  BitcoinTxUpdate,
  PsbtSigningData,
  SwapLimits,
} from './types';

// Create the factory with Starknet support
const Factory = new SwapperFactory<[StarknetInitializerType]>(
  [StarknetInitializer] as const
);

// Token references
const Tokens = Factory.Tokens;

export class AtomiqClient {
  private config: AtomiqConfig;
  private swapper: ReturnType<typeof Factory.newSwapper> | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private starknetSwapper: any | null = null; // Type inference is complex
  private initialized = false;

  constructor(config: AtomiqConfig) {
    this.config = config;
  }

  /**
   * Initialize the Atomiq swapper
   * Must be called before any swap operations
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create swapper with browser storage (Indexed DB)
      this.swapper = Factory.newSwapper({
        chains: {
          STARKNET: {
            rpcUrl: this.config.starknetRpcUrl,
          },
        },
        bitcoinNetwork: this.getBitcoinNetwork(),
        ...(this.config.pricingFeeDifferencePPM && {
          pricingFeeDifferencePPM: this.config.pricingFeeDifferencePPM,
        }),
      });

      // Initialize the swapper
      await this.swapper.init();

      // Extract Starknet-specific swapper
      this.starknetSwapper = this.swapper.withChain<'STARKNET'>('STARKNET');

      this.initialized = true;
      console.log('Atomiq swapper initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Atomiq swapper:', error);
      throw new Error('Failed to initialize Atomiq SDK');
    }
  }

  /**
   * Ensure the swapper is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.swapper || !this.starknetSwapper) {
      throw new Error('Atomiq client not initialized. Call initialize() first.');
    }
  }

  /**
   * Convert network string to BitcoinNetwork enum
   */
  private getBitcoinNetwork(): BitcoinNetwork {
    switch (this.config.bitcoinNetwork) {
      case 'mainnet':
        return BitcoinNetwork.MAINNET;
      case 'testnet':
        return BitcoinNetwork.TESTNET;
      case 'testnet4':
        return BitcoinNetwork.TESTNET4;
      default:
        return BitcoinNetwork.TESTNET;
    }
  }

  /**
   * Get swap limits for BTC -> STRK
   */
  async getSwapLimits(): Promise<SwapLimits> {
    this.ensureInitialized();

    try {
      const limits = this.swapper!.getSwapLimits(
        Tokens.BITCOIN.BTC,
        Tokens.STARKNET.STRK
      );

      return {
        input: {
          min: BigInt(limits.input.min.toString()),
          max: BigInt(limits.input.max.toString()),
        },
        output: {
          min: BigInt(limits.output.min.toString()),
          max: BigInt(limits.output.max.toString()),
        },
      };
    } catch (error) {
      console.error('Failed to get swap limits:', error);
      throw new Error('Failed to retrieve swap limits');
    }
  }

  /**
   * Get a quote for swapping BTC to STRK
   */
  async getQuote(params: {
    fromAmountSats: number;
    recipient: string;
    exactIn?: boolean;
    gasAmount?: bigint;
  }): Promise<AtomiqQuote> {
    this.ensureInitialized();

    try {
      const exactIn = params.exactIn ?? true;
      const amount = BigInt(params.fromAmountSats);

      // Create swap quote (doesn't execute yet)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const swap: any = await this.starknetSwapper!.swap(
        Tokens.BITCOIN.BTC,
        Tokens.STARKNET.STRK,
        amount,
        exactIn,
        undefined, // Source address not used for BTC swaps
        params.recipient,
        params.gasAmount ? { gasAmount: params.gasAmount } : undefined
      );

      // Extract quote information
      const inputWithoutFee = swap.getInputWithoutFee();
      const output = swap.getOutput();
      const fee = swap.getFee();
      const totalInput = swap.getInput();
      const expiry = swap.getQuoteExpiry();
      const priceInfo = swap.getPriceInfo();

      const quote: AtomiqQuote = {
        id: swap.getId(),
        fromAmount: inputWithoutFee.toString(),
        toAmount: output.toString(),
        totalInput: totalInput.toString(),
        fee: fee.amountInSrcToken.toString(),
        rate: priceInfo.swapPrice.toString(),
        expiresAt: expiry,
        slippage: 0, // SDK handles this internally
        priceInfo: {
          swapPrice: priceInfo.swapPrice,
          marketPrice: priceInfo.marketPrice,
          difference: priceInfo.difference,
        },
      };

      return quote;
    } catch (error) {
      console.error('Failed to get quote:', error);
      throw new Error('Failed to get swap quote');
    }
  }

  /**
   * Get PSBT (Partially Signed Bitcoin Transaction) for signing
   * Used with external wallets like Xverse
   */
  async getPsbtForSigning(
    swapId: string,
    bitcoinAddress: string,
    publicKey: string
  ): Promise<PsbtSigningData> {
    this.ensureInitialized();

    try {
      // Retrieve swap from storage
      const swap = await this.starknetSwapper!.getSwapById(swapId);
      if (!swap) {
        throw new Error('Swap not found');
      }

      // Get funded PSBT ready for signing
      const { psbt, signInputs } = await swap.getFundedPsbt({
        address: bitcoinAddress,
        publicKey: publicKey,
      });

      // Convert PSBT to base64 for external wallet signing
      const psbtBase64 = Buffer.from(psbt.toPSBT(0)).toString('base64');

      return {
        psbt: psbtBase64,
        signInputs,
        encoding: 'base64',
      };
    } catch (error) {
      console.error('Failed to get PSBT:', error);
      throw new Error('Failed to prepare Bitcoin transaction');
    }
  }

  /**
   * Submit signed PSBT to broadcast Bitcoin transaction
   */
  async submitSignedPsbt(
    swapId: string,
    signedPsbtBase64: string
  ): Promise<string> {
    this.ensureInitialized();

    try {
      // Import Transaction from @scure/btc-signer (used by Atomiq SDK)
      const { Transaction } = await import('@scure/btc-signer');
      
      // Retrieve swap
      const swap = await this.starknetSwapper!.getSwapById(swapId);
      if (!swap) {
        throw new Error('Swap not found');
      }

      // Parse signed PSBT back to transaction object
      const signedTransaction = Transaction.fromPSBT(
        Buffer.from(signedPsbtBase64, 'base64')
      );

      // Submit the signed PSBT
      const bitcoinTxId = await swap.submitPsbt(signedTransaction);

      return bitcoinTxId;
    } catch (error) {
      console.error('Failed to submit signed PSBT:', error);
      throw new Error('Failed to broadcast Bitcoin transaction');
    }
  }

  /**
   * Wait for Bitcoin transaction to be confirmed
   * Returns updates via callback
   */
  async waitForBitcoinConfirmation(
    swapId: string,
    onUpdate?: (update: BitcoinTxUpdate) => void
  ): Promise<boolean> {
    this.ensureInitialized();

    try {
      const swap = await this.starknetSwapper!.getSwapById(swapId);
      if (!swap) {
        throw new Error('Swap not found');
      }

      // Wait for Bitcoin transaction with progress updates
      await swap.waitForBitcoinTransaction(
        null,
        null,
        (txId: string, confirmations: number, targetConfirmations: number, transactionETAms: number) => {
          if (onUpdate) {
            onUpdate({
              txId,
              confirmations,
              targetConfirmations,
              estimatedTimeMs: transactionETAms,
            });
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Bitcoin transaction failed:', error);
      return false;
    }
  }

  /**
   * Wait for swap to be claimed or fronted by LP
   * Fronting means LP deposits STRK ahead of time
   */
  async waitForSwapCompletion(
    swapId: string,
    timeoutMs: number = 30000
  ): Promise<boolean> {
    this.ensureInitialized();

    try {
      const swap = await this.starknetSwapper!.getSwapById(swapId);
      if (!swap) {
        throw new Error('Swap not found');
      }

      // Create timeout signal
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        // Wait for swap to be claimed or fronted
        await swap.waitTillClaimedOrFronted(controller.signal);
        clearTimeout(timeout);
        return true;
      } catch (error) {
        clearTimeout(timeout);
        
        // If timeout, we can try to claim ourselves
        if ((error as Error).name === 'AbortError') {
          console.log('Auto-claim timeout, attempting manual claim...');
          // In production, would need Starknet signer here
          // await swap.claim(starknetSigner);
          return false;
        }
        throw error;
      }
    } catch (error) {
      console.error('Swap completion failed:', error);
      return false;
    }
  }

  /**
   * Get the current state of a swap
   */
  async getSwapStatus(swapId: string): Promise<AtomiqSwapUpdate> {
    this.ensureInitialized();

    try {
      const swap = await this.starknetSwapper!.getSwapById(swapId);
      if (!swap) {
        throw new Error('Swap not found');
      }

      const state = swap.getState();
      const bitcoinTxId = swap.getBitcoinTxId?.();

      const update: AtomiqSwapUpdate = {
        swapId: swap.getId(),
        status: this.mapSwapState(state),
        state,
        message: this.getStateDescription(state),
        bitcoinTxId,
        timestamp: Date.now(),
      };

      return update;
    } catch (error) {
      console.error('Failed to get swap status:', error);
      throw new Error('Failed to get swap status');
    }
  }

  /**
   * Get full swap details
   */
  async getSwapDetails(swapId: string): Promise<AtomiqSwapResult> {
    this.ensureInitialized();

    try {
      const swap = await this.starknetSwapper!.getSwapById(swapId);
      if (!swap) {
        throw new Error('Swap not found');
      }

      const state = swap.getState();
      const bitcoinTxId = swap.getBitcoinTxId?.();
      const input = swap.getInput();
      const output = swap.getOutput();

      const result: AtomiqSwapResult = {
        swapId: swap.getId(),
        status: this.mapSwapState(state),
        fromAmount: BigInt(input.toString()),
        toAmount: BigInt(output.toString()),
        bitcoinTxId,
        createdAt: Date.now(), // SDK doesn't expose this, would need to track separately
      };

      // Mark as completed if in final state
      if (
        state === 6 || // CLAIM_CLAIMED
        state === SpvFromBTCSwapState.FRONTED
      ) {
        result.completedAt = Date.now();
      }

      return result;
    } catch (error) {
      console.error('Failed to get swap details:', error);
      throw new Error('Failed to get swap details');
    }
  }

  /**
   * Map SDK swap state to our simplified status
   */
  private mapSwapState(state: SpvFromBTCSwapState): AtomiqSwapStatus {
    switch (state) {
      case SpvFromBTCSwapState.CLOSED:
        return 'CLOSED';
      case SpvFromBTCSwapState.FAILED:
        return 'FAILED';
      case SpvFromBTCSwapState.DECLINED:
        return 'DECLINED';
      case SpvFromBTCSwapState.QUOTE_EXPIRED:
        return 'QUOTE_EXPIRED';
      case SpvFromBTCSwapState.QUOTE_SOFT_EXPIRED:
        return 'QUOTE_SOFT_EXPIRED';
      case SpvFromBTCSwapState.CREATED:
        return 'CREATED';
      case SpvFromBTCSwapState.SIGNED:
        return 'SIGNED';
      case SpvFromBTCSwapState.POSTED:
        return 'POSTED';
      case SpvFromBTCSwapState.BROADCASTED:
        return 'BROADCASTED';
      case SpvFromBTCSwapState.FRONTED:
        return 'FRONTED';
      case SpvFromBTCSwapState.BTC_TX_CONFIRMED:
        return 'BTC_TX_CONFIRMED';
      case 6: // CLAIM_CLAIMED
        return 'CLAIM_CLAIMED';
      default:
        return 'CREATED';
    }
  }

  /**
   * Get human-readable description of swap state
   */
  private getStateDescription(state: SpvFromBTCSwapState): string {
    switch (state) {
      case SpvFromBTCSwapState.CLOSED:
        return 'Swap closed due to error';
      case SpvFromBTCSwapState.FAILED:
        return 'Bitcoin transaction failed or was double-spent';
      case SpvFromBTCSwapState.DECLINED:
        return 'Liquidity provider declined the swap';
      case SpvFromBTCSwapState.QUOTE_EXPIRED:
        return 'Quote expired - please request a new quote';
      case SpvFromBTCSwapState.QUOTE_SOFT_EXPIRED:
        return 'Quote likely expired but transaction may still succeed';
      case SpvFromBTCSwapState.CREATED:
        return 'Swap created, waiting for Bitcoin transaction';
      case SpvFromBTCSwapState.SIGNED:
        return 'Bitcoin transaction signed';
      case SpvFromBTCSwapState.POSTED:
        return 'Bitcoin transaction posted to liquidity provider';
      case SpvFromBTCSwapState.BROADCASTED:
        return 'Bitcoin transaction broadcast to network';
      case SpvFromBTCSwapState.FRONTED:
        return 'STRK tokens deposited ahead of time';
      case SpvFromBTCSwapState.BTC_TX_CONFIRMED:
        return 'Bitcoin transaction confirmed';
      case 6: // CLAIM_CLAIMED
        return 'Swap completed successfully';
      default:
        return 'Processing swap';
    }
  }
}

// Singleton instance
let atomiqClient: AtomiqClient | null = null;

/**
 * Get or create Atomiq client instance
 */
export function getAtomiqClient(config?: Partial<AtomiqConfig>): AtomiqClient {
  if (!atomiqClient) {
    const defaultConfig: AtomiqConfig = {
      starknetRpcUrl:
        process.env.NEXT_PUBLIC_STARKNET_RPC_URL ||
        'https://starknet-sepolia.public.blastapi.io/rpc/v0_7',
      bitcoinNetwork:
        (process.env.NEXT_PUBLIC_BITCOIN_NETWORK as 'mainnet' | 'testnet' | 'testnet4') ||
        'testnet',
      pricingFeeDifferencePPM: BigInt(20000), // 2% max price difference
    };

    atomiqClient = new AtomiqClient({
      ...defaultConfig,
      ...config,
    });
  }

  return atomiqClient;
}

/**
 * Initialize the Atomiq client
 * Must be called before using any swap functions
 */
export async function initializeAtomiqClient(
  config?: Partial<AtomiqConfig>
): Promise<AtomiqClient> {
  const client = getAtomiqClient(config);
  await client.initialize();
  return client;
}

/**
 * Format swap status for UI display
 */
export function formatSwapStatus(status: AtomiqSwapStatus): {
  label: string;
  color: string;
  description: string;
} {
  const statusMap: Record<
    AtomiqSwapStatus,
    { label: string; color: string; description: string }
  > = {
    // Error states
    CLOSED: {
      label: 'Failed',
      color: 'red',
      description: 'Swap encountered an error',
    },
    FAILED: {
      label: 'Failed',
      color: 'red',
      description: 'Bitcoin transaction failed',
    },
    DECLINED: {
      label: 'Declined',
      color: 'red',
      description: 'Swap was declined',
    },
    QUOTE_EXPIRED: {
      label: 'Expired',
      color: 'gray',
      description: 'Quote expired',
    },
    QUOTE_SOFT_EXPIRED: {
      label: 'Expiring',
      color: 'yellow',
      description: 'Quote expiring soon',
    },
    // Progress states
    CREATED: {
      label: 'Created',
      color: 'blue',
      description: 'Waiting for Bitcoin transaction',
    },
    SIGNED: {
      label: 'Signed',
      color: 'blue',
      description: 'Transaction signed',
    },
    POSTED: {
      label: 'Posted',
      color: 'blue',
      description: 'Submitted to liquidity provider',
    },
    BROADCASTED: {
      label: 'Broadcasting',
      color: 'blue',
      description: 'Bitcoin transaction broadcasting',
    },
    FRONTED: {
      label: 'Fronted',
      color: 'green',
      description: 'STRK deposited ahead of time',
    },
    BTC_TX_CONFIRMED: {
      label: 'Confirmed',
      color: 'green',
      description: 'Bitcoin transaction confirmed',
    },
    CLAIM_CLAIMED: {
      label: 'Completed',
      color: 'green',
      description: 'Swap completed successfully',
    },
    // To BTC states (for completeness)
    REFUNDED: {
      label: 'Refunded',
      color: 'gray',
      description: 'Swap refunded',
    },
    COMMITED: {
      label: 'Initiated',
      color: 'blue',
      description: 'Swap initiated',
    },
    SOFT_CLAIMED: {
      label: 'Processing',
      color: 'blue',
      description: 'Being processed',
    },
    CLAIMED: {
      label: 'Completed',
      color: 'green',
      description: 'Completed successfully',
    },
    REFUNDABLE: {
      label: 'Refundable',
      color: 'yellow',
      description: 'Can be refunded',
    },
  };

  return statusMap[status] || statusMap.CREATED;
}

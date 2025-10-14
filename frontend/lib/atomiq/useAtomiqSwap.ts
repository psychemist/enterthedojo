'use client';

import { useState, useCallback, useEffect } from 'react';
import { getAtomiqClient, initializeAtomiqClient, formatSwapStatus } from './client';
import type { AtomiqQuote, AtomiqSwapResult, BitcoinTxUpdate } from './types';

export function useAtomiqSwap() {
  const [quote, setQuote] = useState<AtomiqQuote | null>(null);
  const [swap, setSwap] = useState<AtomiqSwapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [bitcoinTxUpdate, setBitcoinTxUpdate] = useState<BitcoinTxUpdate | null>(null);

  // Initialize Atomiq client on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeAtomiqClient();
        setInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Atomiq client:', err);
        setError('Failed to initialize swap service');
      }
    };
    init();
  }, []);

  const atomiq = getAtomiqClient();

  const getQuote = useCallback(async (
    fromAmountSats: number, 
    recipient: string,
    gasAmount?: bigint
  ) => {
    if (!initialized) {
      throw new Error('Atomiq client not initialized');
    }

    try {
      setLoading(true);
      setError(null);

      const newQuote = await atomiq.getQuote({
        fromAmountSats,
        recipient,
        exactIn: true,
        gasAmount,
      });

      setQuote(newQuote);
      return newQuote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get quote';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [atomiq, initialized]);

  const getPsbtForSigning = useCallback(async (
    swapId: string,
    bitcoinAddress: string,
    publicKey: string
  ) => {
    if (!initialized) {
      throw new Error('Atomiq client not initialized');
    }

    try {
      setLoading(true);
      setError(null);

      const psbtData = await atomiq.getPsbtForSigning(
        swapId,
        bitcoinAddress,
        publicKey
      );

      return psbtData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get PSBT';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [atomiq, initialized]);

  const submitSignedPsbt = useCallback(async (
    swapId: string,
    signedPsbtBase64: string
  ) => {
    if (!initialized) {
      throw new Error('Atomiq client not initialized');
    }

    try {
      setLoading(true);
      setError(null);

      const bitcoinTxId = await atomiq.submitSignedPsbt(
        swapId,
        signedPsbtBase64
      );

      return bitcoinTxId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit transaction';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [atomiq, initialized]);

  const waitForBitcoinConfirmation = useCallback(async (
    swapId: string
  ) => {
    if (!initialized) {
      throw new Error('Atomiq client not initialized');
    }

    try {
      const success = await atomiq.waitForBitcoinConfirmation(
        swapId,
        (update: BitcoinTxUpdate) => {
          setBitcoinTxUpdate(update);
        }
      );

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to wait for confirmation';
      setError(errorMessage);
      throw err;
    }
  }, [atomiq, initialized]);

  const waitForSwapCompletion = useCallback(async (
    swapId: string,
    timeoutMs?: number
  ) => {
    if (!initialized) {
      throw new Error('Atomiq client not initialized');
    }

    try {
      const success = await atomiq.waitForSwapCompletion(swapId, timeoutMs);
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete swap';
      setError(errorMessage);
      throw err;
    }
  }, [atomiq, initialized]);

  const checkSwapStatus = useCallback(async (swapId: string) => {
    if (!initialized) {
      throw new Error('Atomiq client not initialized');
    }

    try {
      const status = await atomiq.getSwapStatus(swapId);
      
      // Update local swap if we have one
      if (swap && swap.swapId === swapId) {
        setSwap(prev => prev ? {
          ...prev,
          status: status.status,
          bitcoinTxId: status.bitcoinTxId || prev.bitcoinTxId,
          starknetTxHash: status.starknetTxHash || prev.starknetTxHash,
        } : null);
      }

      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check swap status';
      setError(errorMessage);
      throw err;
    }
  }, [atomiq, initialized, swap]);

  const getSwapDetails = useCallback(async (swapId: string) => {
    if (!initialized) {
      throw new Error('Atomiq client not initialized');
    }

    try {
      const details = await atomiq.getSwapDetails(swapId);
      setSwap(details);
      return details;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get swap details';
      setError(errorMessage);
      throw err;
    }
  }, [atomiq, initialized]);

  const clearQuote = useCallback(() => {
    setQuote(null);
  }, []);

  const clearSwap = useCallback(() => {
    setSwap(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    quote,
    swap,
    loading,
    error,
    initialized,
    bitcoinTxUpdate,
    getQuote,
    getPsbtForSigning,
    submitSignedPsbt,
    waitForBitcoinConfirmation,
    waitForSwapCompletion,
    checkSwapStatus,
    getSwapDetails,
    clearQuote,
    clearSwap,
    clearError,
    formatSwapStatus,
  };
}

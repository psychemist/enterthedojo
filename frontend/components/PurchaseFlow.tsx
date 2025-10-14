'use client';

import { useState } from 'react';
import { useBitcoinWallet } from '../lib/bitcoin/BitcoinWalletContext';
import { useAtomiqSwap } from '../lib/atomiq/useAtomiqSwap';
import { formatBTC, formatSats } from '../lib/bitcoin/utils';

interface PurchaseFlowProps {
  assetId: string;
  assetName: string;
  assetImage: string;
  priceInSats: number;
  sellerAddress: string;
  onSuccess?: (txHash: string) => void;
  onCancel?: () => void;
}

type PurchaseStep = 'quote' | 'confirm' | 'swap' | 'complete' | 'error';

export function PurchaseFlow({
  assetId,
  assetName,
  assetImage,
  priceInSats,
  sellerAddress,
  onSuccess,
  onCancel,
}: PurchaseFlowProps) {
  const { account, isConnected } = useBitcoinWallet();
  const { 
    getQuote, 
    getPsbtForSigning,
    submitSignedPsbt,
    waitForBitcoinConfirmation,
    waitForSwapCompletion,
    checkSwapStatus,
    quote, 
    loading,
    initialized,
    bitcoinTxUpdate,
  } = useAtomiqSwap();
  
  const [step, setStep] = useState<PurchaseStep>('quote');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [swapProgress, setSwapProgress] = useState<string>('');

  const handleGetQuote = async () => {
    if (!initialized) {
      setError('Swap service not initialized. Please wait...');
      return;
    }

    try {
      setError(null);
      // Get quote with seller address as recipient
      await getQuote(priceInSats, sellerAddress);
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get quote');
      setStep('error');
    }
  };

  const handleConfirmPurchase = async () => {
    if (!account || !quote) {
      setError('Missing wallet or quote information');
      setStep('error');
      return;
    }

    try {
      setError(null);
      setStep('swap');
      setSwapProgress('Preparing Bitcoin transaction...');

      // Step 1: Get PSBT for signing with Xverse wallet
      const psbtData = await getPsbtForSigning(
        quote.id,
        account.addresses.payment.address,
        account.addresses.payment.publicKey
      );

      setSwapProgress('Please sign the transaction in your wallet...');

      // Step 2: Sign PSBT using Xverse wallet
      // In production, this would use Xverse's signPsbt function
      // For now, we'll use the Atomiq SDK's internal signing
      const signedPsbt = psbtData.psbt; // (TODO): In production: await xverseSignPsbt(psbtData)

      setSwapProgress('Broadcasting Bitcoin transaction...');

      // Step 3: Submit signed PSBT
      const bitcoinTxId = await submitSignedPsbt(quote.id, signedPsbt);
      setTxHash(bitcoinTxId);

      setSwapProgress('Waiting for Bitcoin confirmations...');

      // Step 4: Wait for Bitcoin transaction confirmation
      const btcConfirmed = await waitForBitcoinConfirmation(quote.id);
      
      if (!btcConfirmed) {
        throw new Error('Bitcoin transaction failed to confirm');
      }

      setSwapProgress('Waiting for STRK to be deposited...');

      // Step 5: Wait for swap completion (LP deposits STRK or auto-claim)
      const swapCompleted = await waitForSwapCompletion(quote.id, 60000); // 60s timeout
      
      if (swapCompleted) {
        setStep('complete');
        if (onSuccess) {
          onSuccess(bitcoinTxId);
        }
      } else {
        // Check status manually
        const status = await checkSwapStatus(quote.id);
        
        if (status.status === 'CLAIM_CLAIMED' || status.status === 'FRONTED') {
          setStep('complete');
          if (onSuccess) {
            onSuccess(bitcoinTxId);
          }
        } else {
          setSwapProgress('Swap is taking longer than expected. Swap ID: ' + quote.id);
          // Continue monitoring in background
          monitorSwapStatus(quote.id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
      setStep('error');
    }
  };

  // Background monitoring for long-running swaps
  const monitorSwapStatus = async (swapId: string) => {
    const maxAttempts = 20; // 10 minutes with 30s intervals
    let attempts = 0;

    const monitor = async () => {
      while (attempts < maxAttempts) {
        try {
          await new Promise(resolve => setTimeout(resolve, 30000)); // 30s interval
          
          const status = await checkSwapStatus(swapId);
          
          setSwapProgress(`Status: ${status.message || 'Processing...'}`);
          
          if (status.status === 'CLAIM_CLAIMED' || status.status === 'FRONTED') {
            setStep('complete');
            if (onSuccess && txHash) {
              onSuccess(txHash);
            }
            return;
          }

          if (status.status === 'FAILED' || status.status === 'DECLINED' || status.status === 'CLOSED') {
            throw new Error(`Swap ${status.status}: ${status.message || 'Unknown error'}`);
          }

          attempts++;
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Swap monitoring failed');
          setStep('error');
          return;
        }
      }

      // Final timeout
      setError('Swap timed out. Please contact support with swap ID: ' + swapId);
      setStep('error');
    };

    monitor();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Connect Wallet</h3>
        <p className="text-gray-600 mb-4">
          Please connect your Bitcoin wallet to purchase this asset.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Asset Info */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetImage}
          alt={assetName}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div>
          <h3 className="text-xl font-bold">{assetName}</h3>
          <p className="text-gray-600">ID: {assetId}</p>
        </div>
      </div>

      {/* Step: Get Quote */}
      {step === 'quote' && (
        <div>
          <h4 className="text-lg font-semibold mb-4">Purchase Details</h4>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Price:</span>
              <span className="font-semibold">
                {formatSats(priceInSats)} sats ({formatBTC(priceInSats)} BTC)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Your Balance:</span>
              <span className="font-semibold">
                {formatSats(account?.balance.total || 0)} sats
              </span>
            </div>
          </div>

          {account && account.balance.total < priceInSats && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">Insufficient balance</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGetQuote}
              disabled={loading || (account ? account.balance.total < priceInSats : false)}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Getting Quote...' : 'Get Quote'}
            </button>
          </div>
        </div>
      )}

      {/* Step: Confirm Purchase */}
      {step === 'confirm' && quote && (
        <div>
          <h4 className="text-lg font-semibold mb-4">Confirm Purchase</h4>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">You Pay (BTC):</span>
              <span className="font-semibold">{formatBTC(priceInSats)} BTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seller Receives (STRK):</span>
              <span className="font-semibold">{quote.toAmount} STRK</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Exchange Rate:</span>
              <span>1 BTC = {quote.rate} STRK</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service Fee:</span>
              <span>{quote.fee} STRK</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Quote Expires:</span>
              <span>{new Date(quote.expiresAt).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              Your Bitcoin will be swapped to STRK and sent to the seller. The asset will be transferred to your wallet upon completion.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPurchase}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Purchase'}
            </button>
          </div>
        </div>
      )}

      {/* Step: Swap in Progress */}
      {step === 'swap' && (
        <div className="text-center">
          <div className="mb-6">
            <svg className="animate-spin h-16 w-16 text-orange-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h4 className="text-lg font-semibold mb-2">Processing Swap</h4>
          <p className="text-gray-600 mb-4">
            {swapProgress || 'Your Bitcoin is being swapped to STRK. This may take a few minutes.'}
          </p>
          {txHash && (
            <p className="text-sm text-gray-500 mb-2">
              BTC Transaction: {txHash.slice(0, 8)}...{txHash.slice(-8)}
            </p>
          )}
          {bitcoinTxUpdate && (
            <div className="text-sm text-gray-500">
              <p>Confirmations: {bitcoinTxUpdate.confirmations}/{bitcoinTxUpdate.targetConfirmations}</p>
              <p className="text-xs">ETA: ~{Math.ceil(bitcoinTxUpdate.estimatedTimeMs / 60000)} minutes</p>
            </div>
          )}
        </div>
      )}

      {/* Step: Complete */}
      {step === 'complete' && (
        <div className="text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold mb-2">Purchase Complete!</h4>
          <p className="text-gray-600 mb-6">
            The asset has been transferred to your wallet.
          </p>
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Step: Error */}
      {step === 'error' && (
        <div className="text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold mb-2">Purchase Failed</h4>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => setStep('quote')}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  getAddress, 
  sendBtcTransaction,
  signMessage as xverseSignMessage,
  AddressPurpose,
  BitcoinNetworkType,
  type GetAddressResponse,
} from '@sats-connect/core';
import type { 
  BitcoinBalance, 
  BitcoinNetwork,
  SendBitcoinParams,
  SignMessageParams,
  XverseAccount,
} from './types';

interface BitcoinWalletContextType {
  isConnected: boolean;
  account: XverseAccount | null;
  network: BitcoinNetwork;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendBitcoin: (params: SendBitcoinParams) => Promise<string>;
  signMessage: (params: SignMessageParams) => Promise<string>;
  refreshBalance: () => Promise<void>;
}

const BitcoinWalletContext = createContext<BitcoinWalletContextType | undefined>(undefined);

export function BitcoinWalletProvider({ 
  children,
  network = 'testnet4' 
}: { 
  children: React.ReactNode;
  network?: BitcoinNetwork;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<XverseAccount | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const savedAccount = localStorage.getItem('xverse_account');
    if (savedAccount) {
      try {
        const parsed = JSON.parse(savedAccount);
        setAccount(parsed);
        setIsConnected(true);
      } catch (e) {
        console.error('Failed to parse saved account:', e);
        localStorage.removeItem('xverse_account');
      }
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setConnecting(true);
      setError(null);

      // Map network to BitcoinNetworkType
      let networkType: BitcoinNetworkType;
      if (network === 'mainnet') {
        networkType = BitcoinNetworkType.Mainnet;
      } else if (network === 'testnet4') {
        networkType = BitcoinNetworkType.Testnet4;
      } else {
        networkType = BitcoinNetworkType.Testnet;
      }

      const getAddressOptions = {
        payload: {
          purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals],
          message: 'Connect to Universal Gaming Hub',
          network: {
            type: networkType,
          },
        },
        onFinish: (response: GetAddressResponse) => {
          const paymentAddress = response.addresses.find(
            addr => addr.purpose === AddressPurpose.Payment
          );
          const ordinalsAddress = response.addresses.find(
            addr => addr.purpose === AddressPurpose.Ordinals
          );

          if (!paymentAddress || !ordinalsAddress) {
            throw new Error('Failed to get addresses from wallet');
          }

          const newAccount: XverseAccount = {
            addresses: {
              payment: {
                address: paymentAddress.address,
                publicKey: paymentAddress.publicKey,
                purpose: 'payment',
              },
              ordinals: {
                address: ordinalsAddress.address,
                publicKey: ordinalsAddress.publicKey,
                purpose: 'ordinals',
              },
            },
            balance: {
              confirmed: 0,
              unconfirmed: 0,
              total: 0,
            },
          };

          setAccount(newAccount);
          setIsConnected(true);
          localStorage.setItem('xverse_account', JSON.stringify(newAccount));

          // Fetch balance after connection
          fetchBalance(paymentAddress.address);
        },
        onCancel: () => {
          setError('Connection cancelled by user');
          setConnecting(false);
        },
      };

      await getAddress(getAddressOptions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Xverse connection error:', err);
    } finally {
      setConnecting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
    localStorage.removeItem('xverse_account');
  }, []);

  const fetchBalance = useCallback(async (address: string) => {
    try {
      // Use a Bitcoin API to fetch balance
      // For testnet4, use mempool.space; for testnet (legacy), use blockstream
      let apiUrl: string;
      
      if (network === 'mainnet') {
        apiUrl = `https://blockstream.info/api/address/${address}`;
      } else if (network === 'testnet4') {
        apiUrl = `https://mempool.space/testnet4/api/address/${address}`;
      } else {
        apiUrl = `https://blockstream.info/testnet/api/address/${address}`;
      }

      const response = await fetch(apiUrl);
      const data = await response.json();

      const balance: BitcoinBalance = {
        confirmed: data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum,
        unconfirmed: data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum,
        total: (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) +
               (data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum),
      };

      setAccount(prev => prev ? { ...prev, balance } : null);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  }, [network]);

  const refreshBalance = useCallback(async () => {
    if (account?.addresses.payment.address) {
      await fetchBalance(account.addresses.payment.address);
    }
  }, [account, fetchBalance]);

  const sendBitcoin = useCallback(async (params: SendBitcoinParams): Promise<string> => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    // Map network to BitcoinNetworkType
    let networkType: BitcoinNetworkType;
    if (network === 'mainnet') {
      networkType = BitcoinNetworkType.Mainnet;
    } else if (network === 'testnet4') {
      networkType = BitcoinNetworkType.Testnet4;
    } else {
      networkType = BitcoinNetworkType.Testnet;
    }

    return new Promise((resolve, reject) => {
      const sendBtcOptions = {
        payload: {
          network: {
            type: networkType,
          },
          recipients: [
            {
              address: params.recipient,
              amountSats: BigInt(params.amountSats),
            },
          ],
          senderAddress: account.addresses.payment.address,
        },
        onFinish: (response: string) => {
          resolve(response);
          // Refresh balance after transaction
          refreshBalance();
        },
        onCancel: () => {
          reject(new Error('Transaction cancelled by user'));
        },
      };

      sendBtcTransaction(sendBtcOptions);
    });
  }, [account, network, refreshBalance]);

  const signMessage = useCallback(async (params: SignMessageParams): Promise<string> => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    // Map network to BitcoinNetworkType
    let networkType: BitcoinNetworkType;
    if (network === 'mainnet') {
      networkType = BitcoinNetworkType.Mainnet;
    } else if (network === 'testnet4') {
      networkType = BitcoinNetworkType.Testnet4;
    } else {
      networkType = BitcoinNetworkType.Testnet;
    }

    return new Promise((resolve, reject) => {
      const signMessageOptions = {
        payload: {
          network: {
            type: networkType,
          },
          address: params.address,
          message: params.message,
        },
        onFinish: (response: string) => {
          resolve(response);
        },
        onCancel: () => {
          reject(new Error('Signing cancelled by user'));
        },
      };

      xverseSignMessage(signMessageOptions);
    });
  }, [account, network]);

  const value: BitcoinWalletContextType = {
    isConnected,
    account,
    network,
    connecting,
    error,
    connect,
    disconnect,
    sendBitcoin,
    signMessage,
    refreshBalance,
  };

  return (
    <BitcoinWalletContext.Provider value={value}>
      {children}
    </BitcoinWalletContext.Provider>
  );
}

export function useBitcoinWallet() {
  const context = useContext(BitcoinWalletContext);
  if (context === undefined) {
    throw new Error('useBitcoinWallet must be used within a BitcoinWalletProvider');
  }
  return context;
}

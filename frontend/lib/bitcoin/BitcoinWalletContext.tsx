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

// Session configuration
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface SessionData {
  account: XverseAccount;
  timestamp: number;
  lastActivity: number;
}

interface BitcoinWalletContextType {
  isConnected: boolean;
  account: XverseAccount | null;
  network: BitcoinNetwork;
  connecting: boolean;
  error: string | null;
  sessionExpiry: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendBitcoin: (params: SendBitcoinParams) => Promise<string>;
  signMessage: (params: SignMessageParams) => Promise<string>;
  refreshBalance: () => Promise<void>;
  refreshSession: () => void;
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
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);

  // Save session with timestamp
  const saveSession = useCallback((accountData: XverseAccount) => {
    const sessionData: SessionData = {
      account: accountData,
      timestamp: Date.now(),
      lastActivity: Date.now(),
    };
    localStorage.setItem('xverse_session', JSON.stringify(sessionData));
    setSessionExpiry(Date.now() + SESSION_TIMEOUT);
  }, []);

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    const sessionStr = localStorage.getItem('xverse_session');
    if (sessionStr) {
      try {
        const session: SessionData = JSON.parse(sessionStr);
        session.lastActivity = Date.now();
        localStorage.setItem('xverse_session', JSON.stringify(session));
      } catch (e) {
        console.error('Failed to update activity:', e);
      }
    }
  }, []);

  // Check if session is expired
  const isSessionExpired = useCallback((session: SessionData): boolean => {
    const age = Date.now() - session.timestamp;
    const inactivity = Date.now() - session.lastActivity;
    
    // Expire if older than 24 hours OR inactive for more than 2 hours
    return age > SESSION_TIMEOUT || inactivity > (2 * 60 * 60 * 1000);
  }, []);

  // Refresh session (extend expiry)
  const refreshSession = useCallback(() => {
    if (account) {
      updateActivity();
      setSessionExpiry(Date.now() + SESSION_TIMEOUT);
    }
  }, [account, updateActivity]);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const sessionStr = localStorage.getItem('xverse_session');
    if (sessionStr) {
      try {
        const session: SessionData = JSON.parse(sessionStr);
        
        if (isSessionExpired(session)) {
          // Session expired, clean up
          localStorage.removeItem('xverse_session');
          setError('Session expired. Please reconnect your wallet.');
        } else {
          // Restore session
          setAccount(session.account);
          setIsConnected(true);
          setSessionExpiry(session.timestamp + SESSION_TIMEOUT);
          
          // Fetch fresh balance
          fetchBalance(session.account.addresses.payment.address);
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
        localStorage.removeItem('xverse_session');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh session periodically
  useEffect(() => {
    if (!isConnected || !account) return;

    const interval = setInterval(() => {
      updateActivity();
    }, SESSION_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isConnected, account, updateActivity]);

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
          saveSession(newAccount);

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
  }, [network, saveSession]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
    setSessionExpiry(null);
    localStorage.removeItem('xverse_session');
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
    sessionExpiry,
    connect,
    disconnect,
    sendBitcoin,
    signMessage,
    refreshBalance,
    refreshSession,
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

// Bitcoin wallet types and interfaces

export interface BitcoinAddress {
  address: string;
  publicKey: string;
  purpose: 'payment' | 'ordinals';
}

export interface BitcoinBalance {
  confirmed: number; // in satoshis
  unconfirmed: number;
  total: number;
}

export interface BitcoinTransaction {
  txid: string;
  amount: number; // in satoshis
  confirmations: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface XverseAccount {
  addresses: {
    payment: BitcoinAddress;
    ordinals: BitcoinAddress;
  };
  balance: BitcoinBalance;
}

export type BitcoinNetwork = 'mainnet' | 'testnet' | 'testnet4';

export interface SendBitcoinParams {
  recipient: string;
  amountSats: number;
  memo?: string;
}

export interface SignMessageParams {
  message: string;
  address: string;
}

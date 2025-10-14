// Bitcoin utility functions

/**
 * Convert satoshis to BTC
 */
export function satsToBTC(sats: number): number {
  return sats / 100000000;
}

/**
 * Convert BTC to satoshis
 */
export function btcToSats(btc: number): number {
  return Math.floor(btc * 100000000);
}

/**
 * Format BTC amount for display
 */
export function formatBTC(sats: number, decimals: number = 8): string {
  const btc = satsToBTC(sats);
  return btc.toFixed(decimals);
}

/**
 * Format satoshis with comma separators
 */
export function formatSats(sats: number): string {
  return sats.toLocaleString();
}

/**
 * Get Bitcoin price in USD (mock for now - would use real API)
 */
export async function getBTCPriceUSD(): Promise<number> {
  try {
    // Using CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    );
    const data = await response.json();
    return data.bitcoin.usd;
  } catch (error) {
    console.error('Failed to fetch BTC price:', error);
    // Fallback price
    return 43000;
  }
}

/**
 * Convert USD to satoshis based on current BTC price
 */
export async function usdToSats(usd: number): Promise<number> {
  const btcPrice = await getBTCPriceUSD();
  const btc = usd / btcPrice;
  return btcToSats(btc);
}

/**
 * Convert satoshis to USD based on current BTC price
 */
export async function satsToUSD(sats: number): Promise<number> {
  const btcPrice = await getBTCPriceUSD();
  const btc = satsToBTC(sats);
  return btc * btcPrice;
}

/**
 * Format USD amount
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Validate Bitcoin address
 */
export function isValidBitcoinAddress(address: string, network: 'mainnet' | 'testnet' = 'testnet'): boolean {
  // Basic validation - should be improved with proper library
  const mainnetRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
  const testnetRegex = /^(tb1|[mn2])[a-zA-HJ-NP-Z0-9]{25,62}$/;
  
  const regex = network === 'mainnet' ? mainnetRegex : testnetRegex;
  return regex.test(address);
}

/**
 * Calculate transaction fee estimate (in sats)
 */
export function estimateTransactionFee(
  inputCount: number,
  outputCount: number,
  feeRatePerByte: number = 10
): number {
  // Simplified calculation
  // P2WPKH: ~110 vBytes per input, ~31 vBytes per output, ~10 vBytes overhead
  const estimatedSize = (inputCount * 110) + (outputCount * 31) + 10;
  return Math.ceil(estimatedSize * feeRatePerByte);
}

/**
 * Get recommended fee rates
 */
export async function getFeeRates(network: 'mainnet' | 'testnet' = 'mainnet'): Promise<{
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
}> {
  try {
    const apiUrl = network === 'mainnet'
      ? 'https://mempool.space/api/v1/fees/recommended'
      : 'https://mempool.space/testnet/api/v1/fees/recommended';
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    return {
      fastestFee: data.fastestFee,
      halfHourFee: data.halfHourFee,
      hourFee: data.hourFee,
      economyFee: data.economyFee || data.hourFee,
    };
  } catch (error) {
    console.error('Failed to fetch fee rates:', error);
    // Fallback rates
    return {
      fastestFee: 20,
      halfHourFee: 10,
      hourFee: 5,
      economyFee: 2,
    };
  }
}

/**
 * Format Bitcoin transaction ID for display
 */
export function formatTxId(txid: string): string {
  if (!txid) return '';
  return `${txid.slice(0, 8)}...${txid.slice(-8)}`;
}

/**
 * Get block explorer URL for transaction
 */
export function getExplorerTxUrl(txid: string, network: 'mainnet' | 'testnet' = 'testnet'): string {
  const baseUrl = network === 'mainnet'
    ? 'https://mempool.space/tx'
    : 'https://mempool.space/testnet/tx';
  
  return `${baseUrl}/${txid}`;
}

/**
 * Get block explorer URL for address
 */
export function getExplorerAddressUrl(address: string, network: 'mainnet' | 'testnet' = 'testnet'): string {
  const baseUrl = network === 'mainnet'
    ? 'https://mempool.space/address'
    : 'https://mempool.space/testnet/address';
  
  return `${baseUrl}/${address}`;
}

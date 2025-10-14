'use client';

import { useState } from 'react';
import { BitcoinWalletButton } from '@/components/BitcoinWalletButton';
import { useBitcoinWallet } from '@/lib/bitcoin/BitcoinWalletContext';

export default function WalletDebugPage() {
  const wallet = useBitcoinWallet();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const testConnection = async () => {
    try {
      addLog('🔍 Starting wallet connection test...');
      
      // Check if Xverse is installed
      if (typeof window === 'undefined') {
        addLog('❌ Window is undefined - running on server?');
        return;
      }

      addLog('✅ Window object available');

      // Check for Bitcoin provider
      const btcProvider = (window as Window & { BitcoinProvider?: unknown }).BitcoinProvider;
      const satsConnect = (window as Window & { satsConnect?: unknown }).satsConnect;
      
      if (!btcProvider && !satsConnect) {
        addLog('❌ No Bitcoin provider found. Is Xverse installed?');
        addLog('💡 Install from: https://www.xverse.app/');
        return;
      }

      if (btcProvider) {
        addLog('✅ BitcoinProvider detected');
      }
      if (satsConnect) {
        addLog('✅ satsConnect detected');
      }

      addLog(`📡 Current network: ${wallet.network}`);
      addLog(`🔌 Connected: ${wallet.isConnected}`);
      addLog(`⏳ Connecting: ${wallet.connecting}`);
      
      if (wallet.error) {
        addLog(`❌ Error: ${wallet.error}`);
      }

      if (wallet.account) {
        addLog(`✅ Account: ${wallet.account.addresses.payment.address.slice(0, 20)}...`);
        addLog(`💰 Balance: ${wallet.account.balance.total} sats`);
      }

      addLog('🚀 Attempting connection...');
      await wallet.connect();
      addLog('✅ Connection successful!');
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      addLog(`❌ Connection failed: ${message}`);
      console.error('Full error:', error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const checkXverseNetwork = () => {
    addLog('🔍 Checking Xverse network settings...');
    addLog('💡 Open Xverse → Settings → Network');
    addLog('💡 Make sure you are on "Bitcoin Testnet4" or "Testnet"');
    addLog(`💡 App is requesting: ${wallet.network}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🔧 Wallet Connection Debug</h1>
          <p className="text-gray-400">Diagnose Bitcoin wallet connection issues</p>
        </div>

        {/* Wallet Status */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Current Status</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Network:</span>
              <span className="text-blue-400">{wallet.network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Connected:</span>
              <span className={wallet.isConnected ? 'text-green-400' : 'text-red-400'}>
                {wallet.isConnected ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Connecting:</span>
              <span className={wallet.connecting ? 'text-yellow-400' : 'text-gray-400'}>
                {wallet.connecting ? '⏳ Yes' : 'No'}
              </span>
            </div>
            {wallet.error && (
              <div className="flex justify-between">
                <span className="text-gray-400">Error:</span>
                <span className="text-red-400">{wallet.error}</span>
              </div>
            )}
            {wallet.account && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Address:</span>
                  <span className="text-green-400 break-all">
                    {wallet.account.addresses.payment.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Balance:</span>
                  <span className="text-green-400">
                    {wallet.account.balance.total} sats
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Test Controls</h2>
          <div className="space-y-3">
            <BitcoinWalletButton />
            
            <button
              onClick={testConnection}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              🧪 Run Connection Test
            </button>
            
            <button
              onClick={checkXverseNetwork}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
            >
              🔍 Check Xverse Network Settings
            </button>
            
            <button
              onClick={clearLogs}
              className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
            >
              🗑️ Clear Logs
            </button>
          </div>
        </div>

        {/* Debug Logs */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-black rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click &quot;Run Connection Test&quot; to start.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-900/30 border border-blue-500/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-3">📋 Troubleshooting Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Make sure Xverse wallet extension is installed</li>
            <li>Open Xverse and check you&apos;re logged in</li>
            <li>Go to Xverse Settings → Network</li>
            <li>Select &quot;Bitcoin Testnet4&quot; or &quot;Testnet&quot;</li>
            <li>Click &quot;Run Connection Test&quot; above</li>
            <li>Check the logs for specific errors</li>
            <li>If still failing, check browser console (F12)</li>
          </ol>
        </div>

        {/* Network Info */}
        <div className="mt-6 bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-3">⚙️ Network Configuration</h3>
          <div className="space-y-2 text-sm font-mono">
            <p>App Network: <span className="text-yellow-400">{wallet.network}</span></p>
            <p>Supported Networks:</p>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>mainnet - Bitcoin Mainnet</li>
              <li>testnet - Bitcoin Testnet (legacy)</li>
              <li>testnet4 - Bitcoin Testnet4 (current)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

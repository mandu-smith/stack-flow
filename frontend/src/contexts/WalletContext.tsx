import React, { createContext, useContext, useEffect, useState } from 'react';
import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect';
import { networkName, isMainnet } from '@/lib/stacks-config';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  displayName: string | null;
  loading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * Extract the STX address from a getAddresses/connect response.
 * connect() calls getAddresses which returns [BTC P2PKH, BTC P2TR, STX].
 * We find the STX entry by symbol or by prefix (SP/ST) as a fallback.
 */
function extractStxAddress(
  addresses: { symbol?: string; address: string }[]
): string | null {
  const stxEntry = addresses.find((a) => a.symbol === 'STX');
  if (stxEntry) return stxEntry.address;

  const stxPrefix = isMainnet ? 'SP' : 'ST';
  const byPrefix = addresses.find((a) => a.address.startsWith(stxPrefix));
  if (byPrefix) return byPrefix.address;

  if (addresses.length > 2) return addresses[2].address;

  return null;
}

function formatDisplayAddress(address: string): string {
  return address.slice(0, 8) + '...' + address.slice(-4);
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnectedState, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Restore wallet state on mount from localStorage — no wallet popup.
  // getLocalStorage() reads cached addresses that @stacks/connect persists
  // after a successful connect(). Shape: { addresses: { stx: [...], btc: [...] } }
  useEffect(() => {
    if (!isConnected()) return;

    const stored = getLocalStorage();
    const stxAddresses = stored?.addresses?.stx;
    if (stxAddresses && stxAddresses.length > 0) {
      const address = stxAddresses[0].address;
      setIsConnected(true);
      setWalletAddress(address);
      setDisplayName(formatDisplayAddress(address));
    }
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);

      // connect() prompts wallet selection and calls getAddresses
      const connectionResponse = await connect({ network: networkName });

      if (connectionResponse) {
        const address = extractStxAddress(connectionResponse.addresses);

        if (address) {
          setIsConnected(true);
          setWalletAddress(address);
          setDisplayName(formatDisplayAddress(address));
        }
      }
    } catch (error) {
      // Error is handled by caller
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setLoading(true);
      await disconnect();
      
      setIsConnected(false);
      setWalletAddress(null);
      setDisplayName(null);
      setWalletInfo(null);
      
      // Clear session storage
      sessionStorage.removeItem('stacks-wallet-session');
    } catch (error) {
      // Error is handled silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected: isConnectedState,
        walletAddress,
        displayName,
        loading,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

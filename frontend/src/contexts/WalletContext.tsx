import React, { createContext, useContext, useEffect, useState } from 'react';
import { connect, disconnect, isConnected } from '@stacks/connect';
import type { GetAddressesResult } from '@stacks/connect/dist/types/methods';
import { networkName } from '@/lib/stacks-config';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  displayName: string | null;
  loading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  walletInfo: GetAddressesResult | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnectedState, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletInfo, setWalletInfo] = useState<GetAddressesResult | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = isConnected();
        if (connected) {
          // User was previously connected, reload connection info
          const session = window.sessionStorage.getItem('stacks-wallet-session');
          if (session) {
            const sessionData = JSON.parse(session);
            setIsConnected(true);
            setWalletAddress(sessionData.address);
            setDisplayName(sessionData.displayName);
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkConnection();
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);
      const connectionResponse = await connect({ network: networkName });
      
      if (connectionResponse) {
        const address = connectionResponse.addresses[0].address;
        const displayAddress = connectionResponse.addresses[0].address.slice(0, 8) + '...' + connectionResponse.addresses[0].address.slice(-4);
        
        setWalletInfo(connectionResponse);
        setIsConnected(true);
        setWalletAddress(address);
        setDisplayName(displayAddress);
        
        // Store in session storage
        sessionStorage.setItem('stacks-wallet-session', JSON.stringify({
          address,
          displayName: displayAddress,
        }));
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
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
      console.error('Error disconnecting wallet:', error);
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
        walletInfo,
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

import { useState } from 'react';
interface UseContractCallState {
  loading: boolean;
  error: string | null;
  txId: string | null;
  success: boolean;
}

type ContractFunction = (...args: any[]) => Promise<any>;

/**
 * Hook for managing contract call state and execution
 */
export const useContractCall = (callFunction: ContractFunction) => {
  const { isConnected } = useWallet();
  const [state, setState] = useState<UseContractCallState>({
    loading: false,
    error: null,
    txId: null,
    success: false,
  });

  const execute = async (...args: any[]) => {
    if (!isConnected) {
      setState(prev => ({
        ...prev,
        error: 'Wallet not connected',
      }));
      return null;
    }

    try {
      setState({
        loading: true,
        error: null,
        txId: null,
        success: false,
      });

      const result = await callFunction(...args);
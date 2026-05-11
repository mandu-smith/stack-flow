import { useState } from 'react';
interface UseContractCallState {
  loading: boolean;
  error: string | null;
  txId: string | null;
  success: boolean;
}

type ContractFunction = (...args: any[]) => Promise<any>;
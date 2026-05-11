import { request } from '@stacks/connect';
import { Cl, Pc, ClarityType, fetchCallReadOnlyFunction, cvToJSON, cvToValue } from '@stacks/transactions';
import type { ClarityValue } from '@stacks/transactions';
import {
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
  networkName,
  stacksNetwork,
  stacksApiBaseUrl,
} from './stacks-config';
import type { LeaderboardEntry, TipEntry } from './types';

type TransactionResult = {
  txid?: string;
  cancel?: () => void;
};

type PlatformStats = {
  totalTips: number;
  totalVolumeMicro: number;
  totalFeesMicro: number;
  totalVolumeSTX: number;
  totalFeesSTX: number;
};
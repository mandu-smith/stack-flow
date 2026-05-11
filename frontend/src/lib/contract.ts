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

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const TIP_FEE_RATE = 0.005;
const READ_ONLY_MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 1_000;
const PLATFORM_STATS_TTL_MS = 60_000;
const TIP_BY_ID_TTL_MS = 120_000;
const ALL_TIPS_TTL_MS = 60_000;
const blockTimestampCache = new Map<number, Date>();
const tipByIdCache = new Map<number, CacheEntry<TipEntry | null>>();
const allTipsCache = new Map<number, CacheEntry<TipEntry[]>>();
const allTipsInFlight = new Map<number, Promise<TipEntry[]>>();
let platformStatsCache: CacheEntry<PlatformStats> | null = null;
let platformStatsInFlight: Promise<PlatformStats> | null = null;

// Clear all relevant caches after a tip is sent
export function clearContractCaches() {
  allTipsCache.clear();
  tipByIdCache.clear();
  platformStatsCache = null;
}

function now(): number {
  return Date.now();
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error ?? '');
}

function isRateLimitedError(error: unknown): boolean {
  const message = toErrorMessage(error);
  return message.includes('429') || /too many requests/i.test(message) || /rate limit/i.test(message);
}

function parseRetryAfterMs(error: unknown): number | null {
  const message = toErrorMessage(error);

  // Hiro responses often contain: "Please try again in 23 seconds"
  const secondsMatch = message.match(/try again in\s+(\d+)\s+seconds?/i);
  if (secondsMatch) {
    const seconds = Number(secondsMatch[1]);
    if (Number.isFinite(seconds) && seconds > 0) {
      return seconds * 1_000;
    }
  }
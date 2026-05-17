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

  return null;
}

function getBackoffMs(attempt: number, error: unknown): number {
  const fromProvider = parseRetryAfterMs(error);
  const jitter = Math.floor(Math.random() * 400);

  if (fromProvider !== null) {
    return fromProvider + jitter;
  }

  return BASE_BACKOFF_MS * Math.pow(2, attempt) + jitter;
}

function getCached<T>(entry: CacheEntry<T> | null): T | null {
  if (!entry) return null;
  if (entry.expiresAt <= now()) return null;
  return entry.value;
}

async function callReadOnlyWithRetry(
  args: Parameters<typeof fetchCallReadOnlyFunction>[0]
) {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= READ_ONLY_MAX_RETRIES; attempt += 1) {
    try {
      return await fetchCallReadOnlyFunction(args);
    } catch (error) {
      lastError = error;

      if (!isRateLimitedError(error) || attempt === READ_ONLY_MAX_RETRIES) {
        throw error;
      }

      await sleep(getBackoffMs(attempt, error));
    }
  }

  throw lastError;
}

function asNumber(value: unknown): number {
  if (value && typeof value === 'object' && 'value' in value) {
    return Number((value as { value: unknown }).value ?? 0);
  }
  return Number(value ?? 0);
}

function asString(value: unknown): string {
  if (value && typeof value === 'object' && 'value' in value) {
    return String((value as { value: unknown }).value ?? '');
  }
  return String(value ?? '');
}

function unwrapOptionalTuple(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;

  const root = value as Record<string, unknown>;

  // Handles direct tuple-like objects: { sender: ..., recipient: ... }
  if ('sender' in root && 'recipient' in root) return root;

  // Handles cvToJSON optional shape: { type: 'optional', value: { type: 'tuple', value: {...} } }
  const wrappedValue = root.value;
  if (wrappedValue && typeof wrappedValue === 'object') {
    const wrappedObj = wrappedValue as Record<string, unknown>;

    // Handles tuple wrapper: { type: 'tuple', value: { ...fields } }
    if ('value' in wrappedObj && wrappedObj.value && typeof wrappedObj.value === 'object') {
      const tupleFields = wrappedObj.value as Record<string, unknown>;
      if ('sender' in tupleFields && 'recipient' in tupleFields) {
        return tupleFields;
      }
    }

    // Handles flattened optional shape: { type: 'some', value: { ...fields } }
    if ('sender' in wrappedObj && 'recipient' in wrappedObj) {
      return wrappedObj;
    }
  }

  return null;
}

async function fetchBlockTimestamp(blockHeight: number): Promise<Date> {
  const cached = blockTimestampCache.get(blockHeight);
  if (cached) return cached;

  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const response = await fetch(`${stacksApiBaseUrl}/extended/v2/blocks/${blockHeight}`);
      if (response.status === 429) {
        await sleep(getBackoffMs(attempt, null));
        continue;
      }
      if (!response.ok) return new Date();

      const data = (await response.json()) as {
        block_time_iso?: string;
        block_time?: number;
        burn_block_time_iso?: string;
        burn_block_time?: number;
      };
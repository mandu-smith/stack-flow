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
const PLATFORM_STATS_TTL_MS = 30_000;
const TIP_BY_ID_TTL_MS = 60_000;
const ALL_TIPS_TTL_MS = 20_000;
const blockTimestampCache = new Map<number, Date>();
const tipByIdCache = new Map<number, CacheEntry<TipEntry | null>>();
const allTipsCache = new Map<number, CacheEntry<TipEntry[]>>();
const allTipsInFlight = new Map<number, Promise<TipEntry[]>>();
let platformStatsCache: CacheEntry<PlatformStats> | null = null;
let platformStatsInFlight: Promise<PlatformStats> | null = null;

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

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
  delayMs = 0
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    if (i > 0 && delayMs > 0) {
      await sleep(delayMs);
    }
    const chunk = items.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map(mapper));
    results.push(...chunkResults);
  }

  return results;
}

async function fetchBlockTimestamp(blockHeight: number): Promise<Date> {
  const cached = blockTimestampCache.get(blockHeight);
  if (cached) return cached;

  try {
    const response = await fetch(`${stacksApiBaseUrl}/extended/v2/blocks/${blockHeight}`);
    if (!response.ok) return new Date();

    const data = (await response.json()) as {
      block_time_iso?: string;
      block_time?: number;
      burn_block_time_iso?: string;
      burn_block_time?: number;
    };

    const date = data.block_time_iso
      ? new Date(data.block_time_iso)
      : data.block_time
        ? new Date(data.block_time * 1000)
        : data.burn_block_time_iso
          ? new Date(data.burn_block_time_iso)
          : new Date((data.burn_block_time ?? 0) * 1000);

    blockTimestampCache.set(blockHeight, date);
    return date;
  } catch {
    return new Date();
  }
}

function buildLeaderboard(entries: TipEntry[]) {
  const sentMap = new Map<string, { total: number; count: number }>();
  const receivedMap = new Map<string, { total: number; count: number }>();

  for (const tip of entries) {
    const sent = sentMap.get(tip.sender) ?? { total: 0, count: 0 };
    sent.total += tip.amountSTX;
    sent.count += 1;
    sentMap.set(tip.sender, sent);

    const received = receivedMap.get(tip.recipient) ?? { total: 0, count: 0 };
    received.total += tip.amountSTX;
    received.count += 1;
    receivedMap.set(tip.recipient, received);
  }

  const toRanked = (map: Map<string, { total: number; count: number }>): LeaderboardEntry[] =>
    Array.from(map.entries())
      .map(([address, { total, count }]) => ({
        address,
        totalSTX: Number(total.toFixed(6)),
        tipCount: count,
        rank: 0,
      }))
      .sort((a, b) => b.totalSTX - a.totalSTX)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return {
    topTippers: toRanked(sentMap),
    mostTipped: toRanked(receivedMap),
  };
}

/**
 * Unwrap a read-only ClarityValue response, checking for ok/err types.
 * Returns the inner value on success, throws on err responses.
 */
function unwrapResponse(cv: ClarityValue): ClarityValue {
  if (cv.type === ClarityType.ResponseOk) {
    return cv.value;
  }
  if (cv.type === ClarityType.ResponseErr) {
    const errDetail = cvToValue(cv.value, true);
    throw new Error(`Contract returned an error: ${errDetail}`);
  }
  // Not a response type (plain tuple, uint, etc.) — return as-is
  return cv;
}

/**
 * Send a tip through the stack-flow contract.
 * Uses explicit post conditions with `deny` mode for user safety.
 */
export async function sendTip(
  senderAddress: string,
  recipient: string,
  amount: number,
  message: string = ''
): Promise<TransactionResult> {
  try {
    // Post condition: sender will send at most `amount` microSTX
    const postCondition = Pc.principal(senderAddress)
      .willSendLte(amount)
      .ustx();

    const result = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'send-tip',
      functionArgs: [
        Cl.principal(recipient),
        Cl.uint(amount),
        Cl.stringUtf8(message),
      ],
      network: networkName,
      postConditions: [postCondition],
      postConditionMode: 'deny',
      sponsored: false,
    });

    return result;
  } catch (error) {
    console.error('Error sending tip:', error);
    throw error;
  }
}

/**
 * Get user tip statistics (read-only)
 */
export async function getUserTipStats(userAddress: string): Promise<{
  tipsSent: number;
  tipsReceived: number;
}> {
  try {
    const cv = await callReadOnlyWithRetry({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user-stats',
      functionArgs: [Cl.principal(userAddress)],
      senderAddress: userAddress,
      network: stacksNetwork,
    });

    const unwrapped = unwrapResponse(cv);
    const parsed = cvToJSON(unwrapped);
    const value = parsed?.value ?? {};

    return {
      tipsSent: Number(value['tips-sent']?.value ?? 0),
      tipsReceived: Number(value['tips-received']?.value ?? 0),
    };
  } catch (error) {
    console.error('Error getting user tip stats:', error);
    throw error;
  }
}

/**
 * Get platform statistics (read-only)
 */
export async function getPlatformStats(): Promise<{
  totalTips: number;
  totalVolumeMicro: number;
  totalFeesMicro: number;
  totalVolumeSTX: number;
  totalFeesSTX: number;
}> {
  const cached = getCached(platformStatsCache);
  if (cached) return cached;

  if (platformStatsInFlight) {
    return platformStatsInFlight;
  }

  platformStatsInFlight = (async () => {
  try {
    const cv = await callReadOnlyWithRetry({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-platform-stats',
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
      network: stacksNetwork,
    });

    const unwrapped = unwrapResponse(cv);
    const parsed = cvToJSON(unwrapped);
    const value = parsed?.value ?? {};

    const totalVolumeMicro = Number(value['total-volume']?.value ?? 0);
    const totalFeesMicro = Number(value['platform-fees']?.value ?? 0);

    const result = {
      totalTips: Number(value['total-tips']?.value ?? 0),
      totalVolumeMicro,
      totalFeesMicro,
      totalVolumeSTX: totalVolumeMicro / 1_000_000,
      totalFeesSTX: totalFeesMicro / 1_000_000,
    };

    platformStatsCache = {
      value: result,
      expiresAt: now() + PLATFORM_STATS_TTL_MS,
    };

    return result;
  } catch (error) {
    console.error('Error getting platform stats:', error);

    // Degrade gracefully on persistent rate-limit failures.
    if (platformStatsCache) {
      return platformStatsCache.value;
    }

    throw error;
  } finally {
    platformStatsInFlight = null;
  }
  })();

  return platformStatsInFlight;
}

export async function getTipById(tipId: number): Promise<TipEntry | null> {
  const cached = tipByIdCache.get(tipId);
  if (cached && cached.expiresAt > now()) {
    return cached.value;
  }

  try {
    const cv = await callReadOnlyWithRetry({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-tip',
      functionArgs: [Cl.uint(tipId)],
      senderAddress: CONTRACT_ADDRESS,
      network: stacksNetwork,
    });

    const unwrapped = unwrapResponse(cv);
    const parsed = cvToJSON(unwrapped);
    const tipTuple = unwrapOptionalTuple(parsed?.value);

    if (!tipTuple) {
      tipByIdCache.set(tipId, {
        value: null,
        expiresAt: now() + TIP_BY_ID_TTL_MS,
      });
      return null;
    }

    const amountMicro = asNumber(tipTuple.amount);
    const amountSTX = amountMicro / 1_000_000;
    const fee = Number((amountSTX * TIP_FEE_RATE).toFixed(6));
    const blockHeight = asNumber(tipTuple['tip-height']);
    const timestamp = await fetchBlockTimestamp(blockHeight);

    const tip: TipEntry = {
      id: String(tipId),
      txid: `onchain-tip-${tipId}`,
      sender: asString(tipTuple.sender),
      recipient: asString(tipTuple.recipient),
      amountSTX,
      fee,
      message: asString(tipTuple.message),
      timestamp,
      status: 'confirmed',
      blockHeight,
    };

    tipByIdCache.set(tipId, {
      value: tip,
      expiresAt: now() + TIP_BY_ID_TTL_MS,
    });

    return tip;
  } catch (error) {
    console.error(`Error getting tip by id ${tipId}:`, error);
    return null;
  }
}

export async function getAllTips(limit = 40): Promise<TipEntry[]> {
  const cached = allTipsCache.get(limit);
  if (cached && cached.expiresAt > now()) {
    return cached.value;
  }

  const inFlight = allTipsInFlight.get(limit);
  if (inFlight) {
    return inFlight;
  }

  const loadPromise = (async () => {
  try {
    const stats = await getPlatformStats();
    if (stats.totalTips === 0) return [];

    const end = stats.totalTips;
    const start = Math.max(0, end - limit);
    const ids = Array.from({ length: end - start }, (_, index) => start + index);

    const tips = await mapWithConcurrency(ids, 2, (id) => getTipById(id), 500);

    const result = tips
      .filter((tip): tip is TipEntry => tip !== null)
      .sort((a, b) => Number(b.id) - Number(a.id));

    allTipsCache.set(limit, {
      value: result,
      expiresAt: now() + ALL_TIPS_TTL_MS,
    });

    return result;
  } catch (error) {
    console.error('Error getting all tips:', error);

    if (cached) {
      return cached.value;
    }

    return [];
  } finally {
    allTipsInFlight.delete(limit);
  }
  })();

  allTipsInFlight.set(limit, loadPromise);
  return loadPromise;
}

export async function getTipsForAddress(address: string): Promise<{
  sent: TipEntry[];
  received: TipEntry[];
}> {
  const tips = await getAllTips(120);
  return {
    sent: tips.filter(tip => tip.sender === address),
    received: tips.filter(tip => tip.recipient === address),
  };
}

export async function getLeaderboard(): Promise<{
  topTippers: LeaderboardEntry[];
  mostTipped: LeaderboardEntry[];
}> {
  const tips = await getAllTips(120);
  return buildLeaderboard(tips);
}

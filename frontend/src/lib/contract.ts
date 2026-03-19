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
      if (attempt < 2) await sleep(getBackoffMs(attempt, null));
    }
  }
  return new Date();
}

// ---------------------------------------------------------------------------
// Hiro Extended API — batch-fetch tips via transaction listing
// ---------------------------------------------------------------------------
// Instead of calling get-tip N times + fetchBlockTimestamp N times,
// we fetch contract transactions in one paginated API call. Each tx
// already contains sender_address, function_args, block_height,
// block_time, and tx_result — everything we need.

interface HiroContractCallArg {
  name: string;
  type: string;
  repr: string;
}

interface HiroTxResponse {
  tx_id: string;
  tx_status: string;
  tx_type: string;
  block_height: number;
  block_time: number;
  sender_address: string;
  contract_call?: {
    contract_id: string;
    function_name: string;
    function_args: HiroContractCallArg[];
  };
  tx_result?: {
    repr: string;
  };
}

interface HiroTxListResponse {
  limit: number;
  offset: number;
  total: number;
  results: HiroTxResponse[];
}

function parseReprUint(repr: string): number {
  const match = repr.match(/^u(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function parseReprPrincipal(repr: string): string {
  return repr.replace(/^'/, '');
}

function parseReprString(repr: string): string {
  const match = repr.match(/^u"(.*)"$/s);
  if (!match) return repr;
  // Clarity repr uses \u{XXYYZZ} where the hex digits are UTF-8 bytes, not
  // Unicode code points. Decode each escape by converting the hex pairs into
  // a byte array and then decoding as UTF-8.
  return match[1].replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex: string) => {
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.slice(i, i + 2), 16));
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  });
}

function parseTipIdFromResult(repr: string): number | null {
  const match = repr.match(/\(ok\s+u(\d+)\)/);
  return match ? Number(match[1]) : null;
}

/**
 * Fetch tips by querying the Hiro extended API for contract-call
 * transactions to the stack-flow contract. Returns up to `limit` tips
 * using 1–3 paginated requests instead of N individual read-only calls.
 */
async function fetchTipsViaAPI(limit: number): Promise<TipEntry[]> {
  const contractPrincipal = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;
  const tips: TipEntry[] = [];
  let offset = 0;
  const pageSize = 50;

  while (tips.length < limit) {
    const url = `${stacksApiBaseUrl}/extended/v1/address/${contractPrincipal}/transactions?limit=${pageSize}&offset=${offset}`;
    const response = await fetch(url);

    if (response.status === 429) {
      await sleep(2_000);
      continue; // retry same page
    }
    if (!response.ok) {
      throw new Error(`Hiro API error: ${response.status}`);
    }

    const data: HiroTxListResponse = await response.json();

    for (const tx of data.results) {
      if (
        tx.tx_type !== 'contract_call' ||
        tx.tx_status !== 'success' ||
        tx.contract_call?.function_name !== 'send-tip'
      ) continue;

      const args = tx.contract_call.function_args;
      const recipientArg = args.find(a => a.name === 'recipient');
      const amountArg = args.find(a => a.name === 'amount');
      const messageArg = args.find(a => a.name === 'message');

      const amountMicro = amountArg ? parseReprUint(amountArg.repr) : 0;
      const amountSTX = amountMicro / 1_000_000;
      const fee = Number((amountSTX * TIP_FEE_RATE).toFixed(6));
      const tipId = tx.tx_result ? parseTipIdFromResult(tx.tx_result.repr) : null;

      const tip: TipEntry = {
        id: tipId !== null ? String(tipId) : tx.tx_id.slice(0, 8),
        txid: tx.tx_id,
        sender: tx.sender_address,
        recipient: recipientArg ? parseReprPrincipal(recipientArg.repr) : '',
        amountSTX,
        fee,
        message: messageArg ? parseReprString(messageArg.repr) : '',
        timestamp: new Date(tx.block_time * 1000),
        status: 'confirmed',
        blockHeight: tx.block_height,
      };

      // Seed the per-tip cache so getTipById doesn't need a contract call
      if (tipId !== null) {
        tipByIdCache.set(tipId, { value: tip, expiresAt: now() + TIP_BY_ID_TTL_MS });
      }

      tips.push(tip);
      if (tips.length >= limit) break;
    }

    if (offset + pageSize >= data.total || data.results.length < pageSize) break;
    offset += pageSize;
  }

  return tips.sort((a, b) => Number(b.id) - Number(a.id));
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
  // Check per-tip cache first (populated by getAllTips / fetchTipsViaAPI)
  const cached = tipByIdCache.get(tipId);
  if (cached && cached.expiresAt > now()) {
    return cached.value;
  }

  // Check if allTipsCache has this tip already
  for (const [, entry] of allTipsCache) {
    if (entry.expiresAt > now()) {
      const found = entry.value.find(t => t.id === String(tipId));
      if (found) {
        tipByIdCache.set(tipId, { value: found, expiresAt: now() + TIP_BY_ID_TTL_MS });
        return found;
      }
    }
  }

  // Fallback: single contract read (rare — only for deep-linked tips not yet cached)
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
    // Use the Hiro extended API — 1-3 requests instead of N*2
    const result = await fetchTipsViaAPI(limit);

    allTipsCache.set(limit, {
      value: result,
      expiresAt: now() + ALL_TIPS_TTL_MS,
    });

    return result;
  } catch (error) {
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

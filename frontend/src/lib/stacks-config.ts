import { createNetwork } from '@stacks/network';

// Code-based configuration (no .env required)
const NETWORK_ENV: 'mainnet' | 'testnet' = 'mainnet';
const CONTRACT_ADDRESS_VALUE = 'SP17XF1J869JJZ32YG0S3QRJAJZVY5X2B95M0EZNA';
const CONTRACT_NAME_VALUE = 'stack-flow-v1';

// Network type
export let networkName: 'mainnet' | 'testnet' = NETWORK_ENV;
export const isMainnet = (networkName as string) === 'mainnet';

const mainnetApiOrigin =
  import.meta.env.VITE_STACKS_MAINNET_API_BASE ?? 'https://api.mainnet.hiro.so';
const testnetApiOrigin =
  import.meta.env.VITE_STACKS_TESTNET_API_BASE ?? 'https://api.testnet.hiro.so';

const remoteApiOrigin = isMainnet ? mainnetApiOrigin : testnetApiOrigin;

// In local dev, route through Vite proxy to avoid browser CORS/rate-limit response issues.
export const stacksApiBaseUrl = import.meta.env.DEV
  ? isMainnet
    ? '/stacks-mainnet'
    : '/stacks-testnet'
  : remoteApiOrigin;

// Network object for read-only calls — accepts baseUrl via client config.
// The docs allow passing a URL string for `network`, but createNetwork
// lets us proxy through Vite in dev without leaking the proxy prefix.
export const stacksNetwork = createNetwork({
  network: networkName,
  client: {
    baseUrl: stacksApiBaseUrl,
  },
});

// Contract configuration
export const CONTRACT_ADDRESS = CONTRACT_ADDRESS_VALUE;
export const CONTRACT_NAME = CONTRACT_NAME_VALUE;

// API endpoints
export const explorerUrl = isMainnet 
  ? 'https://explorer.stacks.co'
  : 'https://explorer.stacks.co/?testnet=1';

type DetectedNetwork = 'mainnet' | 'testnet' | 'unknown';

function toNumberOrNaN(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return Number.NaN;
}

export async function detectNodeNetwork(): Promise<DetectedNetwork> {
  try {
    const response = await fetch(`${stacksApiBaseUrl}/v2/info`);
    if (!response.ok) return 'unknown';

    const data = (await response.json()) as { network_id?: unknown };
    const networkId = toNumberOrNaN(data.network_id);

    if (networkId === 1) return 'mainnet';
    if (networkId === 2147483648) return 'testnet';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

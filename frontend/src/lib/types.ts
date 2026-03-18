export interface TipEntry {
  id: string;
  txid: string;
  sender: string;
  recipient: string;
  amountSTX: number;
  fee: number;
  message?: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  blockHeight?: number;
}

export interface LeaderboardEntry {
  address: string;
  totalSTX: number;
  tipCount: number;
  rank: number;
}

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/types';
import { AddressPill } from '@/components/AddressPill';
import { AmountDisplay } from '@/components/AmountDisplay';
import { SkeletonRow } from '@/components/SkeletonRow';
import { EmptyState } from '@/components/EmptyState';
import { getLeaderboard } from '@/lib/contract';

const medals = ['🥇', '🥈', '🥉'];

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return <span className="text-[length:var(--text-lg)] leading-none">{medals[rank - 1]}</span>;
  }
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[length:var(--text-xs)] font-medium text-muted-foreground">
      {rank}
    </span>
  );
}
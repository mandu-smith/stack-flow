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

function LeaderboardColumn({ title, entries, isLoading }: { title: string; entries: LeaderboardEntry[]; isLoading: boolean }) {
  return (
    <div className="rounded-lg bg-card shadow-base overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        <Trophy className="h-4 w-4 text-primary" />
        <h2 className="font-display text-[length:var(--text-base)] font-semibold text-foreground">{title}</h2>
      </div>
      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
      ) : entries.length === 0 ? (
        <EmptyState title="No ranking data yet" description="Leaderboard will populate when tips are indexed." />
      ) : (
        entries.map((entry) => (
          <div key={entry.address} className="flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0">
            <RankBadge rank={entry.rank} />
            <AddressPill address={entry.address} />
            <span className="ml-auto text-[length:var(--text-xs)] text-muted-foreground tabular-nums">
              {entry.tipCount} tip{entry.tipCount !== 1 ? 's' : ''}
            </span>
            <AmountDisplay amountSTX={entry.totalSTX} className="text-[length:var(--text-sm)]" />
          </div>
        ))
      )}
    </div>
  );
}

export default function Leaderboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
    retry: false,
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-[var(--space-wide)]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="font-display text-[length:var(--text-2xl)] font-bold text-foreground mb-1">
          Leaderboard
        </h1>
        <p className="text-[length:var(--text-sm)] text-muted-foreground mb-[var(--space-wide)]">
          Top contributors across the network
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LeaderboardColumn title="Top Tippers" entries={data?.topTippers ?? []} isLoading={isLoading} />
          <LeaderboardColumn title="Most Tipped" entries={data?.mostTipped ?? []} isLoading={isLoading} />
        </div>
      </motion.div>
    </main>
  );
}

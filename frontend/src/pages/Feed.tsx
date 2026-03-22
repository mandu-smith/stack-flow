import { motion } from 'framer-motion';
import { TipRow } from '@/components/TipRow';
import { SkeletonRow } from '@/components/SkeletonRow';
import { EmptyState } from '@/components/EmptyState';
import type { TipEntry } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { getAllTips } from '@/lib/contract';

export default function Feed() {
  const { data: tips, isLoading } = useQuery<TipEntry[]>({
    queryKey: ['tips'],
    queryFn: async () => getAllTips(100),
    retry: false,
    refetchInterval: 10000, // Poll every 10s
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-[var(--space-wide)]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="font-display text-[length:var(--text-2xl)] font-bold text-foreground mb-1">
          Activity
        </h1>
        <p className="text-[length:var(--text-sm)] text-muted-foreground mb-[var(--space-wide)]">
          Recent tips across the network
        </p>

        <div className="rounded-lg bg-card shadow-base overflow-hidden">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          ) : !tips || tips.length === 0 ? (
            <EmptyState />
          ) : (
            tips.map(tip => <TipRow key={tip.id} tip={tip} />)
          )}
        </div>
      </motion.div>
    </main>
  );
}

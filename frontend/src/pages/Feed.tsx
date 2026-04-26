import { motion } from 'framer-motion';
import { TipRow } from '@/components/TipRow';
import { SkeletonRow } from '@/components/SkeletonRow';
import { EmptyState } from '@/components/EmptyState';
import type { TipEntry } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { getAllTips } from '@/lib/contract';
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export default function Feed() {
  const { data: tips, isLoading } = useQuery<TipEntry[]>({
    queryKey: ['tips'],
    queryFn: async () => getAllTips(100),
    retry: false,
    refetchInterval: 10000, // Poll every 10s
  });

  // Virtualizer setup
  const parentRef = useRef<HTMLDivElement>(null);
  const rowHeight = 64; // px, adjust to match TipRow height
  const virtualizer = useVirtualizer({
    count: tips?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 6,
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

        <div className="rounded-lg bg-card shadow-base overflow-hidden" style={{ height: '480px', maxHeight: '60vh' }}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          ) : !tips || tips.length === 0 ? (
            <EmptyState />
          ) : (
            <div ref={parentRef} style={{ height: '100%', overflow: 'auto' }}>
              <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
                {virtualizer.getVirtualItems().map(virtualRow => {
                  const tip = tips[virtualRow.index];
                  return (
                    <div
                      key={tip.id}
                      ref={virtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`
                      }}
                    >
                      <TipRow tip={tip} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}

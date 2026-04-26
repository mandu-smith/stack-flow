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
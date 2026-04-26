import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { StatValue } from '@/components/StatValue';
import { TipComposer } from '@/components/TipComposer';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getPlatformStats } from '@/lib/contract';

export default function Home() {
  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: getPlatformStats,
    retry: false,
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-[var(--space-section)]">
      <div className="grid gap-[var(--space-wide)] lg:grid-cols-[1fr_380px] lg:items-start">
        {/* Left: Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-[var(--space-wide)]"
        ></motion.div>
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
        >
          <div className="flex flex-col gap-[var(--space-base)]">
            <h1 className="font-display text-[length:var(--text-4xl)] font-bold tracking-tight text-foreground">
              Tip anyone on{' '}
              <span className="text-primary">Stacks</span>
            </h1>
            <p className="max-w-lg text-[length:var(--text-lg)] text-muted-foreground leading-relaxed">
              Send micro-tips to builders, creators, and community members. 
              Fast, transparent, powered by the Stacks blockchain.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 sm:gap-8">
            <StatValue value={stats?.totalTips ?? 0} label="Tips sent" />
            <StatValue value={stats?.totalVolumeSTX ?? 0} label="Total volume" suffix="STX" decimals={3} />
            <StatValue value={stats?.totalFeesSTX ?? 0} label="Platform fees earned" suffix="STX" decimals={3} />
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/feed">
                Explore activity
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Right: Composer */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <TipComposer />
        </motion.div>
      </div>
    </main>
  );
}

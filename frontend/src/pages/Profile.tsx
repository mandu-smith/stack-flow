import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddressPill } from '@/components/AddressPill';
import { StatValue } from '@/components/StatValue';
import { TipRow } from '@/components/TipRow';
import { SkeletonRow } from '@/components/SkeletonRow';
import { EmptyState } from '@/components/EmptyState';
import type { TipEntry } from '@/lib/types';
import { getTipsForAddress } from '@/lib/contract';
import { validateStacksAddress } from '@stacks/transactions';

export default function Profile() {
  const { address } = useParams<{ address: string }>();

  // Validate address using @stacks/transactions
  const isValidAddress = address && validateStacksAddress(address);

  const { data, isLoading } = useQuery({
    queryKey: ['profile', address],
    queryFn: async () => getTipsForAddress(address!),
    enabled: !!address && isValidAddress,
    retry: false,
  });

  const sent = data?.sent ?? [];
  const received = data?.received ?? [];
  const netVolume = received.reduce((s, t) => s + t.amountSTX, 0) - sent.reduce((s, t) => s + t.amountSTX, 0);

  return (
    <main className="mx-auto max-w-3xl px-4 py-[var(--space-wide)]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col gap-1 mb-[var(--space-wide)]">
          <h1 className="font-display text-[length:var(--text-2xl)] font-bold text-foreground">Profile</h1>
          {address && <AddressPill address={address} />}
        </div>

        {!isValidAddress ? (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-[length:var(--text-md)] font-medium mb-8">
            Invalid Stacks address.
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="flex flex-wrap gap-4 sm:gap-8 mb-[var(--space-wide)]">
              <StatValue value={sent.length} label="Tips sent" />
              <StatValue value={received.length} label="Tips received" />
              <StatValue value={Math.abs(netVolume)} label="Net volume" suffix="STX" decimals={2} />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="received">
              <TabsList>
                <TabsTrigger value="received">Received ({received.length})</TabsTrigger>
                <TabsTrigger value="sent">Sent ({sent.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="received">
                <div className="rounded-lg bg-card shadow-base overflow-hidden">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : received.length === 0 ? (
                    <EmptyState />
                  ) : (
                    received.map(tip => <TipRow key={tip.id} tip={tip} />)
                  )}
                </div>
              </TabsContent>
              <TabsContent value="sent">
                <div className="rounded-lg bg-card shadow-base overflow-hidden">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : sent.length === 0 ? (
                    <EmptyState />
                  ) : (
                    sent.map(tip => <TipRow key={tip.id} tip={tip} />)
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </motion.div>
    </main>
  );
}

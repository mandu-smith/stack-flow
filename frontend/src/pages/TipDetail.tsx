import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AddressPill } from '@/components/AddressPill';
import { AmountDisplay } from '@/components/AmountDisplay';
import { TxStatus } from '@/components/TxStatus';
import { StatusTimeline } from '@/components/StatusTimeline';
import { Button } from '@/components/ui/button';
import type { TipEntry } from '@/lib/types';
import { getTipById } from '@/lib/contract';

export default function TipDetail() {
  const { id } = useParams<{ id: string }>();
  const [copiedTxid, setCopiedTxid] = useState(false);
  const parsedId = Number(id);
  const { data: tip } = useQuery<TipEntry | null>({
    queryKey: ['tip-detail', id],
    queryFn: async () => {
      if (!Number.isFinite(parsedId)) return null;
      return getTipById(parsedId);
    },
    retry: false,
  });

  if (!tip) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-[var(--space-section)] text-center">
        <h1 className="font-display text-[length:var(--text-2xl)] font-bold text-foreground mb-2">Tip not found</h1>
        <p className="text-muted-foreground mb-4">This transaction doesn't exist.</p>
        <Button asChild variant="outline">
          <Link to="/feed">Back to activity</Link>
        </Button>
      </main>
    );
  }

  const truncatedTxid = `${tip.txid.slice(0, 10)}…${tip.txid.slice(-8)}`;

  const handleCopyTxid = async () => {
    await navigator.clipboard.writeText(tip.txid);
    setCopiedTxid(true);
    setTimeout(() => setCopiedTxid(false), 1500);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-[var(--space-wide)]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-[var(--space-wide)]"
      >
        {/* Back link */}
        <Link to="/feed" className="inline-flex items-center gap-1.5 text-[length:var(--text-sm)] text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to activity
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 flex-wrap">
          <AmountDisplay amountSTX={tip.amountSTX} className="font-display text-[length:var(--text-3xl)] font-bold" />
          <TxStatus status={tip.status} />
        </div>

        {/* Participants */}
        <div className="rounded-lg bg-card shadow-base p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[length:var(--text-xs)] text-muted-foreground w-16 shrink-0">From</span>
            <AddressPill address={tip.sender} />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[length:var(--text-xs)] text-muted-foreground w-16 shrink-0">To</span>
            <AddressPill address={tip.recipient} />
          </div>
        </div>

        {/* Message */}
        {tip.message && (
          <div className="rounded-lg bg-card shadow-base p-5">
            <span className="text-[length:var(--text-xs)] text-muted-foreground block mb-2">Message</span>
            <blockquote className="border-l-2 border-primary/40 pl-4 text-[length:var(--text-base)] text-foreground italic">
              "{tip.message}"
            </blockquote>
          </div>
        )}

        {/* Transaction details */}
        <div className="rounded-lg bg-card shadow-base p-5 flex flex-col gap-3">
          <span className="text-[length:var(--text-xs)] text-muted-foreground">Transaction details</span>

          <div className="flex items-center gap-2">
            <span className="text-[length:var(--text-xs)] text-muted-foreground w-20 shrink-0">Txid</span>
            <code className="font-mono text-[length:var(--text-xs)] text-foreground">{truncatedTxid}</code>
            <button onClick={handleCopyTxid} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Copy transaction ID">
              {copiedTxid ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[length:var(--text-xs)] text-muted-foreground w-20 shrink-0">Fee</span>
            <span className="text-[length:var(--text-sm)] text-foreground">{tip.fee} STX</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[length:var(--text-xs)] text-muted-foreground w-20 shrink-0">Time</span>
            <span className="text-[length:var(--text-sm)] text-foreground">{tip.timestamp.toLocaleString()}</span>
          </div>

          {tip.blockHeight && (
            <div className="flex items-center gap-2">
              <span className="text-[length:var(--text-xs)] text-muted-foreground w-20 shrink-0">Block</span>
              <span className="text-[length:var(--text-sm)] text-foreground font-mono">#{tip.blockHeight.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Status timeline */}
        <div className="rounded-lg bg-card shadow-base p-5">
          <span className="text-[length:var(--text-xs)] text-muted-foreground block mb-3">Status timeline</span>
          <StatusTimeline status={tip.status} timestamp={tip.timestamp} />
        </div>
      </motion.div>
    </main>
  );
}

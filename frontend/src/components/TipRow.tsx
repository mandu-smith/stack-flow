import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { AddressPill } from './AddressPill';
import { AmountDisplay } from './AmountDisplay';
import { TxStatus } from './TxStatus';
import type { TipEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface TipRowProps {
  tip: TipEntry;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const TipRowComponent = ({ tip }: TipRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const hasMessage = !!tip.message;

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on address pills, chevron, or interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('[data-chevron]')) return;
    navigate(`/tip/${tip.id}`);
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/40">
      <div
        onClick={handleRowClick}
        className={cn(
          'flex w-full items-center gap-2 px-3 py-3 text-left cursor-pointer sm:gap-3 sm:px-4'
        )}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/tip/${tip.id}`)}
      >
        <span className="shrink-0 text-[length:var(--text-xs)] text-muted-foreground tabular-nums w-12 sm:w-14">
          {timeAgo(tip.timestamp)}
        </span>

        <AddressPill address={tip.sender} />

        <span className="hidden text-muted-foreground text-[length:var(--text-xs)] sm:inline">→</span>

        <AddressPill address={tip.recipient} />

        <AmountDisplay amountSTX={tip.amountSTX} className="ml-auto text-[length:var(--text-xs)] sm:text-[length:var(--text-sm)]" />

        <TxStatus status={tip.status} className="hidden sm:inline-flex w-20" />

        {hasMessage && (
          <button
            data-chevron
            onClick={handleChevronClick}
            className="p-1 -m-1"
            aria-expanded={expanded}
            aria-label={expanded ? 'Hide tip message' : 'Show tip message'}
            type="button"
          >
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
                expanded && 'rotate-180'
              )}
              aria-hidden="true"
              focusable="false"
            />
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && tip.message && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pl-[calc(3.5rem+0.75rem)]">
              <p className="text-[length:var(--text-sm)] text-muted-foreground italic">
                "{tip.message}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const TipRow = memo(
  TipRowComponent,
  (prev, next) => prev.tip.id === next.tip.id && prev.tip.status === next.tip.status && prev.tip.message === next.tip.message
);

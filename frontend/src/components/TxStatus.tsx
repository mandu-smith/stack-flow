import { cn } from '@/lib/utils';

type Status = 'pending' | 'confirmed' | 'failed';

const statusConfig: Record<Status, { label: string; color: string; dot: string }> = {
  pending: { label: 'Pending', color: 'text-pending', dot: 'bg-pending' },
  confirmed: { label: 'Confirmed', color: 'text-success', dot: 'bg-success' },
  failed: { label: 'Failed', color: 'text-failed', dot: 'bg-failed' },
};

interface TxStatusProps {
  status: Status;
  className?: string;
}

export function TxStatus({ status, className }: TxStatusProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-[length:var(--text-xs)] font-medium', config.color, className)}
      role="status"
      aria-live="polite"
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot, status === 'pending' && 'animate-pulse')} />
      {config.label}
    </span>
  );
}

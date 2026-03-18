import { cn } from '@/lib/utils';

interface TimelineStep {
  label: string;
  timestamp?: Date;
  active: boolean;
  failed?: boolean;
}

interface StatusTimelineProps {
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
}

export function StatusTimeline({ status, timestamp }: StatusTimelineProps) {
  const submittedTime = new Date(timestamp.getTime() - 120_000);
  const mempoolTime = new Date(timestamp.getTime() - 30_000);

  const steps: TimelineStep[] = [
    { label: 'Submitted', timestamp: submittedTime, active: true },
    { label: 'In mempool', timestamp: status !== 'pending' ? mempoolTime : undefined, active: status !== 'pending' || true },
    {
      label: status === 'failed' ? 'Failed' : 'Confirmed',
      timestamp: status === 'confirmed' || status === 'failed' ? timestamp : undefined,
      active: status === 'confirmed' || status === 'failed',
      failed: status === 'failed',
    },
  ];

  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => (
        <div key={step.label} className="flex gap-3">
          {/* Line + dot */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'h-3 w-3 rounded-full border-2 shrink-0 mt-0.5',
                step.failed
                  ? 'border-destructive bg-destructive'
                  : step.active
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30 bg-transparent',
                !step.active && !step.failed && 'animate-pulse'
              )}
            />
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'w-0.5 flex-1 min-h-[1.5rem]',
                  steps[i + 1].active ? 'bg-primary/50' : 'bg-border'
                )}
              />
            )}
          </div>
          {/* Content */}
          <div className="pb-4">
            <span
              className={cn(
                'text-[length:var(--text-sm)] font-medium',
                step.failed ? 'text-destructive' : step.active ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
            {step.timestamp && (
              <p className="text-[length:var(--text-xs)] text-muted-foreground">
                {step.timestamp.toLocaleString()}
              </p>
            )}
            {!step.active && !step.failed && (
              <p className="text-[length:var(--text-xs)] text-muted-foreground italic">Waiting…</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

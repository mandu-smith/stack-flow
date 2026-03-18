import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AmountDisplayProps {
  amountSTX: number;
  className?: string;
}

export function AmountDisplay({ amountSTX, className = '' }: AmountDisplayProps) {
  const microSTX = Math.round(amountSTX * 1_000_000);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`font-mono font-medium tabular-nums text-foreground ${className}`}>
          {amountSTX.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className="ml-1 text-muted-foreground text-[length:var(--text-xs)]">STX</span>
        </span>
      </TooltipTrigger>
      <TooltipContent className="font-mono text-[length:var(--text-xs)]">
        {microSTX.toLocaleString()} μSTX
      </TooltipContent>
    </Tooltip>
  );
}

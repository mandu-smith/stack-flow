import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AddressPillProps {
  address: string;
  className?: string;
}

export function AddressPill({ address, className = '' }: AddressPillProps) {
  const [copied, setCopied] = useState(false);
  const truncated = `${address.slice(0, 5)}…${address.slice(-4)}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={`/profile/${address}`}
          className={`inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-mono text-[length:var(--text-xs)] text-secondary-foreground transition-colors hover:bg-muted ${className}`}
          aria-label={`View profile for ${address}`}
        >
          <span>{truncated}</span>
          <button
            onClick={handleCopy}
            className="hover:text-foreground transition-colors"
            aria-label="Copy address"
          >
            {copied ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3 opacity-50" />
            )}
          </button>
        </Link>
      </TooltipTrigger>
      <TooltipContent className="font-mono text-[length:var(--text-xs)]">
        {address}
      </TooltipContent>
    </Tooltip>
  );
}

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = 'No tips yet',
  description = 'Be the first to send a tip on StackFlow. It only takes a few seconds.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="rounded-full bg-secondary p-4">
        <ArrowRight className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-display text-[length:var(--text-xl)] font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-[length:var(--text-sm)] text-muted-foreground">{description}</p>
      <Button asChild>
        <Link to="/">Send a tip</Link>
      </Button>
    </div>
  );
}

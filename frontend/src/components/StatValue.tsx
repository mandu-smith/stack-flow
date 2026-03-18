import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatValueProps {
  value: number;
  label: string;
  suffix?: string;
  decimals?: number;
}

export function StatValue({ value, label, suffix, decimals = 0 }: StatValueProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(value, increment * step);
      setDisplayed(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatted = displayed.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div className="flex flex-col gap-1">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={formatted}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-semibold tabular-nums text-[length:var(--text-3xl)] text-foreground"
        >
          {formatted}
          {suffix && <span className="ml-1 text-[length:var(--text-lg)] text-muted-foreground">{suffix}</span>}
        </motion.span>
      </AnimatePresence>
      <span className="text-[length:var(--text-sm)] text-muted-foreground">{label}</span>
    </div>
  );
}

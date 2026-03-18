import { motion } from 'framer-motion';
import { TipComposer } from '@/components/TipComposer';

export default function TipPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-[var(--space-section)]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <TipComposer />
      </motion.div>
    </main>
  );
}

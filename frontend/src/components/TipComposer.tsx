import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TxStatus } from './TxStatus';
import { Check, Loader as Loader2, MessageSquare, Send, CircleAlert as AlertCircle } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { sendTip, clearContractCaches } from '@/lib/contract';
// Helper to poll Hiro API for tx status
async function fetchTxStatus(txid: string): Promise<'pending' | 'confirmed' | 'failed'> {
  try {
    const res = await fetch(`https://api.hiro.so/extended/v1/tx/${txid}`);
    if (!res.ok) return 'pending';
    const data = await res.json();
    if (data.tx_status === 'success') return 'confirmed';
    if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition' || data.tx_status === 'abort_by_block_limit' || data.tx_status === 'abort_by_expiration') return 'failed';
    if (data.tx_status === 'pending' || data.tx_status === 'submitted') return 'pending';
    return 'pending';
  } catch {
    return 'pending';
  }
}
import { useQueryClient } from '@tanstack/react-query';
import { validateStacksAddress } from '@stacks/transactions';
import { isMainnet, explorerTxUrl } from '@/lib/stacks-config';

type ComposerState = 'idle' | 'filling' | 'ready' | 'pending' | 'confirmed' | 'failed';

export function TipComposer() {
  const queryClient = useQueryClient();
  const { isConnected, walletAddress } = useWallet();
  const [state, setState] = useState<ComposerState>('idle');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [txid, setTxid] = useState('');
  const [txStatus, setTxStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const parsedAmount = useMemo(() => parseFloat(amount) || 0, [amount]);
  const fee = useMemo(() => (parsedAmount > 0 ? parseFloat((parsedAmount * 0.005).toFixed(4)) : 0), [parsedAmount]);
  const total = useMemo(() => parsedAmount + fee, [parsedAmount, fee]);

  // Validate using @stacks/transactions validateStacksAddress and check correct network prefix
  const expectedPrefix = isMainnet ? 'SP' : 'ST';
  const isValidAddress =
    recipient.startsWith(expectedPrefix) && validateStacksAddress(recipient);
  const isSelfTip = walletAddress ? recipient === walletAddress : false;
  const isAmountValid = parsedAmount > 0 && parsedAmount <= 999999999;
  const isReady = isValidAddress && !isSelfTip && isAmountValid && isConnected;

  const getAddressError = () => {
    if (!recipient) return '';
    if (!recipient.startsWith(expectedPrefix)) return `Address must start with ${expectedPrefix}`;
    if (!validateStacksAddress(recipient)) return 'Invalid Stacks address';
    if (isSelfTip) return 'You cannot tip yourself';
    return '';
  };

  const getAmountError = () => {
    if (!amount) return '';
    if (parsedAmount <= 0) return 'Amount must be greater than 0';
    if (parsedAmount > 999999999) return 'Amount exceeds maximum';
    return '';
  };

  const addressError = getAddressError();
  const amountError = getAmountError();

  const handleRecipientChange = (val: string) => {
    setRecipient(val);
    setError('');
    if (val.length > 0 && state === 'idle') setState('filling');
    if (val.length === 0 && !amount) setState('idle');
  };

  const handleSend = async () => {
    if (!isReady || !walletAddress) return;
    try {
      setError('');
      setState('pending');
      setLoading(true);

      const result = await sendTip(walletAddress, recipient, Math.floor(parsedAmount * 1e6), message);

      if (result?.txid) {
        // Invalidate React Query caches and clear in-memory contract caches
        clearContractCaches();
        queryClient.invalidateQueries({ queryKey: ['tips'] });
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        queryClient.invalidateQueries({ queryKey: ['platformStats'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });

        setTxid(result.txid);
        setTxStatus('pending');
        setState('pending');
      } else if (result?.cancel) {
        setState('idle');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send tip';
      setError(errorMsg);
      setState('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setState('idle');
    setRecipient('');
    setAmount('');
    setMessage('');
    setShowMessage(false);
    setTxid('');
    setError('');
  };

  // Poll for tx confirmation if pending
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (state === 'pending' && txid) {
      setTxStatus('pending');
      interval = setInterval(async () => {
        const status = await fetchTxStatus(txid);
        setTxStatus(status);
        if (status !== 'pending') {
          setState('confirmed');
          clearInterval(interval);
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state, txid]);

  if (state === 'confirmed' && txid) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 rounded-lg bg-card p-6 shadow-base text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <Check className="h-6 w-6 text-success" />
        </div>
        <h3 className="font-display text-[length:var(--text-xl)] font-semibold">Tip sent!</h3>
        <p className="text-[length:var(--text-sm)] text-muted-foreground">
          {parsedAmount} STX sent successfully
        </p>
        <div className="w-full rounded-md bg-secondary px-3 py-2">
          <span className="text-[length:var(--text-xs)] text-muted-foreground">Tx ID</span>
          <a
            href={explorerTxUrl(txid)}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-mono text-[length:var(--text-xs)] break-all text-primary hover:underline"
          >
            {txid}
          </a>
        </div>
        <TxStatus status={txStatus} />
        <Button onClick={handleReset} variant="outline" className="mt-2">
          Send another tip
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-card p-6 shadow-base">
      <h2 className="font-display text-[length:var(--text-xl)] font-semibold text-foreground">
        Send a tip
      </h2>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-[length:var(--text-sm)]">{error}</span>
        </motion.div>
      )}

      {/* Recipient */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="recipient-input" className="text-[length:var(--text-sm)] font-medium text-foreground">
          Recipient Address
        </label>
        <Input
          id="recipient-input"
          placeholder={`${expectedPrefix}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}
          value={recipient}
          onChange={e => handleRecipientChange(e.target.value)}
          className={`font-mono text-[length:var(--text-sm)] ${
            addressError && recipient ? 'border-destructive focus-visible:ring-destructive' : ''
          }`}
          disabled={state === 'pending' || loading}
          aria-label="Recipient address"
          aria-invalid={!!addressError && !!recipient}
          aria-describedby={addressError && recipient ? 'recipient-error' : undefined}
        />
        {addressError && recipient && (
          <span id="recipient-error" className="text-[length:var(--text-xs)] text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {addressError}
          </span>
        )}
      </div>

      {/* Amount — appears after recipient has content */}
      <AnimatePresence>
        {(state !== 'idle' || recipient.length > 0) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="amount-input" className="text-[length:var(--text-sm)] font-medium text-foreground">
                Amount (STX)
              </label>
              <Input
                id="amount-input"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="0"
                step="0.01"
                disabled={state === 'pending' || loading}
                className={`${
                  amountError && amount ? 'border-destructive focus-visible:ring-destructive' : ''
                }`}
                aria-label="Tip amount in STX"
                aria-invalid={!!amountError && !!amount}
                aria-describedby={amountError && amount ? 'amount-error' : 'amount-details'}
              />
              {amountError && amount && (
                <span id="amount-error" className="text-[length:var(--text-xs)] text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {amountError}
                </span>
              )}
              {parsedAmount > 0 && (
                <motion.div
                  id="amount-details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between text-[length:var(--text-xs)] text-muted-foreground"
                >
                  <span>Fee (0.5%): {fee} STX</span>
                  <span className="font-medium text-foreground">Total: {total.toFixed(4)} STX</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message toggle */}
      <AnimatePresence>
        {parsedAmount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {!showMessage ? (
              <button
                onClick={() => setShowMessage(true)}
                className="flex items-center gap-1.5 text-[length:var(--text-sm)] text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Add a message (optional)
              </button>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message-input" className="text-[length:var(--text-sm)] font-medium text-foreground">
                  Message (Optional)
                </label>
                <Textarea
                  id="message-input"
                  placeholder="Say something nice…"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={2}
                  maxLength={280}
                  disabled={state === 'pending' || loading}
                  className="resize-none text-[length:var(--text-sm)]"
                  aria-label="Optional tip message"
                />
                <span className="text-[length:var(--text-xs)] text-muted-foreground text-right">
                  {message.length}/280
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <div className="flex flex-col gap-2 pt-1">
        {!isConnected ? (
          <Button disabled className="w-full gap-2">
            Connect wallet to send
          </Button>
        ) : (
          <Button
            onClick={handleSend}
            disabled={!isReady || state === 'pending' || loading}
            className="w-full gap-2"
          >
            {state === 'pending' || loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send {parsedAmount > 0 ? `${total.toFixed(2)} STX` : 'tip'}
              </>
            )}
          </Button>
        )}

        {state === 'pending' && (
          <div className="flex justify-center">
            <TxStatus status={txStatus} />
          </div>
        )}
      </div>
    </div>
  );
}

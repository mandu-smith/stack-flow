import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { WalletProvider } from '@/contexts/WalletContext';
import { Navbar } from '@/components/Navbar';
import { detectNodeNetwork, networkName, stacksApiBaseUrl } from '@/lib/stacks-config';
import Index from './pages/Index';
import Feed from './pages/Feed';
import Leaderboard from './pages/Leaderboard';
import TipPage from './pages/Tip';
import TipDetail from './pages/TipDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const App = () => {
  const [networkWarning, setNetworkWarning] = useState<string | null>(null);
  const [checkingNetwork, setCheckingNetwork] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);

  const validateNetwork = async () => {
    setCheckingNetwork(true);
    const detected = await detectNodeNetwork();

    if (detected === 'unknown') {
      setNetworkWarning(
        `Unable to verify Stacks node network from ${stacksApiBaseUrl}. Confirm this endpoint matches ${networkName}.`
      );
      setCheckingNetwork(false);
      return;
    }

    if (detected !== networkName) {
      setNetworkWarning(
        `Network mismatch: app is configured for ${networkName}, but node reports ${detected}. Transactions may fail or go to the wrong network.`
      );
      setCheckingNetwork(false);
      return;
    }

    setNetworkWarning(null);
    setWarningDismissed(false);
    setCheckingNetwork(false);
  };

  useEffect(() => {
    let isMounted = true;

    const runValidation = async () => {
      setCheckingNetwork(true);
      const detected = await detectNodeNetwork();
      if (!isMounted) return;

      if (detected === 'unknown') {
        setNetworkWarning(
          `Unable to verify Stacks node network from ${stacksApiBaseUrl}. Confirm this endpoint matches ${networkName}.`
        );
        setCheckingNetwork(false);
        return;
      }

      if (detected !== networkName) {
        setNetworkWarning(
          `Network mismatch: app is configured for ${networkName}, but node reports ${detected}. Transactions may fail or go to the wrong network.`
        );
        setCheckingNetwork(false);
        return;
      }

      setNetworkWarning(null);
      setCheckingNetwork(false);
    };

    runValidation();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              {networkWarning && !warningDismissed && (
                <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-[length:var(--text-sm)] text-destructive">
                  <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
                    <span>{networkWarning}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setWarningDismissed(false);
                          void validateNetwork();
                        }}
                        disabled={checkingNetwork}
                        className="rounded border border-destructive/40 px-2 py-1 text-[length:var(--text-xs)] hover:bg-destructive/10 disabled:opacity-60"
                      >
                        {checkingNetwork ? 'Checking...' : 'Retry check'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setWarningDismissed(true)}
                        className="rounded border border-destructive/40 px-2 py-1 text-[length:var(--text-xs)] hover:bg-destructive/10"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <Navbar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/tip" element={<TipPage />} />
                <Route path="/tip/:id" element={<TipDetail />} />
                <Route path="/profile/:address" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WalletProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;

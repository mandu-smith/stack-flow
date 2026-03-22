import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Copy, LogOut, Check, User, Loader2, Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from '@/components/ui/sheet';

export function Navbar() {
  const [copied, setCopied] = useState(false);
  const { isConnected, displayName, walletAddress, connectWallet, disconnectWallet, loading } =
    useWallet();

  const handleCopy = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-[length:var(--text-lg)] font-bold text-foreground">
            Stack<span className="text-primary">Flow</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            to="/"
            className="text-[length:var(--text-sm)] text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            to="/leaderboard"
            className="text-[length:var(--text-sm)] text-muted-foreground hover:text-foreground transition-colors"
          >
            Leaderboard
          </Link>
          <Link
            to="/feed"
            className="text-[length:var(--text-sm)] text-muted-foreground hover:text-foreground transition-colors"
          >
            Activity
          </Link>
        </nav>

        {/* Mobile nav: Sheet drawer */}
        <div className="sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <nav className="flex flex-col gap-2 p-6">
                <Link
                  to="/"
                  className="text-[length:var(--text-lg)] font-semibold text-foreground py-2 px-1 rounded hover:bg-accent"
                >
                  Home
                </Link>
                <Link
                  to="/leaderboard"
                  className="text-[length:var(--text-lg)] font-semibold text-foreground py-2 px-1 rounded hover:bg-accent"
                >
                  Leaderboard
                </Link>
                <Link
                  to="/feed"
                  className="text-[length:var(--text-lg)] font-semibold text-foreground py-2 px-1 rounded hover:bg-accent"
                >
                  Activity
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 font-mono text-[length:var(--text-xs)]"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  {displayName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopy} className="gap-2">
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? 'Copied!' : 'Copy address'}
                </DropdownMenuItem>
                {walletAddress && (
                  <DropdownMenuItem asChild className="gap-2">
                    <Link to={`/profile/${walletAddress}`}>
                      <User className="h-3.5 w-3.5" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={disconnectWallet}
                  className="gap-2 text-destructive"
                  disabled={loading}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={connectWallet}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wallet className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {loading ? 'Connecting...' : 'Connect wallet'}
              </span>
              <span className="sm:hidden">{loading ? 'Connecting...' : 'Connect'}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

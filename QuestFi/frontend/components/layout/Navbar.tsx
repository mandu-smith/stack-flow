"use client"

import { useState, useEffect } from 'react'
import { Menu, LogOut, User, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TurnkeyAuth } from '@/components/auth/TurnkeyAuth'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const session = localStorage.getItem('turnkey_session')
      const suborgId = localStorage.getItem('turnkey_suborg_id')
      const walletConnected = localStorage.getItem('wallet_connected')
      const walletAddress = localStorage.getItem('wallet_address')
      const storedAddress = localStorage.getItem('user_stacks_address')
      const storedEmail = localStorage.getItem('user_email')

      // Check if authenticated via Turnkey or Wallet
      if ((session && suborgId) || walletConnected === 'true') {
        setIsAuthenticated(true)
        setUserAddress(walletAddress || storedAddress)
        setUserEmail(storedEmail)
      } else {
        setIsAuthenticated(false)
        setUserAddress(null)
        setUserEmail(null)
      }
    }

    checkAuth()

    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', checkAuth)

    // Listen for custom auth event (for same-tab updates)
    window.addEventListener('auth-changed', checkAuth)

    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('auth-changed', checkAuth)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    setShowAuth(false)

    // Refresh user data
    const walletAddress = localStorage.getItem('wallet_address')
    const storedAddress = localStorage.getItem('user_stacks_address')
    const storedEmail = localStorage.getItem('user_email')
    setUserAddress(walletAddress || storedAddress)
    setUserEmail(storedEmail)
  }

  const handleSignOut = () => {
    localStorage.removeItem('turnkey_session')
    localStorage.removeItem('turnkey_suborg_id')
    localStorage.removeItem('user_stacks_address')
    localStorage.removeItem('user_email')
    localStorage.removeItem('wallet_connected')
    localStorage.removeItem('wallet_address')
    setIsAuthenticated(false)
    setUserAddress(null)
    setUserEmail(null)
    window.location.href = '/'
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const navLinks = [
    { name: 'Quests', href: '/quests' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Dashboard', href: '/profile' },
    { name: 'Docs', href: '/docs' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-slate-950/70 backdrop-blur-xl border-b border-white/10'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <span className="text-2xl">🥋</span>
            <span className="text-xl font-black text-white tracking-tight">
              QuestFi
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-slate-300 hover:text-white transition-colors font-medium text-sm tracking-wide relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {/* XP Badge - Only show when authenticated */}
            {isAuthenticated && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm hover:border-white/20 transition-all">
                <span className="px-2 py-0.5 bg-emerald-500 text-black text-xs font-bold rounded">
                  Lvl 1
                </span>
                <span className="text-white font-semibold text-sm">0 XP</span>
              </div>
            )}

            {!isAuthenticated ? (
              /* Sign In Button */
              <button
                onClick={() => setShowAuth(true)}
                className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-black overflow-hidden transition-all duration-300"
              >
                <div className="absolute inset-0 bg-emerald-400 transition-all duration-300 group-hover:bg-emerald-500"
                  style={{ clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)' }}
                />
                <span className="relative font-bold tracking-wide">
                  Sign In
                </span>
              </button>
            ) : (
              /* User Dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Avatar className="ring-2 ring-cyan-500/50 hover:ring-cyan-500 transition-all duration-300 w-10 h-10">
                      <AvatarFallback className="bg-cyan-500 text-white font-bold">
                        {userEmail ? userEmail[0].toUpperCase() : userAddress ? userAddress[0].toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-white/10">
                  <DropdownMenuLabel className="text-white">
                    <div className="flex flex-col space-y-1">
                      {userEmail ? (
                        <p className="text-sm font-semibold">{userEmail}</p>
                      ) : userAddress ? (
                        <p className="text-sm font-semibold font-mono">{truncateAddress(userAddress)}</p>
                      ) : (
                        <p className="text-sm font-semibold">User</p>
                      )}
                      {userAddress && (
                        <p className="text-xs text-slate-400 font-mono">
                          {truncateAddress(userAddress)}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild>
                    <a href="/profile" className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <User className="w-4 h-4" />
                      Dashboard
                    </a>
                  </DropdownMenuItem>
                  {userAddress && (
                    <DropdownMenuItem className="flex items-center gap-2 text-slate-300 hover:text-white">
                      <Wallet className="w-4 h-4" />
                      <span className="text-xs font-mono">{truncateAddress(userAddress)}</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:text-emerald-400">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 backdrop-blur-xl border-l border-emerald-500/20 w-[300px] p-6">
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/80 pointer-events-none z-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none z-0" />

              {/* Subtle animated glow */}
              <div className="absolute top-1/4 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl animate-pulse pointer-events-none z-0" />
              <div className="absolute bottom-1/3 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl animate-pulse pointer-events-none z-0" style={{ animationDelay: '1s' }} />
              <div className="relative flex flex-col gap-8 mt-8 h-full z-10">
                {/* Mobile XP */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/20 rounded-xl">
                  <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-black rounded-md">
                    Lvl 1
                  </span>
                  <span className="text-white font-bold text-sm">0 XP</span>
                </div>

                {/* Mobile Links */}
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-slate-300 hover:text-white hover:bg-white/5 transition-all font-semibold text-base px-4 py-3 rounded-lg"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>

                {/* Mobile Sign In / User Section */}
                {!isAuthenticated ? (
                  <Button
                    onClick={() => {
                      setShowAuth(true)
                      setIsOpen(false)
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl py-6 text-sm"
                  >
                    Sign In
                  </Button>
                ) : (
                  <>
                    {/* Mobile User Info */}
                    <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                      <Avatar className="ring-2 ring-cyan-500/50 w-12 h-12">
                        <AvatarFallback className="bg-cyan-500 text-white font-bold text-base">
                          {userEmail ? userEmail[0].toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-white">{userEmail || 'User'}</p>
                        {userAddress && (
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {truncateAddress(userAddress)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Mobile Sign Out */}
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold rounded-xl py-6 text-sm mt-auto"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Turnkey Auth Modal */}
      {showAuth && (
        <TurnkeyAuth
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </nav>
  )
}
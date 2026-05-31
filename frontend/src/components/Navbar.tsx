import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane, Map, Calendar, Wallet, User, Menu, X, Users, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import SignIn from '../pages/SignIn';
import { supabase } from '../lib/supabaseClient';

const navItems = [
  { name: 'Home',      path: '/',          icon: Plane    },
  { name: 'Discovery', path: '/discovery', icon: Map      },
  { name: 'Planner',   path: '/planner',   icon: Calendar },
  { name: 'Wallet',    path: '/wallet',    icon: Wallet   },
  { name: 'Community', path: '/community', icon: Users    },
  { name: 'Dashboard', path: '/dashboard', icon: User     },
];

export default function Navbar() {
  const [isOpen, setIsOpen]           = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [user, setUser]               = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  // ─── Auth state ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Hydrate immediately from existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Stay in sync with every auth event (sign-in, sign-out, token refresh, OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Close sign-in modal automatically when session arrives (covers Google OAuth redirect)
      if (session) setIsSignInOpen(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handler = () => setIsUserMenuOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [isUserMenuOpen]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsUserMenuOpen(false);
    setIsOpen(false);
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    user?.phone ||
    'Traveler';

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold text-accent">Tripsy</span>
            <div className="w-2 h-2 rounded-full bg-primary" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50 hover:text-primary',
                  location.pathname === item.path ? 'text-primary bg-primary/5' : 'text-accent'
                )}
              >
                {item.name}
              </Link>
            ))}

            {/* Auth area */}
            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsUserMenuOpen(v => !v); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover bg-gray-100"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`; }}
                  />
                  <span className="text-sm font-medium text-accent max-w-[100px] truncate">{displayName}</span>
                  <ChevronDown size={14} className={cn('text-muted transition-transform', isUserMenuOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-xs text-muted">Signed in as</p>
                        <p className="text-sm font-semibold text-accent truncate">{user.email || user.phone}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-accent hover:bg-gray-50 transition-colors"
                      >
                        <User size={16} className="text-muted" /> My Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setIsSignInOpen(true)}
                className="btn-primary py-2 px-6 text-sm"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-accent p-1">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-accent hover:bg-gray-50 transition-colors',
                    location.pathname === item.path && 'bg-primary/5 text-primary font-semibold'
                  )}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              ))}

              {/* Mobile auth area */}
              {user ? (
                <div className="pt-4 px-4 space-y-2">
                  <div className="flex items-center gap-3 py-2">
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-9 h-9 rounded-full object-cover bg-gray-100"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`; }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-accent">{displayName}</p>
                      <p className="text-xs text-muted truncate">{user.email || user.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-500 font-medium hover:bg-red-50 transition-colors border border-red-100"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 px-4">
                  <button
                    onClick={() => { setIsSignInOpen(true); setIsOpen(false); }}
                    className="w-full btn-primary py-2.5 text-center rounded-xl"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign In Modal — onSignIn is optional since onAuthStateChange handles state */}
      <SignIn
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSignIn={() => setIsSignInOpen(false)}
      />
    </nav>
  );
}
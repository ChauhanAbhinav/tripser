import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane, Map, Calendar, Wallet, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

const navItems = [
  { name: 'Home', path: '/', icon: Plane },
  { name: 'Discovery', path: '/discovery', icon: Map },
  { name: 'Planner', path: '/planner', icon: Calendar },
  { name: 'Wallet', path: '/wallet', icon: Wallet },
  { name: 'Dashboard', path: '/dashboard', icon: User },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
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
                  "nav-link text-sm",
                  location.pathname === item.path && "text-primary font-semibold"
                )}
              >
                {item.name}
              </Link>
            ))}
            <button className="btn-primary py-2 px-6 text-sm">Sign Up</button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-accent">
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
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-accent hover:bg-gray-50 transition-colors",
                    location.pathname === item.path && "bg-primary/5 text-primary font-semibold"
                  )}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 px-4">
                <button className="w-full btn-primary">Sign Up</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

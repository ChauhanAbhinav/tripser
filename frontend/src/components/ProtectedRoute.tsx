import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { getValidatedAuthSession } from '../lib/authSession';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for a valid session immediately on component mount.
    getValidatedAuthSession().then(({ user }) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    // Then, listen for any auth state changes.
    // This handles sign-in/sign-out events.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session || event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setTimeout(() => {
        getValidatedAuthSession().then(({ user }) => {
          setIsAuthenticated(!!user);
          setLoading(false);
        });
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

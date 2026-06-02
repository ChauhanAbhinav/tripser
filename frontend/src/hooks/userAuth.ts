import { useState, useEffect } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient'; // adjust path as needed
import { getValidatedAuthSession } from '../lib/authSession';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Validate the current session on mount (handles stale sessions after DB resets)
    getValidatedAuthSession().then(({ session, user }) => {
      setSession(session);
      setUser(user);
      setIsLoading(false);
    });

    // 2. Subscribe to auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (!session || event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsLoading(false);
          return;
        }

        setTimeout(() => {
          getValidatedAuthSession().then(({ session: validatedSession, user }) => {
            setSession(validatedSession);
            setUser(user);
            setIsLoading(false);
          });
        }, 0);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
  };
}

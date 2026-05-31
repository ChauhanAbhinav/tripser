import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Loader2, Plane } from 'lucide-react';

/**
 * /auth/callback
 *
 * Handles all Supabase post-auth redirects:
 *   - Google OAuth (PKCE — session comes via hash fragment, not ?code=)
 *   - Email confirmation clicks
 *   - Password reset links
 *   - Phone OTP (doesn't redirect here, handled inline)
 *
 * After session is established, upserts the user's profile so all
 * three auth methods (email, google, phone) are guaranteed to have
 * a row in public.profiles.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const url = new URL(window.location.href);

      // ------------------------------------------------------------------
      // 1. Let Supabase handle the session from URL automatically.
      //    For PKCE (Google OAuth), the session arrives as a hash fragment.
      //    supabase-js picks it up on its own via getSession().
      //    For email confirmation, it arrives as ?token_hash= + ?type=.
      // ------------------------------------------------------------------
      const tokenHash = url.searchParams.get('token_hash');
      const type = url.searchParams.get('type') as any;

      if (tokenHash && type) {
        // Email confirmation or password reset link
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (error) {
          console.error('Email callback error:', error.message);
          navigate('/?auth_error=' + encodeURIComponent(error.message), { replace: true });
          return;
        }
      }

      // ------------------------------------------------------------------
      // 2. Get the session (works for both PKCE hash and token_hash flows)
      // ------------------------------------------------------------------
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        // Session not ready yet — wait for onAuthStateChange to fire
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session) {
              subscription.unsubscribe();
              await upsertProfile(session.user);
              const next = url.searchParams.get('next') || '/';
              navigate(next, { replace: true });
            }
          }
        );
        return;
      }

      // ------------------------------------------------------------------
      // 3. Session is ready — upsert profile and redirect
      // ------------------------------------------------------------------
      await upsertProfile(session.user);
      const next = url.searchParams.get('next') || '/';
      navigate(next, { replace: true });
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted bg-gray-50">
      <div className="flex items-center gap-2 mb-2">
        <Plane className="text-primary" size={24} />
        <span className="font-display font-bold text-accent text-xl">Tripsy</span>
      </div>
      <Loader2 className="animate-spin text-primary" size={28} />
      <p className="text-sm">Signing you in…</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upsert profile — called after every successful auth regardless of method.
// The DB trigger handles email sign-up automatically, but Google OAuth and
// Phone OTP don't always fire it reliably, so we upsert here as a safety net.
// ---------------------------------------------------------------------------
async function upsertProfile(user: any) {
  if (!user) return;

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||        // Google sends 'name'
    user.phone ||                       // Phone auth fallback
    'Traveler';

  const avatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||      // Google sends 'picture'
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
      },
      {
        onConflict: 'id',
        ignoreDuplicates: false, // always update name/avatar if changed
      }
    );

  if (error) console.error('Profile upsert error:', error.message);
}
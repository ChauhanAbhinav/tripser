import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Calendar, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from './Toast';
import { getValidatedAuthSession } from '../lib/authSession';

export default function CompleteProfileModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const [missing, setMissing] = useState({
    name: false,
    dob: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let currentUser: any = null;

    const getSkipKey = (sessionUser: any) =>
      sessionUser?.id ? `skipProfileModal:${sessionUser.id}` : 'skipProfileModal';

    const checkProfile = async (sessionUser: any) => {
      if (!mounted) return;

      if (!sessionUser) {
        setIsOpen(false);
        setUser(null);
        currentUser = null;
        setCheckingProfile(false);
        return;
      }

      currentUser = sessionUser;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, dob')
          .eq('id', sessionUser.id)
          .maybeSingle();

        if (!mounted) return;

        if (error) {
          console.error('Error fetching profile:', error);
          setCheckingProfile(false);
          return;
        }

        const profileData: any = data || {};

        const metadataName =
          sessionUser.user_metadata?.full_name ||
          sessionUser.user_metadata?.name ||
          '';

        const isValidName = (name?: string) =>
          !!name &&
          name !== 'Traveler' &&
          name !== sessionUser.phone &&
          name !== sessionUser.email;

        const hasValidProfileName = isValidName(profileData.full_name);
        const hasValidMetadataName = isValidName(metadataName);
        const hasValidName = hasValidProfileName || hasValidMetadataName;

        const needsName = !hasValidName;
        const needsDob = !profileData.dob;

        if (
          (needsName || needsDob) &&
          sessionStorage.getItem(getSkipKey(sessionUser)) !== 'true'
        ) {
          setMissing({
            name: needsName,
            dob: needsDob,
          });

          setFormData({
            fullName: hasValidProfileName
              ? profileData.full_name
              : hasValidMetadataName
                ? metadataName
                : '',
            dob: profileData.dob || '',
          });

          setUser(sessionUser);
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      } catch (err) {
        console.error('Profile check failed:', err);
      } finally {
        if (mounted) {
          setCheckingProfile(false);
        }
      }
    };

    const initialize = async () => {
      try {
        const { user } = await getValidatedAuthSession();

        if (!mounted) return;

        // setTimeout releases the Supabase auth mutex before making DB calls.
        // Without this, supabase.from() inside checkProfile can deadlock because
        // auth startup holds an internal lock that blocks subsequent DB queries.
        setTimeout(() => checkProfile(user), 0);
      } catch (err) {
        console.error('Session initialization failed:', err);
        if (mounted) setCheckingProfile(false);
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, _session) => {
      if (!mounted) return;

      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
        case 'USER_UPDATED':
          // FIX: Same deadlock fix — wrap DB call in setTimeout to escape the
          // onAuthStateChange mutex. Any supabase.from() call made synchronously
          // inside this listener will hang forever waiting for the lock to release.
          setTimeout(() => {
            getValidatedAuthSession().then(({ user }) => checkProfile(user));
          }, 0);
          break;

        case 'SIGNED_OUT':
          setUser(null);
          currentUser = null;
          setIsOpen(false);
          break;

        default:
          break;
      }
    });

    const handleProfileCheckRequested = () => {
      if (currentUser) {
        setTimeout(() => checkProfile(currentUser), 0);
      }
    };

    window.addEventListener('profile_check_requested', handleProfileCheckRequested);

    return () => {
      mounted = false;
      window.removeEventListener('profile_check_requested', handleProfileCheckRequested);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsLoading(true);

    try {
      const finalName = missing.name
        ? (formData.fullName || '').trim()
        : formData.fullName;

      const updates: any = {};

      if (missing.name) {
        updates.full_name = finalName;
      }

      if (missing.dob) {
        updates.dob = formData.dob;
      }

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const payload = existingProfile
        ? { ...existingProfile, ...updates, id: user.id }
        : { ...updates, id: user.id };

      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        toast(`Error saving profile: ${error.message}`, 'error');
        return;
      }

      if (missing.name) {
        await supabase.auth.updateUser({
          data: { full_name: finalName },
        });
      }

      toast('Profile completed successfully!', 'success');
      setIsOpen(false);
    } catch (error: any) {
      toast(
        `An error occurred: ${error?.message || 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingProfile) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative z-10"
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <Sparkles size={32} />
              </div>

              <h3 className="text-2xl font-display font-bold text-accent">
                Welcome to Tripsy!
              </h3>

              <p className="text-muted text-sm mt-2">
                {missing.name
                  ? 'Complete your profile to unlock personalized travel experiences.'
                  : 'Just one more detail and you are ready to explore Tripsy.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {missing.name && (
                <div>
                  <label className="block text-sm font-medium text-accent mb-2">
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="Jane Doe"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white text-accent font-medium"
                    />
                  </div>
                </div>
              )}

              {missing.dob && (
                <div>
                  <label className="block text-sm font-medium text-accent mb-2">
                    Date of Birth
                  </label>

                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) =>
                        setFormData({ ...formData, dob: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white text-accent font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 mt-4">
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    (missing.name && !(formData.fullName || '').trim()) ||
                    (missing.dob && !formData.dob)
                  }
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 rounded-xl text-base disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : missing.name ? (
                    'Complete Profile'
                  ) : (
                    'Finish Setup'
                  )}
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    const skipKey = user?.id
                      ? `skipProfileModal:${user.id}`
                      : 'skipProfileModal';
                    sessionStorage.setItem(skipKey, 'true');
                    setIsOpen(false);
                  }}
                  className="w-full py-3 text-muted hover:text-accent font-medium text-sm transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

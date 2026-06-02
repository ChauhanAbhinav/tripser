import { useEffect, useState } from 'react';
import type React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plane, Map, Calendar, Wallet, User, Menu, X, Users, LogOut, ChevronDown, Settings, Camera, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import SignIn from '../pages/SignIn';
import { supabase } from '../lib/supabaseClient';
import { getValidatedAuthSession } from '../lib/authSession';
import { useToast } from './Toast';
import { EmailOtpVerification, PhoneVerification } from './AuthVerification';

const navItems = [
  { name: 'Home',      path: '/',          icon: Plane    },
  { name: 'Discovery', path: '/discovery', icon: Map      },
  { name: 'Planner',   path: '/planner',   icon: Calendar },
  { name: 'Wallet',    path: '/wallet',    icon: Wallet,   requiresAuth: true },
  { name: 'Community', path: '/community', icon: Users    },
  { name: 'Dashboard', path: '/dashboard', icon: User,     requiresAuth: true },
];

const normalizePhone = (phone: string) => {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  if (!cleanPhone) return '';
  return cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
};

export default function Navbar() {
  const [isOpen, setIsOpen]           = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [user, setUser]               = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', phone: '', dob: '' });
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState('');
  const [editOriginalPhone, setEditOriginalPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [otpView, setOtpView] = useState<'none' | 'phone' | 'email'>('none');
  const [otp, setOtp] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState('');
  const [pendingEmailVerification, setPendingEmailVerification] = useState(false);

  // ─── Auth state ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Hydrate only from a Supabase-validated session, not stale localStorage.
    getValidatedAuthSession().then(({ user }) => {
      setUser(user);
    });

    // Stay in sync with every auth event (sign-in, sign-out, token refresh, OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session || event === 'SIGNED_OUT') {
        setUser(null);
        return;
      }

      setTimeout(() => {
        getValidatedAuthSession().then(({ user }) => {
          setUser(user);
          // Close sign-in modal automatically when a valid session arrives.
          if (user) setIsSignInOpen(false);
        });
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
    }
  }, [user, pendingPath, navigate]);

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

  const openEditProfile = async () => {
    setIsUserMenuOpen(false);
    setOtpView('none');
    setOtp('');
    setVerificationError('');
    setVerificationSuccess('');
    setPendingEmailVerification(false);
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    const originalPhone = data?.phone || user.phone || '';

    setEditForm({
      fullName: data?.full_name || user.user_metadata?.full_name || '',
      email: user.email || '',
      phone: originalPhone,
      dob: data?.dob || ''
    });

    setEditOriginalPhone(originalPhone);
    setEditAvatarPreview(data?.avatar_url || user.user_metadata?.avatar_url || '');
    setEditAvatarFile(null);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setVerificationError('');
    setVerificationSuccess('');

    try {
      let avatarUrl = editAvatarPreview;
      const updates: any = {};
      let phoneChanged = false;
      let emailChanged = false;

      const currentEmail = user.email || '';
      if (editForm.email.trim() !== '' && editForm.email !== currentEmail) {
        updates.email = editForm.email.trim();
        emailChanged = true;
      }

      const currentPhone = normalizePhone(editOriginalPhone || user.phone || '');
      const nextPhone = normalizePhone(editForm.phone);

      if (nextPhone && nextPhone !== currentPhone) {
        const { data: phoneOwner, error: phoneOwnerError } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone', nextPhone)
          .neq('id', user.id)
          .maybeSingle();

        if (phoneOwnerError) throw phoneOwnerError;

        if (phoneOwner) {
          toast('This phone number is already linked to another account.', 'error');
          return;
        }

        updates.phone = nextPhone;
        phoneChanged = true;
      }

      if (editAvatarFile) {
        const fileExt = editAvatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        await supabase.storage.from('avatars').upload(fileName, editAvatarFile, { upsert: true });
        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatarUrl = publicUrlData.publicUrl;
      }

      if (Object.keys(updates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(
          updates,
          emailChanged
            ? { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` }
            : undefined
        );
        if (authError) throw authError;
      }

      setPendingEmailVerification(emailChanged);

      const { data: existingProfile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

      const profilePayload = existingProfile ? { ...existingProfile, id: user.id } : { id: user.id };
      profilePayload.full_name = (editForm.fullName || '').trim();
      profilePayload.dob = editForm.dob || null;
      profilePayload.avatar_url = avatarUrl;
      profilePayload.phone = currentPhone || null;

      const { error: profileError } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' });

      if (profileError) throw profileError;

      await supabase.auth.updateUser({ data: { full_name: editForm.fullName.trim(), avatar_url: avatarUrl }});
      window.dispatchEvent(new Event('profile_updated'));

      if (phoneChanged) {
        setOtpView('phone');
        setOtp('');
        setVerificationSuccess(`Code sent to ${nextPhone}`);
        setIsSaving(false);
        toast('SMS sent to verify your new phone number.', 'info');
        return;
      }

      if (emailChanged) {
        setOtp('');
        setOtpView('email');
        toast('Profile updated! Enter the email code to confirm the new address.', 'info');
      } else {
        toast('Profile updated successfully!', 'success');
        setIsEditProfileOpen(false);
      }
    } catch (e: any) {
      toast(`Error: ${e.message}`, 'error');
      setVerificationError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyPhone = async (otpValue = otp) => {
    if (otpValue.length < 6 || isSaving) return;

    setIsSaving(true);
    setVerificationError('');
    setVerificationSuccess('');

    try {
      const formattedPhone = normalizePhone(editForm.phone);
      const { error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otpValue, type: 'phone_change' });
      if (error) throw error;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ phone: formattedPhone })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setEditOriginalPhone(formattedPhone);
      window.dispatchEvent(new Event('profile_updated'));
      toast('Phone verified and profile updated!', 'success');

      if (pendingEmailVerification) {
        setOtp('');
        setOtpView('email');
        return;
      }

      setIsEditProfileOpen(false);
    } catch(e:any) {
      toast(`Error: ${e.message}`, 'error');
      setVerificationError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileOtpChange = (value: string) => {
    setOtp(value);
    if (value.length === 6 && otpView === 'phone') {
      void handleVerifyPhone(value);
    } else if (value.length === 6 && otpView === 'email') {
      void handleVerifyEmailChange(value);
    }
  };

  const handleProfileOtpSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (otpView === 'email') {
      void handleVerifyEmailChange(otp);
      return;
    }

    void handleVerifyPhone(otp);
  };

  const handleResendProfilePhoneOtp = async () => {
    setVerificationError('');
    setVerificationSuccess('');

    const formattedPhone = normalizePhone(editForm.phone);
    const { error } = await supabase.auth.updateUser({ phone: formattedPhone });

    if (error) {
      setVerificationError(error.message);
      toast(`Error: ${error.message}`, 'error');
      return;
    }

    setOtp('');
    setVerificationSuccess('New code sent!');
  };

  const handleResendProfileEmailVerification = async () => {
    setIsSaving(true);
    setVerificationError('');
    setVerificationSuccess('');

    const { error } = await supabase.auth.resend({
      type: 'email_change',
      email: editForm.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    setIsSaving(false);

    if (error) {
      setVerificationError(error.message);
      toast(`Error: ${error.message}`, 'error');
      return;
    }

    setOtp('');
    setVerificationSuccess('New verification code sent.');
  };

  const handleVerifyEmailChange = async (otpValue = otp) => {
    if (otpValue.length < 6 || isSaving) return;

    setIsSaving(true);
    setVerificationError('');
    setVerificationSuccess('');

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: editForm.email,
        token: otpValue,
        type: 'email_change',
      });

      if (error) throw error;

      setPendingEmailVerification(false);
      window.dispatchEvent(new Event('profile_updated'));
      toast('Email verified and profile updated!', 'success');
      setIsEditProfileOpen(false);
    } catch (e: any) {
      toast(`Error: ${e.message}`, 'error');
      setVerificationError(e.message);
    } finally {
      setIsSaving(false);
    }
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
    <>
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
                onClick={(e) => {
                  if (item.requiresAuth && !user) {
                    e.preventDefault();
                    setPendingPath(item.path);
                    setIsSignInOpen(true);
                  }
                }}
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
                        onClick={openEditProfile}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-accent hover:bg-gray-50 transition-colors"
                      >
                        <Settings size={16} className="text-muted" /> Edit Profile
                      </button>
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
                onClick={() => {
                  setPendingPath(null);
                  setIsSignInOpen(true);
                }}
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
                  onClick={(e) => {
                    if (item.requiresAuth && !user) {
                      e.preventDefault();
                      setPendingPath(item.path);
                      setIsSignInOpen(true);
                    }
                    setIsOpen(false);
                  }}
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
                    onClick={() => { 
                      setPendingPath(null);
                      setIsSignInOpen(true); 
                      setIsOpen(false); 
                    }}
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

    </nav>

      {/* Sign In Modal — onSignIn is optional since onAuthStateChange handles state */}
      <SignIn
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSignIn={() => setIsSignInOpen(false)}
        nextPath={pendingPath}
      />

      {/* Global Edit Profile Modal */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                {otpView !== 'none' ? (
                  <button onClick={() => setOtpView('none')} className="text-gray-400 hover:text-accent bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                  </button>
                ) : (
                  <h3 className="text-xl font-bold text-accent">Edit Profile</h3>
                )}
                <button onClick={() => setIsEditProfileOpen(false)} className="text-gray-400 hover:text-accent bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors ml-auto">
                  <X size={20} />
                </button>
              </div>

              {otpView === 'none' ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 group cursor-pointer shadow-sm">
                      <img
                        src={editAvatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                        alt="Preview"
                        className="w-full h-full object-cover bg-gray-100"
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={20} className="text-white mb-1" />
                        <span className="text-white text-[10px] font-bold">Change</span>
                      </div>
                      <input
                        type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEditAvatarFile(file);
                            setEditAvatarPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-accent mb-1">Full Name</label>
                      <input type="text" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white text-accent font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-accent mb-1">Email Address</label>
                      <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white text-accent font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-accent mb-1">Phone Number</label>
                      <input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white text-accent font-medium" placeholder="+1 234 567 8900" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-accent mb-1">Date of Birth</label>
                      <input type="date" value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white text-accent font-medium" />
                    </div>
                  </div>
                  <button onClick={handleSaveProfile} disabled={isSaving} className="w-full btn-primary py-3 flex items-center justify-center gap-2 rounded-xl text-base disabled:opacity-70 transition-all">
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              ) : otpView === 'phone' ? (
                <PhoneVerification
                  destination={normalizePhone(editForm.phone)}
                  otp={otp}
                  isLoading={isSaving}
                  errorMsg={verificationError}
                  successMsg={verificationSuccess}
                  submitLabel="Verify & Save"
                  onOtpChange={handleProfileOtpChange}
                  onSubmit={handleProfileOtpSubmit}
                  onResend={handleResendProfilePhoneOtp}
                />
              ) : (
                <EmailOtpVerification
                  destination={editForm.email}
                  otp={otp}
                  isLoading={isSaving}
                  errorMsg={verificationError}
                  successMsg={verificationSuccess}
                  submitLabel="Verify & Save"
                  onOtpChange={handleProfileOtpChange}
                  onSubmit={handleProfileOtpSubmit}
                  onResend={handleResendProfileEmailVerification}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

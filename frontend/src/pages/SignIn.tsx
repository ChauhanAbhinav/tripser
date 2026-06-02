import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, Plane, ArrowRight, ArrowLeft, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { EmailOtpVerification, ErrorBanner, PhoneVerification, SuccessBanner } from '../components/AuthVerification';

type View = 'options' | 'email' | 'phone' | 'phone-otp' | 'email-otp';

interface SignInProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn?: () => void;
  nextPath?: string | null;
}

async function upsertProfile(user: any) {
  if (!user) return;

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const updates: any = { id: user.id };

  const isDefaultName = !existingProfile?.full_name || existingProfile.full_name === 'Traveler' || existingProfile.full_name === user.phone || existingProfile.full_name === user.email;
  if (isDefaultName) {
    updates.full_name = user.user_metadata?.full_name || user.user_metadata?.name || user.phone || 'Traveler';
  }
  if (!existingProfile?.avatar_url || existingProfile.avatar_url?.includes('dicebear')) {
    updates.avatar_url = user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
  }
  if (user.phone && !existingProfile?.phone) {
    updates.phone = user.phone;
  }

  const payload = existingProfile ? { ...existingProfile, ...updates, id: user.id } : { ...updates, id: user.id };

  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' });
  if (error) console.error('Profile upsert error:', error.message);
  else window.dispatchEvent(new Event('profile_check_requested'));
}

const getEmailOtpSuccessMessage = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const isLocalSupabase = supabaseUrl?.includes('127.0.0.1:54321') || supabaseUrl?.includes('127.0.0.1:54321');

  return isLocalSupabase
    ? 'Verification code sent. Open local Mailpit at http://127.0.0.1:54324 to read it.'
    : 'Verification code sent. Check your inbox and spam folder.';
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function SignIn({ isOpen, onClose, onSignIn, nextPath }: SignInProps) {
  const [view, setView] = useState<View>('options');
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setView('options');
      setIsSignUp(false);
      setFormData({ email: '', password: '', phone: '' });
      setOtp('');
      setIsResendingEmail(false);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  const clearMessages = () => { setErrorMsg(''); setSuccessMsg(''); };

  const handleClose = () => onClose();

  const handleSuccess = async (user?: any) => {
    if (user) await upsertProfile(user);
    handleClose();
    onSignIn?.();
  };

  // ── Google ────────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setIsLoading(true);
    clearMessages();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback${nextPath ? `?next=${nextPath}` : ''}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) { setErrorMsg(error.message); setIsLoading(false); }
  };

  // ── Email ─────────────────────────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();

    if (isSignUp) {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: 'Traveler',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback${nextPath ? `?next=${nextPath}` : ''}`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setOtp('');
        setView('email-otp');
        setSuccessMsg(getEmailOtpSuccessMessage());
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) setErrorMsg(error.message);
      else await handleSuccess(data.user);
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!formData.email) { setErrorMsg('Enter your email address first.'); return; }
    setIsLoading(true);
    clearMessages();
    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setIsLoading(false);
    if (error) setErrorMsg(error.message);
    else setSuccessMsg('Password reset email sent — check your inbox.');
  };

  const handleResendEmailVerification = async () => {
    if (!formData.email) {
      setErrorMsg('Enter your email address first.');
      return;
    }

    setIsResendingEmail(true);
    clearMessages();

    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: {
        shouldCreateUser: true,
        data: {
          full_name: 'Traveler',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback${nextPath ? `?next=${nextPath}` : ''}`,
      },
    });

    setIsResendingEmail(false);

    if (error) setErrorMsg(error.message);
    else {
      setOtp('');
      setSuccessMsg(getEmailOtpSuccessMessage());
    }
  };

  const verifyEmailOtp = async (otpValue: string) => {
    if (otpValue.length < 6 || isLoading) return;

    setIsLoading(true);
    clearMessages();

    const { data, error } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: otpValue,
      type: 'email',
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
      return;
    }

    const { data: passwordData, error: passwordError } = await supabase.auth.updateUser({
      password: formData.password,
      data: {
        full_name: 'Traveler',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
      },
    });

    if (passwordError) {
      setErrorMsg(passwordError.message);
      setIsLoading(false);
      return;
    }

    await handleSuccess(passwordData.user || data.user);
    setIsLoading(false);
  };

  const handleEmailOtpChange = (val: string) => {
    setOtp(val);
    if (val.length === 6) verifyEmailOtp(val);
  };

  const handleEmailOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyEmailOtp(otp);
  };

  // ── Phone: send OTP ───────────────────────────────────────────────────────
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();
    const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
    const phone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) setErrorMsg(error.message);
    else { setView('phone-otp'); setSuccessMsg(`Code sent to ${phone}`); }
    setIsLoading(false);
  };

  // ── Phone: verify OTP ─────────────────────────────────────────────────────
  // Accepts the value directly — never reads from otp state to avoid stale closure
  const verifyPhoneOtp = async (otpValue: string) => {
    if (otpValue.length < 6 || isLoading) return;
    setIsLoading(true);
    clearMessages();
    const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
    const phone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: otpValue, type: 'sms' });
    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    } else {
      await handleSuccess(data.user);
      setIsLoading(false);
    }
  };

  // KEY FIX: onChange receives the fresh value and auto-submits when complete
  // No stale closure — val is the value right now, not otp from last render
  const handleOtpChange = (val: string) => {
    setOtp(val);
    if (val.length === 6) verifyPhoneOtp(val);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPhoneOtp(otp);
  };

  const handleResendOtp = async () => {
    clearMessages();
    const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
    const phone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) setErrorMsg(error.message);
    else { setOtp(''); setSuccessMsg('New code sent!'); }
  };

  const handleBack = () => {
    clearMessages();
    setOtp('');
    if (view === 'phone') {
      setView('options');
    }
    else if (view === 'phone-otp') { setView('phone'); }
    else if (view === 'email-otp') { setView('email'); }
    else setView('options');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-50">
              {view !== 'options' ? (
                <button onClick={handleBack} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-accent hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                  <ArrowLeft size={20} />
                </button>
              ) : <div className="w-9 flex-shrink-0" />}
              <div className="flex items-center justify-center gap-2 flex-1">
                <Plane className="text-primary" size={20} />
                <span className="font-display font-bold text-accent">Tripsy</span>
              </div>
              <button onClick={handleClose} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-accent hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 sm:p-10 min-h-[440px]">
              <AnimatePresence mode="wait">

                {/* Options */}
                {view === 'options' && (
                  <motion.div key="options" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                    <h2 className="text-2xl font-display font-bold text-accent text-center mb-2">Sign in to unlock the best of Tripsy.</h2>
                    <p className="text-muted text-center text-sm mb-8">Your single source of truth for seamless travel.</p>
                    {errorMsg && <ErrorBanner msg={errorMsg} />}
                    <div className="space-y-4">
                      <button onClick={handleGoogle} disabled={isLoading} className="w-full relative flex items-center justify-center py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-accent disabled:opacity-60">
                        <div className="absolute left-4 sm:left-6 flex items-center justify-center">
                          {isLoading ? <Loader2 size={20} className="animate-spin text-gray-400" /> : <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />}
                        </div>
                        Continue with Google
                      </button>
                      <button onClick={() => { clearMessages(); setView('email'); }} className="w-full relative flex items-center justify-center py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-accent">
                        <div className="absolute left-4 sm:left-6"><Mail size={20} className="text-gray-600" /></div>
                        Continue with Email
                      </button>
                      <button onClick={() => { clearMessages(); setView('phone'); }} className="w-full relative flex items-center justify-center py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-accent">
                        <div className="absolute left-4 sm:left-6"><Phone size={20} className="text-gray-600" /></div>
                        Continue with Phone
                      </button>
                    </div>
                    <p className="mt-8 text-center text-[11px] text-muted">
                      By proceeding, you agree to our <a href="#" className="underline hover:text-primary">Terms of Use</a> and confirm you have read our <a href="#" className="underline hover:text-primary">Privacy and Cookie Statement</a>.
                    </p>
                  </motion.div>
                )}

                {/* Email */}
                {view === 'email' && (
                  <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <h2 className="text-2xl font-display font-bold text-accent mb-6 text-center">{isSignUp ? 'Create your Account' : 'Welcome back'}</h2>
                    {errorMsg && <ErrorBanner msg={errorMsg} />}
                    {successMsg && <SuccessBanner msg={successMsg} />}
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-accent">Email Address</label>
                        <input type="email" required autoFocus className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white" placeholder="sarah@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-accent">Password</label>
                          {!isSignUp && <button type="button" onClick={handleForgotPassword} className="text-xs text-primary font-bold hover:underline">{isLoading ? 'Sending…' : 'Forgot?'}</button>}
                        </div>
                        <input type="password" required minLength={8} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                      </div>
                      <button type="submit" disabled={isLoading} className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 mt-4 disabled:opacity-70">
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>{isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={18} /></>}
                      </button>
                    </form>
                    <div className="mt-6 text-center">
                      <p className="text-sm text-muted">
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        <button onClick={() => { setIsSignUp(!isSignUp); clearMessages(); }} className="text-primary font-bold hover:underline">{isSignUp ? 'Sign In' : 'Sign Up'}</button>
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Email OTP Verify */}
                {view === 'email-otp' && (
                  <motion.div key="email-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <EmailOtpVerification
                      destination={formData.email}
                      otp={otp}
                      isLoading={isLoading}
                      errorMsg={errorMsg}
                      successMsg={successMsg}
                      submitLabel="Verify & Create Account"
                      onOtpChange={handleEmailOtpChange}
                      onSubmit={handleEmailOtpSubmit}
                      onResend={handleResendEmailVerification}
                    />
                    {isResendingEmail && (
                      <p className="mt-3 text-center text-xs text-muted">Sending a new code...</p>
                    )}
                  </motion.div>
                )}

                {/* Phone */}
                {view === 'phone' && (
                  <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <h2 className="text-2xl font-display font-bold text-accent mb-2 text-center">What's your number?</h2>
                    <p className="text-muted text-center text-sm mb-6">We'll send a one-time code via SMS.</p>
                    {errorMsg && <ErrorBanner msg={errorMsg} />}
                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-accent">Phone Number</label>
                        <input type="tel" required autoFocus className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white" placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        <p className="text-[11px] text-muted pl-1">Include country code, e.g. +91, +1</p>
                      </div>
                      <button type="submit" disabled={isLoading} className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 mt-4 disabled:opacity-70">
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Send Code <ArrowRight size={18} /></>}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* OTP Verify */}
                {view === 'phone-otp' && (
                  <motion.div key="phone-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <PhoneVerification
                      destination={formData.phone}
                      otp={otp}
                      isLoading={isLoading}
                      errorMsg={errorMsg}
                      successMsg={successMsg}
                      submitLabel="Verify & Sign In"
                      onOtpChange={handleOtpChange}
                      onSubmit={handleOtpSubmit}
                      onResend={handleResendOtp}
                    />
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}

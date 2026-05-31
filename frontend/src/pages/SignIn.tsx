import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, Plane, ArrowRight, ArrowLeft, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type View = 'options' | 'email' | 'phone' | 'phone-otp' | 'verify-email';

interface SignInProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn?: () => void;
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100"
    >
      {msg}
    </motion.div>
  );
}

function SuccessBanner({ msg }: { msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-xl border border-emerald-100"
    >
      {msg}
    </motion.div>
  );
}

async function upsertProfile(user: any) {
  if (!user) return;
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.phone ||
    'Traveler';
  const avatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, full_name: fullName, avatar_url: avatarUrl }, { onConflict: 'id', ignoreDuplicates: false });
  if (error) console.error('Profile upsert error:', error.message);
}

// ---------------------------------------------------------------------------
// OTPInput — no onComplete prop; parent handles auto-submit via onChange
// ---------------------------------------------------------------------------
interface OTPInputProps {
  value: string;
  onChange: (v: string) => void;
}

function OTPInput({ value, onChange }: OTPInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));

  useEffect(() => {
    if (!value) setDigits(Array(6).fill(''));
  }, [value]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      (document.getElementById(`otp-${idx - 1}`) as HTMLInputElement)?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      const next = [...digits];
      next[idx] = '';
      setDigits(next);
      onChange(next.join(''));
      return;
    }

    // Handle autofill/paste of multiple digits seamlessly
    if (val.length > 1) {
      const pasted = val.slice(0, 6).split('');
      const next = Array(6).fill('');
      pasted.forEach((char, i) => next[i] = char);
      setDigits(next);
      onChange(next.join(''));
      const focusIdx = Math.min(pasted.length, 5);
      (document.getElementById(`otp-${focusIdx}`) as HTMLInputElement)?.focus();
      return;
    }

    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    onChange(next.join(''));
    if (idx < 5) (document.getElementById(`otp-${idx + 1}`) as HTMLInputElement)?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (pasted.length === 0) return;
    const next = Array(6).fill('');
    pasted.forEach((char, i) => next[i] = char);
    setDigits(next);
    onChange(next.join(''));
    const focusIdx = Math.min(pasted.length, 5);
    (document.getElementById(`otp-${focusIdx}`) as HTMLInputElement)?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          value={d}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          autoFocus={i === 0}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          className="w-11 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white"
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function SignIn({ isOpen, onClose, onSignIn }: SignInProps) {
  const [view, setView] = useState<View>('options');
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', phone: '', fullName: '' });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setView('options');
      setIsSignUp(false);
      setFormData({ email: '', password: '', phone: '', fullName: '' });
      setOtp('');
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
        redirectTo: `${window.location.origin}/auth/callback`,
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
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName || 'Traveler',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        if (data.user) await upsertProfile(data.user);
        if (data.session) await handleSuccess(data.user);
        else setView('verify-email');
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
  const verifyOtp = async (otpValue: string) => {
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
    if (val.length === 6) verifyOtp(val);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtp(otp);
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
    else if (view === 'verify-email') { setView('email'); setIsSignUp(false); }
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
                      {isSignUp && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-accent">Full Name</label>
                          <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white" placeholder="Jane Doe" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                        </div>
                      )}
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

                {/* Verify Email */}
                {view === 'verify-email' && (
                  <motion.div key="verify-email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6"><Mail size={32} className="text-primary" /></div>
                    <h2 className="text-2xl font-display font-bold text-accent mb-3">Check your inbox</h2>
                    <p className="text-muted text-sm mb-2">We sent a confirmation link to</p>
                    <p className="font-bold text-accent mb-6">{formData.email}</p>
                    <p className="text-xs text-muted leading-relaxed">Click the link in the email to activate your account,<br />then come back and sign in.</p>
                    <button onClick={() => { setView('email'); setIsSignUp(false); clearMessages(); }} className="mt-8 text-sm text-primary font-bold hover:underline">Back to Sign In</button>
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
                    <h2 className="text-2xl font-display font-bold text-accent mb-2 text-center">Enter your code</h2>
                    <p className="text-muted text-center text-sm mb-6">Sent to <span className="font-semibold text-accent">{formData.phone}</span></p>
                    {errorMsg && <ErrorBanner msg={errorMsg} />}
                    {successMsg && <SuccessBanner msg={successMsg} />}
                    <form onSubmit={handleOtpSubmit} className="space-y-6">
                      <OTPInput value={otp} onChange={handleOtpChange} />
                      <button
                        type="submit"
                        disabled={isLoading || otp.length < 6}
                        className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 transition-opacity"
                      >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Verify & Sign In <ArrowRight size={18} /></>}
                      </button>
                    </form>
                    <p className="mt-6 text-center text-sm text-muted">
                      Didn't get it?{' '}
                      <button onClick={handleResendOtp} className="text-primary font-bold hover:underline">Resend code</button>
                    </p>
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
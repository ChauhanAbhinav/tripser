import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { ArrowRight, Loader2, Mail, Phone } from 'lucide-react';

interface BannerProps {
  msg: string;
}

export function ErrorBanner({ msg }: BannerProps) {
  return (
    <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100">
      {msg}
    </div>
  );
}

export function SuccessBanner({ msg }: BannerProps) {
  return (
    <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-xl border border-emerald-100">
      {msg}
    </div>
  );
}

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function OTPInput({ value, onChange }: OTPInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const next = value.slice(0, 6).split('');
    setDigits(Array.from({ length: 6 }, (_, index) => next[index] || ''));
  }, [value]);

  const focusInput = (index: number) => {
    refs.current[index]?.focus();
  };

  const updateDigits = (next: string[]) => {
    setDigits(next);
    onChange(next.join(''));
  };

  const handleKey = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = event.target.value.replace(/\D/g, '');

    if (!value) {
      const next = [...digits];
      next[index] = '';
      updateDigits(next);
      return;
    }

    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      const next = Array.from({ length: 6 }, (_, i) => pasted[i] || '');
      updateDigits(next);
      focusInput(Math.min(pasted.length, 5));
      return;
    }

    const next = [...digits];
    next[index] = value;
    updateDigits(next);

    if (index < 5) focusInput(index + 1);
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (!pasted.length) return;

    const next = Array.from({ length: 6 }, (_, index) => pasted[index] || '');
    updateDigits(next);
    focusInput(Math.min(pasted.length, 5));
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          value={digit}
          onChange={(event) => handleChange(event, index)}
          onKeyDown={(event) => handleKey(event, index)}
          autoFocus={index === 0}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          className="w-11 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white"
        />
      ))}
    </div>
  );
}

interface PhoneVerificationProps {
  destination: string;
  otp: string;
  isLoading: boolean;
  errorMsg?: string;
  successMsg?: string;
  submitLabel?: string;
  onOtpChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onResend?: () => void;
}

interface OtpVerificationProps extends PhoneVerificationProps {
  icon: 'mail' | 'phone';
  title: string;
  helper: string;
}

function OtpVerification({
  destination,
  otp,
  isLoading,
  errorMsg,
  successMsg,
  submitLabel = 'Verify',
  onOtpChange,
  onSubmit,
  onResend,
  icon,
  title,
  helper,
}: OtpVerificationProps) {
  const Icon = icon === 'mail' ? Mail : Phone;

  return (
    <div>
      <div className="flex justify-center mb-5">
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Icon size={28} />
        </div>
      </div>
      <h2 className="text-2xl font-display font-bold text-accent mb-2 text-center">{title}</h2>
      <p className="text-muted text-center text-sm mb-6">
        {helper} <span className="font-semibold text-accent break-all">{destination}</span>
      </p>
      {errorMsg && <ErrorBanner msg={errorMsg} />}
      {successMsg && <SuccessBanner msg={successMsg} />}
      <form onSubmit={onSubmit} className="space-y-6">
        <OTPInput value={otp} onChange={onOtpChange} />
        <button
          type="submit"
          disabled={isLoading || otp.length < 6}
          className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 transition-opacity"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>{submitLabel} <ArrowRight size={18} /></>}
        </button>
      </form>
      {onResend && (
        <p className="mt-6 text-center text-sm text-muted">
          Didn't get it?{' '}
          <button type="button" onClick={onResend} className="text-primary font-bold hover:underline">
            Resend code
          </button>
        </p>
      )}
    </div>
  );
}

export function PhoneVerification(props: PhoneVerificationProps) {
  return (
    <OtpVerification
      {...props}
      icon="phone"
      title="Enter your code"
      helper="Sent to"
    />
  );
}

export function EmailOtpVerification(props: PhoneVerificationProps) {
  return (
    <OtpVerification
      {...props}
      icon="mail"
      title="Verify your email"
      helper="Enter the code sent to"
    />
  );
}

interface EmailVerificationProps {
  email: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  resendLabel?: string;
  isResending?: boolean;
  resendMessage?: string;
  resendError?: string;
  onResend?: () => void;
}

export function EmailVerification({
  email,
  title = 'Check your inbox',
  description = 'Click the link in the email to finish verification.',
  actionLabel,
  onAction,
  resendLabel = 'Resend email',
  isResending = false,
  resendMessage,
  resendError,
  onResend,
}: EmailVerificationProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Mail size={32} className="text-primary" />
      </div>
      <h2 className="text-2xl font-display font-bold text-accent mb-3">{title}</h2>
      <p className="text-muted text-sm mb-2">We sent a confirmation link to</p>
      <p className="font-bold text-accent mb-6 break-all">{email}</p>
      <p className="text-xs text-muted leading-relaxed">{description}</p>
      {resendError && <div className="mt-5 w-full text-left"><ErrorBanner msg={resendError} /></div>}
      {resendMessage && <div className="mt-5 w-full text-left"><SuccessBanner msg={resendMessage} /></div>}
      {onResend && (
        <button
          type="button"
          onClick={onResend}
          disabled={isResending}
          className="mt-6 w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isResending ? <Loader2 size={18} className="animate-spin" /> : resendLabel}
        </button>
      )}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="mt-6 text-sm text-primary font-bold hover:underline">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** Handles both password-reset and invite links (/reset-password?token=...). */
export const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    const res = await resetPassword(token, password);
    setLoading(false);
    if (res.success) setDone(true);
    else setError(res.error || 'Could not set password.');
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-[#e5ece6]">
        <h1 className="text-lg font-bold text-[#18221b] mb-4">Set your password</h1>
        {!token ? (
          <p className="text-sm text-rose-700">This link is missing its token. Request a new link from the sign-in page.</p>
        ) : done ? (
          <div className="space-y-4">
            <p className="text-sm text-[#18221b]">Your password has been set. You can now sign in.</p>
            <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-[#064e3b] text-white text-xs font-bold">Go to sign in</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <label className="block text-xs font-semibold text-[#5e6d61]" htmlFor="pw">New password (min 8 characters)</label>
            <input id="pw" type="password" autoComplete="new-password" minLength={8} required value={password}
              onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#e5ece6] text-sm" />
            <label className="block text-xs font-semibold text-[#5e6d61]" htmlFor="pw2">Confirm password</label>
            <input id="pw2" type="password" autoComplete="new-password" minLength={8} required value={confirm}
              onChange={e => setConfirm(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#e5ece6] text-sm" />
            {error && <p className="text-xs text-rose-700" role="alert">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-[#064e3b] text-white text-xs font-bold disabled:opacity-50">
              {loading ? 'Saving…' : 'Set password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

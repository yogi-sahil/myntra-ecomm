import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE, getApiError } from './adminUtils';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!response.ok) throw new Error(await getApiError(response, 'Unable to sign in. Check your details and try again.'));
      const data = await response.json();
      login(data.user, data.token);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'The admin service is unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#111827] px-4 py-10 font-sans">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#ff3f6c]/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-36 -right-28 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" aria-hidden="true" />

      <section className="relative w-full max-w-md" aria-labelledby="admin-login-title">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff3f6c] text-white shadow-lg shadow-[#ff3f6c]/20"><LockKeyhole size={30} /></div>
          <h1 id="admin-login-title" className="text-3xl font-black tracking-tight text-white">Admin Portal</h1>
          <p className="mt-2 text-sm text-gray-400">Sign in to manage the Europion storefront</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gray-800/90 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-400/15 bg-blue-400/5 p-3.5 text-blue-100">
            <ShieldCheck className="mt-0.5 shrink-0 text-blue-300" size={18} />
            <p className="text-xs leading-5 text-blue-100/80">Protected workspace. Admin sessions automatically expire after 24 hours.</p>
          </div>

          {error && <div className="mb-5 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200" role="alert">{error}</div>}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="admin-email" className="block text-sm font-semibold text-gray-200">Email address</label>
              <input id="admin-email" type="email" required autoComplete="username" autoFocus value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@company.com" className="mt-2 block w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#ff3f6c] focus:ring-2 focus:ring-[#ff3f6c]/25" />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-semibold text-gray-200">Password</label>
              <div className="relative mt-2">
                <input id="admin-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="block w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 pr-11 text-sm text-white outline-none focus:border-[#ff3f6c] focus:ring-2 focus:ring-[#ff3f6c]/25" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-400 hover:bg-gray-600 hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center rounded-lg bg-[#ff3f6c] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#e73361] focus:outline-none focus:ring-2 focus:ring-[#ff3f6c] focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-60">
              {isLoading ? <><LoaderCircle className="mr-2 animate-spin" size={18} /> Authenticating…</> : 'Sign in to Dashboard'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500"><Link to="/" className="rounded font-semibold text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#ff3f6c]">Return to storefront</Link></p>
      </section>
    </main>
  );
};

export default AdminLogin;

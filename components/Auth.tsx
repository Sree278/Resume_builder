import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Mail, Loader2, KeyRound } from 'lucide-react';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.href,
        },
      });

      if (error) throw error;
      setSent(true);
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-rose flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-brand-mint p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-deep">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-bold text-brand-deep">Welcome to CareerPilot</h1>
          <p className="text-slate-500 mt-2">Sign in to sync your jobs and resume across devices.</p>
        </div>

        {sent ? (
          <div className="text-center p-6 bg-emerald-50 rounded-xl border border-emerald-100">
            <h3 className="text-emerald-800 font-bold mb-2">Check your email</h3>
            <p className="text-emerald-700 text-sm">We've sent a magic link to <strong>{email}</strong></p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-brand-mint rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-slate-800"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-rose-500 bg-rose-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary text-white py-3 rounded-xl font-medium hover:bg-brand-deep transition flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Magic Link'}
            </button>
            
            <p className="text-xs text-center text-slate-400 mt-4">
              If you haven't set up the database yet, please run the SQL script provided in the documentation.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
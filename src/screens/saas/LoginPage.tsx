import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Printer, Mail, Lock, ArrowRight } from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useSaaS();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid login credentials');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please verify credentials or check database connections.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-6 font-sans">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[36px] border border-slate-100 shadow-xl shadow-slate-900/5 space-y-8 relative overflow-hidden">
        {/* Background visual elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/70 rounded-full blur-[40px] pointer-events-none" />
        
        <div className="text-center space-y-3 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 mx-auto">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <Printer className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900 block text-left leading-none">PrintFlow</span>
              <span className="text-xs font-bold text-slate-400 block tracking-wider uppercase text-left mt-0.5">Cloud</span>
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Owner Sign In</h1>
            <p className="text-slate-500 font-medium text-sm">Access your counter logs and printer pairing keys.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-150 rounded-2xl text-red-700 text-sm font-semibold text-center">
            {error}
          </div>
        )}

        {/* Demo Tip */}
        <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-1.5 text-xs">
          <p className="font-extrabold text-slate-700">💡 Quick Demo Access:</p>
          <p className="text-slate-500 font-medium">
            Login with email <code className="bg-white px-1.5 py-0.5 rounded border text-indigo-600 font-bold">amit@quickprint.com</code> (or any matching registered email) to enter that specific shop's pre-seeded queue, or type any email to simulate a new login!
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. amit@quickprint.com"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group hover:scale-[1.01] disabled:opacity-75 disabled:pointer-events-none"
          >
            <span>{loading ? 'Authenticating...' : 'Access Dashboard'}</span>
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              login('demo@printflow.cloud', 'demo');
              navigate('/dashboard');
            }}
            className="w-full h-14 border-2 border-indigo-200 hover:border-indigo-300 text-indigo-700 font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-indigo-50/30 disabled:opacity-75 disabled:pointer-events-none"
          >
            <span>Enter Demo Dashboard (Skip Sign In)</span>
            <ArrowRight className="w-5 h-5 text-indigo-600" />
          </button>
        </form>

        <div className="text-center text-xs font-semibold text-slate-400 relative z-10 pt-4 border-t border-slate-100">
          <span>Don't have a shop registered yet? </span>
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

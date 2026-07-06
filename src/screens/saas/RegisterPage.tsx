import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Printer, Shield, ArrowRight, User, Building2, Mail, Phone, Lock } from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import { motion } from 'motion/react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, login } = useSaaS();

  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName || !businessName || !email || !phone || !password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const generatedShop = await register(
        ownerName,
        businessName,
        email,
        phone,
        address || '100 Main Street, Suite 50, India',
        password
      );
      // Automatically logged in by the register() call, route to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed. Check your network or database parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-6 font-sans">
      <div className="w-full max-w-lg bg-white p-8 md:p-12 rounded-[36px] border border-slate-100 shadow-xl shadow-slate-900/5 space-y-8 relative overflow-hidden">
        {/* Visual background gradient accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[40px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-100/60 rounded-full blur-[45px] pointer-events-none" />

        <div className="relative z-10 text-center space-y-3.5">
          <Link to="/" className="inline-flex items-center gap-2 mx-auto focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <Printer className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900 block text-left leading-none">PrintFlow</span>
              <span className="text-xs font-bold text-slate-400 block tracking-wider uppercase text-left mt-0.5">Cloud</span>
            </div>
          </Link>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create your PrintFlow Shop</h1>
            <p className="text-slate-500 font-medium text-sm">Launch your automatic counter in less than 60 seconds.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-150 rounded-2xl text-red-700 text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Owner Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Rahul Sen"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Business Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Building2 className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Express Copy Center"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="e.g. rahul@expresscopy.com"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 99887 76655"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Physical Shop Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Shop 45, Sector 15-A, Chandigarh, India"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Choose Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group hover:scale-[1.01] disabled:opacity-75 disabled:pointer-events-none"
          >
            <span>{loading ? 'Initializing Database...' : 'Register & Initialize Shop'}</span>
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
            <span>Enter Demo Dashboard (Skip Registration)</span>
            <ArrowRight className="w-5 h-5 text-indigo-600" />
          </button>
        </form>

        <div className="text-center text-xs font-semibold text-slate-400 relative z-10 pt-4 border-t border-slate-100">
          <span>Already have a shop counter? </span>
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

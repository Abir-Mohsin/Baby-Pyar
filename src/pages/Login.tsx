import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const location = useLocation();
  const signupEmail = location.state?.email || '';
  const isFromSignup = location.state?.signupSuccess || false;

  const [email, setEmail] = useState(signupEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        toast.success('লগইন সফল হয়েছে!');
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const errorMessage = err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' 
        ? 'ইমেইল বা পাসওয়ার্ড সঠিক নয়' 
        : (err.message || 'Error signing in');
      setError(errorMessage);
      toast.error('লগইন ব্যর্থ হয়েছে: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('লগইন সফল হয়েছে!');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error('গুগল লগইন ব্যর্থ হয়েছে');
      console.error(err);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/5 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-black text-brand">লগইন করুন</h1>
          <p className="text-gray-500 text-sm mt-1">আপনার অ্যাকাউন্টে প্রবেশ করতে ইমেইল ও পাসওয়ার্ড দিন</p>
        </div>

        {isFromSignup && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-3">
            <CheckCircle className="text-green-600 mt-0.5" size={20} />
            <div>
              <h3 className="text-green-900 font-bold text-sm">অ্যাকাউন্ট তৈরি হয়েছে!</h3>
              <p className="text-green-700 text-xs mt-0.5">
                লগইন করার আগে দয়া করে আপনার <strong>{email}</strong> ইমেইলটি চেক করুন এবং আপনার অ্যাকাউন্ট ভেরিফাই করুন।
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block ml-1">ইমেইল</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-accent/10 focus:border-brand transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block ml-1">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-accent/10 focus:border-brand transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm border border-red-100">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-brand text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-brand-hover transition-all disabled:opacity-50"
          >
            {loading ? 'প্রসেসিং হচ্ছে...' : 'লগইন'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-medium">অথবা</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold text-lg shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google এর মাধ্যমে চালিয়ে যান
          </button>
        </div>

        <div className="mt-8 text-center text-gray-600">
          অ্যাকাউন্ট নেই? {' '}
          <Link to="/signup" className="text-brand font-bold hover:underline">নতুন অ্যাকাউন্ট খুলুন</Link>
        </div>
      </motion.div>
    </div>
  );
}

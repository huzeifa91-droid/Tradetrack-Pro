import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  ChevronLeft, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { loginWithGoogle, loginWithEmail, signUpWithEmail } from '../services/authService';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Google login error:', err);
      toast.error(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast.success('Account created successfully');
      } else {
        await loginWithEmail(email, password);
        toast.success('Logged in successfully');
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Email auth error:', err);
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-100 flex flex-col lg:flex-row font-sans selection:bg-brand-500/30">
      {/* Brand Section */}
      <div className="lg:w-1/2 p-8 lg:p-20 bg-surface-200 flex flex-col justify-between">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-text-200 hover:text-text-100 transition-colors mb-20 group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold tracking-tight">Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-white border border-border-subtle rounded-2xl flex items-center justify-center shadow-sm overflow-hidden">
              <img src="/favicon.svg" alt="TradeTrack Pro" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">TradeTrack<span className="text-brand-500">Pro</span></h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
              Elevate your <br />
              <span className="text-brand-500">trading edge.</span>
            </h2>
            <p className="text-text-200 text-lg max-w-md font-medium leading-relaxed">
              Join the elite circle of disciplined traders using intelligence to master the markets.
            </p>

            <div className="space-y-6 pt-8">
              <FeatureItem icon={ShieldCheck} text="Secure, cloud-based trade logging" />
              <FeatureItem icon={BarChart3} text="Advanced performance analytics" />
              <FeatureItem icon={Zap} text="Intelligent psychology insights" />
            </div>
          </motion.div>
        </div>

        <div className="text-text-200/50 text-[10px] font-semibold uppercase tracking-widest pt-12">
          © 2026 TradeTrack PRO. 
        </div>
      </div>

      {/* Login Section */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-surface-100">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="space-y-4 mb-10">
            <h3 className="text-3xl font-semibold tracking-tight">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h3>
            <p className="text-text-200 text-sm font-medium">
              {isSignUp ? 'Start your professional trading journal today.' : 'Welcome back to your trading journal.'}
            </p>
          </div>

          <div className="space-y-6 text-left">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-surface-200 text-text-100 border border-border-subtle p-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm group"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
              <span>Continue with Google</span>
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-subtle"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-surface-100 px-3 text-text-200 font-bold tracking-widest">Or email</span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-200 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-200" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-surface-200 border border-border-subtle rounded-xl py-3.5 pl-11 pr-4 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-200 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-200" />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-200 border border-border-subtle rounded-xl py-3.5 pl-11 pr-4 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
                {password.length > 0 && password.length < 6 && (
                  <p className="text-[10px] text-red-500 font-semibold ml-1">Min 6 characters required</p>
                )}
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-brand-500/20"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm font-bold text-brand-500 hover:text-brand-600 transition-colors"
                disabled={isLoading}
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}
              </button>
            </div>
          </div>

          <p className="mt-12 text-[11px] text-text-200 max-w-[280px] mx-auto leading-relaxed font-medium">
            By signing in, you agree to our <span className="text-text-100 underline decoration-border-subtle underline-offset-4 cursor-pointer">Terms</span> and <span className="text-text-100 underline decoration-border-subtle underline-offset-4 cursor-pointer">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}


function FeatureItem({ icon: Icon, text }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-white border border-border-subtle rounded-xl shadow-sm">
        <Icon className="w-5 h-5 text-brand-500" />
      </div>
      <span className="text-text-100 font-semibold text-sm">{text}</span>
    </div>
  );
}

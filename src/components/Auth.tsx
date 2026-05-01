import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../firebase';
import { TrendingUp, ShieldCheck, Zap, BarChart3, AlertCircle, Mail, Lock, UserPlus, LogIn, KeyRound, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface AuthProps {
  onLogin: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot-password';

export function Auth({ onLogin }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        toast.success('Account created! Please check your email for verification.');
        setMode('login');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          setError('Please verify your email address before logging in.');
          await auth.signOut();
          setIsLoading(false);
          return;
        }
        onLogin();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
      setMode('login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      // Note: We need the user to be signed in (even if unverified) to resend
      // Or we can ask them to sign in again to trigger this
      toast.info('Sending verification email...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await auth.signOut();
      toast.success('Verification email sent!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-surface-100 flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-between bg-surface-200">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="w-10 h-10 bg-white border border-border-subtle rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
            <img src="/favicon.svg" alt="TradeTrack Pro" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight">TradeTrack<span className="text-brand-500">Pro</span></h1>
        </div>

        <div className="max-w-lg mt-12 lg:mt-0">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-semibold tracking-tight text-text-100 leading-[1.1]"
          >
            Master your trades with <span className="text-brand-500">intelligence.</span>
          </motion.h2>
          <p className="text-text-200 mt-6 text-sm lg:text-lg leading-relaxed font-medium">
            The ultimate smart trading journal for professional traders. Track performance, analyze psychology, and optimize your strategy.
          </p>

          <div className="mt-12 space-y-6 hidden sm:block">
            <FeatureItem icon={ShieldCheck} text="Secure, cloud-based trade logging" />
            <FeatureItem icon={BarChart3} text="Advanced strategy performance analytics" />
            <FeatureItem icon={Zap} text="AI-driven psychology insights" />
          </div>
        </div>

        <div className="text-text-200/50 text-xs mt-12 lg:mt-0 font-medium">
          © 2026 TradeTrack Pro. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-20 bg-surface-100">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-10"
        >
          <div className="text-center space-y-2">
            <h3 className="text-2xl lg:text-3xl font-semibold tracking-tight">
              {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h3>
            <p className="text-text-200 text-sm font-medium">
              {mode === 'login' ? 'Login to continue your trading journey.' : 
               mode === 'signup' ? 'Join thousands of traders improving their edge.' : 
               'Enter your email to receive a reset link.'}
            </p>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-xs lg:text-sm text-red-600 font-medium leading-relaxed">{error}</p>
                    {error === 'Please verify your email address before logging in.' && (
                      <button 
                        type="button"
                        onClick={handleResendVerification}
                        className="text-xs font-semibold text-brand-500 hover:text-brand-600 underline"
                      >
                        Resend verification email
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={mode === 'forgot-password' ? handleForgotPassword : handleEmailAuth} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-text-200 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-200" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-surface-200 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {mode !== 'forgot-password' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-text-200">Password</label>
                    {mode === 'login' && (
                      <button 
                        type="button" 
                        onClick={() => setMode('forgot-password')}
                        className="text-[11px] font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-200" />
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-surface-200 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? <LogIn className="w-4 h-4" /> : mode === 'signup' ? <UserPlus className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                    {mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
                  </>
                )}
              </button>

              {mode === 'forgot-password' && (
                <button 
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full py-2 text-sm font-semibold text-text-200 hover:text-text-100 flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              )}
            </form>

            {mode !== 'forgot-password' && (
              <>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border-subtle"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-surface-100 px-3 text-text-200 font-semibold tracking-widest">Or Continue With</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full bg-surface-100 hover:bg-surface-200 text-text-100 border border-border-subtle py-3 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
                  >
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                    Google
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button 
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                  >
                    {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Login"}
                  </button>
                </div>
              </>
            )}

            <p className="text-center text-[11px] text-text-200 leading-relaxed font-medium px-4">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
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

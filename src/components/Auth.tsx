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
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (result.user) {
          await sendEmailVerification(result.user);
          toast.success('Verification email sent!', {
            description: `Please check ${email} to verify your account before logging in.`
          });
          setMode('login');
        }
      } else if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (result.user) {
          if (!result.user.emailVerified) {
            setError('Please verify your email address before logging in.');
            // Sign out the user immediately if they are not verified
            await auth.signOut();
            setIsLoading(false);
            return;
          }
          onLogin();
        }
      }
    } catch (err: any) {
      console.error("Email Auth Error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Try logging in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email to resend the verification link.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      // We need to sign in temporarily to get the user object if they are not signed in
      // But Firebase documentation says sendEmailVerification should be called on the currentUser.
      // If the user is logging in and sees the error, we might have a currentUser briefly or they might be signed out.
      // A better way is to ask them to try signing in, which sets the currentUser, then we catch the verification error.
      // However, for simplicity, we can try to send it if there's a current user.
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        toast.success('Verification email resent!');
      } else {
        setError('Please try logging in first to resend verification.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!', {
        description: `Check your inbox at ${email} for instructions.`
      });
      setMode('login');
    } catch (err: any) {
      console.error("Forgot Password Error:", err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to send reset email.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        onLogin();
      }
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('The login popup was blocked. Please allow popups and try again.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled.');
      } else {
        setError(`Login failed: ${err.message || 'An unexpected error occurred'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-100 text-text-100 flex flex-col lg:flex-row transition-colors duration-500">
      {/* Left Side - Branding */}
      <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden min-h-[40vh] lg:min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-50"></div>
        <div className="absolute -top-24 -left-24 w-64 lg:w-96 h-64 lg:h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-64 lg:w-96 h-64 lg:h-96 bg-purple-600/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-2 lg:gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-surface-200 border border-border-subtle rounded-lg lg:rounded-xl flex items-center justify-center shadow-2xl overflow-hidden">
            <img src="/favicon.svg" alt="TradeTrack Pro" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">TradeTrack<span className="text-[#90be6d]">Pro</span></h1>
        </div>

        <div className="relative z-10 max-w-lg mt-8 lg:mt-0">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-5xl font-bold leading-tight"
          >
            Master your trades with <span className="text-[#90be6d]">intelligence.</span>
          </motion.h2>
          <p className="text-text-200 mt-4 lg:mt-6 text-sm lg:text-lg leading-relaxed">
            The ultimate smart trading journal for professional traders. Track performance, analyze psychology, and optimize your strategy.
          </p>

          <div className="mt-8 lg:mt-12 space-y-4 lg:space-y-6 hidden sm:block">
            <FeatureItem icon={ShieldCheck} text="Secure, cloud-based trade logging" />
            <FeatureItem icon={BarChart3} text="Advanced strategy performance analytics" />
            <FeatureItem icon={Zap} text="AI-driven psychology insights" />
          </div>
        </div>

        <div className="relative z-10 text-text-200/50 text-[10px] lg:text-sm mt-8 lg:mt-0">
          © 2026 TradeTrack Pro. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-surface-200 border-l border-border-subtle flex-1">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <h3 className="text-2xl lg:text-3xl font-bold">
              {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h3>
            <p className="text-text-200 mt-2 text-sm lg:text-base">
              {mode === 'login' ? 'Login to continue your trading journey.' : 
               mode === 'signup' ? 'Join thousands of traders improving their edge.' : 
               'Enter your email to receive a reset link.'}
            </p>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-xs lg:text-sm text-red-400 leading-relaxed">{error}</p>
                    {error === 'Please verify your email address before logging in.' && (
                      <button 
                        type="button"
                        onClick={handleResendVerification}
                        className="text-xs font-bold text-blue-500 hover:text-blue-400 underline"
                      >
                        Resend verification email
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={mode === 'forgot-password' ? handleForgotPassword : handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-200 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-200" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-surface-300 border border-border-subtle rounded-xl py-3.5 pl-12 pr-4 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {mode !== 'forgot-password' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-200">Password</label>
                    {mode === 'login' && (
                      <button 
                        type="button" 
                        onClick={() => setMode('forgot-password')}
                        className="text-[10px] uppercase font-bold text-blue-500 hover:text-blue-400 transition-colors"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-200" />
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-surface-300 border border-border-subtle rounded-xl py-3.5 pl-12 pr-4 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-blue-600/20"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? <LogIn className="w-5 h-5" /> : mode === 'signup' ? <UserPlus className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
                    {mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
                  </>
                )}
              </button>

              {mode === 'forgot-password' && (
                <button 
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full py-2 text-sm font-medium text-text-200 hover:text-text-100 flex items-center justify-center gap-2 transition-colors"
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
                    <span className="bg-surface-200 px-4 text-text-200 font-bold tracking-widest">Or Continue With</span>
                  </div>
                </div>

                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-surface-300 hover:bg-surface-100 text-text-100 border border-border-subtle py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  Google
                </button>

                <div className="text-center pt-2">
                  <button 
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Login"}
                  </button>
                </div>
              </>
            )}

            <p className="text-center text-[10px] lg:text-xs text-text-200/50 leading-relaxed px-8">
              By continuing, you agree to our Terms of Service and Privacy Policy. We take your data security seriously.
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
      <div className="p-2 bg-surface-200 border border-border-subtle rounded-lg">
        <Icon className="w-5 h-5 text-blue-500" />
      </div>
      <span className="text-text-200 font-medium">{text}</span>
    </div>
  );
}

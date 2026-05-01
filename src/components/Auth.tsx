import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../firebase';
import { TrendingUp, ShieldCheck, Zap, BarChart3, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthProps {
  onLogin: () => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      // Add custom parameters if needed, but keeping it simple for now
      provider.setCustomParameters({ prompt: 'select_account' });
      
      console.log("Initiating Google Login...");
      const result = await signInWithPopup(auth, provider);
      console.log("Login result:", result.user ? "Success" : "No user");
      if (result.user) {
        onLogin();
      }
    } catch (err: any) {
      console.error("Login Error Details:", err);

      if (err.code === 'auth/popup-blocked') {
        setError('The login popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('A network error occurred. Please check your internet connection.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login was cancelled. Please try again.');
      } else if (err.code === 'auth/internal-error') {
        setError('A Firebase internal error occurred (auth/internal-error). This often happens due to browser restrictions or configuration issues. Try clearing your cache or using an Incognito window.');
      } else {
        setError(`Login failed: ${err.message || 'An unexpected error occurred'}. (Code: ${err.code})`);
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
          className="w-full max-w-md space-y-6 lg:space-y-8"
        >
          <div className="text-center">
            <h3 className="text-2xl lg:text-3xl font-bold">Get Started</h3>
            <p className="text-text-200 mt-2 text-sm lg:text-base">Join thousands of traders improving their edge.</p>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs lg:text-sm text-red-400 leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white dark:bg-white dark:text-black py-3.5 lg:py-4 rounded-xl lg:rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-600/20 dark:shadow-none"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              )}
              {isLoading ? 'Connecting...' : 'Continue with Google'}
            </button>
            
            <div className="relative py-2 lg:py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-subtle"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-surface-200 px-4 text-text-200 font-bold tracking-widest">Secure Access</span>
              </div>
            </div>

            <p className="text-center text-[10px] lg:text-xs text-text-200/50 leading-relaxed">
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

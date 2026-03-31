import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { toast } from 'sonner';
import { Crown, TrendingUp, Loader2 } from 'lucide-react';
import { initializePayment } from '../services/paystackService';

interface PricingProps {
  user: UserProfile | null;
  onUpgrade: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ user, onUpgrade }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulateUpgrade = async () => {
    if (!user) {
      toast.error('Please log in to upgrade');
      return;
    }
    
    setIsProcessing(true);
    try {
      initializePayment(
        user, 
        () => setIsProcessing(false), // onComplete
        () => onUpgrade() // onSuccess
      );
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment');
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      name: 'Free Plan',
      price: 'GHS 0',
      description: 'Perfect for beginners starting their trading journey.',
      features: [
        'Limit: 10 trades per month',
        'Basic Dashboard',
        'Trade History',
        'Basic Trade Calendar',
        'Standard Support'
      ],
      buttonText: user?.plan === 'free' ? 'Current Plan' : 'Downgrade (N/A)',
      buttonDisabled: true,
      recommended: false
    },
    {
      name: 'Premium Plan',
      price: 'GHS 109.9899',
      period: '/month',
      description: 'For serious traders who want full insights and unlimited tracking.',
      features: [
        'Unlimited trades',
        'Full Analytics (Equity Curve, Win/Loss streaks)',
        'Smart Insights (Behavior analysis, Alerts)',
        'Priority Features Access',
        'Advanced Psychology Tracking',
        'Priority Support',
        'Custom Trade Tags',
        'Export Data (CSV/PDF)'
      ],
      buttonText: user?.plan === 'premium' ? 'Current Plan' : 'Upgrade to Premium',
      buttonDisabled: user?.plan === 'premium',
      recommended: true,
      badge: 'Most Popular'
    }
  ];

  return (
    <div className="space-y-12 py-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-500 px-4 py-1.5 rounded-full border border-blue-500/20 text-xs font-black uppercase tracking-widest mb-2">
          <TrendingUp className="w-3 h-3" />
          <span>Grow Your Edge</span>
        </div>
        <h2 className="text-4xl font-black tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Traders using insights improve faster. Choose the plan that fits your trading style.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 hover:scale-[1.02] ${
              plan.recommended 
                ? 'bg-[#111] border-blue-500 shadow-2xl shadow-blue-500/10' 
                : 'bg-[#111] border-white/5 hover:border-white/10'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 z-20 whitespace-nowrap">
                {plan.badge}
              </div>
            )}

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  {plan.recommended && (
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                      <Crown className="w-5 h-5 text-blue-500" />
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tighter">{plan.price}</span>
                {plan.period && <span className="text-gray-400 font-medium text-lg">{plan.period}</span>}
              </div>

              <button
                onClick={plan.name === 'Premium Plan' ? handleSimulateUpgrade : undefined}
                disabled={plan.buttonDisabled || isProcessing}
                className={`w-full py-5 rounded-2xl font-bold transition-all duration-300 text-lg flex items-center justify-center gap-2 ${
                  plan.buttonDisabled
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                    : plan.recommended
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-[0.98]'
                    : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98]'
                }`}
              >
                {isProcessing && plan.name === 'Premium Plan' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  plan.buttonText
                )}
              </button>

              <div className="space-y-5 pt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Everything in {plan.name === 'Premium Plan' ? 'Free, plus' : 'Free'}:</p>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${plan.recommended ? 'bg-blue-500/20 text-blue-500' : 'bg-white/10 text-white'}`}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] max-w-3xl mx-auto text-center space-y-4">
        <h4 className="text-xl font-bold">Frequently Asked Questions</h4>
        <div className="grid sm:grid-cols-2 gap-6 text-left">
          <div className="space-y-2">
            <p className="font-bold text-sm">Can I cancel anytime?</p>
            <p className="text-gray-400 text-xs leading-relaxed">Yes, you can cancel your subscription at any time from your settings page.</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-sm">What happens if I hit the limit?</p>
            <p className="text-gray-400 text-xs leading-relaxed">On the Free plan, you can track up to 10 trades per month. Once reached, you'll need to wait for the next month or upgrade.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

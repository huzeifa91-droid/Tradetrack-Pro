import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { motion } from 'motion/react';

interface LockedFeatureProps {
  featureName: string;
  description: string;
  onUpgrade: () => void;
}

export const LockedFeature: React.FC<LockedFeatureProps> = ({ featureName, description, onUpgrade }) => {
  const valueMessages = [
    "Traders using insights improve faster",
    "Unlock advanced analytics to grow your edge",
    "Consistency is key. Track every trade without limits.",
    "Identify your best trading sessions with Premium."
  ];
  const [valueMessage] = React.useState(() => valueMessages[Math.floor(Math.random() * valueMessages.length)]);

  return (
    <div className="relative min-h-[500px] w-full rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0A0A0A] flex items-center justify-center p-8 text-center group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
      
      <div className="relative z-10 max-w-md space-y-8">
        <div className="space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/40 relative"
          >
            <Lock className="w-10 h-10 text-white" />
            <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1.5 shadow-lg">
              <Crown className="w-4 h-4 text-black" />
            </div>
          </motion.div>
          
          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            Premium Feature
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-3xl font-black tracking-tighter">Unlock {featureName} with Premium</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {description}
          </p>
          <p className="text-blue-400 font-semibold text-sm italic">
            "{valueMessage}"
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onUpgrade}
            className="group relative flex items-center justify-center gap-2 bg-white text-black px-10 py-5 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all duration-500 active:scale-95 mx-auto shadow-2xl shadow-white/5"
          >
            <Crown className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Upgrade to Premium
          </button>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            Cancel anytime • 30-day money back guarantee
          </p>
        </div>
      </div>

      {/* Blurred background elements to simulate content */}
      <div className="absolute inset-0 -z-10 opacity-20 grayscale blur-xl pointer-events-none select-none overflow-hidden">
        <div className="p-8 space-y-12">
          <div className="flex justify-between items-center">
            <div className="h-10 bg-white/20 rounded-2xl w-1/4" />
            <div className="h-10 bg-white/20 rounded-2xl w-32" />
          </div>
          
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-white/10 rounded-3xl border border-white/5" />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-80 bg-white/10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-500/20 to-transparent" />
              <div className="absolute inset-0 flex items-end p-8">
                <div className="w-full h-1/2 border-b-2 border-l-2 border-white/10 flex items-end gap-2">
                  {[40, 70, 45, 90, 65, 80, 30, 95].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/10 rounded-t-lg" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="h-80 bg-white/10 rounded-[2.5rem] border border-white/5 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border-8 border-white/10 border-t-blue-500/30 rotate-45" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="h-48 bg-white/10 rounded-[2.5rem] border border-white/5" />
            <div className="h-48 bg-white/10 rounded-[2.5rem] border border-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
};

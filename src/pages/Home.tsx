import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  LayoutDashboard, 
  Brain, 
  History,
  Shield,
  ZapIcon
} from 'lucide-react';
import { Pricing } from '../components/Pricing';

export default function Home() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-100 text-text-100 selection:bg-brand-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="h-20 flex items-center justify-between px-8 lg:px-20 border-b border-border-subtle bg-surface-100/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border border-border-subtle rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
            <img src="/favicon.svg" alt="TradeTrack Pro" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">TradeTrack<span className="text-brand-500">Pro</span></h1>
        </div>
        
        <div className="hidden lg:flex items-center gap-10">
          <a href="#features" className="text-sm font-semibold text-text-200 hover:text-brand-500 transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-semibold text-text-200 hover:text-brand-500 transition-colors">Pricing</a>
          <Link to="/login" className="text-sm font-semibold text-text-200 hover:text-brand-500 transition-colors">Login</Link>
          <Link to="/login" className="bg-text-100 text-surface-100 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-500 transition-all active:scale-95 shadow-lg shadow-black/5">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 lg:px-20 pt-24 pb-20 lg:pt-32 lg:pb-32 flex flex-col items-center text-center max-w-6xl mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-brand-500/5 to-transparent -z-10 blur-3xl opacity-50" />
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-600 px-4 py-1.5 rounded-full border border-brand-500/20 text-[11px] font-bold uppercase tracking-wider">
            <ZapIcon className="w-3.5 h-3.5" />
            <span>The #1 AI-Powered Trading Journal</span>
          </motion.div>

          <motion.h2 
            variants={itemVariants}
            className="text-5xl lg:text-[5.5rem] font-semibold tracking-tight leading-[0.95] max-w-4xl mx-auto"
          >
            Master your trades with <span className="text-brand-500">intelligence.</span>
          </motion.h2>

          <motion.p 
            variants={itemVariants}
            className="text-text-200 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed font-medium"
          >
            TradeTrack Pro is the ultimate smart journal for professional traders. Track performance, analyze psychology, and optimize your strategy with Apple-like simplicity.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              to="/login" 
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-brand-500/25 group"
            >
              Start Journaling Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#pricing" 
              className="w-full sm:w-auto bg-surface-200 hover:bg-surface-300 text-text-100 px-8 py-4 rounded-2xl font-semibold text-lg transition-all active:scale-95 border border-border-subtle"
            >
              View Pricing
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Providers / Partners Section */}
      <section className="py-20 border-y border-border-subtle bg-surface-200/50">
        <div className="max-w-7xl mx-auto px-8 lg:px-20 text-center">
          <p className="text-[10px] font-bold text-text-200 uppercase tracking-[0.3em] mb-12">Trusted by traders across all major platforms</p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-40 grayscale contrast-125 dark:invert">
            <span className="text-xl lg:text-2xl font-black tracking-tighter">MetaTrader 5</span>
            <span className="text-xl lg:text-2xl font-black tracking-tighter">TradingView</span>
            <span className="text-xl lg:text-2xl font-black tracking-tighter">Binance</span>
            <span className="text-xl lg:text-2xl font-black tracking-tighter">cTrader</span>
            <span className="text-xl lg:text-2xl font-black tracking-tighter">NinjaTrader</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-8 lg:px-20 py-32 bg-surface-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight">Built for Performance</h2>
            <p className="text-text-200 font-medium max-w-xl mx-auto">Everything you need to turn your trading activity into professional-grade performance data.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ShieldCheck} 
              title="Secure Logging" 
              description="Your data is encrypted and securely stored in the cloud. Access your journal from anywhere, anytime with peace of mind."
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Advanced Analytics" 
              description="Visualize your equity curve, drawdowns, and win-rate with professional-grade charting tools designed for clarity."
            />
            <FeatureCard 
              icon={Brain} 
              title="Psychology Insights" 
              description="Identify emotional patterns and bad habits using our proprietary psychology analysis engine to stay disciplined."
            />
            <FeatureCard 
              icon={History} 
              title="Trade History" 
              description="Beautifully organized trade history with screenshot support, tags, and detailed execution breakdowns."
            />
            <FeatureCard 
              icon={TrendingUp} 
              title="Strategy Optimizer" 
              description="A/B test your setups and find out exactly which market conditions yield the highest expectancy for your style."
            />
            <FeatureCard 
              icon={Shield} 
              title="Bank-Level Security" 
              description="We use Enterprise-grade security protocols to ensure your strategy and data remain your competitive advantage."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-8 lg:px-20 py-32 bg-surface-200 border-y border-border-subtle">
        <div className="max-w-7xl mx-auto">
          <Pricing user={null} onUpgrade={() => {}} />
        </div>
      </section>

      {/* FAQ / Trust markers */}
      <section className="py-32 px-8 lg:px-20">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight">Ready to improve?</h2>
          <p className="text-text-200 text-lg font-medium leading-relaxed">
            Join thousands of traders who have moved from gambling to professional execution using TradeTrack Pro’s insights.
          </p>
          <Link 
            to="/login" 
            className="inline-flex items-center gap-3 bg-text-100 text-surface-100 px-10 py-5 rounded-2xl font-semibold text-xl hover:bg-brand-500 transition-all active:scale-95 shadow-2xl shadow-black/10"
          >
            Get Started Now
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      <footer className="py-20 px-8 lg:px-20 border-t border-border-subtle bg-surface-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-200 border border-border-subtle rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
              <img src="/favicon.svg" alt="TradeTrack Pro" className="w-full h-full object-cover" />
            </div>
            <p className="text-xl font-semibold tracking-tight">TradeTrack<span className="text-brand-500">Pro</span></p>
          </div>
          <div className="flex gap-8 text-sm font-semibold text-text-200">
            <a href="#" className="hover:text-text-100 transition-colors">Twitter</a>
            <a href="#" className="hover:text-text-100 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-text-100 transition-colors">Discord</a>
            <a href="#" className="hover:text-text-100 transition-colors">Support</a>
          </div>
          <p className="text-text-200 text-xs font-semibold tracking-widest uppercase">
            © 2026 TradeTrack Pro.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-surface-100 p-10 rounded-[2.5rem] border border-border-subtle shadow-sm hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-500 group"
    >
      <div className="p-4 bg-brand-500/10 text-brand-600 rounded-2xl w-fit mb-8 group-hover:bg-brand-500 group-hover:text-white transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-2xl font-semibold tracking-tight mb-4">{title}</h3>
      <p className="text-text-200 text-base leading-relaxed font-medium">
        {description}
      </p>
    </motion.div>
  );
}

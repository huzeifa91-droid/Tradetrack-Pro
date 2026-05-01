import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  History, 
  Calendar, 
  BarChart3, 
  Brain, 
  Settings, 
  LogOut,
  Plus,
  TrendingUp,
  Menu,
  X,
  User,
  CreditCard,
  Crown
} from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile | null;
  onAddTrade: () => void;
}

export function Layout({ children, activeTab, setActiveTab, user, onAddTrade }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Trades', icon: History },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'psychology', label: 'Psychology', icon: Brain },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const bottomNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'history', label: 'Trades', icon: History },
    { id: 'add', label: 'Add', icon: Plus, isAction: true },
    { id: 'analytics', label: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-100 text-text-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-surface-200 border-r border-border-subtle flex-col fixed h-full z-20">
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-surface-300 rounded-xl flex items-center justify-center group cursor-pointer overflow-hidden border border-border-subtle">
            <img src="/favicon.svg" alt="TradeTrack Pro" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-text-100">TradeTrack<span className="text-brand-500">Pro</span></h1>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-brand-500 rounded-full" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-200">Accountability</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-brand-500 text-white font-semibold' 
                  : 'text-text-200 hover:text-text-100 hover:bg-surface-300'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
              <span className="text-sm font-medium tracking-tight">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeNav"
                  className="ml-auto w-1 h-1 bg-white rounded-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-border-subtle space-y-6">
          <div className="bg-surface-300 rounded-2xl p-4 flex items-center gap-3 border border-border-subtle">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-base font-semibold text-white">
                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
              </div>
              {user?.plan === 'premium' && (
                <div className="absolute -top-1.5 -right-1.5 bg-yellow-500 rounded-full p-0.5 border-2 border-surface-200 shadow-sm">
                  <Crown className="w-2.5 h-2.5 text-black" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate text-text-100">{user?.displayName || 'Trader'}</p>
                {user?.plan === 'premium' ? (
                  <span className="text-[9px] bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border border-yellow-500/20">Pro</span>
                ) : (
                  <span className="text-[9px] bg-surface-100 text-text-200 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border border-border-subtle">Free</span>
                )}
              </div>
              <p className="text-[10px] text-text-200 truncate font-medium">{user?.email}</p>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-text-200 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all font-semibold text-[11px] uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface-100/80 backdrop-blur-xl border-b border-border-subtle z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-surface-200 rounded-lg flex items-center justify-center overflow-hidden border border-border-subtle">
            <img src="/favicon.svg" alt="TradeTrack Pro" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">TradeTrack<span className="text-brand-500">Pro</span></h1>
        </div>
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="w-9 h-9 flex items-center justify-center bg-surface-200 rounded-lg text-text-200 hover:text-text-100 transition-colors border border-border-subtle"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 lg:hidden"
            />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-[300px] bg-surface-200 z-[60] lg:hidden flex flex-col border-l border-border-subtle shadow-2xl"
              >
                <div className="p-8 flex items-center justify-between border-b border-border-subtle">
                  <h2 className="text-2xl font-black tracking-tighter text-text-100">Menu</h2>
                  <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 flex items-center justify-center bg-surface-300 rounded-xl text-text-200">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              
            <nav className="flex-1 p-6 space-y-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] transition-all ${
                      activeTab === item.id 
                        ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30 font-bold' 
                        : 'text-text-200 hover:bg-surface-300'
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="text-xl font-medium tracking-tight">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="p-8 border-t border-border-subtle">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-4 px-6 py-5 text-red-400 bg-red-500/5 rounded-[2rem] transition-all font-bold text-lg"
                >
                  <LogOut className="w-6 h-6" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 pb-24 lg:pb-0 pt-20 lg:pt-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 border-b border-border-subtle bg-surface-100/80 backdrop-blur-xl sticky top-0 z-10 px-10 items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight capitalize text-text-100">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-6">
            <div className="flex bg-surface-200 rounded-xl p-1 border border-border-subtle">
              <button 
                onClick={() => setActiveTab('pricing')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${activeTab === 'pricing' ? 'bg-brand-500 text-white shadow-sm' : 'text-text-200 hover:text-text-100'}`}
              >
                Pricing
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${activeTab === 'settings' ? 'bg-brand-500 text-white shadow-sm' : 'text-text-200 hover:text-text-100'}`}
              >
                Settings
              </button>
            </div>
            <div className="w-px h-6 bg-border-subtle" />
            <button 
              onClick={onAddTrade}
              className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Trade
            </button>
          </div>
        </header>
        
        <div className="px-4 sm:px-8 lg:px-12 py-8 max-w-7xl mx-auto">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-24 bg-surface-200/90 backdrop-blur-2xl border-t border-border-subtle z-40 px-8 flex items-center justify-between pb-safe">
        {bottomNavItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onAddTrade}
                className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-600/40 -translate-y-8 active:scale-90 transition-transform border-4 border-surface-100"
              >
                <Plus className="w-10 h-10 text-white" />
              </button>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1.5 transition-all ${
                activeTab === item.id ? 'text-blue-500' : 'text-text-200'
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-500/10' : ''}`}>
                <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

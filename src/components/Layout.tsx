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
    <div className="flex min-h-screen bg-[#0A0A0A]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-[#0F0F0F] border-r border-white/5 flex-col fixed h-full z-20">
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/10 group cursor-pointer overflow-hidden">
            <img src="/favicon.svg" alt="TradeTrack Pro" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter">TradeTrack<span className="text-[#90be6d]">Pro</span></h1>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-[#90be6d] rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Professional</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 font-bold' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-sm tracking-tight">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeNav"
                  className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-6">
          <div className="bg-white/5 rounded-3xl p-4 flex items-center gap-4 border border-white/5">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-black shadow-xl">
                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
              </div>
              {user?.plan === 'premium' && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1 border-4 border-[#111] shadow-lg">
                  <Crown className="w-3 h-3 text-black" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold truncate">{user?.displayName || 'Trader'}</p>
                {user?.plan === 'premium' ? (
                  <span className="text-[8px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-yellow-500/20">Pro</span>
                ) : (
                  <span className="text-[8px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Free</span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 truncate font-medium">{user?.email}</p>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <img src="/favicon.svg" alt="TradeTrack Pro" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-lg font-black tracking-tighter">TradeTrack<span className="text-[#90be6d]">Pro</span></h1>
        </div>
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/5"
        >
          <Menu className="w-6 h-6" />
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
              className="fixed top-0 right-0 bottom-0 w-[300px] bg-[#0F0F0F] z-[60] lg:hidden flex flex-col border-l border-white/10 shadow-2xl"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <h2 className="text-2xl font-black tracking-tighter">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-gray-400">
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
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="text-xl font-medium tracking-tight">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="p-8 border-t border-white/5">
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
        <header className="hidden lg:flex h-20 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 z-10 px-10 items-center justify-between">
          <h2 className="text-xl font-black tracking-tighter capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-6">
            <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5">
              <button 
                onClick={() => setActiveTab('pricing')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pricing' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                Pricing
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                Settings
              </button>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <button 
              onClick={onAddTrade}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Trade
            </button>
          </div>
        </header>
        
        <div className="px-6 lg:px-12 py-8 max-w-7xl mx-auto">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-24 bg-[#0F0F0F]/90 backdrop-blur-2xl border-t border-white/10 z-40 px-8 flex items-center justify-between pb-safe">
        {bottomNavItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onAddTrade}
                className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-600/40 -translate-y-8 active:scale-90 transition-transform border-4 border-[#0A0A0A]"
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
                activeTab === item.id ? 'text-blue-500' : 'text-gray-500'
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

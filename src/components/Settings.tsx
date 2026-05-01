import React, { useState } from 'react';
import { User, Shield, Bell, Moon, Sun, Save, CreditCard, LogOut } from 'lucide-react';
import { UserProfile } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';

interface SettingsProps {
  user: UserProfile | null;
  onNavigateToPricing: () => void;
  onThemeChange?: (theme: 'dark' | 'light') => void;
}

export function Settings({ user, onNavigateToPricing, onThemeChange }: SettingsProps) {
  const [riskPreference, setRiskPreference] = useState(user?.riskPreference || 1);
  const [accountBalance, setAccountBalance] = useState(user?.accountBalance || 10000);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [theme, setThemeState] = useState(user?.theme || 'dark');
  const [saving, setSaving] = useState(false);

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    onThemeChange?.(newTheme);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        riskPreference,
        accountBalance,
        theme
      });
      toast.success('Settings updated successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
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
    <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold">Settings</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Sidebar Navigation - Horizontal on mobile */}
        <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          <SettingsNavButton icon={User} label="Profile" active />
          <SettingsNavButton icon={Shield} label="Risk" />
          <SettingsNavButton icon={Bell} label="Alerts" />
          <SettingsNavButton icon={CreditCard} label="Billing" onClick={onNavigateToPricing} />
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <section className="bg-surface-200 border border-border-subtle rounded-2xl lg:rounded-3xl p-5 lg:p-8 space-y-6">
            <h3 className="text-base lg:text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> Profile Information
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-200">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-surface-300 border border-border-subtle text-text-100 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-200">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full bg-surface-300 border border-border-subtle text-text-100 rounded-xl px-4 py-3 text-sm opacity-50 cursor-not-allowed"
                />
                <p className="text-[10px] text-text-200">Linked to your Google account.</p>
              </div>
            </div>
          </section>

          {/* Risk Management Section */}
          <section className="bg-surface-200 border border-border-subtle rounded-2xl lg:rounded-3xl p-5 lg:p-8 space-y-6">
            <h3 className="text-base lg:text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" /> Risk Management
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-200">Account Balance ($)</label>
                <input 
                  type="number" 
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(parseFloat(e.target.value))}
                  className="w-full bg-surface-300 border border-border-subtle text-text-100 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                />
                <p className="text-[10px] text-text-200">Used for risk percentage calculations.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-text-200">Default Risk per Trade (%)</label>
                  <span className="text-emerald-500 font-bold text-sm">{riskPreference}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="10" 
                  step="0.1"
                  value={riskPreference}
                  onChange={(e) => setRiskPreference(parseFloat(e.target.value))}
                  className="w-full h-2 bg-surface-300 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[10px] text-text-200">Used for lot size recommendations.</p>
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="bg-surface-200 border border-border-subtle rounded-2xl lg:rounded-3xl p-5 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base lg:text-lg font-semibold flex items-center gap-2">
                  <Moon className="w-5 h-5 text-purple-500" /> Appearance
                </h3>
                <p className="text-xs text-text-200">Customize how TradeTrack Pro looks on your device.</p>
              </div>
              
              {/* Accessible Modern Toggle Switch */}
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                aria-pressed={theme === 'dark'}
                className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-surface-100 bg-surface-300 border border-border-subtle"
              >
                <span 
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out flex items-center justify-center ${theme === 'dark' ? 'translate-x-[1.75rem] bg-blue-600' : 'translate-x-1'}`}
                >
                  {theme === 'dark' ? (
                    <Moon className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-orange-500" />
                  )}
                </span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setTheme('dark')}
                aria-pressed={theme === 'dark'}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-blue-600/10 border-blue-500 text-blue-500 shadow-lg shadow-blue-500/10' : 'bg-surface-300 border-border-subtle text-text-200 hover:border-text-200'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-surface-200'}`}>
                    <Moon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">Dark Mode</span>
                </div>
                {theme === 'dark' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
              </button>

              <button 
                onClick={() => setTheme('light')}
                aria-pressed={theme === 'light'}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${theme === 'light' ? 'bg-blue-600/10 border-blue-500 text-blue-500 shadow-lg shadow-blue-500/10' : 'bg-surface-300 border-border-subtle text-text-200 hover:border-text-200'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-blue-500 text-white' : 'bg-surface-200'}`}>
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">Light Mode</span>
                </div>
                {theme === 'light' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
              </button>
            </div>
          </section>

          {/* Subscription Section */}
          <section className="bg-surface-200 border border-border-subtle rounded-2xl lg:rounded-3xl p-5 lg:p-8 space-y-6">
            <h3 className="text-base lg:text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-500" /> Subscription Plan
            </h3>
            
            <div className="flex items-center justify-between p-6 bg-surface-300 rounded-2xl border border-border-subtle">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold capitalize">{user?.plan || 'Free'} Plan</span>
                  {user?.plan === 'premium' && (
                    <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Pro</span>
                  )}
                </div>
                <p className="text-xs text-text-200">
                  {user?.plan === 'premium' ? 'Unlimited trades and full analytics' : `${user?.tradeCount || 0} / 10 trades used this month`}
                </p>
              </div>
              <button 
                onClick={onNavigateToPricing}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  user?.plan === 'premium' 
                    ? 'bg-blue-600/10 text-blue-500 hover:bg-blue-600/20' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                }`}
              >
                {user?.plan === 'premium' ? 'Manage' : 'Upgrade'}
              </button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-red-500/5 border border-red-500/10 rounded-2xl lg:rounded-3xl p-5 lg:p-8 space-y-6">
            <h3 className="text-base lg:text-lg font-semibold flex items-center gap-2 text-red-500">
              <LogOut className="w-5 h-5" /> Account Actions
            </h3>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
              <div className="space-y-1">
                <p className="text-sm font-bold text-red-400">Sign Out</p>
                <p className="text-xs text-text-200">End your current session safely.</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SettingsNavButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex-shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-4 py-2.5 lg:py-3 rounded-xl transition-all text-sm ${
      active ? 'bg-blue-600/10 text-blue-500 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}>
      <Icon className="w-4 h-4 lg:w-5 h-5" />
      {label}
    </button>
  );
}

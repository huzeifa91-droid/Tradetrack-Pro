import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from './firebase';
import { Trade, UserProfile } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TradeHistory } from './components/TradeHistory';
import { TradeCalendar } from './components/TradeCalendar';
import { Analytics } from './components/Analytics';
import { Psychology } from './components/Psychology';
import { Auth } from './components/Auth';
import { TradeForm } from './components/TradeForm';
import { Settings } from './components/Settings';
import { TradeDetail } from './components/TradeDetail';
import { Pricing } from './components/Pricing';
import { DashboardSkeleton, HistorySkeleton } from './components/Skeleton';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { LockedFeature } from './components/LockedFeature';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Ensure profile exists
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              theme: 'dark',
              accountBalance: 10000,
              plan: 'free',
              tradeCount: 0,
              subscriptionStartDate: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
          }
        } catch (error) {
          console.error("Error checking user profile:", error);
        }
      } else {
        setUserProfile(null);
        setTrades([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        
        // Monthly reset logic
        const now = new Date();
        const lastReset = data.subscriptionStartDate ? new Date(data.subscriptionStartDate) : new Date(0);
        const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceReset >= 30) {
          updateDoc(userDocRef, {
            tradeCount: 0,
            subscriptionStartDate: now.toISOString()
          }).catch(err => console.error("Error resetting trade count:", err));
        } else {
          setUserProfile(data);
        }
      } else {
        // If profile doesn't exist yet, we might still be creating it in the other useEffect
        // But we should stop loading if it's taking too long
      }
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }
      setLoading(false); // Stop loading even on error
    });

    return () => unsubscribeUser();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const tradesQuery = query(
      collection(db, 'trades'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeTrades = onSnapshot(tradesQuery, (snapshot) => {
      const tradesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[];
      setTrades(tradesData);
      setLoading(false);
    }, (error) => {
      // Only report if still logged in
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'trades');
      }
      setLoading(false); // Stop loading even on error
    });

    return () => unsubscribeTrades();
  }, [user]);

  // Theme Management & Persistence
  useEffect(() => {
    const applyTheme = (theme: string) => {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
      localStorage.setItem('theme', theme);
    };

    // Initial Resolution
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolvedTheme = userProfile?.theme || localStorage.getItem('theme') || (systemDark ? 'dark' : 'light');
    applyTheme(resolvedTheme as string);

    // Listen for System Preference Changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if the user hasn't set an explicit preference
      if (!userProfile?.theme && !localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [userProfile?.theme]);

  const handleAddTrade = async (tradeData: Partial<Trade>) => {
    if (!user || !userProfile) return;

    // Check trade limit for free users
    if (userProfile.plan === 'free' && (userProfile.tradeCount || 0) >= 10) {
      toast.error("You've reached your monthly limit. Upgrade to Premium for unlimited trades.", {
        action: {
          label: 'Upgrade',
          onClick: () => setActiveTab('pricing')
        },
        duration: 5000
      });
      return;
    }

    try {
      await addDoc(collection(db, 'trades'), {
        ...tradeData,
        userId: user.uid,
        timestamp: new Date().toISOString()
      });
      
      // Increment trade count
      const userDocRef = doc(db, 'users', user.uid);
      const newCount = (userProfile.tradeCount || 0) + 1;
      await updateDoc(userDocRef, {
        tradeCount: newCount
      });
      setUserProfile({ ...userProfile, tradeCount: newCount });

      setIsTradeModalOpen(false);
      toast.success('Trade recorded successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'trades');
      toast.error('Failed to record trade');
    }
  };

  const handleUpdateTrade = async (id: string, tradeData: Partial<Trade>) => {
    try {
      await updateDoc(doc(db, 'trades', id), tradeData);
      setIsTradeModalOpen(false);
      setEditingTrade(null);
      toast.success('Trade updated successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `trades/${id}`);
      toast.error('Failed to update trade');
    }
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'trades', id));
      toast.success('Trade deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `trades/${id}`);
      toast.error('Failed to delete trade');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 text-text-100 font-sans">
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={userProfile} onAddTrade={() => setIsTradeModalOpen(true)}>
          <main className="p-6 max-w-7xl mx-auto">
            {activeTab === 'dashboard' ? <DashboardSkeleton /> : <HistorySkeleton />}
          </main>
        </Layout>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={() => {}} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard trades={trades} onAddTrade={() => setIsTradeModalOpen(true)} user={userProfile} onUpgrade={() => setActiveTab('pricing')} />;
      case 'history':
        return (
          <TradeHistory 
            trades={trades} 
            onEdit={(trade) => {
              setEditingTrade(trade);
              setIsTradeModalOpen(true);
            }} 
            onDelete={(id) => setConfirmDeleteId(id)}
            onView={(trade) => setSelectedTrade(trade)}
          />
        );
      case 'calendar':
        return <TradeCalendar trades={trades} />;
      case 'analytics':
        if (userProfile?.plan === 'free') {
          return (
            <LockedFeature 
              featureName="Advanced Analytics" 
              description="Get deep insights into your trading performance with equity curves, win/loss streaks, and risk-reward analysis." 
              onUpgrade={() => setActiveTab('pricing')}
            />
          );
        }
        return <Analytics trades={trades} />;
      case 'psychology':
        if (userProfile?.plan === 'free') {
          return (
            <LockedFeature 
              featureName="Smart Insights" 
              description="Analyze your trading behavior, detect overtrading, and get intelligent alerts to improve your discipline." 
              onUpgrade={() => setActiveTab('pricing')}
            />
          );
        }
        return <Psychology trades={trades} />;
      case 'pricing':
        return <Pricing user={userProfile} onUpgrade={() => setActiveTab('dashboard')} />;
      case 'settings':
        return (
          <Settings 
            user={userProfile} 
            onNavigateToPricing={() => setActiveTab('pricing')} 
            onThemeChange={(theme) => {
              if (userProfile) {
                setUserProfile({ ...userProfile, theme });
              }
            }}
          />
        );
      default:
        return <Dashboard trades={trades} onAddTrade={() => setIsTradeModalOpen(true)} user={userProfile} onUpgrade={() => setActiveTab('pricing')} />;
    }
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500/30 transition-colors duration-500 ${userProfile?.theme === 'light' ? 'bg-surface-100 text-text-100' : 'dark bg-surface-100 text-text-100'}`}>
      <Toaster position="top-right" theme={userProfile?.theme === 'light' ? 'light' : 'dark'} richColors />
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={userProfile} onAddTrade={() => setIsTradeModalOpen(true)}>
        <main className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </Layout>

      <AnimatePresence>
        {isTradeModalOpen && (
          <TradeForm 
            onClose={() => {
              setIsTradeModalOpen(false);
              setEditingTrade(null);
            }}
            onSubmit={editingTrade ? (data) => handleUpdateTrade(editingTrade.id, data) : handleAddTrade}
            initialData={editingTrade}
            accountBalance={userProfile?.accountBalance}
            userPlan={userProfile?.plan}
            tradeCount={userProfile?.tradeCount}
          />
        )}
        {selectedTrade && (
          <TradeDetail 
            trade={selectedTrade}
            onClose={() => setSelectedTrade(null)}
            onEdit={() => {
              setEditingTrade(selectedTrade);
              setSelectedTrade(null);
              setIsTradeModalOpen(true);
            }}
            onDelete={(id) => setConfirmDeleteId(id)}
          />
        )}
      </AnimatePresence>

      {/* Global Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-100 border border-border-subtle p-8 rounded-3xl max-w-sm w-full space-y-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl text-red-500">🗑️</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-text-100">Delete Trade?</h3>
              <p className="text-text-200 text-sm">This action cannot be undone. Are you sure you want to remove this trade from your history?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="py-3 rounded-xl bg-surface-300 hover:bg-surface-300 text-text-100 font-bold transition-all border border-border-subtle"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleDeleteTrade(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

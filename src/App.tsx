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
      }
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }
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
    });

    return () => unsubscribeTrades();
  }, [user]);

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
      <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
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
        return <Settings user={userProfile} onNavigateToPricing={() => setActiveTab('pricing')} />;
      default:
        return <Dashboard trades={trades} onAddTrade={() => setIsTradeModalOpen(true)} user={userProfile} onUpgrade={() => setActiveTab('pricing')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-blue-500/30">
      <Toaster position="top-right" theme="dark" richColors />
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={userProfile} onAddTrade={() => setIsTradeModalOpen(true)}>
        <main className="p-4 lg:p-8 max-w-7xl mx-auto">
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
          <div className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-sm w-full space-y-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl text-red-500">🗑️</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Delete Trade?</h3>
              <p className="text-gray-400 text-sm">This action cannot be undone. Are you sure you want to remove this trade from your history?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleDeleteTrade(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="py-3 rounded-xl bg-red-600 hover:bg-red-700 font-bold transition-all shadow-lg shadow-red-600/20"
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

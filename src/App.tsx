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
import { AlertCircle } from 'lucide-react';
import { Layout } from './components/Layout';
import { TradeForm } from './components/TradeForm';
import { TradeDetail } from './components/TradeDetail';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import Pages
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PsychologyPage from './pages/PsychologyPage';
import PricingPage from './pages/PricingPage';
import SettingsPage from './pages/SettingsPage';
import CalendarPage from './pages/CalendarPage';
import { DashboardSkeleton, HistorySkeleton } from './components/Skeleton';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
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
        setUserProfile(data);
      }
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }
      setLoading(false);
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

    const unsubscribeTrades = onSnapshot(tradesQuery, async (snapshot) => {
      const tradesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[];
      setTrades(tradesData);
      
      if (userProfile && tradesData.length !== userProfile.tradeCount) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, { tradeCount: tradesData.length });
        } catch (err) {
          console.error("Error updating trade count:", err);
        }
      }
      
      setLoading(false);
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'trades');
      }
      setLoading(false);
    });

    return () => unsubscribeTrades();
  }, [user, userProfile]);

  // Theme Management
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

    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolvedTheme = userProfile?.theme || localStorage.getItem('theme') || (systemDark ? 'dark' : 'light');
    applyTheme(resolvedTheme as string);
  }, [userProfile?.theme]);

  const handleAddTrade = async (tradeData: Partial<Trade>) => {
    if (!user || !userProfile) return;

    if (userProfile.plan === 'free' && trades.length >= 10) {
      toast.error("Free limit reached. Upgrade to continue using TradeTrack Pro.", {
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
      <div className="min-h-screen bg-surface-100 text-text-100 font-sans flex items-center justify-center p-6">
        <div className="max-w-7xl w-full">
          {location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/history') ? <HistorySkeleton /> : <DashboardSkeleton />}
        </div>
      </div>
    );
  }

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user) return <Navigate to="/login" replace />;
    return (
      <Layout user={userProfile} onAddTrade={() => setIsTradeModalOpen(true)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Layout>
    );
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-brand-500/30 transition-colors duration-500 ${userProfile?.theme === 'light' ? 'bg-surface-100 text-text-100' : 'dark bg-surface-100 text-text-100'}`}>
      <Toaster position="top-right" theme={userProfile?.theme === 'light' ? 'light' : 'dark'} richColors />
      
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage trades={trades} user={userProfile} onAddTrade={() => setIsTradeModalOpen(true)} onUpgrade={() => {}} />
          </ProtectedRoute>
        } />
        
        <Route path="/history" element={
          <ProtectedRoute>
            <HistoryPage 
              trades={trades} 
              onEdit={(trade) => {
                setEditingTrade(trade);
                setIsTradeModalOpen(true);
              }}
              onDelete={setConfirmDeleteId}
              onView={setSelectedTrade}
            />
          </ProtectedRoute>
        } />

        <Route path="/calendar" element={
          <ProtectedRoute>
            <CalendarPage trades={trades} />
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute>
            <AnalyticsPage trades={trades} user={userProfile} />
          </ProtectedRoute>
        } />

        <Route path="/psychology" element={
          <ProtectedRoute>
            <PsychologyPage trades={trades} user={userProfile} />
          </ProtectedRoute>
        } />

        <Route path="/pricing" element={
          <ProtectedRoute>
            <PricingPage user={userProfile} onUpgrade={() => {}} />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage 
              user={userProfile} 
              onNavigateToPricing={() => {}} 
              onThemeChange={(theme) => {
                if (userProfile) setUserProfile({ ...userProfile, theme: theme as 'dark' | 'light' });
              }} 
            />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

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
            tradeCount={trades.length}
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

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-100 border border-border-subtle p-8 rounded-2xl max-w-sm w-full space-y-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-text-100">Delete Trade?</h3>
              <p className="text-text-200 text-xs font-medium">This action cannot be undone. Are you sure you want to remove this trade from your history?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="py-2.5 rounded-xl bg-surface-200 hover:bg-surface-300 text-text-100 font-semibold text-sm transition-all border border-border-subtle"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleDeleteTrade(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all"
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

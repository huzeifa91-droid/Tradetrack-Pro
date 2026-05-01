import React from 'react';
import { Dashboard } from '../components/Dashboard';
import { Trade, UserProfile } from '../types';

interface DashboardPageProps {
  trades: Trade[];
  user: UserProfile | null;
  onAddTrade: () => void;
  onUpgrade: () => void;
}

export default function DashboardPage({ trades, user, onAddTrade, onUpgrade }: DashboardPageProps) {
  return (
    <Dashboard 
      trades={trades} 
      onAddTrade={onAddTrade} 
      user={user} 
      onUpgrade={onUpgrade} 
    />
  );
}

import React from 'react';
import { Analytics } from '../components/Analytics';
import { LockedFeature } from '../components/LockedFeature';
import { Trade, UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';

interface AnalyticsPageProps {
  trades: Trade[];
  user: UserProfile | null;
}

export default function AnalyticsPage({ trades, user }: AnalyticsPageProps) {
  const navigate = useNavigate();

  if (user?.plan === 'free') {
    return (
      <div className="p-6 lg:p-10">
        <LockedFeature 
          featureName="Advanced Analytics" 
          description="Get deep insights into your trading performance with equity curves, win/loss streaks, and risk-reward analysis." 
          onUpgrade={() => navigate('/pricing')}
        />
      </div>
    );
  }

  return <Analytics trades={trades} />;
}

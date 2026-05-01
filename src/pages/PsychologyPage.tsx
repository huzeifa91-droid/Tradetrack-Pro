import React from 'react';
import { Psychology } from '../components/Psychology';
import { LockedFeature } from '../components/LockedFeature';
import { Trade, UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';

interface PsychologyPageProps {
  trades: Trade[];
  user: UserProfile | null;
}

export default function PsychologyPage({ trades, user }: PsychologyPageProps) {
  const navigate = useNavigate();

  if (user?.plan === 'free') {
    return (
      <div className="p-6 lg:p-10">
        <LockedFeature 
          featureName="Smart Insights" 
          description="Analyze your trading behavior, detect overtrading, and get intelligent alerts to improve your discipline." 
          onUpgrade={() => navigate('/pricing')}
        />
      </div>
    );
  }

  return <Psychology trades={trades} />;
}

import React from 'react';
import { Pricing } from '../components/Pricing';
import { UserProfile } from '../types';

interface PricingPageProps {
  user: UserProfile | null;
  onUpgrade: () => void;
}

export default function PricingPage({ user, onUpgrade }: PricingPageProps) {
  return (
    <Pricing 
      user={user} 
      onUpgrade={onUpgrade} 
    />
  );
}

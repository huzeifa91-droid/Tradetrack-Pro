import React from 'react';
import { Settings } from '../components/Settings';
import { UserProfile } from '../types';

interface SettingsPageProps {
  user: UserProfile | null;
  onNavigateToPricing: () => void;
  onThemeChange: (theme: string) => void;
}

export default function SettingsPage({ user, onNavigateToPricing, onThemeChange }: SettingsPageProps) {
  return (
    <Settings 
      user={user} 
      onNavigateToPricing={onNavigateToPricing} 
      onThemeChange={onThemeChange} 
    />
  );
}

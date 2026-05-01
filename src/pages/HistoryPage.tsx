import React from 'react';
import { TradeHistory } from '../components/TradeHistory';
import { Trade } from '../types';

interface HistoryPageProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onView: (trade: Trade) => void;
}

export default function HistoryPage({ trades, onEdit, onDelete, onView }: HistoryPageProps) {
  return (
    <TradeHistory 
      trades={trades} 
      onEdit={onEdit} 
      onDelete={onDelete} 
      onView={onView} 
    />
  );
}

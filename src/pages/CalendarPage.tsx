import React from 'react';
import { TradeCalendar } from '../components/TradeCalendar';
import { Trade } from '../types';

interface CalendarPageProps {
  trades: Trade[];
}

export default function CalendarPage({ trades }: CalendarPageProps) {
  return <TradeCalendar trades={trades} />;
}

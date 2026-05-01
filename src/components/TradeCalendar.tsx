import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Trade } from '../types';
import { format, isSameDay } from 'date-fns';
import './CalendarStyles.css';

interface TradeCalendarProps {
  trades: Trade[];
}

export function TradeCalendar({ trades }: TradeCalendarProps) {
  const [value, onChange] = useState<any>(new Date());

  const getDayTrades = (date: Date) => {
    return trades.filter(t => isSameDay(new Date(t.timestamp), date));
  };

  const getDayProfit = (date: Date) => {
    const dayTrades = getDayTrades(date);
    return dayTrades.reduce((acc, t) => acc + (t.profitLoss || 0), 0);
  };

  const tileContent = ({ date, view }: any) => {
    if (view === 'month') {
      const profit = getDayProfit(date);
      const dayTrades = getDayTrades(date);
      
      if (dayTrades.length === 0) return null;

      return (
        <div className="mt-1 flex flex-col items-center">
          <div className={`text-[10px] font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {profit >= 0 ? '+' : ''}{profit.toFixed(0)}
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-600 mt-0.5"></div>
        </div>
      );
    }
    return null;
  };

  const selectedDayTrades = getDayTrades(value);
  const selectedDayProfit = getDayProfit(value);

  return (
    <div className="space-y-6 lg:space-y-8">
      <h1 className="text-2xl lg:text-3xl font-bold">Trade Calendar</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-surface-200 border border-border-subtle rounded-3xl p-4 lg:p-8 overflow-x-auto">
          <Calendar 
            onChange={onChange} 
            value={value} 
            tileContent={tileContent}
            className="w-full bg-transparent border-none text-text-100 min-w-[300px]"
          />
        </div>

        <div className="space-y-6">
          <div className="bg-[#111] border border-white/5 rounded-3xl p-5 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold mb-4">{format(value, 'MMMM dd, yyyy')}</h3>
            <div className="flex items-center justify-between p-4 bg-surface-300/50 rounded-2xl border border-border-subtle">
              <span className="text-text-200 text-xs lg:text-sm">Daily P/L</span>
              <span className={`text-lg lg:text-xl font-bold ${selectedDayProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {selectedDayProfit >= 0 ? '+' : ''}{selectedDayProfit.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-surface-200 border border-border-subtle rounded-3xl p-5 lg:p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-200 mb-4">Trades on this day</h3>
            <div className="space-y-3">
              {selectedDayTrades.map(trade => (
                <div key={trade.id} className="flex items-center justify-between p-4 bg-surface-300/50 rounded-2xl border border-border-subtle">
                  <div>
                    <div className="font-bold text-sm lg:text-base">{trade.pair}</div>
                    <div className="text-[10px] lg:text-xs text-text-200 uppercase">{trade.type} • {trade.strategy}</div>
                  </div>
                  <div className={`font-bold text-sm lg:text-base ${trade.profitLoss && trade.profitLoss >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {trade.profitLoss && trade.profitLoss >= 0 ? '+' : ''}{trade.profitLoss}
                  </div>
                </div>
              ))}
              {selectedDayTrades.length === 0 && (
                <p className="text-center text-gray-500 py-8 text-xs lg:text-sm italic">No trades recorded for this day.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

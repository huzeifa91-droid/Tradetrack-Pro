import React from 'react';
import { Trade, STRATEGIES } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface AnalyticsProps {
  trades: Trade[];
}

export function Analytics({ trades }: AnalyticsProps) {
  const strategyData = STRATEGIES.map(strategy => {
    const strategyTrades = trades.filter(t => t.strategy === strategy);
    const wins = strategyTrades.filter(t => t.outcome === 'win').length;
    const profit = strategyTrades.reduce((acc, t) => acc + (t.profitLoss || 0), 0);
    const winRate = strategyTrades.length > 0 ? (wins / strategyTrades.length) * 100 : 0;

    return {
      name: strategy,
      trades: strategyTrades.length,
      winRate,
      profit
    };
  }).filter(s => s.trades > 0);

  const bestStrategy = [...strategyData].sort((a, b) => b.profit - a.profit)[0];

  return (
    <div className="space-y-6 lg:space-y-8">
      <h1 className="text-2xl lg:text-3xl font-bold">Strategy Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-3xl p-5 lg:p-8">
          <h3 className="text-base lg:text-lg font-semibold mb-6 lg:mb-8">Profit per Strategy</h3>
          <div className="h-[250px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strategyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                  {strategyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111] border border-white/5 rounded-3xl p-5 lg:p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Top Performer</h3>
            {bestStrategy ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-500 font-bold uppercase">Best Strategy</p>
                  <p className="text-xl lg:text-2xl font-bold mt-1">{bestStrategy.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <p className="text-[10px] text-gray-500 font-medium">Win Rate</p>
                    <p className="text-base lg:text-lg font-bold">{bestStrategy.winRate.toFixed(1)}%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <p className="text-[10px] text-gray-500 font-medium">Total Profit</p>
                    <p className="text-base lg:text-lg font-bold text-emerald-500">${bestStrategy.profit.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm">No data available yet.</p>
            )}
          </div>

          <div className="bg-[#111] border border-white/5 rounded-3xl p-5 lg:p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Win Rate Comparison</h3>
            <div className="space-y-4">
              {strategyData.sort((a, b) => b.winRate - a.winRate).map(s => (
                <div key={s.name} className="space-y-2">
                  <div className="flex justify-between text-xs lg:text-sm">
                    <span className="text-gray-300">{s.name}</span>
                    <span className="font-bold">{s.winRate.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000" 
                      style={{ width: `${s.winRate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

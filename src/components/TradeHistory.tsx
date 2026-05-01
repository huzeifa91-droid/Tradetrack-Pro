import React, { useState } from 'react';
import { Search, Filter, Edit2, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Trade } from '../types';
import { format } from 'date-fns';

interface TradeHistoryProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onView: (trade: Trade) => void;
}

export function TradeHistory({ trades, onEdit, onDelete, onView }: TradeHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPair, setFilterPair] = useState('all');
  const [filterStrategy, setFilterStrategy] = useState('all');

  const filteredTrades = trades.filter(t => {
    const matchesSearch = t.pair.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.strategy?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPair = filterPair === 'all' || t.pair === filterPair;
    const matchesStrategy = filterStrategy === 'all' || t.strategy === filterStrategy;
    return matchesSearch && matchesPair && matchesStrategy;
  });

  const uniquePairs = Array.from(new Set(trades.map(t => t.pair)));
  const uniqueStrategies = Array.from(new Set(trades.filter(t => t.strategy).map(t => t.strategy)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">Trade History</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-200" />
            <input 
              type="text"
              placeholder="Search trades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-surface-300 border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-brand-500 outline-none transition-all w-full sm:w-64 font-medium"
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              value={filterPair}
              onChange={(e) => setFilterPair(e.target.value)}
              className="flex-1 sm:flex-none bg-surface-300 border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none transition-all font-medium"
            >
              <option value="all">All Pairs</option>
              {uniquePairs.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select 
              value={filterStrategy}
              onChange={(e) => setFilterStrategy(e.target.value)}
              className="flex-1 sm:flex-none bg-surface-300 border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:border-brand-500 outline-none transition-all font-medium"
            >
              <option value="all">All Strategies</option>
              {uniqueStrategies.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-surface-200 border border-border-subtle rounded-2xl overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-text-200 text-[11px] font-semibold uppercase tracking-wider border-b border-border-subtle">
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Pair</th>
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Entry</th>
                <th className="px-6 py-5">SL / TP</th>
                <th className="px-6 py-5 text-center">Outcome</th>
                <th className="px-6 py-5 text-right">Profit/Loss</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-medium">
              {filteredTrades.map((trade) => (
                <tr 
                  key={trade.id} 
                  onClick={() => onView(trade)}
                  className="hover:bg-surface-300 transition-colors group cursor-pointer text-sm"
                >
                  <td className="px-6 py-5">
                    <div className="font-semibold text-text-100">{format(new Date(trade.timestamp), 'MMM dd, yyyy')}</div>
                    <div className="text-[10px] text-text-200 uppercase tracking-wider">{format(new Date(trade.timestamp), 'HH:mm')}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {(trade.screenshot || trade.imageUrl) && (
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-border-subtle flex-shrink-0">
                          <img 
                            src={trade.screenshot || trade.imageUrl} 
                            alt="Trade" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-text-100">{trade.pair}</div>
                        <div className="text-[10px] text-text-200 uppercase tracking-wider">{trade.strategy || 'No Strategy'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${
                      trade.type === 'buy' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-text-200 font-semibold">{trade.entryPrice}</td>
                  <td className="px-6 py-5">
                    <div className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">SL: {trade.stopLoss || '-'}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">TP: {trade.takeProfit || '-'}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider ${
                        trade.outcome === 'win' ? 'bg-emerald-500/10 text-emerald-600' : 
                        trade.outcome === 'loss' ? 'bg-red-500/10 text-red-600' : 
                        trade.outcome === 'breakeven' ? 'bg-brand-500/10 text-brand-500' : 'bg-surface-200 text-text-200'
                      }`}>
                        {trade.outcome}
                      </span>
                    </div>
                  </td>
                  <td className={`px-6 py-5 text-right font-semibold tracking-tight text-base ${
                    (trade.profitLoss || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {(trade.profitLoss || 0) >= 0 ? '+' : ''}{trade.profitLoss || 0}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(trade);
                        }}
                        className="p-2 hover:bg-surface-200 rounded-lg text-text-200 hover:text-brand-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(trade.id);
                        }}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-text-200 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden divide-y divide-border-subtle">
          {filteredTrades.map((trade) => (
            <div 
              key={trade.id} 
              onClick={() => onView(trade)}
              className="p-4 active:bg-white/5 transition-colors space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    trade.type === 'buy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {trade.type === 'buy' ? 'B' : 'S'}
                  </div>
                  {(trade.screenshot || trade.imageUrl) && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                      <img 
                        src={trade.screenshot || trade.imageUrl} 
                        alt="Trade" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm">{trade.pair}</h4>
                    <p className="text-[10px] text-gray-500">{format(new Date(trade.timestamp), 'MMM dd, HH:mm')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${
                    (trade.profitLoss || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {(trade.profitLoss || 0) >= 0 ? '+' : ''}{trade.profitLoss || 0}
                  </p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                    trade.outcome === 'win' ? 'bg-emerald-500/10 text-emerald-500' : 
                    trade.outcome === 'loss' ? 'bg-red-500/10 text-red-500' : 
                    trade.outcome === 'breakeven' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    {trade.outcome}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-surface-300/50 rounded-xl border border-border-subtle">
                <div>
                  <p className="text-[9px] text-gray-500 uppercase font-bold">Entry</p>
                  <p className="text-xs font-mono text-gray-300">{trade.entryPrice}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase font-bold">SL</p>
                  <p className="text-xs font-mono text-red-400">{trade.stopLoss || '-'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase font-bold">TP</p>
                  <p className="text-xs font-mono text-emerald-400">{trade.takeProfit || '-'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                  {trade.strategy || 'No Strategy'}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(trade);
                    }}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(trade.id);
                    }}
                    className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTrades.length === 0 && (
          <div className="px-6 py-20 text-center">
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Filter className="w-8 h-8 opacity-20" />
              <p className="text-sm">No trades found matching your filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

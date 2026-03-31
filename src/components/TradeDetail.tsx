import React from 'react';
import { X, Calendar, Tag, TrendingUp, TrendingDown, Clock, FileText, Brain, Target, AlertCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import { Trade } from '../types';
import { format } from 'date-fns';
import { motion } from 'motion/react';

interface TradeDetailProps {
  trade: Trade;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export function TradeDetail({ trade, onClose, onEdit, onDelete }: TradeDetailProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-3xl bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#161616]">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
              trade.type === 'buy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {trade.type === 'buy' ? <TrendingUp /> : <TrendingDown />}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{trade.pair}</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{trade.strategy || 'No Strategy'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onEdit}
              className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            >
              Edit Trade
            </button>
            <button 
              onClick={() => {
                onDelete(trade.id);
                onClose();
              }}
              className="p-2 hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-500 transition-all"
              title="Delete Trade"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DetailStat label="Outcome" value={trade.outcome} color={
              trade.outcome === 'win' ? 'text-emerald-500' : 
              trade.outcome === 'loss' ? 'text-red-500' : 'text-blue-500'
            } />
            <DetailStat label="Profit/Loss" value={`$${trade.profitLoss || 0}`} color={
              (trade.profitLoss || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
            } />
            <DetailStat label="Risk/Reward" value={`1:${trade.riskRewardRatio?.toFixed(2) || '0.00'}`} />
            <DetailStat label="Lot Size" value={trade.lotSize.toString()} />
          </div>

          {/* Trade Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Target className="w-4 h-4" /> Execution Details
              </h3>
              <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Entry Price</span>
                  <span className="font-mono font-bold">{trade.entryPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Stop Loss</span>
                  <span className="font-mono text-red-400">{trade.stopLoss || 'Not Set'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Take Profit</span>
                  <span className="font-mono text-emerald-400">{trade.takeProfit || 'Not Set'}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-gray-400 text-sm">Date & Time</span>
                  <span className="text-sm">{format(new Date(trade.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Brain className="w-4 h-4" /> Psychology & Plan
              </h3>
              <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${(trade.confidence || 0) * 10}%` }}></div>
                    </div>
                    <span className="font-bold">{trade.confidence}/10</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Emotion</span>
                  <span className="font-bold">{trade.emotion || 'Not Recorded'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Followed Plan</span>
                  <span className={`flex items-center gap-1 font-bold ${trade.followedPlan ? 'text-emerald-500' : 'text-red-500'}`}>
                    {trade.followedPlan ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Trading Notes
            </h3>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 min-h-[100px]">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap italic">
                {trade.notes || 'No notes recorded for this trade.'}
              </p>
            </div>
          </div>

          {/* Screenshot Section */}
          {trade.imageUrl && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Trade Screenshot
              </h3>
              <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                <img 
                  src={trade.imageUrl} 
                  alt="Trade Screenshot" 
                  className="w-full object-contain max-h-[500px]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function DetailStat({ label, value, color = 'text-white' }: any) {
  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-bold capitalize ${color}`}>{value}</p>
    </div>
  );
}

import React from 'react';
import { Trade, EMOTIONS } from '../types';
import { Brain, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';

interface PsychologyProps {
  trades: Trade[];
}

export function Psychology({ trades }: PsychologyProps) {
  const followedPlanTrades = trades.filter(t => t.followedPlan);
  const brokenPlanTrades = trades.filter(t => !t.followedPlan);

  const winRateFollowed = followedPlanTrades.length > 0 
    ? (followedPlanTrades.filter(t => t.outcome === 'win').length / followedPlanTrades.length) * 100 
    : 0;
  
  const winRateBroken = brokenPlanTrades.length > 0 
    ? (brokenPlanTrades.filter(t => t.outcome === 'win').length / brokenPlanTrades.length) * 100 
    : 0;

  const emotionPerformance = EMOTIONS.map(emotion => {
    const emotionTrades = trades.filter(t => t.emotion === emotion);
    const winRate = emotionTrades.length > 0 
      ? (emotionTrades.filter(t => t.outcome === 'win').length / emotionTrades.length) * 100 
      : 0;
    return { emotion, winRate, count: emotionTrades.length };
  }).filter(e => e.count > 0);

  const lowConfidenceTrades = trades.filter(t => (t.confidence || 0) < 5);
  const lowConfidenceWinRate = lowConfidenceTrades.length > 0
    ? (lowConfidenceTrades.filter(t => t.outcome === 'win').length / lowConfidenceTrades.length) * 100
    : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Psychology Tracker</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discipline Analysis */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-500" /> Discipline Analysis
          </h3>
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Followed Plan</span>
                <span className="text-emerald-500 font-bold">{winRateFollowed.toFixed(1)}% Win Rate</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${winRateFollowed}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{followedPlanTrades.length} trades followed the plan</p>
            </div>

            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Broke Plan</span>
                <span className="text-red-500 font-bold">{winRateBroken.toFixed(1)}% Win Rate</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${winRateBroken}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{brokenPlanTrades.length} trades broke the plan</p>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" /> AI Insights
          </h3>
          <div className="space-y-4">
            {winRateFollowed > winRateBroken && (
              <InsightCard 
                type="success"
                title="Discipline Pays Off"
                description={`Your win rate is ${(winRateFollowed - winRateBroken).toFixed(1)}% higher when you follow your plan. Keep it up!`}
              />
            )}
            {lowConfidenceWinRate < 40 && lowConfidenceTrades.length > 0 && (
              <InsightCard 
                type="warning"
                title="Confidence Warning"
                description={`You perform significantly worse when your confidence is below 5. Consider skipping these trades.`}
              />
            )}
            {trades.length > 10 && (
              <InsightCard 
                type="info"
                title="Emotion Detection"
                description={`You seem to perform best when you are '${emotionPerformance.sort((a, b) => b.winRate - a.winRate)[0]?.emotion || 'Calm'}'.`}
              />
            )}
            {brokenPlanTrades.length > 3 && (
              <InsightCard 
                type="danger"
                title="Overtrading Risk"
                description="You've broken your plan multiple times recently. This often leads to revenge trading."
              />
            )}
          </div>
        </div>
      </div>

      {/* Emotion Performance */}
      <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
        <h3 className="text-lg font-semibold mb-8">Performance by Emotion</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {EMOTIONS.map(emotion => {
            const stats = emotionPerformance.find(e => e.emotion === emotion);
            return (
              <div key={emotion} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                <p className="text-xs text-gray-500 font-bold uppercase mb-2">{emotion}</p>
                <p className="text-xl font-bold">{stats ? `${stats.winRate.toFixed(0)}%` : '-'}</p>
                <p className="text-[10px] text-gray-600 mt-1">{stats ? `${stats.count} trades` : '0 trades'}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InsightCard({ type, title, description }: any) {
  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    warning: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
    danger: 'bg-red-500/10 border-red-500/20 text-red-500',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
  };

  const icons = {
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: AlertTriangle,
    info: Brain,
  };

  const Icon = icons[type as keyof typeof icons];

  return (
    <div className={`p-4 rounded-2xl border flex gap-4 ${styles[type as keyof typeof styles]}`}>
      <div className="mt-1">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-sm">{title}</h4>
        <p className="text-xs opacity-80 mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

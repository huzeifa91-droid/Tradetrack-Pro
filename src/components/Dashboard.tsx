import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Percent, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Info,
  Activity,
  AlertCircle,
  TrendingUp as TrendingUpIcon,
  Clock,
  Zap,
  Brain,
  AlertTriangle,
  CheckCircle2,
  LayoutDashboard,
  History,
  BarChart3,
  Calendar
} from 'lucide-react';
import { Trade, UserProfile } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { LockedFeature } from './LockedFeature';
import { initializePayment } from '../services/paystackService';

interface DashboardProps {
  trades: Trade[];
  onAddTrade: () => void;
  user: UserProfile | null;
  onUpgrade: () => void;
}

export function Dashboard({ trades, onAddTrade, user, onUpgrade }: DashboardProps) {
  const handleUpgrade = () => {
    if (!user) return;
    initializePayment(user, () => {}, onUpgrade);
  };
  // ... existing stats ...
  const totalProfit = trades.reduce((acc, t) => acc + (t.profitLoss || 0), 0);
  const winRate = trades.length > 0 
    ? (trades.filter(t => t.outcome === 'win').length / trades.length) * 100 
    : 0;
  const totalTrades = trades.length;
  const avgRR = trades.length > 0
    ? trades.reduce((acc, t) => acc + (t.riskRewardRatio || 0), 0) / trades.length
    : 0;

  // AI Insight Logic
  const getInsights = () => {
    const insights = [];
    if (trades.length === 0) {
      insights.push({
        icon: Zap,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        title: 'Start your journey',
        text: 'Record your first trade to begin generating intelligent insights.'
      });
      return insights;
    }

    // 1. Overtrading Detection
    const tradesToday = trades.filter(t => {
      const tradeDate = new Date(t.timestamp).toDateString();
      const today = new Date().toDateString();
      return tradeDate === today;
    });

    if (tradesToday.length > 5) {
      insights.push({
        icon: Activity,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        title: 'Overtrading Alert',
        text: `You've taken ${tradesToday.length} trades today. Consider reducing frequency to maintain focus.`
      });
    }

    // 2. Losing Streak Detection
    let currentStreak = 0;
    for (const trade of trades) {
      if (trade.outcome === 'loss') {
        currentStreak++;
      } else if (trade.outcome === 'win') {
        break;
      }
    }

    if (currentStreak >= 3) {
      insights.push({
        icon: AlertCircle,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        title: 'Losing Streak Detected',
        text: `You are on a ${currentStreak} trade losing streak. Take a break and review your strategy.`
      });
    }

    // 3. Risk-to-Reward Analysis
    if (trades.length >= 5 && avgRR < 1.5) {
      insights.push({
        icon: Target,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        title: 'Low R:R Ratio',
        text: `Your average R:R is ${avgRR.toFixed(2)}. Aim for at least 1.5 to ensure long-term profitability.`
      });
    }

    // 4. Performance Trend
    if (trades.length >= 14) {
      const last7 = trades.slice(0, 7).reduce((acc, t) => acc + (t.profitLoss || 0), 0);
      const prev7 = trades.slice(7, 14).reduce((acc, t) => acc + (t.profitLoss || 0), 0);
      
      if (last7 > prev7) {
        insights.push({
          icon: TrendingUpIcon,
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10',
          title: 'Performance Improving',
          text: 'Your net profit in the last 7 trades is higher than the previous 7. Keep it up!'
        });
      } else if (last7 < prev7) {
        insights.push({
          icon: TrendingDown,
          color: 'text-red-400',
          bg: 'bg-red-400/10',
          title: 'Performance Declining',
          text: 'Your recent performance shows a dip compared to your previous trades. Review your recent entries.'
        });
      }
    }

    // 5. Best Session Analysis
    if (trades.length >= 10) {
      const sessions = {
        Asia: 0,
        London: 0,
        NewYork: 0
      };

      trades.forEach(t => {
        const hour = new Date(t.timestamp).getUTCHours();
        const profit = t.profitLoss || 0;
        
        if (hour >= 0 && hour < 8) sessions.Asia += profit;
        else if (hour >= 8 && hour < 16) sessions.London += profit;
        else if (hour >= 13 && hour < 21) sessions.NewYork += profit;
      });

      const bestSession = Object.entries(sessions).reduce((a, b) => a[1] > b[1] ? a : b);
      if (bestSession[1] > 0) {
        insights.push({
          icon: Clock,
          color: 'text-blue-400',
          bg: 'bg-blue-400/10',
          title: 'Best Trading Session',
          text: `You perform best during the ${bestSession[0]} session. Focus your high-conviction setups here.`
        });
      }
    }

    // Fallback if no specific insights
    if (insights.length === 0) {
      insights.push({
        icon: CheckCircle2,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        title: 'Consistent Trading',
        text: 'No major behavioral issues detected. Maintain your discipline and follow your plan.'
      });
    }

    return insights;
  };

  // Value-based messages for free users
  const valueMessages = [
    "Traders using insights improve faster",
    "Unlock advanced analytics to grow your edge",
    "Consistency is key. Track every trade without limits.",
    "Identify your best trading sessions with Premium."
  ];
  const [valueMessage] = React.useState(() => valueMessages[Math.floor(Math.random() * valueMessages.length)]);

  const insights = getInsights();

  const chartData = [...trades]
    .reverse()
    .reduce((acc: any[], trade, i) => {
      const prevProfit = i > 0 ? acc[i - 1].cumulative : 0;
      acc.push({
        name: format(new Date(trade.timestamp), 'MMM dd'),
        profit: trade.profitLoss || 0,
        cumulative: prevProfit + (trade.profitLoss || 0)
      });
      return acc;
    }, []);

  const pieData = [
    { name: 'Wins', value: trades.filter(t => t.outcome === 'win').length },
    { name: 'Losses', value: trades.filter(t => t.outcome === 'loss').length },
    { name: 'Breakeven', value: trades.filter(t => t.outcome === 'breakeven').length },
  ];

  const COLORS = ['#10B981', '#EF4444', '#3B82F6'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-semibold tracking-tight">Welcome, {user?.displayName?.split(' ')[0] || 'Trader'}</h1>
            {user?.plan === 'premium' && (
              <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full border border-yellow-500/20 shadow-sm">
                <Crown className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Premium</span>
              </div>
            )}
          </div>
          <p className="text-gray-500 mt-2 text-base lg:text-lg font-medium">Your trading edge is growing. Here's the breakdown.</p>
        </div>
        <div className="flex items-center gap-4">
          {user?.plan === 'free' && (
            <button 
              onClick={handleUpgrade}
              className="hidden lg:flex items-center gap-3 bg-surface-200 text-yellow-600 px-6 py-3 rounded-2xl text-[10px] font-semibold uppercase tracking-wider border border-border-subtle hover:bg-surface-300 transition-all shadow-sm"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </button>
          )}
          <button 
            onClick={onAddTrade}
            className="hidden sm:flex bg-brand-500 hover:bg-brand-600 text-white px-8 py-3.5 rounded-2xl font-semibold text-xs uppercase tracking-wider items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Trade
          </button>
        </div>
      </div>

      {/* Subscription Status Card (Free Plan Only) */}
      {user?.plan === 'free' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 premium-card p-5 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 group bg-surface-200 border-border-subtle">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] -z-10 group-hover:bg-blue-500/10 transition-all duration-1000" />
            
            <div className="space-y-4 sm:space-y-6 flex-1 w-full relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-500/10 rounded-xl">
                    <Info className="w-5 h-5 text-brand-500" />
                  </div>
                  <h3 className="font-semibold text-[11px] uppercase tracking-wider text-text-200">
                    {user.tradeCount >= 10 ? 'Monthly Limit Reached' : 'Monthly Trade Limit'}
                  </h3>
                </div>
                <span className={`text-base sm:text-lg font-semibold tracking-tight ${user.tradeCount >= 10 ? 'text-red-500' : 'text-text-100'}`}>
                  {user.tradeCount || 0} <span className="text-gray-500 text-xs sm:text-sm">/ 10</span>
                </span>
              </div>
              <div className="h-3 bg-surface-300 rounded-full overflow-hidden p-0.5 border border-border-subtle">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((user.tradeCount || 0) / 10) * 100, 100)}%` }}
                  className={`h-full rounded-full transition-all duration-1000 ${
                    (user.tradeCount || 0) >= 10 ? 'bg-red-500' : (user.tradeCount || 0) >= 5 ? 'bg-yellow-500' : 'bg-brand-500'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-text-100 font-semibold tracking-tight">
                  {user.tradeCount >= 10 
                    ? "Upgrade to Premium for unlimited trades and insights" 
                    : user.tradeCount >= 5 
                      ? "You've reached your monthly limit" 
                      : valueMessage}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  <Calendar className="w-3 h-3" />
                  Resets in {Math.max(0, 30 - Math.floor((new Date().getTime() - (user.subscriptionStartDate ? new Date(user.subscriptionStartDate).getTime() : 0)) / (1000 * 60 * 60 * 24)))} days
                </div>
              </div>
            </div>
            <button 
              onClick={handleUpgrade}
              className="w-full lg:w-auto bg-text-100 text-surface-100 px-10 py-4 rounded-xl font-semibold text-xs uppercase tracking-wider hover:bg-brand-500 transition-all duration-300 shadow-sm active:scale-95 flex items-center justify-center gap-2 group/btn"
            >
              <Crown className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
              Upgrade to Premium
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 p-8 rounded-[2.5rem] flex flex-col justify-center gap-4 relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <TrendingUp className="w-32 h-32" />
            </div>
            <div className="flex items-center gap-3 text-brand-500">
              <div className="p-2 bg-brand-500/10 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider">Pro Tip</span>
            </div>
            <p className="text-base font-semibold leading-relaxed tracking-tight">
              {valueMessage === "Traders using insights improve faster" 
                ? "Traders using insights improve faster. Unlock advanced analytics to grow your edge."
                : "Unlock advanced analytics to grow your edge. Most successful traders track every detail."}
            </p>
            <button 
              onClick={handleUpgrade}
              className="text-xs font-semibold uppercase tracking-wider text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-2 group/btn mt-2"
            >
              Premium Benefits
              <TrendingUp className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        <StatCard 
          label="Total Profit" 
          value={`$${totalProfit.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: '+12.5%', isPositive: true }}
          color="emerald"
        />
        <StatCard 
          label="Win Rate" 
          value={`${winRate.toFixed(1)}%`}
          icon={Percent}
          trend={{ value: '+2.1%', isPositive: true }}
          color="blue"
        />
        <StatCard 
          label="Total Trades" 
          value={totalTrades}
          icon={Activity}
          trend={{ value: '+5', isPositive: true }}
          color="purple"
        />
        <StatCard 
          label="Avg RR" 
          value={avgRR.toFixed(2)}
          icon={Target}
          trend={{ value: '-0.2', isPositive: false }}
          color="orange"
        />
      </div>

      {/* Charts & Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Equity Curve */}
        <div className="lg:col-span-2 premium-card p-5 sm:p-8 lg:p-10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-blue-500/50" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-500/10 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-brand-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-text-100">Equity Curve</h3>
              </div>
              <p className="text-text-200 text-xs sm:text-sm font-medium">Cumulative profit over time</p>
            </div>
            <div className="flex items-center gap-1 bg-surface-200 p-1 rounded-xl border border-border-subtle self-start sm:self-center overflow-x-auto max-w-full">
              {['7D', '1M', '3M', 'ALL'].map((range) => (
                <button 
                  key={range}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all whitespace-nowrap ${
                    range === 'ALL' ? 'bg-text-100 text-surface-100 shadow-sm' : 'text-text-200 hover:text-text-100'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[250px] sm:h-[400px] w-full relative">
            {user?.plan === 'free' ? (
              <LockedFeature 
                featureName="Advanced Analytics" 
                description="Unlock full equity curve and performance breakdown with Premium."
                onUpgrade={handleUpgrade}
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#888" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--s-100)', 
                      border: '1px solid var(--b-subtle)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                      padding: '12px'
                    }}
                    itemStyle={{ color: 'var(--t-100)', fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ color: 'var(--t-200)', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="var(--color-brand-500)" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: 'var(--color-brand-500)', stroke: 'var(--s-100)', strokeWidth: 3 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI Behavioral Insights */}
        <div className="premium-card p-5 sm:p-8 lg:p-10 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-purple-500/50" />
          <div className="flex items-center justify-between mb-8 sm:mb-10">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold tracking-tight">Smart Insights</h3>
              </div>
              <p className="text-text-200 text-xs sm:text-sm font-medium">AI-driven behavior analysis</p>
            </div>
            <div className="p-2 bg-black/5 rounded-xl border border-border-subtle">
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
          
          <div className="flex-1 relative">
            {user?.plan === 'free' ? (
              <LockedFeature 
                featureName="Smart Insights" 
                description="Get AI-driven feedback on your trading behavior to grow faster."
                onUpgrade={handleUpgrade}
              />
            ) : (
              <div className="space-y-6">
                {insights.map((insight, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-[2rem] bg-surface-300/50 border border-border-subtle hover:bg-surface-300 transition-all group/insight"
                  >
                    <div className="flex items-start gap-5">
                      <div className={`p-4 rounded-2xl ${insight.bg} ${insight.color} group-hover/insight:scale-110 transition-transform duration-500`}>
                        <insight.icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-sm tracking-tight">{insight.title}</h4>
                        <p className="text-gray-400 text-xs leading-relaxed font-medium">{insight.text}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {insights.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
                    <div className="p-6 bg-white/5 rounded-full">
                      <Activity className="w-10 h-10 text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">No insights available yet. Keep trading to unlock AI feedback.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {user?.plan === 'premium' && (
            <button className="mt-8 w-full py-4 rounded-2xl bg-surface-300/50 border border-border-subtle text-[10px] font-black uppercase tracking-widest text-text-200 hover:bg-surface-300 hover:text-text-100 transition-all">
              Refresh Analysis
            </button>
          )}
        </div>
      </div>

      {/* Recent Trades */}
      <div className="premium-card overflow-hidden group">
        <div className="p-8 lg:p-10 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 rounded-xl">
              <History className="w-5 h-5 text-brand-500" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight">Recent Activity</h3>
          </div>
          <button className="text-[11px] font-semibold uppercase tracking-wider text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-2 group/btn">
            View History
            <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-text-200 text-[11px] font-semibold uppercase tracking-wider border-b border-border-subtle">
                <th className="px-10 py-6">Asset Pair</th>
                <th className="px-10 py-6">Type</th>
                <th className="px-10 py-6">Entry</th>
                <th className="px-10 py-6 text-center">Outcome</th>
                <th className="px-10 py-6 text-right">Profit/Loss</th>
                <th className="px-10 py-6 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-medium">
              {trades.slice(0, 5).map((trade, i) => (
                <motion.tr 
                  key={trade.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-surface-200 transition-colors group/row text-sm"
                >
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-200 flex items-center justify-center font-semibold text-[11px] group-hover/row:bg-brand-500/10 group-hover/row:text-brand-500 transition-colors text-text-100">
                        {trade.pair.substring(0, 2)}
                      </div>
                      <span className="font-semibold tracking-tight">{trade.pair}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider ${
                      trade.type === 'buy' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-text-200">{trade.entryPrice}</td>
                  <td className="px-10 py-6">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider ${
                        trade.outcome === 'win' ? 'bg-emerald-500/10 text-emerald-600' : 
                        trade.outcome === 'loss' ? 'bg-red-500/10 text-red-600' : 'bg-brand-500/10 text-brand-500'
                      }`}>
                        {trade.outcome}
                      </span>
                    </div>
                  </td>
                  <td className={`px-10 py-6 text-right font-semibold tracking-tight text-base ${
                    (trade.profitLoss || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {(trade.profitLoss || 0) >= 0 ? '+' : ''}{trade.profitLoss}
                  </td>
                  <td className="px-10 py-6 text-right text-text-200 text-[10px] uppercase tracking-wider">
                    {format(new Date(trade.timestamp), 'MMM dd, HH:mm')}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden divide-y divide-border-subtle">
          {trades.slice(0, 5).map((trade) => (
            <div key={trade.id} className="p-6 flex items-center justify-between active:bg-surface-300/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${
                  trade.type === 'buy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {trade.type === 'buy' ? 'B' : 'S'}
                </div>
                <div>
                  <h4 className="font-black text-base tracking-tight">{trade.pair}</h4>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{format(new Date(trade.timestamp), 'MMM dd, HH:mm')}</p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className={`font-black text-lg tracking-tighter ${
                  (trade.profitLoss || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {(trade.profitLoss || 0) >= 0 ? '+' : ''}{trade.profitLoss}
                </p>
                <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg inline-block ${
                  trade.outcome === 'win' ? 'bg-emerald-500/10 text-emerald-500' : 
                  trade.outcome === 'loss' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {trade.outcome}
                </div>
              </div>
            </div>
          ))}
        </div>

        {trades.length === 0 && (
          <div className="px-10 py-20 text-center space-y-4">
            <div className="p-6 bg-white/5 rounded-full inline-block">
              <History className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No trades recorded yet. Start by adding your first trade!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: string;
}

function StatCard({ label, value, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="premium-card p-6 lg:p-8 group"
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-600`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide ${
            trend.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
            {trend.value}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

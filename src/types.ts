export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  riskPreference?: number;
  accountBalance?: number;
  theme?: 'dark' | 'light';
  plan?: 'free' | 'premium';
  tradeCount?: number;
  subscriptionStartDate?: string;
}

export interface Trade {
  id: string;
  userId: string;
  pair: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  stopLoss: number;
  takeProfit?: number;
  lotSize: number;
  timestamp: string;
  strategy?: string;
  notes?: string;
  screenshotUrl?: string;
  confidence: number;
  emotion?: string;
  followedPlan: boolean;
  outcome: 'win' | 'loss' | 'breakeven' | 'open';
  profitLoss?: number;
  riskRewardRatio?: number;
  riskMode?: 'amount' | 'lot';
  riskAmount?: number;
  riskPercentage?: number;
  screenshot?: string;
  imageUrl?: string;
}

export const STRATEGIES = [
  'Breakout',
  'Trend Following',
  'Mean Reversion',
  'Scalping',
  'Swing Trading',
  'Price Action',
  'Fibonacci Retracement',
  'Support & Resistance'
];

export const EMOTIONS = [
  'Calm',
  'Fear',
  'Greed',
  'Excited',
  'Anxious',
  'Frustrated',
  'Confident'
];

export const PAIRS = [
  'XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'BTCUSD', 'ETHUSD'
];

import React from 'react';
import { X, AlertCircle, TrendingUp, TrendingDown, Clock, Tag, FileText, Brain, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Trade, STRATEGIES, EMOTIONS, PAIRS } from '../types';
import { motion } from 'motion/react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebase';
import { toast } from 'sonner';

const tradeSchema = z.object({
  pair: z.string().min(1, 'Required'),
  type: z.enum(['buy', 'sell']),
  entryPrice: z.number().min(0.00000001),
  stopLoss: z.number().min(0.00000001, 'Stop Loss is required for risk management'),
  takeProfit: z.number().optional(),
  lotSize: z.number().min(0.01),
  riskMode: z.enum(['amount', 'lot']).default('amount'),
  riskAmount: z.number().optional(),
  riskPercentage: z.number().optional(),
  strategy: z.string().optional(),
  notes: z.string().optional(),
  confidence: z.number().min(1).max(10),
  emotion: z.string().optional(),
  followedPlan: z.boolean().default(true),
  outcome: z.enum(['win', 'loss', 'breakeven', 'open']).default('open'),
  profitLoss: z.number().optional(),
  riskRewardRatio: z.number().optional(),
  imageUrl: z.string().optional(),
});

interface TradeFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Trade | null;
  accountBalance?: number;
}

export function TradeForm({ onClose, onSubmit, initialData, accountBalance = 10000, userPlan = 'free', tradeCount = 0 }: TradeFormProps & { userPlan?: string, tradeCount?: number }) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(initialData?.imageUrl || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(tradeSchema),
    defaultValues: initialData || {
      pair: 'XAUUSD',
      type: 'buy',
      lotSize: 0.1,
      riskMode: 'amount',
      riskAmount: 100,
      confidence: 5,
      followedPlan: true,
      outcome: 'open'
    }
  });

  const entryPrice = watch('entryPrice');
  const stopLoss = watch('stopLoss');
  const takeProfit = watch('takeProfit');
  const type = watch('type');
  const lotSize = watch('lotSize');
  const riskMode = watch('riskMode');
  const riskAmount = watch('riskAmount');
  const outcome = watch('outcome');
  const pair = watch('pair');

  // Contract size helper
  const getContractSize = (p: string) => {
    if (p === 'XAUUSD') return 100;
    if (p.includes('USD') && !p.startsWith('BTC') && !p.startsWith('ETH')) return 100000;
    if (p.startsWith('BTC') || p.startsWith('ETH')) return 1;
    return 100000; // Default to forex
  };

  // Real-time risk calculations
  React.useEffect(() => {
    if (!entryPrice || !stopLoss || !pair) return;

    const pips = Math.abs(entryPrice - stopLoss);
    if (pips === 0) return;

    const contractSize = getContractSize(pair);

    if (riskMode === 'amount' && riskAmount) {
      // Calculate Lot Size from Risk Amount
      // Risk = LotSize * Pips * ContractSize
      // LotSize = Risk / (Pips * ContractSize)
      const calculatedLotSize = riskAmount / (pips * contractSize);
      setValue('lotSize', Number(calculatedLotSize.toFixed(2)));
      
      const riskPct = (riskAmount / accountBalance) * 100;
      setValue('riskPercentage', Number(riskPct.toFixed(2)));
    } else if (riskMode === 'lot' && lotSize) {
      // Calculate Risk Amount from Lot Size
      const calculatedRiskAmount = lotSize * pips * contractSize;
      setValue('riskAmount', Number(calculatedRiskAmount.toFixed(2)));
      
      const riskPct = (calculatedRiskAmount / accountBalance) * 100;
      setValue('riskPercentage', Number(riskPct.toFixed(2)));
    }
  }, [entryPrice, stopLoss, riskAmount, lotSize, riskMode, pair, accountBalance, setValue]);

  // Auto calculate RR
  const calculateRR = () => {
    if (!entryPrice || !stopLoss || !takeProfit) return 0;
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);
    if (risk === 0) return 0;
    return reward / risk;
  };

  const rr = calculateRR();
  const riskPercentage = watch('riskPercentage');

  // Sync RR to form state
  React.useEffect(() => {
    setValue('riskRewardRatio', rr);
  }, [rr, setValue]);

  // Auto calculate Profit/Loss
  React.useEffect(() => {
    if (outcome === 'open') {
      setValue('profitLoss', 0);
      return;
    }

    if (outcome === 'breakeven') {
      setValue('profitLoss', 0);
      return;
    }

    if (!entryPrice || !lotSize) return;

    let exitPrice = 0;
    if (outcome === 'win' && takeProfit) {
      exitPrice = takeProfit;
    } else if (outcome === 'loss' && stopLoss) {
      exitPrice = stopLoss;
    }

    if (exitPrice) {
      const contractSize = getContractSize(pair);
      let pl = 0;
      if (type === 'buy') {
        pl = (exitPrice - entryPrice) * lotSize * contractSize;
      } else {
        pl = (entryPrice - exitPrice) * lotSize * contractSize;
      }
      setValue('profitLoss', Number(pl.toFixed(2)));
    }
  }, [entryPrice, stopLoss, takeProfit, lotSize, type, outcome, pair, setValue]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Limit to 10MB before compression
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    try {
      console.log('Starting upload process for file:', file.name);
      
      if (!auth.currentUser) {
        throw new Error('User is not authenticated. Please log in again.');
      }

      // Simple client-side compression using Canvas
      console.log('Compressing image...');
      const compressedFile = await compressImage(file);
      console.log('Compression complete. Original size:', file.size, 'Compressed size:', compressedFile.size);
      
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `trades/${auth.currentUser.uid}/${fileName}`);
      
      console.log('Uploading to path:', storageRef.fullPath);
      const snapshot = await uploadBytes(storageRef, compressedFile);
      console.log('Upload successful. Metadata:', snapshot.metadata);
      
      const url = await getDownloadURL(snapshot.ref);
      console.log('Download URL retrieved:', url);
      
      setPreviewUrl(url);
      setValue('imageUrl', url);
      toast.success('Screenshot uploaded successfully');
    } catch (error: any) {
      console.error('Upload error details:', error);
      const errorMessage = error.message || 'Failed to upload screenshot. Please check your connection.';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas to Blob failed'));
            },
            'image/jpeg',
            0.8 // 80% quality
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const removeScreenshot = () => {
    setPreviewUrl(null);
    setValue('imageUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
        className="relative w-full max-w-2xl bg-surface-100 border-x border-t sm:border border-border-subtle rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col mt-auto sm:mt-0"
      >
        <div className="px-6 py-5 sm:p-6 border-b border-border-subtle flex items-center justify-between bg-surface-200 sticky top-0 z-10 shrink-0">
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-text-100">{initialData ? 'Edit Trade' : 'Record New Trade'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-300 rounded-full transition-colors">
            <X className="w-5 h-5 text-text-200" />
          </button>
        </div>

        <form id="trade-form" onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 overflow-y-auto space-y-6 sm:space-y-8 flex-1">
          {userPlan === 'free' && tradeCount >= 5 && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${tradeCount >= 10 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold uppercase tracking-wider">
                  {tradeCount >= 10 ? 'Monthly Limit Reached' : 'Approaching Limit'}
                </p>
                <p className="text-[10px] opacity-80 leading-relaxed">
                  {tradeCount >= 10 
                    ? "Upgrade to Premium for unlimited trades and insights." 
                    : `You have used ${tradeCount} of your 10 monthly trades.`}
                </p>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-text-200 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Trading Pair
              </label>
              <select 
                {...register('pair')}
                className="w-full bg-surface-300 border border-border-subtle rounded-xl px-4 py-3 sm:py-3 focus:border-blue-500 outline-none transition-all text-sm text-text-100"
              >
                {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-text-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Trade Type
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-surface-300 rounded-xl border border-border-subtle">
                <button
                  type="button"
                  onClick={() => setValue('type', 'buy')}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'buy' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-text-200 hover:text-text-100'}`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setValue('type', 'sell')}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'sell' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-text-200 hover:text-text-100'}`}
                >
                  SELL
                </button>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400">Entry Price</label>
              <input 
                type="number" step="any"
                {...register('entryPrice', { valueAsNumber: true })}
                className="w-full bg-surface-300 border border-border-subtle rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-sm text-text-100"
              />
              {errors.entryPrice && <p className="text-[10px] text-red-500">{errors.entryPrice.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400">Stop Loss</label>
              <input 
                type="number" step="any"
                {...register('stopLoss', { valueAsNumber: true })}
                className="w-full bg-surface-300 border border-border-subtle rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-sm text-text-100"
              />
              {errors.stopLoss && <p className="text-[10px] text-red-500">{errors.stopLoss.message}</p>}
              {!stopLoss && !errors.stopLoss && <p className="text-[10px] text-orange-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Risking account!</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400">Take Profit</label>
              <input 
                type="number" step="any"
                {...register('takeProfit', { valueAsNumber: true })}
                className="w-full bg-surface-300 border border-border-subtle rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-sm text-text-100"
              />
            </div>
          </div>

          {/* Risk Management Section */}
          <div className="space-y-4 pt-4 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Risk Management
              </h3>
              <div className="flex bg-surface-300 p-1 rounded-lg border border-border-subtle">
                <button
                  type="button"
                  onClick={() => setValue('riskMode', 'amount')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${riskMode === 'amount' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
                >
                  RISK $
                </button>
                <button
                  type="button"
                  onClick={() => setValue('riskMode', 'lot')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${riskMode === 'lot' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
                >
                  LOT SIZE
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">Risk Amount ($)</label>
                  {riskMode === 'lot' && <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Auto</span>}
                </div>
                <input 
                  type="number" step="any"
                  {...register('riskAmount', { valueAsNumber: true })}
                  disabled={riskMode === 'lot'}
                  className={`w-full bg-surface-300 border border-border-subtle rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-sm text-text-100 ${riskMode === 'lot' ? 'opacity-50 font-mono text-blue-400' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">Lot Size</label>
                  {riskMode === 'amount' && <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Auto</span>}
                </div>
                <input 
                  type="number" step="0.01"
                  {...register('lotSize', { valueAsNumber: true })}
                  disabled={riskMode === 'amount'}
                  className={`w-full bg-surface-300 border border-border-subtle rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-sm text-text-100 ${riskMode === 'amount' ? 'opacity-50 font-mono text-blue-400' : ''}`}
                />
              </div>
            </div>

            {riskPercentage !== undefined && (
              <div className={`p-3 rounded-xl border flex items-center justify-between ${riskPercentage > 5 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/5 border-blue-500/20 text-blue-400'}`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Risk Percentage: {riskPercentage}%</span>
                </div>
                {riskPercentage > 5 && (
                  <span className="text-[10px] font-bold uppercase tracking-tighter">High Risk Warning!</span>
                )}
              </div>
            )}
          </div>

          {/* Risk Summary Card */}
          {(entryPrice && stopLoss && takeProfit) && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center">
                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-wider">Risk</p>
                <p className="text-sm sm:text-lg font-mono text-red-400 truncate">{Math.abs(entryPrice - stopLoss).toFixed(5)}</p>
              </div>
              <div className="text-center border-x border-white/5">
                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-wider">Reward</p>
                <p className="text-sm sm:text-lg font-mono text-emerald-400 truncate">{Math.abs(takeProfit - entryPrice).toFixed(5)}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-wider">R:R</p>
                <p className="text-sm sm:text-lg font-mono text-blue-400">1:{rr.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Strategy */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Strategy
              </label>
              <select 
                {...register('strategy')}
                className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-sm"
              >
                <option value="">Select Strategy</option>
                {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Psychology */}
          <div className="space-y-6 pt-4 border-t border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Brain className="w-4 h-4" /> Psychology & Plan
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400">Confidence (1-10)</label>
                <input 
                  type="range" min="1" max="10"
                  {...register('confidence', { valueAsNumber: true })}
                  className="w-full accent-blue-500 h-6"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                  <span>LOW</span>
                  <span>HIGH</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400">Emotion</label>
                <select 
                  {...register('emotion')}
                  className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-sm"
                >
                  <option value="">How do you feel?</option>
                  {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
              <input 
                type="checkbox" 
                id="followedPlan"
                {...register('followedPlan')}
                className="w-6 h-6 rounded border-white/10 bg-[#1A1A1A] text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="followedPlan" className="text-sm font-medium text-gray-300 cursor-pointer flex-1">
                I followed my trading plan strictly
              </label>
            </div>
          </div>

          {/* Outcome (Optional for new trades) */}
          <div className="space-y-6 pt-4 border-t border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Outcome Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400">Outcome</label>
                <select 
                  {...register('outcome')}
                  className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-sm"
                >
                  <option value="open">Open</option>
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="breakeven">Breakeven</option>
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">Profit/Loss ($)</label>
                  <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Auto</span>
                </div>
                <input 
                  type="number" step="any"
                  {...register('profitLoss', { valueAsNumber: true })}
                  className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all font-mono text-blue-400 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Notes
            </label>
            <textarea 
              {...register('notes')}
              rows={4}
              placeholder="Why did you take this trade? Any lessons learned?"
              className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all resize-none text-sm"
            />
          </div>

          {/* Screenshot Upload */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Trade Screenshot
            </label>
            
            {previewUrl ? (
              <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <img 
                  src={previewUrl} 
                  alt="Trade Screenshot" 
                  className="w-full aspect-video object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                    title="Change Screenshot"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="p-3 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-500 transition-all"
                    title="Remove Screenshot"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full aspect-video border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
              >
                <div className="p-4 bg-white/5 rounded-full group-hover:bg-blue-500/10 transition-all">
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 text-gray-500 group-hover:text-blue-500" />
                  )}
                </div>
                <div className="text-center p-4">
                  <p className="text-sm font-bold text-gray-400 group-hover:text-gray-200">
                    {isUploading ? 'Uploading...' : 'Click to upload screenshot'}
                  </p>
                  <p className="text-xs text-gray-600">Supports JPG, PNG (Max 5MB)</p>
                </div>
              </button>
            )}
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </form>

        <div className="p-4 sm:p-6 bg-surface-200 border-t border-border-subtle sticky bottom-0 z-10">
          <button 
            type="submit"
            form="trade-form"
            onClick={handleSubmit(onSubmit)}
            disabled={isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            {isUploading ? 'Uploading Screenshot...' : (initialData ? 'Update Trade' : 'Save Trade')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

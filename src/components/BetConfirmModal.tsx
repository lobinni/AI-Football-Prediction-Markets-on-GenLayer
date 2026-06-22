import React, { useEffect, useState } from 'react';
import { t } from '../data/mockData';
import { UseWalletResult, BetFeeEstimate } from '../hooks/useWallet';
import { PredictionMarketContract } from '../types';
import { X, Loader2, Fuel, Wallet, ArrowRight, ShieldCheck } from 'lucide-react';

interface BetConfirmModalProps {
  market: PredictionMarketContract;
  choice: number;
  amount: number;
  wallet: UseWalletResult;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export const BetConfirmModal: React.FC<BetConfirmModalProps> = ({
  market,
  choice,
  amount,
  wallet,
  onConfirm,
  onClose,
}) => {
  const [fee, setFee] = useState<BetFeeEstimate | null>(null);
  const [loadingFee, setLoadingFee] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const choiceLabel = choice === 1 ? market.team1 : choice === 2 ? market.team2 : t.draw;

  const evmAddr = market.evmContractAddress;
  const isContractBet = !!evmAddr && /^0x[a-fA-F0-9]{40}$/.test(evmAddr) && evmAddr !== '0x0000000000000000000000000000000000000000';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingFee(true);
      const est = isContractBet
        ? await wallet.estimateContractBetFee(evmAddr!, choice, amount)
        : await wallet.estimateBetFeeDetailed(amount);
      if (!cancelled) {
        setFee(est);
        setLoadingFee(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [amount, choice, evmAddr, isContractBet, wallet]);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  const isAwaiting = wallet.txStatus === 'awaiting_signature' || wallet.txStatus === 'estimating';
  const isPending = wallet.txStatus === 'pending';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-base text-slate-100">{t.confirmBetTitle}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">{t.confirmBetDesc}</p>

          <div className={`flex items-center space-x-2 text-[11px] font-semibold px-3 py-2 rounded-lg border ${
            isContractBet
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {isContractBet
                ? `Calling placeBet() on ${evmAddr!.substring(0, 8)}...${evmAddr!.substring(38)}`
                : 'Native GEN transfer (no contract address set)'}
            </span>
          </div>

          {/* Match + choice */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
            <div className="text-sm">
              <div className="text-slate-400 text-xs">{market.team1} vs {market.team2}</div>
              <div className="font-bold text-cyan-400 mt-0.5">{choiceLabel}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase">{t.betStakeRow}</div>
              <div className="font-extrabold text-white">{amount} GEN</div>
            </div>
          </div>

          {/* Fee breakdown */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/70">
            {loadingFee ? (
              <div className="p-4 flex items-center justify-center space-x-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{t.calculatingFee}</span>
              </div>
            ) : fee ? (
              <>
                <Row label={t.betStakeRow} value={`${amount} GEN`} />
                <Row label={t.gasLimitRow} value={fee.gasLimit} mono />
                <Row label={t.gasPriceRow} value={`${fee.gasPriceGwei} Gwei`} mono />
                <Row
                  label={t.networkFeeRow}
                  value={`~ ${fee.feeGen} GEN`}
                  icon={<Fuel className="w-3.5 h-3.5 text-amber-400" />}
                  highlight="amber"
                />
                <Row label={t.totalRow} value={`${fee.totalGen} GEN`} highlight="cyan" bold />
              </>
            ) : (
              <div className="p-4 text-center text-xs text-rose-400">
                Could not estimate fee from network.
              </div>
            )}
          </div>

          {/* On-chain balance */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="flex items-center space-x-1 text-slate-400">
              <Wallet className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.onchainBalance}</span>
            </span>
            <span className="font-mono font-bold text-slate-200">{wallet.balance} GEN</span>
          </div>

          {/* Status line */}
          {(isAwaiting || isPending) && (
            <div className="flex items-center space-x-2 text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 rounded-lg p-2.5">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isAwaiting ? t.txAwaitingSig : t.txBroadcasting}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center space-x-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm border border-slate-700 disabled:opacity-40 transition-colors"
          >
            {t.cancelBtn}
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || loadingFee}
            className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold rounded-xl text-sm shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2 transition-all"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{t.signSendBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
  icon?: React.ReactNode;
  highlight?: 'amber' | 'cyan';
}> = ({ label, value, mono, bold, icon, highlight }) => (
  <div className="flex items-center justify-between p-3 text-xs">
    <span className="flex items-center space-x-1.5 text-slate-400">
      {icon}
      <span>{label}</span>
    </span>
    <span
      className={`${mono ? 'font-mono' : ''} ${bold ? 'font-extrabold' : 'font-bold'} ${
        highlight === 'amber' ? 'text-amber-400' : highlight === 'cyan' ? 'text-cyan-400' : 'text-slate-200'
      }`}
    >
      {value}
    </span>
  </div>
);

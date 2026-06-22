import React, { useState, useEffect } from 'react';
import { PredictionMarketContract } from '../types';
import { t } from '../data/mockData';
import { UseWalletResult } from '../hooks/useWallet';
import { Trophy, Cpu, ExternalLink, TrendingUp, CheckCircle2, AlertCircle, Fuel } from 'lucide-react';

interface MarketCardProps {
  market: PredictionMarketContract;
  wallet: UseWalletResult;
  onBet: (marketId: string, choice: number, amount: number) => void;
  onStartSimulation: (marketId: string) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  market,
  wallet,
  onBet,
  onStartSimulation,
}) => {
  const [betChoice, setBetChoice] = useState<number>(1);
  const [stakeAmount, setStakeAmount] = useState<string>('500');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [estimatedFee, setEstimatedFee] = useState<string>('');
  const [feeLoading, setFeeLoading] = useState<boolean>(false);

  // Estimate the network gas fee (in GEN) whenever the stake changes
  useEffect(() => {
    let cancelled = false;
    const amount = parseFloat(stakeAmount);
    if (!wallet.isConnected || !wallet.isCorrectNetwork || isNaN(amount) || amount <= 0) {
      setEstimatedFee('');
      return;
    }

    setFeeLoading(true);
    const timer = setTimeout(async () => {
      const fee = await wallet.estimateBetFee(amount);
      if (!cancelled) {
        setEstimatedFee(fee);
        setFeeLoading(false);
      }
    }, 500); // debounce

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [stakeAmount, wallet.isConnected, wallet.isCorrectNetwork, wallet]);

  const totalPool = market.totalPool;
  const calcOdds = (pool: number) => {
    if (pool === 0) return '1.0x';
    return (totalPool / pool).toFixed(2) + 'x';
  };

  const handleBetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Invalid amount');
      return;
    }
    setErrorMsg('');
    onBet(market.id, betChoice, amount);
  };

  const getChoiceLabel = (choice: number) => {
    if (choice === 1) return market.team1;
    if (choice === 2) return market.team2;
    return t.draw;
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 shadow-xl overflow-hidden transition-all duration-300 flex flex-col justify-between">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-slate-800 text-cyan-400 rounded-full border border-slate-700">
            {market.league}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">{market.gameDate}</span>
            {market.hasResolved ? (
              <span className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.resolvedTag}</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 px-2.5 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded-lg border border-cyan-500/30">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                <span>{t.activeTag}</span>
              </span>
            )}
          </div>
        </div>

        {/* Matchup Header */}
        <div className="grid grid-cols-3 items-center gap-2 pt-2 pb-1 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-900 to-slate-800 flex items-center justify-center font-bold text-lg text-white mb-2 shadow-md border border-cyan-500/30">
              {market.team1.charAt(0)}
            </div>
            <span className="font-bold text-slate-100 text-sm sm:text-base line-clamp-1">{market.team1}</span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="text-xs font-bold text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded-md">VS</div>
            {market.hasResolved && market.score && (
              <div className="mt-2 text-xl font-extrabold text-cyan-400 tracking-wider bg-slate-900 px-3 py-1 rounded-lg border border-cyan-500/40 shadow-inner">
                {market.score}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-900 to-slate-800 flex items-center justify-center font-bold text-lg text-white mb-2 shadow-md border border-indigo-500/30">
              {market.team2.charAt(0)}
            </div>
            <span className="font-bold text-slate-100 text-sm sm:text-base line-clamp-1">{market.team2}</span>
          </div>
        </div>

        {/* Contract & Resolution URL info */}
        <div className="mt-4 pt-3 border-t border-slate-800/50 flex flex-col space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span>Contract:</span>
            <span className="font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {market.contractAddress.substring(0, 12)}...{market.contractAddress.substring(34)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>AI Target:</span>
            <a
              href={market.resolutionUrl}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 inline-flex items-center space-x-1 truncate max-w-[220px]"
            >
              <span className="truncate">{market.resolutionUrl.replace('https://www.', '')}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
        {/* Total Pool & Estimated Odds */}
        <div>
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.odds}</span>
            </span>
            <span className="font-bold text-slate-200">
              {t.poolTotal}: <span className="text-cyan-400">{market.totalPool.toLocaleString()} $GEN</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400 font-medium truncate mb-1">{market.team1}</div>
              <div className="font-bold text-sm text-cyan-400">{calcOdds(market.poolTeam1)}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{market.poolTeam1.toLocaleString()} $GEN</div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400 font-medium mb-1">{t.draw}</div>
              <div className="font-bold text-sm text-yellow-400">{calcOdds(market.poolDraw)}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{market.poolDraw.toLocaleString()} $GEN</div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400 font-medium truncate mb-1">{market.team2}</div>
              <div className="font-bold text-sm text-indigo-400">{calcOdds(market.poolTeam2)}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{market.poolTeam2.toLocaleString()} $GEN</div>
            </div>
          </div>
        </div>

        {/* Existing user bet notice */}
        {market.myBet && (
          <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              <span className="text-slate-300">
                Your Stake: <strong className="text-cyan-400">{getChoiceLabel(market.myBet.choice)}</strong>
              </span>
            </div>
            <span className="font-bold text-white">{market.myBet.amount.toLocaleString()} $GEN</span>
          </div>
        )}

        {/* Action Controls */}
        {!market.hasResolved ? (
          <div className="space-y-4">
            <form onSubmit={handleBetSubmit} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300">{t.selectWinner}</div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBetChoice(1)}
                  className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all truncate ${
                    betChoice === 1
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {market.team1}
                </button>
                <button
                  type="button"
                  onClick={() => setBetChoice(0)}
                  className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                    betChoice === 0
                      ? 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {t.draw}
                </button>
                <button
                  type="button"
                  onClick={() => setBetChoice(2)}
                  className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all truncate ${
                    betChoice === 2
                      ? 'bg-indigo-500 text-slate-950 border-indigo-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {market.team2}
                </button>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">{t.enterAmount}</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min="1"
                    step="1"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs transition-transform active:scale-95 shadow-md"
                  >
                    {t.btnPlaceBet}
                  </button>
                </div>
                {errorMsg && (
                  <div className="text-rose-400 text-xs mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Suggested network gas fee from GenLayer Testnet */}
                {wallet.isConnected && wallet.isCorrectNetwork && (
                  <div className="mt-2 flex items-center justify-between text-[11px] bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Fuel className="w-3 h-3 text-amber-400" />
                      <span>{t.estimatedFee}</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      {feeLoading
                        ? '...'
                        : estimatedFee && parseFloat(estimatedFee) > 0
                          ? `~ ${estimatedFee} GEN`
                          : '—'}
                    </span>
                  </div>
                )}
              </div>
            </form>

            <button
              onClick={() => onStartSimulation(market.id)}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-800 hover:from-indigo-900 hover:to-slate-700 text-indigo-200 hover:text-white border border-indigo-500/40 rounded-xl py-3 font-semibold text-sm transition-all group shadow-lg"
            >
              <Cpu className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>{t.btnResolve}</span>
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-4 rounded-xl border border-emerald-500/30 flex flex-col items-center text-center space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>
                {market.winner === 1 && `${market.team1} Won!`}
                {market.winner === 2 && `${market.team2} Won!`}
                {market.winner === 0 && `Match Ended in Draw`}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Contract successfully resolved via GenLayer AI Consensus. Winners can claim payouts in the Wallet tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

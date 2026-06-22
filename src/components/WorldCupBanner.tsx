import React from 'react';
import { PredictionMarketContract } from '../types';
import { t } from '../data/mockData';
import { UseWalletResult } from '../hooks/useWallet';
import { MarketCard } from './MarketCard';
import { Trophy, Radio, CalendarDays, CheckCircle2, Clock } from 'lucide-react';

interface WorldCupBannerProps {
  markets: PredictionMarketContract[];
  wallet: UseWalletResult;
  onBet: (marketId: string, choice: number, amount: number) => void;
  onStartSimulation: (marketId: string) => void;
}

const todayLabel = () =>
  new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const WorldCupBanner: React.FC<WorldCupBannerProps> = ({
  markets,
  wallet,
  onBet,
  onStartSimulation,
}) => {
  if (markets.length === 0) return null;

  // Split into played (resolved) and upcoming
  const played = markets.filter((m) => m.hasResolved);
  const upcoming = markets.filter((m) => !m.hasResolved);

  const renderGrid = (list: PredictionMarketContract[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {list.map((market) => (
        <MarketCard
          key={market.id}
          market={market}
          wallet={wallet}
          onBet={onBet}
          onStartSimulation={onStartSimulation}
        />
      ))}
    </div>
  );

  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 shadow-2xl">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-emerald-950" />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl animate-pulse-glow" />

      <div className="relative p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-tr from-amber-400 to-yellow-600 rounded-2xl shadow-lg shadow-amber-500/30">
              <Trophy className="w-8 h-8 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  {t.worldCupTitle}
                </h2>
                <span className="flex items-center space-x-1 px-2.5 py-1 bg-rose-500/20 text-rose-300 text-[10px] font-extrabold rounded-lg border border-rose-500/40 uppercase tracking-wider">
                  <Radio className="w-3 h-3 animate-ping" />
                  <span>{t.worldCupTag}</span>
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">{t.worldCupSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-amber-300/80 text-3xl sm:text-4xl">
            🇺🇸 🇲🇽 🇨🇦
          </div>
        </div>

        {/* Today bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-5 px-4 py-2.5 bg-slate-950/50 rounded-xl border border-amber-500/20">
          <div className="flex items-center space-x-2 text-sm font-bold text-amber-200">
            <CalendarDays className="w-4 h-4 text-amber-400" />
            <span>{t.worldCupToday}</span>
            <span className="text-slate-400 font-normal text-xs">• {todayLabel()}</span>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{played.length} {t.worldCupFinished}</span>
            </span>
            <span className="flex items-center space-x-1 text-cyan-300">
              <Clock className="w-3.5 h-3.5" />
              <span>{upcoming.length} {t.worldCupUpcoming}</span>
            </span>
          </div>
        </div>

        {/* Upcoming matches first (most relevant to bet on) */}
        {upcoming.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
              <Clock className="w-3.5 h-3.5" />
              <span>{t.worldCupUpcoming}</span>
            </div>
            {renderGrid(upcoming)}
          </div>
        )}

        {/* Played matches */}
        {played.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.worldCupFinished}</span>
            </div>
            {renderGrid(played)}
          </div>
        )}
      </div>
    </section>
  );
};

import React from 'react';
import { t } from '../data/mockData';
import {
  UseDailyFaucetResult,
  MILESTONE_BONUS,
  BASE_REWARD,
  STREAK_BONUS,
  MAX_STREAK_BONUS_DAYS,
} from '../hooks/useDailyFaucet';
import { Gift, Flame, Coins, CheckCircle2, Calendar, Trophy, Sparkles, Clock } from 'lucide-react';

interface DailyFaucetProps {
  faucet: UseDailyFaucetResult;
  onClaim: () => void;
}

export const DailyFaucet: React.FC<DailyFaucetProps> = ({ faucet, onClaim }) => {
  // Build a 7-day streak progress view
  const weekDots = Array.from({ length: MAX_STREAK_BONUS_DAYS }, (_, i) => {
    const dayNum = i + 1;
    const reached = faucet.streak >= dayNum;
    const isNext = faucet.canClaim && faucet.nextStreak === dayNum;
    return { dayNum, reached, isNext };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-cyan-950" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-2xl shadow-lg shadow-emerald-500/30">
              <Gift className="w-9 h-9 text-slate-950" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                {t.faucetTitle}
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-md">{t.faucetSubtitle}</p>
            </div>
          </div>

          {/* Claim Button */}
          <div className="flex flex-col items-center">
            {faucet.canClaim ? (
              <button
                onClick={onClaim}
                className="group relative flex flex-col items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold rounded-2xl shadow-xl shadow-emerald-500/30 transition-all transform hover:scale-105 active:scale-95"
              >
                <span className="flex items-center space-x-2 text-base">
                  <Coins className="w-5 h-5" />
                  <span>{t.faucetClaim}</span>
                </span>
                <span className="text-xs font-bold mt-0.5">+{faucet.nextReward.toLocaleString()} GEN</span>
              </button>
            ) : (
              <div className="flex flex-col items-center px-8 py-4 bg-slate-800/80 text-slate-300 font-bold rounded-2xl border border-slate-700">
                <span className="flex items-center space-x-2 text-base text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t.faucetClaimed}</span>
                </span>
                <span className="text-xs text-slate-400 mt-0.5">{t.faucetClaimedDesc}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl border border-orange-500/30">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.faucetCurrentStreak}</div>
            <div className="text-2xl font-extrabold text-orange-400">
              {faucet.streak} <span className="text-sm">{faucet.streak === 1 ? t.faucetDay : t.faucetDays}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/30">
            <Coins className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.faucetNextReward}</div>
            <div className="text-2xl font-extrabold text-cyan-400">+{faucet.nextReward.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.faucetTotalClaimed}</div>
            <div className="text-2xl font-extrabold text-emerald-400">{faucet.totalClaimed.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* 7-day streak progress */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-slate-100">{t.faucetWeekProgress}</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDots.map(({ dayNum, reached, isNext }) => {
            const reward = BASE_REWARD + Math.min(dayNum - 1, MAX_STREAK_BONUS_DAYS - 1) * STREAK_BONUS;
            const milestone = MILESTONE_BONUS[dayNum];
            return (
              <div
                key={dayNum}
                className={`flex flex-col items-center p-2 sm:p-3 rounded-xl border transition-all ${
                  reached
                    ? 'bg-emerald-500/15 border-emerald-500/40'
                    : isNext
                      ? 'bg-cyan-500/15 border-cyan-500/50 ring-2 ring-cyan-500/30'
                      : 'bg-slate-950 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400">D{dayNum}</span>
                <div
                  className={`my-1.5 w-7 h-7 rounded-full flex items-center justify-center ${
                    reached ? 'bg-emerald-500 text-slate-950' : isNext ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {reached ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : milestone ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <Coins className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className={`text-[9px] font-bold ${reached ? 'text-emerald-300' : isNext ? 'text-cyan-300' : 'text-slate-500'}`}>
                  +{(reward + (milestone || 0)).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-500 mt-3 flex items-center space-x-1">
          <Flame className="w-3 h-3 text-orange-400" />
          <span>{t.faucetStreakDesc}</span>
        </p>
      </div>

      {/* Milestones + History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100">{t.faucetMilestones}</h3>
          </div>
          <div className="space-y-2.5">
            {Object.entries(MILESTONE_BONUS).map(([day, bonus]) => {
              const reached = faucet.streak >= parseInt(day, 10);
              return (
                <div
                  key={day}
                  className={`flex items-center justify-between p-3 rounded-xl border text-sm ${
                    reached ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Flame className={`w-4 h-4 ${reached ? 'text-amber-400' : 'text-slate-600'}`} />
                    <span className={reached ? 'text-amber-200 font-semibold' : 'text-slate-400'}>
                      {day}-{t.faucetDay} streak
                    </span>
                  </div>
                  <span className={`font-extrabold ${reached ? 'text-amber-400' : 'text-slate-500'}`}>
                    +{bonus.toLocaleString()} GEN
                    {reached && ' ✓'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* History */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-slate-100">{t.faucetHistory}</h3>
          </div>
          {faucet.history.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-8">{t.faucetNoHistory}</div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {faucet.history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs"
                >
                  <span className="text-slate-400 font-mono">{h.date}</span>
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1 text-orange-400">
                      <Flame className="w-3 h-3" />
                      <span>{h.streak}d</span>
                    </span>
                    <span className="font-bold text-emerald-400">+{h.amount.toLocaleString()} GEN</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

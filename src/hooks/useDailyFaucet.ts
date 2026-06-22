import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'genlayer_daily_faucet';

// Reward configuration
export const BASE_REWARD = 100; // base GEN per claim
export const STREAK_BONUS = 25; // extra GEN per consecutive day
export const MAX_STREAK_BONUS_DAYS = 7; // bonus caps at day 7
export const MILESTONE_BONUS: Record<number, number> = {
  3: 100, // +100 GEN at 3-day streak
  7: 500, // +500 GEN at 7-day streak
  14: 1500, // +1500 GEN at 14-day streak
  30: 5000, // +5000 GEN at 30-day streak
};

interface FaucetData {
  lastClaim: string | null; // YYYY-MM-DD
  streak: number;
  totalClaimed: number;
  history: { date: string; amount: number; streak: number }[];
}

const todayStr = () => new Date().toISOString().split('T')[0];

const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const loadData = (): FaucetData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { lastClaim: null, streak: 0, totalClaimed: 0, history: [] };
};

const saveData = (data: FaucetData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
};

export interface FaucetState {
  canClaim: boolean;
  streak: number;
  totalClaimed: number;
  lastClaim: string | null;
  history: { date: string; amount: number; streak: number }[];
  nextReward: number;
  nextStreak: number;
  milestoneBonus: number;
}

export interface UseDailyFaucetResult extends FaucetState {
  claim: () => { amount: number; streak: number; milestone: number } | null;
}

// Compute the reward for a given (about-to-be) streak day
export const computeReward = (streakDay: number): { reward: number; milestone: number } => {
  const bonusDays = Math.min(streakDay - 1, MAX_STREAK_BONUS_DAYS - 1);
  const reward = BASE_REWARD + Math.max(0, bonusDays) * STREAK_BONUS;
  const milestone = MILESTONE_BONUS[streakDay] || 0;
  return { reward: reward + milestone, milestone };
};

export function useDailyFaucet(onReward: (amount: number) => void): UseDailyFaucetResult {
  const [data, setData] = useState<FaucetData>(loadData);

  // Re-evaluate streak validity on mount (reset if a day was skipped)
  useEffect(() => {
    const today = todayStr();
    if (data.lastClaim && data.lastClaim !== today && data.lastClaim !== yesterdayStr()) {
      // Streak broken (missed at least a full day) -> reset streak counter
      const reset = { ...data, streak: 0 };
      setData(reset);
      saveData(reset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = todayStr();
  const canClaim = data.lastClaim !== today;

  // What the next claim will give
  const nextStreak = canClaim
    ? data.lastClaim === yesterdayStr()
      ? data.streak + 1
      : 1
    : data.streak;
  const { reward: nextReward, milestone: milestoneBonus } = computeReward(
    canClaim ? nextStreak : data.streak
  );

  const claim = useCallback(() => {
    const t = todayStr();
    if (data.lastClaim === t) return null; // already claimed today

    const continuing = data.lastClaim === yesterdayStr();
    const newStreak = continuing ? data.streak + 1 : 1;
    const { reward, milestone } = computeReward(newStreak);

    const updated: FaucetData = {
      lastClaim: t,
      streak: newStreak,
      totalClaimed: data.totalClaimed + reward,
      history: [{ date: t, amount: reward, streak: newStreak }, ...data.history].slice(0, 30),
    };

    setData(updated);
    saveData(updated);
    onReward(reward);

    return { amount: reward, streak: newStreak, milestone };
  }, [data, onReward]);

  return {
    canClaim,
    streak: data.streak,
    totalClaimed: data.totalClaimed,
    lastClaim: data.lastClaim,
    history: data.history,
    nextReward,
    nextStreak,
    milestoneBonus,
    claim,
  };
}

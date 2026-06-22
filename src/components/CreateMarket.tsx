import React, { useState } from 'react';
import { PredictionMarketContract } from '../types';
import { t } from '../data/mockData';
import { Rocket, ShieldCheck, Calendar, Trophy, Coins, CheckCircle2 } from 'lucide-react';

interface CreateMarketProps {
  onDeployContract: (market: PredictionMarketContract) => void;
}

export const CreateMarket: React.FC<CreateMarketProps> = ({ onDeployContract }) => {
  const [team1, setTeam1] = useState<string>('');
  const [team2, setTeam2] = useState<string>('');
  const [gameDate, setGameDate] = useState<string>('2026-04-10');
  const [league, setLeague] = useState<string>('Premier League');
  const [initialStake, setInitialStake] = useState<string>('5000');
  const [evmAddress, setEvmAddress] = useState<string>('');
  const [deployed, setDeployed] = useState<boolean>(false);
  const [contractAddr, setContractAddr] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!team1 || !team2 || !gameDate || !league) return;

    const stake = parseFloat(initialStake) || 1000;
    const mockAddr = 'gl1' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + '8a';

    const bbcMockText = `BBC Sport - Football Scores & Fixtures
Date: ${gameDate}
Competition: ${league}
Match Status: Full Time
${team1} 2 - 1 ${team2}
Goals scored in the second half. Match finished successfully.`;

    const validEvm = /^0x[a-fA-F0-9]{40}$/.test(evmAddress.trim());

    const newMarket: PredictionMarketContract = {
      id: 'market-' + Date.now(),
      contractAddress: mockAddr,
      evmContractAddress: validEvm ? evmAddress.trim() : undefined,
      gameDate,
      team1,
      team2,
      league,
      resolutionUrl: `https://www.bbc.com/sport/football/scores-fixtures/${gameDate}`,
      hasResolved: false,
      winner: -1,
      score: '',
      totalPool: stake * 3,
      poolTeam1: stake,
      poolTeam2: stake,
      poolDraw: stake,
      simulationData: {
        bbcWebText: bbcMockText,
        expectedScore: '2:1',
        expectedWinner: 1,
      },
    };

    onDeployContract(newMarket);
    setContractAddr(mockAddr);
    setDeployed(true);

    setTimeout(() => {
      setDeployed(false);
      setTeam1('');
      setTeam2('');
    }, 5000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">

        <div className="p-8 bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/50 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl shadow-lg text-slate-950">
              <Rocket className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">{t.createTitle}</h2>
              <p className="text-sm text-slate-400 mt-1">{t.createSubtitle}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {deployed && (
            <div className="p-4 bg-emerald-950/50 border border-emerald-500/50 rounded-2xl flex items-center space-x-3 text-emerald-200 text-sm animate-pulse">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-bold text-base text-white">{t.deploySuccess}</div>
                <div className="font-mono text-xs text-emerald-300 mt-0.5">Contract Address: {contractAddr}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.formTeam1}</label>
              <input
                type="text"
                required
                placeholder="e.g. Real Madrid"
                value={team1}
                onChange={(e) => setTeam1(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.formTeam2}</label>
              <input
                type="text"
                required
                placeholder="e.g. Barcelona"
                value={team2}
                onChange={(e) => setTeam2(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>{t.formDate}</span>
              </label>
              <input
                type="date"
                required
                value={gameDate}
                onChange={(e) => setGameDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>{t.formLeague}</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Champions League"
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>{t.formInitStake}</span>
            </label>
            <input
              type="number"
              required
              min="100"
              step="100"
              value={initialStake}
              onChange={(e) => setInitialStake(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-cyan-400 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Initial liquidity will be split equally into Team 1, Team 2, and Draw pools for initial odds calculation.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>EVM Contract Address (optional)</span>
            </label>
            <input
              type="text"
              placeholder="0x... (leave empty for native GEN transfer)"
              value={evmAddress}
              onChange={(e) => setEvmAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-emerald-400 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              If you provide a deployed <span className="font-mono text-slate-400">PredictionMarket</span> address,
              bets will call <span className="font-mono text-emerald-400">placeBet(choice)</span> on-chain.
              Otherwise a native GEN transfer is used.
            </p>
          </div>

          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-3 text-xs text-slate-300">
            <div className="flex items-center space-x-2 font-bold text-slate-100">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Smart Contract Constructor Details</span>
            </div>
            <div className="space-y-1 font-mono text-slate-400 text-[11px]">
              <div>class PredictionMarket(gl.Contract):</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;def __init__(self, game_date="{gameDate}", team1="{team1 || 'Team1'}", team2="{team2 || 'Team2'}")</div>
              <div className="text-cyan-400">&nbsp;&nbsp;&nbsp;&nbsp;self.resolution_url = "https://www.bbc.com/sport/football/scores-fixtures/{gameDate}"</div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold rounded-2xl text-base shadow-xl hover:shadow-cyan-500/20 transition-all transform active:scale-[0.99]"
          >
            {t.btnDeploy}
          </button>
        </form>
      </div>
    </div>
  );
};

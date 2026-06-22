import React from 'react';
import { PredictionMarketContract, Transaction } from '../types';
import { t } from '../data/mockData';
import { UseWalletResult } from '../hooks/useWallet';
import { shortenAddress, explorerTxUrl, explorerAddressUrl } from '../config/network';
import { Wallet, Trophy, CheckCircle2, AlertCircle, Clock, ExternalLink, Link2, ShieldAlert } from 'lucide-react';

interface UserBetsProps {
  markets: PredictionMarketContract[];
  balance: number;
  wallet: UseWalletResult;
  transactions: Transaction[];
  onClaimWinnings: (marketId: string, winnings: number) => void;
}

const isEvmTx = (hash: string) => hash.startsWith('0x') && hash.length === 66;

export const UserBets: React.FC<UserBetsProps> = ({
  markets,
  balance,
  wallet,
  transactions,
  onClaimWinnings,
}) => {
  const betMarkets = markets.filter(m => m.myBet !== undefined);

  const getBetOutcome = (market: PredictionMarketContract) => {
    const bet = market.myBet!;
    if (!market.hasResolved) {
      return { status: 'waiting', label: t.statusWaiting, winnings: 0 };
    }

    if (market.winner === bet.choice) {
      if (bet.claimed) {
        return { status: 'claimed', label: t.statusClaimed, winnings: 0 };
      } else {
        let winningPool = market.poolDraw;
        if (market.winner === 1) winningPool = market.poolTeam1;
        if (market.winner === 2) winningPool = market.poolTeam2;

        const share = bet.amount / (winningPool || 1);
        const winnings = Math.round(market.totalPool * share);
        return { status: 'claimable', label: t.statusClaimable, winnings };
      }
    } else {
      return { status: 'lost', label: t.statusLost, winnings: 0 };
    }
  };

  const getChoiceLabel = (market: PredictionMarketContract, choice: number) => {
    if (choice === 1) return market.team1;
    if (choice === 2) return market.team2;
    return t.draw;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Wallet & Bets */}
        <div className="lg:col-span-8 space-y-6">

          {/* On-chain wallet status banner */}
          <div className="bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
            {wallet.isConnected && wallet.isCorrectNetwork ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
                    <Link2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">GenLayer Testnet • Connected</div>
                    <a
                      href={explorerAddressUrl(wallet.account!)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-sm text-cyan-400 hover:text-cyan-300 inline-flex items-center space-x-1"
                    >
                      <span>{shortenAddress(wallet.account!)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.onchainBalance}</div>
                  <div className="text-xl font-extrabold text-emerald-400">{wallet.balance} GEN</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="text-sm text-slate-300">
                    {!wallet.isConnected ? t.walletRequired : t.networkRequired}
                  </div>
                </div>
                <button
                  onClick={!wallet.isConnected ? wallet.connect : wallet.switchNetwork}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg whitespace-nowrap"
                >
                  {!wallet.isConnected ? t.walletConnect : t.switchNetwork}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-slate-900 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center space-x-4">
              <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/30 shadow-inner">
                <Wallet className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.totalBalance}</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-1">{balance.toLocaleString()} $GEN</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center space-x-4">
              <div className="p-4 bg-yellow-500/10 text-yellow-400 rounded-2xl border border-yellow-500/30 shadow-inner">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.winningsAvailable}</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-yellow-400 mt-1">
                  {betMarkets.reduce((acc, m) => acc + getBetOutcome(m).winnings, 0).toLocaleString()} $GEN
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{t.winningsCalc}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-6 bg-slate-950 border-b border-slate-800">
              <h3 className="font-bold text-lg text-slate-100">{t.betsTitle}</h3>
            </div>

            {betMarkets.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">{t.noBets}</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {betMarkets.map((market) => {
                  const outcome = getBetOutcome(market);
                  const bet = market.myBet!;

                  return (
                    <div key={market.id} className="p-6 hover:bg-slate-950/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold px-2.5 py-1 bg-slate-800 text-cyan-400 rounded-lg border border-slate-700">{market.league}</span>
                          <span className="text-xs text-slate-400">{market.gameDate}</span>
                        </div>
                        <h4 className="font-bold text-base text-slate-200">
                          {market.team1} <span className="text-slate-500 font-normal px-1">vs</span> {market.team2}
                        </h4>
                        <div className="flex items-center space-x-4 text-xs text-slate-400">
                          <div><span>{t.betOn}</span> <strong className="text-cyan-400">{getChoiceLabel(market, bet.choice)}</strong></div>
                          <div><span>{t.stakeAmount}</span> <strong className="text-white">{bet.amount.toLocaleString()} $GEN</strong></div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                        {outcome.status === 'waiting' && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-xl border border-slate-700">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" /><span>{outcome.label}</span>
                          </span>
                        )}
                        {outcome.status === 'lost' && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/50 text-rose-300 text-xs font-medium rounded-xl border border-rose-800/50">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400" /><span>{outcome.label}</span>
                          </span>
                        )}
                        {outcome.status === 'claimed' && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/50 text-emerald-300 text-xs font-medium rounded-xl border border-emerald-800/50">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>{outcome.label}</span>
                          </span>
                        )}
                        {outcome.status === 'claimable' && (
                          <div className="flex flex-col items-end space-y-2 w-full sm:w-auto">
                            <div className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/30">
                              {outcome.label}: +{outcome.winnings.toLocaleString()} $GEN
                            </div>
                            <button
                              onClick={() => onClaimWinnings(market.id, outcome.winnings)}
                              className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg hover:shadow-yellow-500/20 transition-all active:scale-95"
                            >
                              {t.btnClaim}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Transaction History */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex-1 flex flex-col max-h-[700px]">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">{t.txHistory}</h3>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">Live GenLayer VM</span>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="text-center text-xs text-slate-500 italic py-8">No transactions yet.</div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                        tx.type === 'DEPLOY' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        tx.type === 'BET' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        tx.type === 'RESOLVE' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {tx.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{tx.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div className="font-semibold text-xs text-slate-200">{tx.title}</div>
                    {tx.amount && <div className="text-xs font-bold text-cyan-400">{tx.amount.toLocaleString()} $GEN</div>}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] font-mono text-slate-500">
                      <span>{t.txHash}:</span>
                      {isEvmTx(tx.txHash) ? (
                        <a
                          href={explorerTxUrl(tx.txHash)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 flex items-center space-x-1 hover:text-cyan-300"
                          title={t.viewOnExplorer}
                        >
                          <span>{tx.txHash.substring(0, 14)}...</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400 flex items-center space-x-1">
                          <span>{tx.txHash.substring(0, 16)}...</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

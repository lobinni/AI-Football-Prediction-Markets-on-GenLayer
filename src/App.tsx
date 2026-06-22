import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { PredictionMarketContract, TabType, Transaction } from './types';
import { initialMarkets, t } from './data/mockData';
import { Navbar } from './components/Navbar';
import { MarketCard } from './components/MarketCard';
import { ConsensusSimulationModal } from './components/ConsensusSimulationModal';
import { CreateMarket } from './components/CreateMarket';
import { ContractStudio } from './components/ContractStudio';
import { UserBets } from './components/UserBets';
import { ResultsFinder } from './components/ResultsFinder';
import { WorldCupBanner } from './components/WorldCupBanner';
import { DailyFaucet } from './components/DailyFaucet';
import { BetConfirmModal } from './components/BetConfirmModal';
import { useWallet } from './hooks/useWallet';
import { useDailyFaucet } from './hooks/useDailyFaucet';
import { fetchAllRegionMarkets, fetchWorldCupMarkets, RegionMarkets } from './services/footballApi';
import { REGIONS } from './config/leagues';
import { Search, Filter, AlertCircle, CheckCircle2, RefreshCw, Radio, Gift } from 'lucide-react';

const randomHash = () =>
  'gl1' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const App: React.FC = () => {
  const wallet = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>('markets');
  const [balance, setBalance] = useState<number>(100000);
  const [markets, setMarkets] = useState<PredictionMarketContract[]>(initialMarkets);

  // Live football data state
  const [regionMarkets, setRegionMarkets] = useState<RegionMarkets[]>([]);
  const [worldCupMarkets, setWorldCupMarkets] = useState<PredictionMarketContract[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');

  const [simulatingMarketId, setSimulatingMarketId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [pendingBet, setPendingBet] = useState<{ marketId: string; choice: number; amount: number } | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-1',
      timestamp: new Date(Date.now() - 3600000 * 4),
      type: 'DEPLOY',
      title: 'Deployed Contract: Arsenal vs Chelsea',
      txHash: 'gl1x94f8a29b47cd29e1f82c49a71b0583b27e99',
    },
    {
      id: 'tx-2',
      timestamp: new Date(Date.now() - 3600000 * 2),
      type: 'BET',
      title: 'Staked: Arsenal Win (500 $GEN)',
      amount: 500,
      txHash: 'gl1a55f8b91b47cd29e1f82c49a71b0583b28b77',
    },
  ]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Daily GEN faucet (adds claimed GEN to the demo balance)
  const faucet = useDailyFaucet((amount) => {
    setBalance((prev) => prev + amount);
  });

  const handleFaucetClaim = () => {
    const result = faucet.claim();
    if (!result) return;
    const milestoneMsg = result.milestone > 0 ? ` 🎉 +${result.milestone} milestone bonus!` : '';
    showToast(`${t.faucetSuccess} +${result.amount.toLocaleString()} GEN (${result.streak}d streak)${milestoneMsg}`, 'success');

    // Record a transaction entry
    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      timestamp: new Date(),
      type: 'CLAIM',
      title: `Daily Faucet: +${result.amount.toLocaleString()} GEN (${result.streak}-day streak)`,
      amount: result.amount,
      txHash: randomHash(),
    };
    setTransactions((txs) => [newTx, ...txs]);
  };

  // Load live football fixtures grouped by region + featured World Cup
  const loadLiveData = useCallback(async () => {
    setLoadingData(true);
    setDataError(false);
    try {
      const [regions, worldCup] = await Promise.all([
        fetchAllRegionMarkets(),
        fetchWorldCupMarkets(),
      ]);

      if (regions.length === 0 && worldCup.length === 0) {
        setDataError(true);
        return;
      }

      setRegionMarkets(regions);
      setWorldCupMarkets(worldCup);

      // Combine region markets + World Cup, de-duplicate by id
      const flatMap = new Map<string, PredictionMarketContract>();
      regions.flatMap((r) => r.markets).forEach((m) => flatMap.set(m.id, m));
      worldCup.forEach((m) => flatMap.set(m.id, m));
      const flat = Array.from(flatMap.values());

      // Merge: keep any existing user bets / user-created markets
      setMarkets((prev) => {
        const userCreated = prev.filter((m) => m.id.startsWith('market-'));
        const betsById = new Map(prev.filter((m) => m.myBet).map((m) => [m.id, m.myBet]));
        const merged = flat.map((m) =>
          betsById.has(m.id) ? { ...m, myBet: betsById.get(m.id) } : m
        );
        return [...userCreated, ...merged];
      });
    } catch (err) {
      console.error(err);
      setDataError(true);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadLiveData();
  }, [loadLiveData]);

  const leagues = useMemo(() => {
    const list = markets.map(m => m.league);
    return ['all', ...Array.from(new Set(list))];
  }, [markets]);

  const matchesFilters = useCallback(
    (market: PredictionMarketContract) => {
      const matchesSearch =
        market.team1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.team2.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.league.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ? true : statusFilter === 'active' ? !market.hasResolved : market.hasResolved;

      const matchesLeague = selectedLeague === 'all' ? true : market.league === selectedLeague;

      return matchesSearch && matchesStatus && matchesLeague;
    },
    [searchQuery, statusFilter, selectedLeague]
  );

  // Region-grouped markets for display, with all filters + region filter applied
  const displayRegions = useMemo(() => {
    // user-created markets shown in a synthetic "Your Markets" group at top
    const userCreated = markets.filter((m) => m.id.startsWith('market-') && matchesFilters(m));

    // When the featured banner is shown, avoid duplicating World Cup cards below
    const bannerShown =
      searchQuery === '' &&
      statusFilter === 'all' &&
      selectedLeague === 'all' &&
      selectedRegion === 'all' &&
      worldCupMarkets.length > 0;
    const wcIds = new Set(worldCupMarkets.map((m) => m.id));

    const groups = regionMarkets
      .filter((rm) => selectedRegion === 'all' || rm.region.key === selectedRegion)
      .map((rm) => {
        // re-pull live versions from current markets state (to reflect bet updates)
        const ids = new Set(rm.markets.map((m) => m.id));
        const live = markets.filter(
          (m) => ids.has(m.id) && matchesFilters(m) && !(bannerShown && wcIds.has(m.id))
        );
        return { region: rm.region, markets: live };
      })
      .filter((g) => g.markets.length > 0);

    return { userCreated, groups };
  }, [markets, regionMarkets, worldCupMarkets, selectedRegion, searchQuery, statusFilter, selectedLeague, matchesFilters]);

  const totalVisible =
    displayRegions.userCreated.length +
    displayRegions.groups.reduce((acc, g) => acc + g.markets.length, 0);

  // Live World Cup markets (reflecting current bet state) for the featured banner
  const liveWorldCupMarkets = useMemo(() => {
    const ids = new Set(worldCupMarkets.map((m) => m.id));
    return markets.filter((m) => ids.has(m.id));
  }, [markets, worldCupMarkets]);

  // Only show the featured World Cup banner in the default unfiltered view
  const showWorldCupBanner =
    searchQuery === '' &&
    statusFilter === 'all' &&
    selectedLeague === 'all' &&
    selectedRegion === 'all' &&
    liveWorldCupMarkets.length > 0;

  // Step 1: validate wallet, then open the on-chain confirm modal
  const handleBet = async (marketId: string, choice: number, amount: number) => {
    if (!wallet.isConnected) {
      showToast(t.walletRequired, 'error');
      await wallet.connect();
      return;
    }
    if (!wallet.isCorrectNetwork) {
      showToast(t.networkRequired, 'error');
      await wallet.switchNetwork();
      return;
    }
    setPendingBet({ marketId, choice, amount });
  };

  // Step 2: user confirmed -> sign & broadcast the real transaction
  const executeBet = async () => {
    if (!pendingBet) return;
    const { marketId, choice, amount } = pendingBet;

    const market = markets.find(m => m.id === marketId);
    if (!market) return;
    const choiceName = choice === 1 ? market.team1 : choice === 2 ? market.team2 : t.draw;

    const evmAddr = market.evmContractAddress;
    const isContractBet =
      !!evmAddr &&
      /^0x[a-fA-F0-9]{40}$/.test(evmAddr) &&
      evmAddr !== '0x0000000000000000000000000000000000000000';

    let txHash = '';
    try {
      // Call the real smart contract placeBet() when a contract address exists,
      // otherwise fall back to a plain native GEN transfer.
      txHash = isContractBet
        ? await wallet.placeBetOnContract(evmAddr!, choice, amount)
        : await wallet.sendBet(amount);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message?.includes('insufficient')
        ? t.insufficientFunds
        : t.txRejected;
      showToast(msg, 'error');
      setPendingBet(null);
      return;
    }

    // Close modal once tx hash is returned (it broadcasts in background)
    setPendingBet(null);

    // Update local market state + record the real tx hash
    setMarkets(prev => prev.map(m => {
      if (m.id === marketId) {
        let poolTeam1 = m.poolTeam1;
        let poolTeam2 = m.poolTeam2;
        let poolDraw = m.poolDraw;

        if (choice === 1) poolTeam1 += amount;
        else if (choice === 2) poolTeam2 += amount;
        else poolDraw += amount;

        return {
          ...m,
          totalPool: m.totalPool + amount,
          poolTeam1,
          poolTeam2,
          poolDraw,
          myBet: { choice, amount: (m.myBet?.amount || 0) + amount, claimed: false },
        };
      }
      return m;
    }));

    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      timestamp: new Date(),
      type: 'BET',
      title: `Staked on: ${market.team1} vs ${market.team2} (${choiceName})`,
      amount,
      txHash,
    };
    setTransactions(txs => [newTx, ...txs]);

    showToast(t.txConfirmed, 'success');
  };

  const handleStartSimulation = async (marketId: string) => {
    const market = markets.find(m => m.id === marketId);
    const evmAddr = market?.evmContractAddress;
    const isContractMarket =
      !!evmAddr &&
      /^0x[a-fA-F0-9]{40}$/.test(evmAddr) &&
      evmAddr !== '0x0000000000000000000000000000000000000000';

    // If a real contract is configured, fire the on-chain resolve() tx first
    if (isContractMarket && wallet.isConnected && wallet.isCorrectNetwork) {
      try {
        showToast(t.txAwaitingSig, 'success');
        const txHash = await wallet.resolveOnContract(evmAddr!);
        const newTx: Transaction = {
          id: 'tx-' + Date.now(),
          timestamp: new Date(),
          type: 'RESOLVE',
          title: `resolve() called on-chain: ${market!.team1} vs ${market!.team2}`,
          txHash,
        };
        setTransactions(txs => [newTx, ...txs]);
      } catch (err) {
        console.error(err);
        showToast(t.txRejected, 'error');
        return;
      }
    }

    // Show the AI consensus visualization
    setSimulatingMarketId(marketId);
  };

  const handleCompleteResolution = (marketId: string, winner: number, score: string) => {
    setMarkets(prev => prev.map(m => {
      if (m.id === marketId && !m.hasResolved) {
        const newTx: Transaction = {
          id: 'tx-' + Date.now(),
          timestamp: new Date(),
          type: 'RESOLVE',
          title: `AI Resolve complete: ${m.team1} vs ${m.team2} (Score ${score})`,
          txHash: randomHash(),
        };
        setTransactions(txs => [newTx, ...txs]);

        return { ...m, hasResolved: true, winner, score };
      }
      return m;
    }));
  };

  const handleDeployContract = (newMarket: PredictionMarketContract) => {
    setMarkets(prev => [newMarket, ...prev]);
    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      timestamp: new Date(),
      type: 'DEPLOY',
      title: `Deployed Contract: ${newMarket.team1} vs ${newMarket.team2}`,
      txHash: newMarket.contractAddress,
    };
    setTransactions(txs => [newTx, ...txs]);
    showToast(t.deploySuccess, 'success');
  };

  const handleClaimWinnings = async (marketId: string, winnings: number) => {
    const market = markets.find(m => m.id === marketId);
    const evmAddr = market?.evmContractAddress;
    const isContractMarket =
      !!evmAddr &&
      /^0x[a-fA-F0-9]{40}$/.test(evmAddr) &&
      evmAddr !== '0x0000000000000000000000000000000000000000';

    let txHash = randomHash();

    // Real on-chain claim when a contract is configured
    if (isContractMarket) {
      if (!wallet.isConnected || !wallet.isCorrectNetwork) {
        showToast(t.networkRequired, 'error');
        return;
      }
      try {
        showToast(t.txAwaitingSig, 'success');
        txHash = await wallet.claimOnContract(evmAddr!);
      } catch (err) {
        console.error(err);
        showToast(t.txRejected, 'error');
        return;
      }
    } else {
      setBalance(prev => prev + winnings);
    }

    setMarkets(prev => prev.map(m => {
      if (m.id === marketId && m.myBet) {
        const newTx: Transaction = {
          id: 'tx-' + Date.now(),
          timestamp: new Date(),
          type: 'CLAIM',
          title: `Claimed Payout: ${m.team1} vs ${m.team2} (+${winnings} $GEN)`,
          amount: winnings,
          txHash,
        };
        setTransactions(txs => [newTx, ...txs]);

        return { ...m, myBet: { ...m.myBet, claimed: true } };
      }
      return m;
    }));
    showToast(t.claimSuccess, 'success');
  };

  const activeSimulationMarket = markets.find(m => m.id === simulatingMarketId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wallet={wallet}
      />

      <main className="flex-1">
        {activeTab === 'markets' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

            {/* Live data status bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 p-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-500/15 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30">
                  <Radio className={`w-3.5 h-3.5 ${loadingData ? 'animate-ping' : 'animate-pulse'}`} />
                  <span>{t.liveData}</span>
                </span>
                <span className="text-xs text-slate-400">{t.dataSource}</span>
              </div>
              <button
                onClick={loadLiveData}
                disabled={loadingData}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loadingData ? 'animate-spin' : ''}`} />
                <span>{t.refreshData}</span>
              </button>
            </div>

            {dataError && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>{t.loadError}</span>
              </div>
            )}

            {/* Daily faucet reminder */}
            {faucet.canClaim && (
              <button
                onClick={() => setActiveTab('faucet')}
                className="w-full flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/40 border border-emerald-500/30 rounded-2xl shadow-lg hover:border-emerald-500/50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-xl text-slate-950 group-hover:scale-105 transition-transform">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-emerald-300 text-sm">{t.faucetClaim} • +{faucet.nextReward.toLocaleString()} GEN</div>
                    <div className="text-xs text-slate-400">{t.faucetSubtitle}</div>
                  </div>
                </div>
                <span className="text-emerald-400 text-sm font-bold whitespace-nowrap">→</span>
              </button>
            )}

            {/* Featured FIFA World Cup banner (default view only) */}
            {showWorldCupBanner && (
              <WorldCupBanner
                markets={liveWorldCupMarkets}
                wallet={wallet}
                onBet={handleBet}
                onStartSimulation={handleStartSimulation}
              />
            )}

            {/* Search & Filter Toolbar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                {/* Region filter */}
                <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                  <span className="text-slate-500">🌐</span>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="bg-transparent text-slate-300 font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900">{t.allRegions}</option>
                    {REGIONS.map((r) => (
                      <option key={r.key} value={r.key} className="bg-slate-900">
                        {r.emoji} {r.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                  <Filter className="w-3.5 h-3.5 text-cyan-400" />
                  <select
                    value={selectedLeague}
                    onChange={(e) => setSelectedLeague(e.target.value)}
                    className="bg-transparent text-slate-300 font-semibold focus:outline-none cursor-pointer max-w-[140px]"
                  >
                    {leagues.map(l => (
                      <option key={l} value={l} className="bg-slate-900 text-slate-200">
                        {l === 'all' ? t.allLeagues : l}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 text-xs font-semibold">
                  <button onClick={() => setStatusFilter('all')} className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>{t.filterAll}</button>
                  <button onClick={() => setStatusFilter('active')} className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'active' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>{t.filterActive}</button>
                  <button onClick={() => setStatusFilter('resolved')} className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'resolved' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>{t.filterResolved}</button>
                </div>
              </div>
            </div>

            {/* Loading skeleton */}
            {loadingData && totalVisible === 0 ? (
              <div className="p-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 font-medium flex flex-col items-center space-y-3">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <span>{t.loadingMatches}</span>
              </div>
            ) : totalVisible === 0 ? (
              <div className="p-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 font-medium">
                No prediction markets found.
              </div>
            ) : (
              <div className="space-y-10">
                {/* User-created markets */}
                {displayRegions.userCreated.length > 0 && (
                  <section>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xl">⭐</span>
                      <h2 className="text-lg font-bold text-slate-100">Your Markets</h2>
                      <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                        {displayRegions.userCreated.length} {t.matchesCount}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {displayRegions.userCreated.map((market) => (
                        <MarketCard key={market.id} market={market} wallet={wallet} onBet={handleBet} onStartSimulation={handleStartSimulation} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Region groups */}
                {displayRegions.groups.map((group) => (
                  <section key={group.region.key}>
                    <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-800">
                      <span className="text-2xl">{group.region.emoji}</span>
                      <h2 className="text-lg font-bold text-slate-100">{group.region.nameEn}</h2>
                      <span className="text-sm text-slate-500">/ {group.region.nameVi}</span>
                      <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full ml-1">
                        {group.markets.length} {t.matchesCount}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.markets.map((market) => (
                        <MarketCard key={market.id} market={market} wallet={wallet} onBet={handleBet} onStartSimulation={handleStartSimulation} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && <ResultsFinder />}

        {activeTab === 'faucet' && <DailyFaucet faucet={faucet} onClaim={handleFaucetClaim} />}

        {activeTab === 'create' && <CreateMarket onDeployContract={handleDeployContract} />}

        {activeTab === 'studio' && <ContractStudio />}

        {activeTab === 'my-bets' && (
          <UserBets
            markets={markets}
            balance={balance}
            wallet={wallet}
            transactions={transactions}
            onClaimWinnings={handleClaimWinnings}
          />
        )}
      </main>

      {activeSimulationMarket && (
        <ConsensusSimulationModal
          market={activeSimulationMarket}
          onClose={() => setSimulatingMarketId(null)}
          onCompleteResolution={handleCompleteResolution}
        />
      )}

      {pendingBet && (() => {
        const pbMarket = markets.find(m => m.id === pendingBet.marketId);
        if (!pbMarket) return null;
        return (
          <BetConfirmModal
            market={pbMarket}
            choice={pendingBet.choice}
            amount={pendingBet.amount}
            wallet={wallet}
            onConfirm={executeBet}
            onClose={() => setPendingBet(null)}
          />
        );
      })()}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl animate-bounce">
          {toast.type === 'success' ? (
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          <span className="text-sm font-bold text-slate-100">{toast.message}</span>
        </div>
      )}

      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="font-semibold text-slate-400">
            GenLayer AI Prediction Market Portal • Built on Nondeterministic Consensus Mechanics
          </div>
          <div>Powered by py-genlayer v0.2.16 & Equivalence Principle • Simulated DApp Environment</div>
        </div>
      </footer>
    </div>
  );
};

export default App;

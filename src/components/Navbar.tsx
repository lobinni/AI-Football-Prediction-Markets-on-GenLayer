import React, { useState } from 'react';
import { TabType } from '../types';
import { t } from '../data/mockData';
import { UseWalletResult } from '../hooks/useWallet';
import { shortenAddress, explorerAddressUrl } from '../config/network';
import {
  BarChart3, PlusCircle, Code2, Wallet, Cpu, AlertTriangle, LogOut, ExternalLink, Copy, Check, CalendarSearch, Gift,
} from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  wallet: UseWalletResult;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, wallet }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'markets', label: t.navMarkets, icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'results', label: t.navResults, icon: <CalendarSearch className="w-4 h-4" /> },
    { key: 'faucet', label: t.navFaucet, icon: <Gift className="w-4 h-4" /> },
    { key: 'create', label: t.navCreate, icon: <PlusCircle className="w-4 h-4" /> },
    { key: 'studio', label: t.navStudio, icon: <Code2 className="w-4 h-4" /> },
    { key: 'my-bets', label: t.navMyBets, icon: <Wallet className="w-4 h-4" /> },
  ];

  const copyAddress = () => {
    if (wallet.account) {
      navigator.clipboard.writeText(wallet.account);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const renderWalletButton = () => {
    // Not installed
    if (!wallet.isInstalled) {
      return (
        <button
          onClick={wallet.connect}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">{t.installMetamask}</span>
          <span className="sm:hidden">MetaMask</span>
        </button>
      );
    }

    // Not connected
    if (!wallet.isConnected) {
      return (
        <button
          onClick={wallet.connect}
          disabled={wallet.isConnecting}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          <Wallet className="w-4 h-4 text-slate-950" />
          <span>{wallet.isConnecting ? '...' : t.walletConnect}</span>
        </button>
      );
    }

    // Connected but wrong network
    if (!wallet.isCorrectNetwork) {
      return (
        <button
          onClick={wallet.switchNetwork}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="hidden sm:inline">{t.switchNetwork}</span>
          <span className="sm:hidden">{t.wrongNetwork}</span>
        </button>
      );
    }

    // Connected + correct network -> show account dropdown
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-xl cursor-pointer hover:border-cyan-500/50 transition-colors shadow-inner"
        >
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <div className="text-left">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">
              {parseFloat(wallet.balance).toFixed(3)} GEN
            </div>
            <div className="text-sm font-bold text-cyan-400 font-mono">{shortenAddress(wallet.account!)}</div>
          </div>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-40 overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-950/60">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">GenLayer Testnet</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-slate-200">{shortenAddress(wallet.account!)}</span>
                  <button onClick={copyAddress} className="text-slate-400 hover:text-cyan-400 p-1 rounded">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-2 text-lg font-extrabold text-cyan-400">{wallet.balance} GEN</div>
              </div>
              <a
                href={explorerAddressUrl(wallet.account!)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                <span>{t.viewOnExplorer}</span>
              </a>
              <button
                onClick={() => { wallet.disconnect(); setMenuOpen(false); }}
                className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.disconnect}</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('markets')}>
            <div className="relative p-2.5 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl shadow-md group">
              <Cpu className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  GenLayer
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30">
                  AI Markets
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block max-w-[300px] truncate">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Wallet */}
          <div className="flex items-center space-x-3">{renderWalletButton()}</div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-800 bg-slate-900/50">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center space-y-1 text-xs font-medium ${
                activeTab === tab.key ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

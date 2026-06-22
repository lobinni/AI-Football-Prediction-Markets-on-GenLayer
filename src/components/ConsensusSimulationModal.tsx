import React, { useEffect, useState } from 'react';
import { PredictionMarketContract, ValidatorNode } from '../types';
import { t } from '../data/mockData';
import {
  Cpu, Globe, Terminal, CheckCircle2, AlertTriangle, X, Loader2, ShieldCheck, Database,
} from 'lucide-react';

interface ConsensusSimulationModalProps {
  market: PredictionMarketContract;
  onClose: () => void;
  onCompleteResolution: (marketId: string, winner: number, score: string) => void;
}

export const ConsensusSimulationModal: React.FC<ConsensusSimulationModalProps> = ({
  market,
  onClose,
  onCompleteResolution,
}) => {
  const [step, setStep] = useState<'init' | 'fetch_web' | 'exec_prompt' | 'check_consensus' | 'complete'>('init');

  const [validators, setValidators] = useState<ValidatorNode[]>([
    { id: 'val-1', name: t.nodeAlpha, location: 'UK', status: 'idle', latency: 124 },
    { id: 'val-2', name: t.nodeBeta, location: 'Germany', status: 'idle', latency: 98 },
    { id: 'val-3', name: t.nodeGamma, location: 'Singapore', status: 'idle', latency: 156 },
  ]);

  const [activeTabNode, setActiveTabNode] = useState<string>('val-1');
  const simData = market.simulationData;

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStep('fetch_web');
      setValidators(prev => prev.map(v => ({ ...v, status: 'fetching', renderedText: simData.bbcWebText })));
    }, 2000);

    const timer2 = setTimeout(() => {
      setStep('exec_prompt');
      const expectedJson = `{\n    "score": "${simData.expectedScore}",\n    "winner": ${simData.expectedWinner}\n}`;
      setValidators(prev => prev.map(v => ({
        ...v,
        status: 'prompting',
        llmOutput: expectedJson,
        parsedResult: { score: simData.expectedScore, winner: simData.expectedWinner },
      })));
    }, 5000);

    const timer3 = setTimeout(() => {
      setStep('check_consensus');
      setValidators(prev => prev.map(v => ({ ...v, status: 'success' })));
    }, 8500);

    const timer4 = setTimeout(() => {
      setStep('complete');
      if (simData.expectedWinner > -1) {
        onCompleteResolution(market.id, simData.expectedWinner, simData.expectedScore);
      }
    }, 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [market.id, simData, onCompleteResolution]);

  const getStepProgress = () => {
    switch (step) {
      case 'init': return 15;
      case 'fetch_web': return 40;
      case 'exec_prompt': return 70;
      case 'check_consensus': return 90;
      case 'complete': return 100;
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'init': return t.validatorStatusInit;
      case 'fetch_web': return t.validatorStatusFetch;
      case 'exec_prompt': return t.validatorStatusPrompt;
      case 'check_consensus': return t.validatorStatusConsensus;
      case 'complete': return t.validatorStatusComplete;
    }
  };

  const selectedNode = validators.find(v => v.id === activeTabNode) || validators[0];
  const isMatchFinished = simData.expectedWinner > -1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl shadow-lg">
              <Cpu className="w-6 h-6 text-white animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-slate-100">{t.resolveSimulationTitle}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-cyan-400 font-mono bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
                  {market.team1} vs {market.team2}
                </span>
                <span className="text-xs text-slate-400">Target: BBC Sport ({market.gameDate})</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800/60">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-cyan-400 flex items-center space-x-2">
              {step !== 'complete' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{getStepDescription()}</span>
            </span>
            <span className="text-slate-400">{getStepProgress()}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 h-full transition-all duration-500 ease-out" style={{ width: `${getStepProgress()}%` }}></div>
          </div>

          <div className="grid grid-cols-5 gap-1 mt-3 text-[10px] sm:text-xs font-medium text-center">
            <div className={`p-1.5 rounded ${step === 'init' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-500'}`}>{t.stepInit}</div>
            <div className={`p-1.5 rounded ${step === 'fetch_web' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-500'}`}>{t.stepFetch}</div>
            <div className={`p-1.5 rounded ${step === 'exec_prompt' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-500'}`}>{t.stepPrompt}</div>
            <div className={`p-1.5 rounded ${step === 'check_consensus' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-500'}`}>{t.stepConsensus}</div>
            <div className={`p-1.5 rounded ${step === 'complete' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold' : 'text-slate-500'}`}>{t.stepComplete}</div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-slate-900">

          {/* Left: Validators */}
          <div className="md:col-span-4 border-r border-slate-800 p-4 space-y-3 bg-slate-950/40 overflow-y-auto custom-scrollbar">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center justify-between">
              <span>AI Validator Network</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-cyan-400 font-mono text-[10px]">3 Nodes</span>
            </div>

            {validators.map((node) => (
              <div
                key={node.id}
                onClick={() => setActiveTabNode(node.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  activeTabNode === node.id ? 'bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-500/5' : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Database className={`w-4 h-4 ${activeTabNode === node.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="font-bold text-xs text-slate-200">{node.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{node.latency}ms</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>{node.location}</span>
                  </span>
                  {node.status === 'idle' && <span className="text-slate-500 font-medium">Idle</span>}
                  {node.status === 'fetching' && (
                    <span className="text-indigo-400 font-semibold flex items-center space-x-1"><Loader2 className="w-3 h-3 animate-spin" /><span>Fetching Web</span></span>
                  )}
                  {node.status === 'prompting' && (
                    <span className="text-cyan-400 font-semibold flex items-center space-x-1"><Loader2 className="w-3 h-3 animate-spin" /><span>LLM Prompting</span></span>
                  )}
                  {node.status === 'success' && (
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>Parsed JSON</span></span>
                  )}
                </div>
              </div>
            ))}

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 mt-6 text-xs text-slate-400 space-y-2">
              <div className="flex items-center space-x-1.5 text-slate-200 font-bold">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Equivalence Principle</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Each node independently fetches the web data and runs the LLM prompt. Contract state is updated only if all nodes produce identical JSON outputs (strict_eq).
              </p>
            </div>
          </div>

          {/* Right: Terminal */}
          <div className="md:col-span-8 p-6 flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-mono font-bold text-slate-200">Terminal View: {selectedNode.name}</span>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">Status: {selectedNode.status.toUpperCase()}</span>
            </div>

            <div className="flex-1 flex flex-col space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center space-x-1">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t.rawBbcData} (gl.nondet.web.render)</span>
                </label>
                <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 border border-slate-800 min-h-[120px] whitespace-pre-wrap overflow-x-auto shadow-inner">
                  {selectedNode.renderedText ? selectedNode.renderedText : <span className="text-slate-600 italic">Waiting for web render initiation...</span>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center space-x-1">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.llmJsonOutput} (gl.nondet.exec_prompt)</span>
                </label>
                <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-cyan-300 border border-slate-800 min-h-[90px] whitespace-pre-wrap overflow-x-auto shadow-inner">
                  {selectedNode.llmOutput ? selectedNode.llmOutput : <span className="text-slate-600 italic">Waiting for LLM prompt execution...</span>}
                </div>
              </div>
            </div>

            {step === 'check_consensus' && (
              <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center space-x-3 text-indigo-200 text-xs animate-pulse">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Verifying gl.eq_principle.strict_eq...</div>
                  <div>Checking if Validator Alpha, Beta, and Gamma produced exact matching JSON string.</div>
                </div>
              </div>
            )}

            {step === 'complete' && (
              <div className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${
                isMatchFinished ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              }`}>
                {isMatchFinished ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />}
                <div className="space-y-1">
                  <div className="font-bold text-sm text-slate-100">{isMatchFinished ? t.strictEqMatch : t.strictEqFailed}</div>
                  <p className="text-slate-300 leading-relaxed">
                    {isMatchFinished
                      ? `100% consensus achieved! The match concluded with score ${simData.expectedScore}. Smart contract updated winner = ${simData.expectedWinner} and has_resolved = True.`
                      : t.unresolvedExplain}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button onClick={onClose} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm border border-slate-700 transition-all shadow-md">
            {step === 'complete' ? 'Done' : t.closeModal}
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { t, pythonContractCode } from '../data/mockData';
import { Code2, FileText, Cpu, Globe, Network } from 'lucide-react';

export const ContractStudio: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Explanations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-xl shadow-lg text-slate-950">
                <Code2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">{t.studioTitle}</h2>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800">
                  py-genlayer v0.2.16
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{t.studioDescription}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider px-1">{t.codeExplanationTitle}</h3>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors shadow-md space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                <Globe className="w-5 h-5 flex-shrink-0" />
                <span>{t.exp1Title}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{t.exp1Desc}</p>
              <div className="p-2.5 bg-slate-950 rounded-xl font-mono text-[11px] text-cyan-300 border border-slate-800">
                web_data = gl.nondet.web.render(market_resolution_url, mode="text")
              </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors shadow-md space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
                <Cpu className="w-5 h-5 flex-shrink-0" />
                <span>{t.exp2Title}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{t.exp2Desc}</p>
              <div className="p-2.5 bg-slate-950 rounded-xl font-mono text-[11px] text-cyan-300 border border-slate-800">
                result = gl.nondet.exec_prompt(task)
              </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors shadow-md space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <Network className="w-5 h-5 flex-shrink-0" />
                <span>{t.exp3Title}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{t.exp3Desc}</p>
              <div className="p-2.5 bg-slate-950 rounded-xl font-mono text-[11px] text-emerald-300 border border-slate-800">
                result_json = gl.eq_principle.strict_eq(get_match_result)
              </div>
            </div>
          </div>
        </div>

        {/* Right: Code */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-slate-300 font-mono font-bold">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>prediction_market.py</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
            </div>
            <div className="p-6 bg-slate-950/80 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto overflow-y-auto custom-scrollbar flex-1 max-h-[800px] leading-relaxed">
              <pre>{pythonContractCode}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

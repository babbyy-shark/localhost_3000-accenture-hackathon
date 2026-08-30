import React from 'react';
import { ChatResponsePayload } from '@/lib/types';
import { Router, Lock, Waypoints, AlertTriangle, Activity } from 'lucide-react';

interface DashboardPanelProps {
  chatState: ChatResponsePayload | null;
  isLoading: boolean;
}

export function DashboardPanel({ chatState, isLoading }: DashboardPanelProps) {
  if (!chatState && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 w-full col-span-2">
        <p>Awaiting telemetry...</p>
        <p className="text-sm mt-2">Inject prompt to establish connection.</p>
      </div>
    );
  }

  const isDeflected = chatState?.deflection_active || false;
  const contradiction = chatState?.fact_check_results?.find(r => r.status === 'contradiction');

  return (
    <section className="w-full h-full flex flex-col justify-center gap-8 relative z-10">
      <div className="absolute -top-10 right-0 text-right w-full">
        <h2 className="font-mono text-lg text-[#c0c1ff]/80 uppercase tracking-widest border-b border-[#c0c1ff]/20 pb-2 inline-flex items-center gap-2">
            Telemetry_Inspector <Activity size={20} />
        </h2>
      </div>

      {/* Node 1: Semantic Gateway */}
      <div className="glass-card p-5 relative overflow-hidden group floating-node self-end w-[90%]">
        <div className="absolute inset-0 bg-[#c0c1ff]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[11px] font-bold text-[#c7c4d7] uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff]"></span> Semantic Gateway
          </span>
          <Router className="text-[#c0c1ff]" size={20} />
        </div>
        <div className="text-xl font-medium glow-text-primary flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isDeflected ? 'bg-[#c0c1ff] animate-pulse-glow' : 'bg-slate-700'}`}></div>
          Vector Deflection: {isDeflected ? 'Active' : 'Inactive'}
        </div>
        <div className="mt-4 h-1 w-full bg-[#353437]/30 rounded-full overflow-hidden">
          <div className={`h-full ${isDeflected ? 'bg-[#c0c1ff] animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_#c0c1ff]' : 'bg-slate-700'} w-full rounded-full`}></div>
        </div>
      </div>

      {/* Node 2 & 3 Container */}
      <div className="flex gap-6 w-full justify-end">
        {/* Node 2: PII Vault */}
        <div className="glass-card-emerald p-5 relative overflow-hidden floating-node w-[48%]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-bold text-[#4edea3] uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span> PII Vault
            </span>
            <Lock className="text-[#4edea3]" size={20} />
          </div>
          <div className="flex flex-col gap-2">
            {chatState?.vault_events && chatState.vault_events.length > 0 ? (
              chatState.vault_events.map((e, idx) => (
                <div key={idx} className="font-mono text-xs text-[#e5e1e4] bg-[#4edea3]/10 border border-[#4edea3]/20 p-2 rounded-lg inline-block w-full text-center">
                  <span className="text-[#c7c4d7] line-through">{e.original}</span> <span className="text-[#4edea3] mx-1">→</span> <span className="glow-text-secondary font-bold">[{e.redacted}]</span>
                </div>
              ))
            ) : (
               <div className="text-xs text-slate-500 italic text-center w-full">NO_PII_DETECTED</div>
            )}
          </div>
          <div className="mt-3 text-[9px] text-[#4edea3]/70 font-mono text-center">REDACT_OK // 99.9%</div>
        </div>

        {/* Node 3: Smart Routing */}
        <div className="glass-card-emerald p-5 relative overflow-hidden floating-node w-[48%]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-[#4edea3] uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span> Routing Optimizer
            </span>
          </div>
          <div className="flex items-end gap-2 mt-1">
            <div className="text-4xl font-bold glow-text-secondary tracking-tighter">{chatState?.cost_saved_pct || 0}%</div>
          </div>
          <div className="font-mono text-xs text-[#4edea3]/80 mt-1">Cost Efficiency</div>
          <div className="mt-3 flex gap-1 h-4 items-end opacity-80">
            <div className="w-full bg-[#4edea3]/20 h-1/4 rounded-t-sm"></div>
            <div className="w-full bg-[#4edea3]/40 h-2/4 rounded-t-sm"></div>
            <div className="w-full bg-[#4edea3]/60 h-3/4 rounded-t-sm"></div>
            <div className="w-full bg-[#4edea3] h-full rounded-t-sm shadow-[0_0_8px_#4edea3]"></div>
          </div>
        </div>
      </div>

      {/* Node 4: Fact Checking */}
      <div className={`glass-card-amber p-5 relative overflow-hidden floating-node self-start w-[85%] ${contradiction ? 'border-t-2 border-t-[#ffb95f]' : 'border-slate-800 border'}`}>
        {contradiction && <div className="absolute top-0 left-0 w-full h-[1px] bg-[#ffb95f] shadow-[0_0_15px_#ffb95f]"></div>}
        <div className="flex justify-between items-center mb-2">
          <span className={`text-[11px] font-bold ${contradiction ? 'text-[#ffb95f]' : 'text-slate-500'} uppercase tracking-widest flex items-center gap-2`}>
            <span className={`w-1.5 h-1.5 rounded-full ${contradiction ? 'bg-[#ffb95f] animate-ping' : 'bg-slate-700'}`}></span> Fact Checking Engine
          </span>
          <AlertTriangle className={contradiction ? "text-[#ffb95f] text-2xl animate-flicker drop-shadow-[0_0_8px_#ffb95f]" : "text-slate-500"} />
        </div>
        <div className={`text-xl font-medium ${contradiction ? 'glow-text-tertiary' : 'text-slate-400'} mt-2`}>
          Status: {contradiction ? 'Contradiction Found' : 'Verified'}
        </div>
        <div className={`mt-3 text-[10px] ${contradiction ? 'text-[#ffb95f]/70 bg-[#ffb95f]/10 border-[#ffb95f]/20' : 'text-slate-500 bg-slate-800 border-slate-700'} font-mono py-1 px-2 rounded border inline-block`}>
          {contradiction ? 'INTERVENTION_REQ // REF: 0x9A4B' : 'ALL_CLAIMS_VERIFIED'}
        </div>
      </div>
    </section>
  );
}

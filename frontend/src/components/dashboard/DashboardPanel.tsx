import React from 'react';
import { ChatResponsePayload } from '@/lib/types';
import { ShieldCheck, Lock, Waypoints, AlertTriangle, FileCheck, ArrowRight } from 'lucide-react';

interface DashboardPanelProps {
  chatState: ChatResponsePayload | null;
  isLoading: boolean;
}

export function DashboardPanel({ chatState, isLoading }: DashboardPanelProps) {
  if (!chatState && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <p>Awaiting traffic...</p>
        <p className="text-sm mt-2">Send a message to see the X-Ray in action.</p>
      </div>
    );
  }

  const similarity = chatState?.similarity_score || 0;
  const isDeflected = chatState?.deflection_active || false;
  
  // Find if there is a contradiction
  const contradiction = chatState?.fact_check_results?.find(r => r.status === 'contradiction');

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full content-start">
        
        {/* Card 1: Semantic Gateway */}
        <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 border-glow-indigo relative overflow-hidden group min-h-[160px]">
          <div className="absolute inset-0 bg-[#c0c1ff]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between z-10">
            <span className="text-[11px] uppercase tracking-widest font-bold text-[#c7c4d7]">Semantic Gateway</span>
            <ShieldCheck size={20} className="text-[#c0c1ff] drop-shadow-[0_0_10px_rgba(192,193,255,0.5)]" />
          </div>
          <div className="flex flex-col z-10">
            <span className="text-2xl font-semibold tracking-tight text-[#e5e1e4]">Vector Deflection</span>
            <div className="flex items-center gap-2 mt-2">
              <span className={`h-2 w-2 rounded-full ${isDeflected ? 'bg-[#c0c1ff] shadow-[0_0_5px_rgba(192,193,255,1)]' : 'bg-slate-600'}`}></span>
              <span className={`text-xs font-mono font-medium tracking-wider ${isDeflected ? 'text-[#c0c1ff]' : 'text-slate-400'}`}>
                {isDeflected ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
            <svg fill="none" height="60" viewBox="0 0 100 60" width="100" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 60L50 10L100 60" stroke="#c0c1ff" strokeWidth="2"></path>
              <path d="M20 60L50 30L80 60" stroke="#c0c1ff" strokeWidth="2"></path>
            </svg>
          </div>
        </div>

        {/* Card 2: PII Vault */}
        <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden border-glow-emerald min-h-[160px]">
          <div className="flex items-center justify-between z-10">
            <span className="text-[11px] uppercase tracking-widest font-bold text-[#c7c4d7]">PII Vault</span>
            <Lock size={20} className="text-[#4edea3]" />
          </div>
          <div className="flex flex-col z-10 mt-auto space-y-2">
            {chatState?.vault_events && chatState.vault_events.length > 0 ? (
              chatState.vault_events.map((e, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-[#0e0e10] border border-[#464554]/30 rounded px-3 py-2">
                  <span className="text-sm text-[#e5e1e4] line-through opacity-70">{e.original}</span>
                  <ArrowRight size={14} className="text-[#908fa0]" />
                  <span className="text-xs font-mono font-medium tracking-wider text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded border border-[#4edea3]/20">[{e.redacted}]</span>
                </div>
              ))
            ) : (
               <div className="text-sm text-slate-500 italic">No PII detected.</div>
            )}
          </div>
        </div>

        {/* Card 3: Smart Routing */}
        <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 border-glow-emerald lg:col-span-2">
          <div className="flex items-center justify-between z-10">
            <span className="text-[11px] uppercase tracking-widest font-bold text-[#c7c4d7]">Smart Routing</span>
            <Waypoints size={20} className="text-[#4edea3]" />
          </div>
          <div className="flex flex-col items-center justify-center py-4 z-10">
            <span className="text-[48px] leading-none font-bold text-[#4edea3] tracking-tight">{chatState?.cost_saved_pct || 0}%</span>
            <span className="text-base text-[#c7c4d7] mt-1">Cost Saved</span>
          </div>
          <div className="mt-auto border-t border-[#464554]/30 pt-3 z-10 flex justify-between items-center">
            <span className="text-xs font-mono font-medium tracking-wider text-[#c7c4d7]">Model Routed:</span>
            <span className="text-xs font-mono font-medium text-[#e5e1e4] bg-[#353437] px-2 py-1 rounded">
              {chatState?.model_routed ? chatState.model_routed.split('/').pop() : 'Evaluating...'}
            </span>
          </div>
        </div>

        {/* Card 4: Fact Checking */}
        <div className={`glass-panel rounded-xl p-6 flex flex-col gap-4 ${contradiction ? 'border-glow-amber' : 'border-[#27272a]'} lg:col-span-2`}>
          <div className="flex items-center justify-between z-10">
            <span className="text-[11px] uppercase tracking-widest font-bold text-[#c7c4d7]">Fact Checking</span>
            <AlertTriangle size={20} className={contradiction ? "text-[#ffb95f]" : "text-slate-500"} />
          </div>
          {chatState?.fact_check_results && chatState.fact_check_results.length > 0 ? (
            <div className={`flex items-start gap-4 ${contradiction ? 'bg-[#ffb95f]/10 border-[#ffb95f]/20' : 'bg-slate-800/30 border-slate-700'} border rounded-lg p-4 mt-2`}>
              <div className={`h-10 w-10 rounded-full ${contradiction ? 'bg-[#ffb95f]/20' : 'bg-slate-700'} flex items-center justify-center shrink-0`}>
                <FileCheck size={20} className={contradiction ? "text-[#ffb95f]" : "text-slate-400"} />
              </div>
              <div>
                <span className={`block text-xs font-mono font-medium tracking-wider ${contradiction ? 'text-[#ffb95f]' : 'text-slate-300'} mb-1`}>
                  Status: {contradiction ? 'Contradiction Found' : 'Verified'}
                </span>
                <span className="block text-sm text-[#c7c4d7]">
                  {contradiction ? "Real-time cross-reference indicates internal audit policy may be inaccurate in generated response." : "All factual claims matched company knowledge base."}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic mt-2">Monitoring stream for factual claims...</div>
          )}
        </div>

      </div>
    </div>
  );
}

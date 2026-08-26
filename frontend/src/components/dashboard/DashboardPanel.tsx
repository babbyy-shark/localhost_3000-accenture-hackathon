import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChatResponsePayload } from '@/lib/types';

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
  const riskScore = chatState?.final_risk_score || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-indigo-400">ControlPlane.ai X-Ray</h2>
        {isLoading && <span className="text-xs text-indigo-400 animate-pulse">ANALYZING...</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Layer 0: Gateway */}
        <Card className="bg-[#12121A] border-[#1E1E2E] text-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-400">Layer 0: Semantic Gateway</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-1">
              <span>Danger Zone Proximity:</span>
              <span className={similarity > 0.8 ? 'text-red-400' : 'text-green-400'}>
                {(similarity * 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={similarity * 100} className="h-2 mb-4 bg-[#1E1E2E]" />
            {isDeflected ? (
              <Badge variant="destructive" className="bg-red-500/20 text-red-400 border border-red-500/50">
                ⚡ Semantic Deflection Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-green-400 border-green-400/50">
                ✅ Clean Prompt
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Layer 1: PII Vault */}
        <Card className="bg-[#12121A] border-[#1E1E2E] text-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-400">Layer 1: PII Vault</CardTitle>
          </CardHeader>
          <CardContent>
            {chatState?.vault_events && chatState.vault_events.length > 0 ? (
              <div className="space-y-2">
                {chatState.vault_events.map((e, idx) => (
                  <div key={idx} className="text-xs flex items-center gap-2 bg-[#0A0A0F] p-2 rounded border border-[#1E1E2E]">
                    <span className="text-red-400 line-through">{e.original}</span>
                    <span>→</span>
                    <span className="text-green-400 font-mono">{e.redacted}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No PII detected in payload.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Layer 2: Routing & Cost */}
      <Card className="bg-[#12121A] border-[#1E1E2E] text-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-400">Layer 2: Smart Routing & Cost</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <div>
            <div className="text-xs text-slate-500 mb-1">Model Selected</div>
            <div className="font-mono text-indigo-400">{chatState?.model_routed || 'Evaluating...'}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-1">Savings vs Frontier</div>
            <div className="text-xl font-bold text-green-400">{chatState?.cost_saved_pct || 0}%</div>
          </div>
        </CardContent>
      </Card>

      {/* Layer 3: Fact Checking */}
      <Card className="bg-[#12121A] border-[#1E1E2E] text-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-400">Layer 3: Fact Checking (NLI)</CardTitle>
        </CardHeader>
        <CardContent>
           {chatState?.fact_check_results && chatState.fact_check_results.length > 0 ? (
             <ul className="space-y-2 text-sm">
               {chatState.fact_check_results.map((res, i) => (
                 <li key={i} className="flex gap-2 items-start">
                   {res.status === 'verified' && <span className="text-green-400">✅</span>}
                   {res.status === 'contradiction' && <span className="text-yellow-500">⚠️</span>}
                   <span className={res.status === 'contradiction' ? 'text-yellow-200' : 'text-slate-300'}>{res.claim}</span>
                 </li>
               ))}
             </ul>
           ) : (
             <div className="text-sm text-slate-500">No verifiable claims extracted.</div>
           )}
        </CardContent>
      </Card>

      {/* Decision Engine */}
      <Card className="bg-[#12121A] border-[#1E1E2E] text-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-400">Decision Engine: Composite Risk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={riskScore * 100} className={`h-3 bg-[#1E1E2E] ${riskScore > 0.7 ? 'indicator-red' : riskScore > 0.4 ? 'indicator-yellow' : 'indicator-green'}`} />
            </div>
            <div className={`font-bold ${riskScore > 0.7 ? 'text-red-400' : riskScore > 0.4 ? 'text-yellow-400' : 'text-green-400'}`}>
              {(riskScore * 100).toFixed(0)} / 100
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

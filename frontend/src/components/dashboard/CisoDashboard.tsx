import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CisoDashboardProps {
  metrics: {
    totalRequests: number;
    deflected: number;
    vaulted: number;
    blocked: number;
    avgLatency: number;
  };
}

export function CisoDashboard({ metrics }: CisoDashboardProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-indigo-400">Governance & Metrics</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-[#12121A] border-[#1E1E2E] text-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-400">Total API Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{metrics.totalRequests}</div>
            <p className="text-xs text-slate-500 mt-1">Queries processed this session</p>
          </CardContent>
        </Card>

        <Card className="bg-[#12121A] border-[#1E1E2E] text-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-400">Threats Neutralized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">
              {metrics.deflected + metrics.vaulted + metrics.blocked}
            </div>
            <p className="text-xs text-slate-500 mt-1">Deflections, vaults, and blocks combined</p>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-md font-semibold text-slate-300 border-b border-[#1E1E2E] pb-2 mb-4">False Positive Monitoring</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Over-Flagging Rate (False Positives)</span>
          <span className="text-sm font-bold text-green-400">1.2%</span>
        </div>
        <Progress value={1.2} max={5} className="h-2 bg-[#1E1E2E]" />
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-slate-400">Under-Flagging Rate (False Negatives)</span>
          <span className="text-sm font-bold text-red-400">0.4%</span>
        </div>
        <Progress value={0.4} max={5} className="h-2 bg-[#1E1E2E]" />
      </div>

      <h3 className="text-md font-semibold text-slate-300 border-b border-[#1E1E2E] pb-2 mt-8 mb-4">System Health</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0A0A0F] p-4 rounded border border-[#1E1E2E]">
          <div className="text-xs text-slate-500 mb-1">Avg Additive Latency</div>
          <div className="text-lg font-bold text-yellow-400">{metrics.avgLatency}ms</div>
        </div>
        <div className="bg-[#0A0A0F] p-4 rounded border border-[#1E1E2E]">
          <div className="text-xs text-slate-500 mb-1">Cost Savings</div>
          <div className="text-lg font-bold text-green-400">68%</div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ScenarioTabs({ activeScenario, setActiveScenario }: any) {
  return (
    <div className="w-full">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Load Demo Scenario</h3>
      <Tabs value={activeScenario} onValueChange={setActiveScenario} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#12121A] border border-[#1E1E2E]">
          <TabsTrigger 
            value="responsibility" 
            onClick={() => setActiveScenario('responsibility')}
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400"
          >
            Responsibility
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            onClick={() => setActiveScenario('performance')}
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger 
            value="cost" 
            onClick={() => setActiveScenario('cost')}
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400"
          >
            Cost
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

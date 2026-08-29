"use client";

import React, { useState } from 'react';
import { SplitScreen } from '@/components/layout/SplitScreen';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { DashboardPanel } from '@/components/dashboard/DashboardPanel';
import { CisoDashboard } from '@/components/dashboard/CisoDashboard';
import { Message, ChatResponsePayload } from '@/lib/types';

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatState, setChatState] = useState<ChatResponsePayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'xray' | 'ciso'>('xray');
  const [policy, setPolicy] = useState<'customer_chatbot' | 'internal_copilot'>('customer_chatbot');

  // Metrics for CISO dashboard
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    deflected: 0,
    vaulted: 0,
    blocked: 0,
    avgLatency: 45
  });

  const handleSend = async (prompt: string) => {
    const newMsg: Message = { role: 'user', content: prompt };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    const startTime = Date.now();

    try {
      // Calling the FastAPI backend
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages, 
          scenario_id: "demo",
          policy: policy
        })
      });
      const data: ChatResponsePayload = await res.json();
      
      setChatState(data);
      
      // Update metrics
      const latency = Date.now() - startTime;
      setMetrics(prev => ({
        totalRequests: prev.totalRequests + 1,
        deflected: prev.deflected + (data.deflection_active ? 1 : 0),
        vaulted: prev.vaulted + (data.vault_events.length > 0 ? 1 : 0),
        blocked: prev.blocked + (data.policy_action === 'BLOCKED' ? 1 : 0),
        avgLatency: Math.round((prev.avgLatency * prev.totalRequests + latency) / (prev.totalRequests + 1))
      }));
      
      // Look for a contradiction to flag
      const contradiction = data.fact_check_results?.find(r => r.status === 'contradiction');
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        flaggedSentence: contradiction ? contradiction.claim : undefined
      }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to backend.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const leftPanel = (
    <ChatPanel 
      messages={messages}
      onSend={handleSend}
    />
  );

  const rightPanel = (
    <div className="flex flex-col h-full bg-transparent">
      <header className="h-16 px-8 w-full border-b border-[#27272a] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ffb95f]">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <h1 className="text-xl font-medium text-[#e5e1e4]">X-Ray Monitoring</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 text-xs font-mono rounded ${viewMode === 'xray' ? 'bg-[#c0c1ff] text-[#0d0096]' : 'bg-[#201f22] text-[#c7c4d7] hover:text-white'}`}
              onClick={() => setViewMode('xray')}
            >
              Live X-Ray
            </button>
            <button 
              className={`px-3 py-1 text-xs font-mono rounded ${viewMode === 'ciso' ? 'bg-[#c0c1ff] text-[#0d0096]' : 'bg-[#201f22] text-[#c7c4d7] hover:text-white'}`}
              onClick={() => setViewMode('ciso')}
            >
              CISO
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-mono font-medium tracking-wider text-[#4edea3] uppercase">Live Telemetry</span>
            <div className="relative h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#4edea3] pulse-indicator"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4edea3]"></span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {viewMode === 'xray' ? (
          <DashboardPanel chatState={chatState} isLoading={isLoading} />
        ) : (
          <CisoDashboard metrics={metrics} />
        )}
      </div>
    </div>
  );

  return (
    <SplitScreen leftPanel={leftPanel} rightPanel={rightPanel} />
  );
}

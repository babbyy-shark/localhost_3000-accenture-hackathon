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
    <div className="w-full h-full">
      {viewMode === 'xray' ? (
        <DashboardPanel chatState={chatState} isLoading={isLoading} />
      ) : (
        <CisoDashboard metrics={metrics} />
      )}
    </div>
  );

  const headerActions = (
    <div className="flex space-x-2">
      <button 
        className={`px-3 py-1 text-xs font-mono rounded border ${viewMode === 'xray' ? 'bg-[#c0c1ff]/20 border-[#c0c1ff] text-[#c0c1ff] glow-text-primary' : 'bg-transparent border-[#464554] text-[#c7c4d7] hover:border-[#c0c1ff]/50 hover:text-[#c0c1ff]'}`}
        onClick={() => setViewMode('xray')}
      >
        Neural Mesh
      </button>
      <button 
        className={`px-3 py-1 text-xs font-mono rounded border ${viewMode === 'ciso' ? 'bg-[#c0c1ff]/20 border-[#c0c1ff] text-[#c0c1ff] glow-text-primary' : 'bg-transparent border-[#464554] text-[#c7c4d7] hover:border-[#c0c1ff]/50 hover:text-[#c0c1ff]'}`}
        onClick={() => setViewMode('ciso')}
      >
        CISO View
      </button>
    </div>
  );

  return (
    <SplitScreen leftPanel={leftPanel} rightPanel={rightPanel} headerActions={headerActions} />
  );
}

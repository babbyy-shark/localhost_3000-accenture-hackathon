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
    <div className="flex flex-col h-full bg-[#12121A]">
      <div className="flex justify-between items-center p-4 border-b border-[#1E1E2E]">
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 text-sm rounded ${viewMode === 'xray' ? 'bg-indigo-600 text-white' : 'bg-[#1E1E2E] text-slate-400 hover:text-white'}`}
            onClick={() => setViewMode('xray')}
          >
            Live X-Ray
          </button>
          <button 
            className={`px-4 py-2 text-sm rounded ${viewMode === 'ciso' ? 'bg-indigo-600 text-white' : 'bg-[#1E1E2E] text-slate-400 hover:text-white'}`}
            onClick={() => setViewMode('ciso')}
          >
            CISO Dashboard
          </button>
        </div>
        
        {viewMode === 'xray' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Active Policy:</span>
            <select 
              className="bg-[#1E1E2E] border border-slate-700 text-slate-200 text-xs rounded px-2 py-1"
              value={policy}
              onChange={(e) => setPolicy(e.target.value as any)}
            >
              <option value="customer_chatbot">Customer Chatbot (Strict)</option>
              <option value="internal_copilot">Internal Copilot (Permissive)</option>
            </select>
          </div>
        )}
      </div>

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

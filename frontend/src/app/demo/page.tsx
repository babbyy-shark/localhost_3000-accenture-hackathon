"use client";

import React, { useState } from 'react';
import { SplitScreen } from '@/components/layout/SplitScreen';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { DashboardPanel } from '@/components/dashboard/DashboardPanel';
import { Message, ChatResponsePayload } from '@/lib/types';

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatState, setChatState] = useState<ChatResponsePayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (prompt: string) => {
    const newMsg: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, newMsg]);
    setIsLoading(true);

    try {
      // Calling the FastAPI backend
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, scenario_id: "demo" }) // scenario_id is no longer used for logic
      });
      const data: ChatResponsePayload = await res.json();
      
      setChatState(data);
      
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
    <DashboardPanel 
      chatState={chatState}
      isLoading={isLoading}
    />
  );

  return (
    <SplitScreen leftPanel={leftPanel} rightPanel={rightPanel} />
  );
}

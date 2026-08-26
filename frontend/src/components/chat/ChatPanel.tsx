import React, { useState } from 'react';
import { Send } from 'lucide-react';

export function ChatPanel({ messages, onSend }: any) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F]">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg: any, idx: number) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-[#12121A] border border-[#1E1E2E] text-slate-200'
            }`}>
              <div className="text-sm">{msg.content}</div>
              {msg.flaggedSentence && (
                <div className="mt-2 pt-2 border-t border-yellow-500/30 text-yellow-500 text-sm flex items-center">
                  <span className="mr-2">⚠️</span>
                  <span className="underline decoration-yellow-500 decoration-wavy underline-offset-4">{msg.flaggedSentence}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[#1E1E2E] bg-[#12121A]">
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-full px-5 py-3 pr-12 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder:text-slate-500"
            placeholder="Type your prompt here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Send, User, Bot, AlertTriangle } from 'lucide-react';

export function ChatPanel({ messages, onSend }: any) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Header */}
      <header className="flex justify-between items-center h-16 px-8 w-full border-b border-[#27272a] bg-[#131315]/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <ShieldLogo />
          <span className="text-xl font-bold tracking-tighter text-[#c0c1ff]">ControlPlane.ai</span>
        </div>
      </header>

      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
        {messages.map((msg: any, idx: number) => {
          if (msg.role === 'user') {
            return (
              <div key={idx} className="flex flex-col items-end gap-2 max-w-2xl self-end">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-medium tracking-wider text-[#c7c4d7]">Employee</span>
                  <div className="h-6 w-6 rounded-full bg-[#201f22] flex items-center justify-center border border-[#464554]/50">
                    <User size={14} className="text-[#c7c4d7]" />
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl rounded-tr-none text-base text-[#e5e1e4]">
                  {msg.content}
                </div>
              </div>
            );
          } else {
            return (
              <div key={idx} className="flex flex-col items-start gap-2 max-w-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-6 w-6 rounded-full bg-[#8083ff]/20 flex items-center justify-center border border-[#c0c1ff]/30">
                    <Bot size={14} className="text-[#c0c1ff]" />
                  </div>
                  <span className="text-xs font-mono font-medium tracking-wider text-[#c0c1ff]">ControlPlane Agent</span>
                </div>
                <div className="glass-panel p-4 rounded-xl rounded-tl-none text-base text-[#c7c4d7] leading-relaxed relative">
                  {msg.flaggedSentence ? (
                    <>
                      {msg.content.split(msg.flaggedSentence).map((part: string, i: number, arr: any[]) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="relative inline-block mt-1 group">
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#353437] border border-[#ffb95f] text-[#ffb95f] text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded flex items-center gap-1 shadow-lg z-20 tooltip-float whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                <AlertTriangle size={12} />
                                Unverified claim
                              </div>
                              <span className="text-[#e5e1e4] pb-1 cursor-help" style={{ borderBottom: '2px wavy #f59e0b' }}>
                                {msg.flaggedSentence}
                              </span>
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Message Input */}
      <div className="p-8 pt-4 border-t border-[#27272a] bg-[#0e0e10] shrink-0">
        <div className="relative flex items-center">
          <input
            className="w-full bg-[#09090b] border border-[#464554]/50 focus:border-[#c0c1ff] focus:ring-0 rounded-lg py-3 pl-4 pr-12 text-sm text-[#e5e1e4] placeholder:text-[#c7c4d7]/50 transition-colors outline-none"
            placeholder="Type a message..."
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 h-8 w-8 rounded flex items-center justify-center bg-[#c0c1ff] hover:bg-[#8083ff] text-[#0d0096] transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 text-center">
          <span className="text-[10px] font-mono text-[#c7c4d7]/50">ControlPlane.ai monitors all prompts for compliance.</span>
        </div>
      </div>
    </div>
  );
}

function ShieldLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#c0c1ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8L8 12M12 8L16 12M12 8V16M8 12L12 16M16 12L12 16" stroke="#c0c1ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

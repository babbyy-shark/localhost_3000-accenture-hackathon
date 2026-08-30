import React, { useState } from 'react';
import { Send, Network } from 'lucide-react';

export function ChatPanel({ messages, onSend }: any) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <section className="w-full h-[80%] flex flex-col relative z-10 floating-node glass-card p-6">
      <div className="mb-4">
        <h2 className="font-mono text-lg text-[#c0c1ff] glow-text-primary uppercase tracking-widest border-b border-[#c0c1ff]/20 pb-2 flex items-center gap-2">
          <Network size={20} />
          Neural Cluster: Chat_Monitor
        </h2>
      </div>

      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-2">
        {messages.map((msg: any, idx: number) => {
          if (msg.role === 'user') {
            return (
              <div key={idx} className="self-end max-w-[85%]">
                <div className="bg-[#353437]/40 border border-[#464554]/30 backdrop-blur-sm p-4 rounded-2xl rounded-tr-sm text-[#e5e1e4] text-base shadow-lg">
                  {msg.content}
                </div>
                <div className="text-right mt-1 font-mono text-[10px] text-[#c7c4d7]">USR_REQ_{idx} // {new Date().toLocaleTimeString()}</div>
              </div>
            );
          } else {
            return (
              <div key={idx} className="self-start max-w-[85%]">
                <div className="bg-[#c0c1ff]/10 border border-[#c0c1ff]/20 backdrop-blur-sm p-4 rounded-2xl rounded-tl-sm text-[#e5e1e4] text-base shadow-[0_4px_20px_rgba(192,193,255,0.1)]">
                  {msg.flaggedSentence ? (
                    <>
                      {msg.content.split(msg.flaggedSentence).map((part: string, i: number, arr: any[]) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="wavy-underline font-semibold text-[#ffb95f]">
                              {msg.flaggedSentence}
                              <span className="tooltip">
                                ⚠ Unverified claim - Intervention Required
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
                <div className="text-left mt-1 font-mono text-[10px] text-[#c0c1ff]/70">AI_RESP_GEN // {new Date().toLocaleTimeString()}</div>
              </div>
            );
          }
        })}
      </div>

      {/* Message Input */}
      <div className="mt-4 pt-4 border-t border-[#c0c1ff]/20 relative flex items-center group">
        <span className="text-[#c0c1ff]/70 absolute left-2 font-mono">{'>_'}</span>
        <input
          className="w-full bg-[#201f22]/50 border border-[#c0c1ff]/10 rounded-xl outline-none focus:border-[#c0c1ff]/50 text-[#c0c1ff] font-mono text-sm py-3 pl-10 pr-10 placeholder-[#c0c1ff]/40 transition-colors shadow-inner"
          placeholder="Injecting stream to network..."
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend}
          className="absolute right-3 text-[#c0c1ff] hover:glow-text-primary transition-all"
        >
          <Send size={18} />
        </button>
      </div>
    </section>
  );
}

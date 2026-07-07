import { useState } from 'react';
import { Bot, Send, Sparkles, ChevronRight, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { API_BASE_URL } from '../config';

const SUGGESTED_PROMPTS = [
  'Explain recent movement',
  'Summarize earnings impact',
  'Compare AAPL and MSFT',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  structured?: {
    summary?: string;
    reasoning?: string[];
    dataPoints?: { label: string; value: string }[];
    risks?: string[];
  };
}

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hi, I'm MarketMind Analyst. Ask me to explain market movements, summarize earnings, or deep dive into any stock's narrative.",
  }
];

export default function RightPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          context: {} // We'll pass context if needed, empty for now
        })
      });
      
      const data = await res.json();
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, the AI backend is currently unreachable.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (collapsed) {
    return (
      <div className="w-12 border-l border-slate-200 bg-white flex flex-col items-center py-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setCollapsed(false)}>
        <Bot size={20} className="text-green-700" />
        <Maximize2 size={14} className="text-slate-400 mt-auto" />
      </div>
    );
  }

  return (
    <aside className="w-[340px] min-w-[340px] h-screen bg-white border-l border-slate-200 flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.03)]">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot size={18} className="text-green-700" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white" />
          </div>
          <div className="font-semibold text-sm text-slate-800">MarketMind Analyst</div>
        </div>
        <button onClick={() => setCollapsed(true)} className="text-slate-400 hover:text-slate-700 p-1">
          <Minimize2 size={14} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex flex-col", msg.role === 'user' ? 'items-end' : 'items-start')}
            >
              {msg.role === 'user' ? (
                <div className="bg-slate-100 text-slate-800 px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm max-w-[85%]">
                  {msg.content}
                </div>
              ) : (
                <div className="w-full">
                  {msg.content && (
                    <div className="text-sm text-slate-700 mb-3">{msg.content}</div>
                  )}
                  {msg.structured && (
                    <div className="space-y-3 bg-[#f8fafb] border border-slate-100 rounded-xl p-3.5">
                      {msg.structured.summary && (
                        <div className="text-sm text-slate-800 font-medium leading-snug">
                          {msg.structured.summary}
                        </div>
                      )}
                      
                      {msg.structured.reasoning && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Key Reasoning</div>
                          <ul className="space-y-1.5">
                            {msg.structured.reasoning.map((r, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                <ChevronRight size={12} className="text-green-600 flex-shrink-0 mt-0.5" />
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {msg.structured.dataPoints && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Data Points</div>
                          <div className="grid grid-cols-2 gap-2">
                            {msg.structured.dataPoints.map((dp, i) => (
                              <div key={i} className="bg-white border border-slate-100 rounded-lg p-2">
                                <div className="text-[10px] text-slate-500">{dp.label}</div>
                                <div className="text-xs font-semibold text-slate-800 mt-0.5">{dp.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.structured.risks && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Risk Factors</div>
                          <ul className="space-y-1.5">
                            {msg.structured.risks.map((r, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1.5 items-center text-green-700 py-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-white">
        {/* Suggested Prompts */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="Ask about a stock or narrative..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none min-h-[44px] max-h-[120px]"
            rows={1}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-green-600 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-1 text-[9px] text-slate-400">
            <Sparkles size={10} /> AI can make mistakes.
          </div>
          <div className="text-[9px] text-slate-400">Press Enter to send</div>
        </div>
      </div>
    </aside>
  );
}

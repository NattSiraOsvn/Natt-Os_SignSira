
import React, { useState, useRef, useEffect } from 'react';
import { Domain, ChatMessage, PersonaID } from '../types';
import { DOMAINS, PERSONAS } from '../constants';
import { generatePersonaResponse, speakText, requestApiKey } from '@/cells/infrastructure/ai-connector-cell/domain/services/gemini.engine';
import AIAvatar from './AIAvatar';

interface ChatConsultantProps {
  initialDomain?: Domain;
}

const ChatConsultant: React.FC<ChatConsultantProps> = ({ initialDomain }) => {
  const [activeDomain, setActiveDomain] = useState<Domain>(initialDomain || Domain.AUDIT);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{data: string, type: string, mimeType: string, name: string} | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const domainInfo = DOMAINS.find(d => d.id === activeDomain) || DOMAINS[0];
  const persona = PERSONAS[domainInfo.persona];

  const NATT_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, errorMsg]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        let type = 'file';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else if (file.type.startsWith('audio/')) type = 'audio';

        setSelectedFile({
          data: ev.target?.result as string,
          type: type,
          mimeType: file.type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateKey = async () => {
    await requestApiKey();
    setQuotaExceeded(false);
    setErrorMsg(null);
  };

  const handleSend = async (forcedInput?: string) => {
    const currentInput = forcedInput || input;
    if (!currentInput.trim() && !selectedFile || isLoading) return;

    setErrorMsg(null);
    setQuotaExceeded(false);

    const userMsg: ChatMessage = {
      id: Math.random().toString(36),
      role: 'user',
      content: currentInput || `Đã gửi tệp: ${selectedFile?.name}`,
      personaId: PersonaID.THIEN,
      timestamp: Date.now(),
      type: (selectedFile?.type as any) || 'text',
      fileData: selectedFile?.data
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentFile = selectedFile;
    setSelectedFile(null);
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    try {
      const result = await generatePersonaResponse(domainInfo.persona, currentInput, {
        history,
        useThinking: useThinking || domainInfo.persona === PersonaID.THIEN,
        useMaps,
        file: currentFile ? { data: currentFile.data, mimeType: currentFile.mimeType } : undefined
      });

      const modelMsg: ChatMessage = {
        id: Math.random().toString(36),
        role: 'model',
        content: result.text,
        personaId: domainInfo.persona,
        timestamp: Date.now(),
        /* Fix: Added missing type property to modelMsg */
        type: 'text',
        citations: result.citations,
        isThinking: useThinking || domainInfo.persona === PersonaID.THIEN,
        suggestedActions: result.suggestedActions
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error: any) {
      console.error(error);
      const isQuota = error?.message?.includes('429') || error?.status === 429;
      if (isQuota) {
        setQuotaExceeded(true);
        setErrorMsg("⚠️ Neural Link Overload (429): Quota hệ thống hiện tại đã hết. Anh Natt có thể cấu hình API Key cá nhân từ dự án có trả phí để tiếp tục.");
      } else {
        setErrorMsg("⚠️ Hệ thống gặp sự cố không mong muốn. Đang rà soát nguyên nhân...");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 relative">
      {/* Header */}
      <div className="p-4 border-b border-white/10 glass flex flex-wrap items-center justify-between gap-4 z-10">
        <div className="flex items-center space-x-4">
          <AIAvatar personaId={domainInfo.persona} isThinking={isLoading} />
          <div>
            <h3 className="font-bold text-white flex items-center">
              {persona.name} 
              <span className="ml-2 text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 uppercase font-black tracking-widest">
                {isLoading ? 'Neural Thinking...' : 'Ready to Consult'}
              </span>
            </h3>
            <p className="text-[9px] text-gray-500 font-medium italic mt-0.5 uppercase tracking-tighter">{persona.role}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setUseThinking(!useThinking)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all text-[10px] font-bold uppercase tracking-tighter ${
              useThinking ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'border-white/10 text-gray-500'
            }`}
          >
            <span>🧠 Deep Analysis</span>
          </button>
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          <div className="flex bg-white/5 rounded-xl p-1 overflow-x-auto max-w-md no-scrollbar">
            {DOMAINS.map(d => (
              <button
                key={d.id}
                onClick={() => setActiveDomain(d.id)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                  activeDomain === d.id ? 'bg-amber-500 text-black' : 'text-gray-500 hover:text-white'
                }`}
              >
                {d.title.split(' | ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 z-10 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
            {msg.role === 'model' && <AIAvatar personaId={msg.personaId} size="md" isThinking={msg.isThinking && idx === messages.length - 1} />}
            
            <div className="flex flex-col space-y-2 max-w-[85%]">
              <div className={`rounded-3xl px-6 py-5 relative group ${
                msg.role === 'user' 
                  ? 'bg-amber-500/10 text-amber-100 border border-amber-500/30' 
                  : 'glass text-gray-200 border border-white/10'
              }`}>
                {msg.role === 'model' && (
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">
                      {msg.personaId} {msg.isThinking && '• DEEP ANALYSIS'}
                    </span>
                    <button onClick={() => speakText(msg.content)} className="opacity-40 group-hover:opacity-100 transition-opacity p-1 hover:text-amber-500">🔊</button>
                  </div>
                )}
                
                {msg.fileData && (
                  <div className="mb-4 rounded-2xl overflow-hidden border border-white/10 bg-black/20 p-2">
                    {msg.type === 'image' ? <img src={msg.fileData} className="max-h-64 w-full object-cover rounded-xl" /> :
                     msg.type === 'video' ? <video src={msg.fileData} controls className="max-h-64 rounded-xl" /> :
                     <div className="flex items-center gap-3 p-4">
                        <span className="text-3xl">📄</span>
                        <div>
                          <p className="text-xs font-bold text-white uppercase">{msg.content.replace('Đã gửi tệp: ', '')}</p>
                          <p className="text-[9px] text-gray-500 font-mono italic">OMEGA SECURED BLOCK</p>
                        </div>
                     </div>}
                  </div>
                )}

                <div className="whitespace-pre-wrap leading-relaxed text-[13px] md:text-sm font-light italic">
                  {msg.content}
                </div>
              </div>

              {/* Suggested Action Chips */}
              {msg.role === 'model' && msg.suggestedActions && idx === messages.length - 1 && (
                <div className="flex flex-wrap gap-2 mt-2 animate-in fade-in slide-in-from-left-4 duration-1000">
                  {msg.suggestedActions.map((action, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSend(action)}
                      className="px-4 py-1.5 bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/50 rounded-full text-[10px] font-bold text-gray-400 hover:text-amber-500 transition-all flex items-center gap-2 active:scale-95"
                    >
                      <span>⚡</span> {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-12 h-12 rounded-full border border-amber-500/20 overflow-hidden shrink-0 shadow-xl self-start">
                 <img src={NATT_AVATAR} className="w-full h-full object-cover" title="Master Natt" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10"></div>
            <div className="h-14 w-32 glass rounded-2xl border border-white/10"></div>
          </div>
        )}

        {errorMsg && (
          <div className="max-w-2xl mx-auto glass border-red-500/30 bg-red-500/5 p-8 rounded-[3rem] animate-in zoom-in-95 text-center shadow-2xl">
             <p className="text-xs font-bold text-red-400 mb-6 leading-relaxed">{errorMsg}</p>
             <div className="flex flex-wrap justify-center gap-4">
                {quotaExceeded && (
                  <button 
                    onClick={handleUpdateKey}
                    className="px-8 py-3 bg-amber-500 text-black font-black text-[10px] uppercase rounded-2xl shadow-xl hover:bg-amber-400 transition-all active:scale-95"
                  >
                    Cấu hình API Key cá nhân
                  </button>
                )}
                <button 
                    onClick={() => handleSend()}
                    className="px-8 py-3 bg-white/10 border border-white/20 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-white/20 transition-all"
                >
                  Thử lại | Retry
                </button>
             </div>
             {quotaExceeded && (
               <p className="mt-4 text-[9px] text-gray-500 italic">
                 Yêu cầu API Key từ dự án trả phí. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-amber-500">Xem hướng dẫn Billing</a>
               </p>
             )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 glass border-t border-white/10 bg-black/60 z-20">
        {selectedFile && (
          <div className="mb-4 flex items-center space-x-3 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 animate-in slide-in-from-bottom-4">
            <span className="text-xl">📄</span>
            <div className="flex-1">
               <p className="text-[10px] text-amber-200 font-bold uppercase truncate">{selectedFile.name}</p>
               <p className="text-[8px] text-amber-500/50 uppercase font-black">Ready for Neural Ingest</p>
            </div>
            <button onClick={() => setSelectedFile(null)} className="text-amber-500 hover:text-white p-2 text-xl">✕</button>
          </div>
        )}
        <div className="relative max-w-5xl mx-auto flex items-end space-x-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-amber-500/50 transition-all text-xl active:scale-90"
            title="Nạp tri thức (Numbers, Pages, Excel, PDF...)"
          >
            📎
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileSelect} 
            accept=".pdf,.xlsx,.xls,.csv,.docx,.doc,.numbers,.pages,image/*,video/*" 
          />
          
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Giao nhiệm vụ cho ${persona.name}...`}
              className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white focus:outline-none focus:border-amber-500/50 transition-all resize-none h-16"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={isLoading || (!input.trim() && !selectedFile)}
            className="p-5 bg-amber-500 text-black rounded-2xl shadow-xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? '...' : '🚀'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatConsultant;



import React, { useState, useEffect } from 'react';
import { IngestStatus, FileMetadata, PersonaID } from '../types';
import { Ingestion } from '@/core/ingestion/ingestion.service';
import { QuantumBuffer } from '@/core/smartlink/quantum-buffer.engine';
import { DocumentParserLayer } from '@/core/ingestion/document-parser.engine';
import AIAvatar from './aiavatar';

const OmegaProcessor: React.FC = () => {
  const [isWorkerActive, setIsWorkerActive] = useState(false);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [history, setHistory] = useState<FileMetadata[]>([]);

  useEffect(() => {
    // WORKER LOOP: Lắng nghe QuantumBuffer
    const unsubscribe = QuantumBuffer.subscribe(async (queue) => {
       const ingestTask = queue.find(t => t.type === 'MEDIA_INGEST' && !isWorkerActive);
       
       if (ingestTask && !isWorkerActive) {
          await processBackgroundMedia(ingestTask);
       }
    });

    setHistory(Ingestion.getHistory());
    const historyInterval = setInterval(() => setHistory(Ingestion.getHistory()), 3000);

    return () => {
      unsubscribe();
      clearInterval(historyInterval);
    };
  }, [isWorkerActive]);

  const processBackgroundMedia = async (task: any) => {
    setIsWorkerActive(true);
    setCurrentTask(task.payload.fileName);
    
    try {
       const { fileBlob, taskId } = task.payload;
       // Thực thi parse nặng tại đây (Background)
       console.log(`[WORKER] Bóc tách Media 19TB: ${task.payload.fileName}`);
       
       // 1. Đăng ký Shard
       const meta = await Ingestion.validateAndRegister(fileBlob);
       
       // 2. Chạy Deep OCR/Parser
       await DocumentParserLayer.executeHeavyParse(fileBlob);
       
       // 3. Commit
       Ingestion.updateStatus(meta.id, IngestStatus.COMMITTED, { confidence: 0.98, context: 'MEDIA_VAULT' });
       
    } catch (err) {
       console.error("[WORKER] Shard Process Failed:", err);
    } finally {
       setIsWorkerActive(false);
       setCurrentTask(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#020202] p-8 md:p-12 overflow-y-auto no-scrollbar gap-10 animate-in fade-in duration-700 pb-40">
      <header className="flex justify-between items-end border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Worker Node v3.0</span>
             <h2 className="ai-headline text-6xl italic uppercase tracking-tighter leading-none">Omega Background Processor</h2>
          </div>
          <p className="ai-sub-headline text-cyan-300/40 ml-1 italic font-black tracking-[0.4em]">Xử lý Media 19TB phi tập trung • Không giật UI</p>
        </div>
        
        <div className="flex items-center gap-6">
           {isWorkerActive ? (
              <div className="flex items-center gap-4 px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl animate-pulse">
                 <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                 <span className="text-[10px] font-black text-amber-500 uppercase">Worker Busy: {currentTask}</span>
              </div>
           ) : (
              <div className="flex items-center gap-4 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-2xl">
                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                 <span className="text-[10px] font-black text-green-500 uppercase">Worker Standby</span>
              </div>
           )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 ai-panel overflow-hidden border-white/5 bg-black/40">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
               <h3 className="text-sm font-bold text-white uppercase italic tracking-widest">Ingestion Ledger</h3>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-[11px]">
                  <thead>
                     <tr className="text-gray-500 font-black uppercase tracking-widest border-b border-white/10 bg-black">
                        <th className="p-6">Asset Name</th>
                        <th className="p-6">Status</th>
                        <th className="p-6 text-right">Timestamp</th>
                     </tr>
                  </thead>
                  <tbody className="text-gray-300">
                     {history.map(file => (
                       <tr key={file.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="p-6 font-bold uppercase truncate max-w-xs">{file.fileName}</td>
                          <td className="p-6">
                             <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${file.status === IngestStatus.COMMITTED ? 'text-green-500' : 'text-amber-500'}`}>{file.status}</span>
                          </td>
                          <td className="p-6 text-right font-mono opacity-40">{new Date(file.uploadedAt).toLocaleTimeString()}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="space-y-8">
            <div className="ai-panel p-8 border-indigo-500/30 bg-indigo-500/5 flex flex-col items-center text-center">
               <AIAvatar personaId={PersonaID.PHIEU} size="lg" isThinking={isWorkerActive} />
               <h4 className="ai-sub-headline text-indigo-400 mt-6 mb-4">Phiêu: Background Work</h4>
               <p className="text-[12px] text-gray-400 italic leading-relaxed">
                  "Thưa Anh Natt, Phiêu đã tách riêng luồng xử lý ảnh 4K và tệp Excel 19TB. Anh cứ tiếp tục thao tác Terminal, Phiêu sẽ âm thầm bóc tách và thông báo khi Shard dữ liệu đã sẵn sàng."
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default OmegaProcessor;

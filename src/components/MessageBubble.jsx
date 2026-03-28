import { useState } from 'react';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [showCitations, setShowCitations] = useState(false);

  if (isUser) {
    return (
      <div className="flex justify-end ml-12 mb-6">
        <div className="bg-brand-surface-high border-4 border-brand-border p-6 shadow-[4px_4px_0_0_var(--brand-border)] max-w-2xl relative">
          {message.imagePreview && (
            <div className="mb-4 bg-zinc-100 border-2 border-brand-border p-2">
              <img src={message.imagePreview} alt="Attached" className="max-w-[200px] h-auto border-2 border-brand-border" />
            </div>
          )}
          <p className="font-bold text-lg whitespace-pre-wrap text-brand-text">{message.content}</p>
          <span className="block text-[10px] font-black uppercase text-brand-text-muted mt-4 font-headline">User Query</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 justify-start mr-12 mb-6">
      <div className="bg-brand-surface border-4 border-brand-border p-8 shadow-[8px_8px_0_0_var(--brand-border)] max-w-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary"></div>
        <div className="mb-6 flex justify-between items-center">
          <span className="bg-brand-bg border-2 border-brand-border text-brand-text px-3 py-1 text-xs font-black uppercase font-headline shadow-[2px_2px_0_0_var(--brand-border)]">COGNIMED AI Core</span>
          <span className="text-brand-primary material-symbols-outlined">verified</span>
        </div>
        
        <p className="font-bold text-brand-text mb-6 leading-relaxed whitespace-pre-wrap text-[17px]">
          {message.content}
        </p>

        {message.citations && message.citations.length > 0 && (
          <div className="mt-8 border-t-2 border-brand-border pt-6">
            <button 
              onClick={() => setShowCitations(!showCitations)}
              className="bg-brand-surface border-2 border-brand-border text-brand-text px-3 py-1 flex items-center gap-2 hover:bg-brand-primary hover:text-black transition-colors uppercase font-black text-xs font-headline cursor-pointer mb-4 shadow-[2px_2px_0_0_var(--brand-border)]"
            >
              <span className="material-symbols-outlined text-sm">link</span>
              {showCitations ? 'HIDE SOURCES' : `VIEW SOURCES [${message.citations.length}]`}
            </button>
            
            {showCitations && (
              <div className="border-4 border-brand-border overflow-hidden">
                <table className="w-full text-left font-headline">
                  <thead className="bg-brand-surface-high text-brand-text border-b-4 border-brand-border">
                    <tr>
                      <th className="p-3 text-xs uppercase font-black">Source / Pg</th>
                      <th className="p-3 text-xs uppercase font-black">Extracted Fact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-brand-border bg-brand-surface">
                    {message.citations.map((cit, idx) => (
                      <tr key={idx} className="hover:bg-brand-surface-high transition-colors">
                        <td className="p-3 font-bold text-sm min-w-[100px] align-top border-r-2 border-brand-border text-brand-primary">PG: {cit.page}</td>
                        <td className="p-3 font-bold text-sm italic text-brand-text">"{cit.text}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Telemetry Metrics Row */}
      {(message.inferenceTime || message.tokensPerSecond) && (
        <div className="flex gap-6 px-2 mt-2">
          {message.inferenceTime && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Inference Time:</span>
              <span className="text-[10px] font-black text-brand-primary font-mono">{message.inferenceTime}ms</span>
            </div>
          )}
          {message.tokensPerSecond && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Tokens/sec:</span>
              <span className="text-[10px] font-black text-brand-secondary font-mono">{message.tokensPerSecond.toFixed(1)}</span>
            </div>
          )}
          {message.tokensGenerated && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Tokens:</span>
              <span className="text-[10px] font-black text-brand-tertiary font-mono">{message.tokensGenerated}</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

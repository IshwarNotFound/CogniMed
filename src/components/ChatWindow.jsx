import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import SuggestionCards from './SuggestionCards';
import { useEffect, useRef } from 'react';

export default function ChatWindow({ history, isLoading, onSuggestionSelect }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  return (
    <div className="space-y-6">
      <div className="bg-brand-surface border-4 border-brand-border p-8 shadow-[8px_8px_0_0_var(--brand-border)] flex items-start gap-6 mb-8 mt-2 transition-colors">
        <div className="bg-brand-bg border-2 border-brand-border p-3 text-brand-primary shadow-[2px_2px_0_0_var(--brand-border)]">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
        </div>
        <div>
          <h3 className="text-3xl font-black font-headline uppercase leading-none mb-2 text-brand-text">Neural Inference Active</h3>
          <p className="text-lg font-bold leading-tight text-brand-text-muted">AI engine is live and monitoring the current diagnostic baseline. Upload clinical documents or inquire below.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <SuggestionCards onSelect={onSuggestionSelect} />
      ) : (
        <div className="space-y-6 pb-4">
          {history.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} className="h-2" />
        </div>
      )}
    </div>
  );
}

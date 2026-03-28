import { useEffect, useState } from 'react';
import { getSuggestions } from '../api/client';

export default function SuggestionCards({ onSelect }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await getSuggestions();
        if (data && data.suggestions) {
            setSuggestions(data.suggestions);
        }
      } catch (e) {
        console.error("Failed to load suggestions, using fallbacks", e);
        setSuggestions([
            { id: 1, title: "Analyze latest lab results", description: "Full biomarker breakdown", icon: "analytics", query: "Can you analyze the latest lab results and provide a full biomarker breakdown?" },
            { id: 2, title: "Check drug interactions", description: "Verify compatibility matrices", icon: "medication", query: "Please check the patient's current medication list for any dangerous drug interactions." },
            { id: 3, title: "Summarize patient history", description: "Temporal trend synthesis", icon: "history_edu", query: "Provide a comprehensive summary of the patient's medical history over the last 5 years." }
        ]);
      }
    };
    fetchSuggestions();
  }, []);

  if (suggestions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
      {suggestions.map((card, idx) => (
        <button 
          key={card.id || idx}
          onClick={() => onSelect(card.query || card.title)}
          className="group bg-brand-surface border-2 border-brand-border p-4 text-left shadow-[4px_4px_0px_0px_var(--brand-border)] hover:shadow-[6px_6px_0px_0px_var(--brand-primary)] hover:-translate-y-1 transition-all"
        >
          <div className="text-brand-primary mb-2">
            <span className="material-symbols-outlined">{card.icon || "analytics"}</span>
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-brand-text group-hover:text-brand-primary transition-colors">
            {card.title}
          </p>
          <p className="text-[10px] text-brand-text-muted mt-2 font-medium">
            {card.description}
          </p>
        </button>
      ))}
    </div>
  );
}

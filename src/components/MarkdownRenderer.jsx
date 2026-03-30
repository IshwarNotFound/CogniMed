// Item 8 — Secure Markdown AST Parsing (XSS Prevention)
// Uses react-markdown + remark-gfm. Every node is intercepted at the AST level
// and mapped to a safe HTML element styled with the Neo-Brutalist design system.
// There is ZERO use of dangerouslySetInnerHTML anywhere in this component.
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // ── Text Blocks ──────────────────────────────────────────────────────
        p: ({ node, ...props }) => (
          <p className="mb-4 text-brand-text leading-relaxed last:mb-0" {...props} />
        ),
        strong: ({ node, ...props }) => (
          <strong className="font-black text-brand-primary uppercase tracking-wide" {...props} />
        ),
        em: ({ node, ...props }) => (
          <em className="italic text-brand-text-muted" {...props} />
        ),

        // ── Headings — down-shifted for DOM hierarchy (page already has h1) ──
        h1: ({ node, ...props }) => (
          <h3 className="text-lg font-black text-brand-text mt-6 mb-3 border-b-2 border-brand-secondary pb-1 font-headline uppercase" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h4 className="text-base font-bold text-brand-text mt-5 mb-2 font-headline uppercase" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h5 className="text-sm font-bold text-brand-text mt-4 mb-2 uppercase tracking-wider font-headline" {...props} />
        ),

        // ── Lists ────────────────────────────────────────────────────────────
        ul: ({ node, ...props }) => (
          <ul className="list-disc pl-5 mb-4 space-y-2 text-brand-text marker:text-brand-secondary" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal pl-5 mb-4 space-y-2 text-brand-text marker:text-brand-primary marker:font-bold" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="pl-1 font-bold" {...props} />
        ),

        // ── Code & Data ──────────────────────────────────────────────────────
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          return !inline ? (
            <div className="bg-brand-bg border-4 border-brand-border shadow-[4px_4px_0_0_var(--brand-border)] overflow-hidden my-4">
              <div className="bg-brand-surface-high px-4 py-1 text-xs text-brand-text-muted font-mono border-b-2 border-brand-border uppercase tracking-widest">
                {match ? match[1] : 'DATA OUTPUT'}
              </div>
              <pre className="p-4 overflow-x-auto text-sm text-brand-primary font-mono">
                <code className={className} {...props}>{children}</code>
              </pre>
            </div>
          ) : (
            <code
              className="bg-brand-surface-high text-brand-primary font-mono text-sm px-1.5 py-0.5 border border-brand-border"
              {...props}
            >
              {children}
            </code>
          );
        },

        // ── Blockquote — styled as a clinical note/callout ───────────────────
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-brand-secondary bg-brand-surface border-2 border-brand-border italic px-4 py-3 my-4 text-brand-text-muted"
            {...props}
          />
        ),

        // ── Table (GFM) ──────────────────────────────────────────────────────
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4 border-4 border-brand-border shadow-[4px_4px_0_0_var(--brand-border)]">
            <table className="w-full text-left font-headline text-sm" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-brand-surface-high text-brand-text border-b-4 border-brand-border" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="p-3 text-xs uppercase font-black" {...props} />
        ),
        tbody: ({ node, ...props }) => (
          <tbody className="divide-y-2 divide-brand-border bg-brand-surface" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="p-3 font-bold text-sm text-brand-text" {...props} />
        ),
        tr: ({ node, ...props }) => (
          <tr className="hover:bg-brand-surface-high transition-colors" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

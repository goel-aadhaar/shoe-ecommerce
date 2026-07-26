'use client';

import { useState } from 'react';
import { Sparkles, Send, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { aiService } from '@/services/ai.service';
import type { AskResponse } from '@/types';

const SUGGESTIONS = [
  'Is this shoe good for long walks?',
  'How do these fit? Size up or down?',
  'What is the return policy?',
];

/**
 * RAG "ask about this shoe" — grounded answer with citations to the
 * product knowledge base (specs, policies, FAQs). Falls back gracefully when
 * the KB hasn't been ingested yet.
 */
export function AiAskShoe({ productId }: { productId: string }) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [pending, setPending] = useState(false);

  async function ask(q: string) {
    if (!q.trim() || pending) return;
    setPending(true);
    setResponse(null);
    try {
      const res = await aiService.ask(q, productId);
      setResponse(res.data);
    } catch {
      setResponse({
        answer: 'I couldn’t reach the knowledge base right now. Please try again.',
        citations: [],
        grounded: false,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-10 border-t border-ink/15 pt-7">
      <p className="section-tag flex items-center gap-2 text-copper">
        <Sparkles className="h-3.5 w-3.5" />
        AI Knowledge Assistant
      </p>
      <h3 className="mt-2 font-serif text-2xl uppercase text-ink">
        Ask About This Shoe
      </h3>

      <div className="mt-4 flex flex-col gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => ask(s)}
            disabled={pending}
            className="border border-ink/15 px-3 py-2 text-left font-sans text-sm text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bone disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
          setQuestion('');
        }}
        className="mt-4 flex border border-ink/15"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything…"
          className="flex-1 bg-paper px-4 py-3 font-sans text-sm text-ink placeholder:text-ink/40 focus:outline-none"
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending || !question.trim()}
          aria-label="Ask"
          className="flex items-center justify-center bg-ink px-4 text-bone transition-colors hover:bg-cobalt disabled:opacity-30"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>

      {response && (
        <div className="mt-4 border border-ink/15 bg-paper p-5">
          <p className="font-sans text-sm leading-relaxed text-ink">
            {response.answer}
          </p>
          {response.citations.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em]">
              <span className="text-ink/40">Sources:</span>
              {response.citations.map((c, i) =>
                c.productId ? (
                  <Link
                    key={i}
                    href={`/shoe/${c.productId}`}
                    className="flex items-center gap-1 border border-ink/15 px-2 py-0.5 text-ink/70 transition-colors hover:border-ink hover:text-ink"
                  >
                    {c.title ?? c.source}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                ) : (
                  <span
                    key={i}
                    className="border border-ink/15 px-2 py-0.5 text-ink/70"
                  >
                    {c.title ?? c.source}
                  </span>
                ),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

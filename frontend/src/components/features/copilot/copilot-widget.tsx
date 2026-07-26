'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Send, X, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { aiService } from '@/services/ai.service';
import { DEFAULT_PLACEHOLDER } from '@/constants';
import type { SearchProduct } from '@/types';
import { RichText } from './rich-text';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  products?: SearchProduct[];
}

const SESSION_KEY = 'urban-sole:copilot-session';

function newSessionId() {
  return `c-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

const SUGGESTIONS = [
  'White sneakers under ₹12,000',
  'I have flat feet — what do you recommend?',
  'Shoes for long walks and outdoor trails',
  'Something similar to Air Max but cheaper',
];

export function CopilotWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stable session id, persisted so preference slots carry across reloads.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = newSessionId();
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    setSessionId(id);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, pending]);

  // Escape closes the panel (collapsing first if expanded).
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      setExpanded((wasExpanded) => {
        if (wasExpanded) return false;
        setOpen(false);
        return false;
      });
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, expanded]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !sessionId || pending) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setPending(true);

    try {
      const res = await aiService.chat(sessionId, trimmed);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: res.data.reply, products: res.data.products },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'The copilot is taking a moment — please try again shortly.',
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  // The site header is `sticky top-0 z-50`, so the panel must sit above it
  // (z-60) or its own header — and the enlarge/close buttons — get painted
  // over. It also stays clear of the header band so the two never overlap.
  const panelSize = expanded
    ? 'top-28 bottom-4 left-4 right-4 sm:left-8 sm:right-8 lg:left-[10vw] lg:right-[10vw]'
    : 'bottom-24 right-4 sm:right-6 w-[min(400px,92vw)] h-[min(620px,calc(100vh-11rem))]';

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close shopping copilot' : 'Open shopping copilot'}
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-ink text-bone shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal={expanded}
          aria-label="AI Shopping Copilot"
          className={`fixed z-[60] flex flex-col border border-ink/15 bg-paper shadow-2xl ${panelSize}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink/15 bg-ink px-4 py-3 text-bone">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-[0.2em]">
                Shopping Copilot
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-label={expanded ? 'Shrink copilot' : 'Enlarge copilot'}
                className="p-1.5 transition-colors hover:text-copper"
              >
                {expanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close copilot"
                className="p-1.5 transition-colors hover:text-copper"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            <div className={expanded ? 'mx-auto w-full max-w-3xl' : ''}>
              {messages.length === 0 ? (
                <div className="flex h-full flex-col justify-end">
                  <div className="mb-4">
                    <p className="font-serif text-2xl uppercase text-ink">
                      Tell me what you need.
                    </p>
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-ink/40">
                      Plain English — I&apos;ll find the right pair.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="border border-ink/15 px-3 py-2 text-left font-sans text-sm text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bone"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((m, i) => (
                    <MessageBubble key={i} message={m} expanded={expanded} />
                  ))}
                  {pending && (
                    <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/40">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Thinking
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-ink/15 bg-bone"
          >
            <div className={`flex ${expanded ? 'mx-auto w-full max-w-3xl' : ''}`}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe what you need…"
                aria-label="Message the shopping copilot"
                className="flex-1 bg-transparent px-4 py-3.5 font-sans text-sm text-ink placeholder:text-ink/40 focus:outline-none"
                disabled={pending}
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                aria-label="Send message"
                className="flex items-center justify-center bg-ink px-5 text-bone transition-colors hover:bg-cobalt disabled:opacity-30"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function MessageBubble({
  message,
  expanded,
}: {
  message: ChatMessage;
  expanded: boolean;
}) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-ink px-3.5 py-2.5 font-sans text-sm leading-relaxed text-bone">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="max-w-[92%] border border-ink/15 bg-bone px-3.5 py-3 font-sans text-sm text-ink">
        <RichText text={message.text} />
      </div>

      {message.products && message.products.length > 0 && (
        <div
          className={
            expanded
              ? 'grid grid-cols-2 gap-2 md:grid-cols-4'
              : 'flex gap-2 overflow-x-auto pb-1'
          }
        >
          {message.products.slice(0, expanded ? 8 : 4).map((p) => (
            <Link
              key={p._id}
              href={`/shoe/${p._id}`}
              className={`flex shrink-0 flex-col border border-ink/15 bg-bone transition-colors hover:border-ink ${
                expanded ? 'w-full' : 'w-36'
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-ink/5">
                <Image
                  src={p.thumbnail ?? DEFAULT_PLACEHOLDER}
                  alt={p.name ?? 'Product'}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <div className="px-2.5 py-2">
                <p className="line-clamp-1 font-mono text-[10px] uppercase tracking-widest text-ink/50">
                  {p.brand}
                </p>
                <p className="line-clamp-2 font-sans text-xs leading-snug text-ink">
                  {p.name}
                </p>
                <p className="mt-1 font-mono text-xs font-bold text-ink">
                  ₹{(p.price ?? 0).toLocaleString('en-IN')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

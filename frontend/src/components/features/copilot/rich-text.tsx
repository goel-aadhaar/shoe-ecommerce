'use client';

import { Fragment, type ReactNode } from 'react';

/**
 * Minimal renderer for the light markdown the copilot emits: `- ` bullets,
 * `**bold**`, and blank-line paragraph breaks.
 *
 * Deliberately builds React elements rather than an HTML string — model output
 * is untrusted, and there is no `dangerouslySetInnerHTML` anywhere in this
 * path, so a prompt injection cannot inject markup.
 */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // Split on **bold** while keeping the delimiters' content.
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={`${keyPrefix}-t${i}`}>{part}</Fragment>;
  });
}

export function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  // The model uses "- " bullets most of the time but falls back to "1." lists
  // for ranked picks, so both have to render as real lists.
  let items: string[] = [];
  let ordered = false;

  const flushItems = (key: string) => {
    if (items.length === 0) return;
    blocks.push(
      <ul key={key} className="my-2 flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={`${key}-${i}`} className="flex gap-2.5">
            {ordered ? (
              <span className="mt-px font-mono text-[11px] font-bold tabular-nums text-cobalt">
                {i + 1}.
              </span>
            ) : (
              <span
                aria-hidden
                className="mt-1.75 h-1 w-1 shrink-0 rounded-full bg-ink/40"
              />
            )}
            <span className="flex-1">{renderInline(item, `${key}-${i}`)}</span>
          </li>
        ))}
      </ul>,
    );
    items = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);

    if (bullet || numbered) {
      const isOrdered = Boolean(numbered);
      // A change of list style starts a new list.
      if (items.length > 0 && isOrdered !== ordered) flushItems(`list-${idx}`);
      ordered = isOrdered;
      items.push((numbered ?? bullet)![1]);
      return;
    }

    flushItems(`list-${idx}`);
    if (line.trim() === '') return;
    blocks.push(
      <p key={`p-${idx}`} className="my-1.5 first:mt-0 last:mb-0">
        {renderInline(line, `p-${idx}`)}
      </p>,
    );
  });
  flushItems('list-end');

  return <div className="leading-relaxed">{blocks}</div>;
}

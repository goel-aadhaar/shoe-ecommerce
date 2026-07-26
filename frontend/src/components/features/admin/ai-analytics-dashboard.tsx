'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { aiService } from '@/services/ai.service';
import type { AnalyticsSummary } from '@/types';

/**
 * AI analytics dashboard. Palettes were validated with the data-viz validator
 * against this app's real chart surface (#ffffff card / #141210 dark):
 *   categorical  cobalt #1a14ff + orange #eb6834   (CVD ΔE 35.4, normal 49.1)
 *   funnel ramp  #a9a6f9 → #1a14cc (ordinal, monotone L, gaps ≥ 0.06)
 * Every series is direct-labelled, so identity never rests on colour alone.
 */
const RANGES = [7, 30, 90] as const;

export function AiAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    aiService
      .analyticsSummary(days)
      .then((res) => {
        if (active) setData(res.data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [days]);

  return (
    <div className="viz-root">
      <style>{`
        .viz-root {
          --surface-1: #ffffff;
          --grid: #e1e0d9;
          --axis: #c3c2b7;
          --ink-muted: #898781;
          --series-1: #1a14ff;
          --series-2: #eb6834;
          --f1: #a9a6f9; --f2: #7773f5; --f3: #4640f0; --f4: #1a14cc;
        }
        @media (prefers-color-scheme: dark) {
          :root:where(:not([data-theme="light"])) .viz-root {
            --surface-1: #141210; --grid: #2c2c2a; --axis: #383835;
            --series-1: #6b66ff; --series-2: #d95926;
            --f1: #2a24d6; --f2: #4640f0; --f3: #7773f5; --f4: #a9a6f9;
          }
        }
      `}</style>

      {/* Header + range filter (one row above the charts) */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/15 pb-6">
        <div>
          <p className="section-tag flex items-center gap-2 text-copper">
            <Sparkles className="h-3.5 w-3.5" />
            AI Analytics
          </p>
          <h2 className="mt-3 font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[0.85] text-ink">
            Intelligence Dashboard
          </h2>
        </div>
        <div className="flex items-center gap-px bg-ink/15">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDays(r)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] transition-colors ${
                days === r
                  ? 'bg-ink text-bone'
                  : 'bg-paper text-ink/60 hover:text-ink'
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center font-mono text-xs uppercase tracking-[0.3em] text-ink/40">
          Loading metrics…
        </div>
      ) : error || !data ? (
        <div className="mt-8 border border-dashed border-ink/20 py-20 text-center">
          <p className="font-serif text-3xl uppercase text-ink">Analytics Unavailable</p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-ink/40">
            The AI service isn’t responding.
          </p>
        </div>
      ) : (
        <>
          {/* Stat row — headline numbers, no chart needed */}
          <div className="mt-8 grid grid-cols-2 gap-px bg-ink/15 lg:grid-cols-4">
            <Stat label="Events" value={data.engagement.events.toLocaleString('en-IN')} />
            <Stat label="Unique Users" value={data.engagement.uniqueUsers.toLocaleString('en-IN')} />
            <Stat label="CTR" value={pct(data.rates.ctr)} />
            <Stat label="Conversion" value={pct(data.rates.conversionRate)} />
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <Funnel data={data} />
            <DailySeries data={data} />
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <TopProducts data={data} />
            <TopSearches data={data} />
          </div>

          {/* Provenance */}
          <p className="mt-10 border-t border-ink/15 pt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
            Model {data.modelVersion ?? 'not trained'} · Copilot: {data.copilot.sessions} sessions,{' '}
            {data.copilot.messages} messages · Window {data.windowDays}d
          </p>
        </>
      )}
    </div>
  );
}

function pct(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">{label}</p>
      <p className="mt-2 font-serif text-4xl leading-none text-ink">{value}</p>
    </div>
  );
}

function Panel({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="font-serif text-xl uppercase text-ink">{title}</h3>
      {subtitle && (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
          {subtitle}
        </p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Funnel — magnitude by ordered stage. Horizontal bars, direct-labelled. */
function Funnel({ data }: { data: AnalyticsSummary }) {
  const max = Math.max(...data.funnel.map((f) => f.count), 1);
  const fills = ['var(--f1)', 'var(--f2)', 'var(--f3)', 'var(--f4)'];
  const LABELS: Record<string, string> = {
    view: 'Viewed', click: 'Clicked', add_to_cart: 'Added to cart', purchase: 'Purchased',
  };

  return (
    <Panel title="Conversion Funnel" subtitle={`Last ${data.windowDays} days`}>
      <div className="flex flex-col gap-3">
        {data.funnel.map((stage, i) => {
          const pctOfTop = max ? (stage.count / max) * 100 : 0;
          return (
            <div key={stage.stage}>
              <div className="flex items-baseline justify-between font-mono text-xs">
                <span className="uppercase tracking-[0.15em] text-ink/70">
                  {LABELS[stage.stage] ?? stage.stage}
                </span>
                <span className="tabular-nums font-bold text-ink">
                  {stage.count.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="mt-1.5 h-6 w-full bg-ink/5">
                <div
                  className="h-full rounded-r-[4px]"
                  style={{ width: `${Math.max(pctOfTop, 0.5)}%`, background: fills[i] }}
                  role="img"
                  aria-label={`${LABELS[stage.stage]}: ${stage.count}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/** Daily activity — change over time, 2 series, legend + direct end-labels. */
function DailySeries({ data }: { data: AnalyticsSummary }) {
  const points = data.daily.slice(-30);
  if (points.length === 0) {
    return (
      <Panel title="Daily Activity">
        <Empty />
      </Panel>
    );
  }
  const max = Math.max(...points.map((p) => p.total), 1);

  return (
    <Panel title="Daily Activity" subtitle="Views vs purchases">
      {/* Legend — identity never rests on colour alone */}
      <div className="mb-4 flex gap-5 font-mono text-[10px] uppercase tracking-[0.15em]">
        <Key color="var(--series-1)" label="Views" />
        <Key color="var(--series-2)" label="Purchases" />
      </div>
      <div className="flex h-40 items-end gap-px overflow-x-auto">
        {points.map((p) => {
          const views = p.counts.view ?? 0;
          const purchases = p.counts.purchase ?? 0;
          return (
            <div
              key={p.day}
              className="flex min-w-[8px] flex-1 flex-col justify-end gap-[2px]"
              title={`${p.day} — ${views} views, ${purchases} purchases`}
            >
              <div
                className="w-full rounded-t-[4px]"
                style={{ height: `${(views / max) * 100}%`, background: 'var(--series-1)' }}
              />
              {purchases > 0 && (
                <div
                  className="w-full"
                  style={{ height: `${(purchases / max) * 100}%`, background: 'var(--series-2)' }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] tabular-nums text-ink/40">
        <span>{points[0]?.day}</span>
        <span>{points[points.length - 1]?.day}</span>
      </div>
    </Panel>
  );
}

function Key({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-ink/60">
      <span className="h-2.5 w-2.5" style={{ background: color }} />
      {label}
    </span>
  );
}

/** Top products — ranked list; a table, because rank + several measures. */
function TopProducts({ data }: { data: AnalyticsSummary }) {
  if (data.topProducts.length === 0) {
    return <Panel title="Top Products"><Empty /></Panel>;
  }
  return (
    <Panel title="Top Products" subtitle="Weighted by intent">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-ink/15 text-left uppercase tracking-[0.15em] text-ink/40">
              <th className="py-2 pr-3 font-normal">Product</th>
              <th className="py-2 px-2 text-right font-normal">Views</th>
              <th className="py-2 px-2 text-right font-normal">Carts</th>
              <th className="py-2 pl-2 text-right font-normal">Buys</th>
            </tr>
          </thead>
          <tbody>
            {data.topProducts.map((p) => (
              <tr key={p.productId} className="border-b border-ink/10">
                <td className="py-2.5 pr-3 font-sans text-ink">
                  {p.name ?? p.productId}
                  {p.brand && <span className="text-ink/40"> · {p.brand}</span>}
                </td>
                <td className="py-2.5 px-2 text-right tabular-nums text-ink/70">{p.views}</td>
                <td className="py-2.5 px-2 text-right tabular-nums text-ink/70">{p.carts}</td>
                <td className="py-2.5 pl-2 text-right tabular-nums font-bold text-ink">
                  {p.purchases}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/** Top searches — ranked magnitude, single series. */
function TopSearches({ data }: { data: AnalyticsSummary }) {
  if (data.topSearches.length === 0) {
    return <Panel title="Search Behaviour"><Empty /></Panel>;
  }
  const max = Math.max(...data.topSearches.map((s) => s.count), 1);
  return (
    <Panel title="Search Behaviour" subtitle="Most frequent queries">
      <div className="flex flex-col gap-2.5">
        {data.topSearches.map((s) => (
          <div key={s.query}>
            <div className="flex items-baseline justify-between font-mono text-xs">
              <span className="truncate pr-3 text-ink/70">{s.query}</span>
              <span className="tabular-nums font-bold text-ink">{s.count}</span>
            </div>
            <div className="mt-1 h-2 w-full bg-ink/5">
              <div
                className="h-full rounded-r-[4px]"
                style={{ width: `${(s.count / max) * 100}%`, background: 'var(--series-1)' }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Empty() {
  return (
    <p className="border border-dashed border-ink/20 py-10 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
      No data in this window
    </p>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { aiService } from '@/services/ai.service';
import type { ReviewSummary } from '@/types';

/**
 * AI-generated review digest: most loved features, common complaints, overall
 * sentiment, and a "should you buy?" verdict. Cached server-side in the
 * `reviewSummaries` collection; the UI just renders the latest digest.
 */
export function AiReviewSummary({ productId }: { productId: string }) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    aiService
      .summarizeReviews(productId)
      .then((res) => {
        if (active) setSummary(res.data);
      })
      .catch(() => {
        /* AI down or no reviews yet */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="mt-10 border-t border-ink/15 pt-7">
        <div className="h-32 animate-pulse bg-ink/5" />
      </div>
    );
  }

  if (!summary || summary.reviewsAnalyzed === 0) return null;

  return (
    <div className="mt-10 border-t border-ink/15 pt-7">
      <p className="section-tag flex items-center gap-2 text-copper">
        <Sparkles className="h-3.5 w-3.5" />
        AI Review Digest
      </p>
      <h3 className="mt-2 font-serif text-2xl uppercase text-ink">
        What Shoppers Are Saying
      </h3>
      <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-ink/40">
        Based on {summary.reviewsAnalyzed} review{summary.reviewsAnalyzed === 1 ? '' : 's'}
      </p>

      <div className="mt-5 grid gap-px bg-ink/15 md:grid-cols-2">
        {/* Loved features */}
        <div className="bg-paper p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
            <ThumbsUp className="h-3.5 w-3.5" />
            Most Loved
          </div>
          {summary.lovedFeatures.length > 0 ? (
            <ul className="flex flex-col gap-2 font-sans text-sm leading-relaxed text-ink">
              {summary.lovedFeatures.map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-ink/30">+</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-sm italic text-ink/50">
              No standout positives mentioned.
            </p>
          )}
        </div>

        {/* Complaints */}
        <div className="bg-paper p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
            <ThumbsDown className="h-3.5 w-3.5" />
            Common Complaints
          </div>
          {summary.commonComplaints.length > 0 ? (
            <ul className="flex flex-col gap-2 font-sans text-sm leading-relaxed text-ink">
              {summary.commonComplaints.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-ink/30">−</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-sm italic text-ink/50">
              No recurring complaints mentioned.
            </p>
          )}
        </div>
      </div>

      <div className="mt-px bg-ink/15">
        <div className="bg-paper p-5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
            Sentiment
          </p>
          <p className="mt-2 font-serif text-lg leading-snug text-ink">
            {summary.overallSentiment}
          </p>
        </div>
      </div>
      <div className="mt-px bg-ink/15">
        <div className="bg-cobalt p-5 text-bone">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-bone/70">
            Should You Buy?
          </p>
          <p className="mt-2 font-serif text-lg leading-snug">{summary.shouldYouBuy}</p>
        </div>
      </div>
    </div>
  );
}

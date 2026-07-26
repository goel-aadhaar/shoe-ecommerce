import { apiGet, apiPost } from '@/lib/api';
import type {
  AnalyticsSummary,
  AskResponse,
  BehaviourEvent,
  BundlesData,
  ChatTurnResponse,
  ComparisonResponse,
  PersonalizedHome,
  ReviewSummary,
  SearchFilters,
  SemanticSearchResponse,
} from '@/types';

/**
 * Talks to the AI-powered endpoints on the Express BFF (which proxies to the
 * Python AI service). Never calls the AI service directly.
 */

// Generation-backed endpoints are far slower than ordinary REST: a copilot turn
// is a reasoning-model call, a tool execution, and a second model call. The
// shared axios client defaults to 15s, which cuts them off mid-answer.
const LLM_TIMEOUT_MS = 90_000;
export const aiService = {
  semanticSearch: (
    query: string,
    opts?: { filters?: SearchFilters; limit?: number },
  ) =>
    apiPost<SemanticSearchResponse>('/ai/semantic-search', {
      query,
      filters: opts?.filters,
      limit: opts?.limit,
    }),

  // Personalized homepage sections (recommended, trending, recently viewed, ...).
  // Covers the single-section POST /ai/recommend endpoint too, so there is no
  // separate client method for it.
  home: () => apiGet<PersonalizedHome>('/ai/home'),

  // "Frequently bought together" for a product (association-rule mining).
  bundles: (productId: string) =>
    apiGet<BundlesData>(`/ai/bundles/${productId}`),

  // Conversational copilot.
  // LLM turns run several round-trips (reasoning model + tool call + answer),
  // so they need far more than the client's default 15s budget.
  // Filter extraction happens server-side inside a chat turn, so the standalone
  // POST /ai/extract-filters endpoint has no client wrapper here.
  chat: (sessionId: string, message: string) =>
    apiPost<ChatTurnResponse>('/ai/chat', { sessionId, message }, { timeout: LLM_TIMEOUT_MS }),

  // RAG knowledge assistant
  ask: (question: string, productId?: string) =>
    apiPost<AskResponse>('/ai/ask', { question, productId }, { timeout: LLM_TIMEOUT_MS }),

  // Product comparison + review summarization
  compare: (productIds: string[]) =>
    apiPost<ComparisonResponse>(
      '/ai/compare-products',
      { productIds },
      { timeout: LLM_TIMEOUT_MS },
    ),
  summarizeReviews: (productId: string) =>
    apiPost<ReviewSummary>('/ai/summarize-reviews', { productId }, { timeout: LLM_TIMEOUT_MS }),

  // Analytics dashboard (admin only)
  analyticsSummary: (days = 30) =>
    apiGet<AnalyticsSummary>('/ai/analytics/summary', { days }),

  // Fire-and-forget behavioural event; feeds the recommenders. Never throws upstream.
  trackEvent: (event: BehaviourEvent) =>
    apiPost<{ accepted: boolean }>('/ai/events', event).catch(() => null),
};

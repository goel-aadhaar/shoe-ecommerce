import { config } from '../../config.js';
import { ApiError } from '../../shared/errors/api-error.class.js';

/**
 * Translate an AI-service status into one meaningful to the browser.
 *
 * Critically, 401/403 from the AI service describe *our* service token being
 * wrong — not the end user's session. Forwarding them verbatim would make the
 * frontend's axios interceptor treat it as an expired login and bounce every
 * visitor (including guests) to /login. Those become 502.
 */
function mapUpstreamStatus(status: number): number {
    // Feature ships in a later phase -> present as temporarily unavailable.
    if (status === 501) return 503;
    // Statuses that genuinely describe the caller's request are passed through.
    if (status === 400 || status === 404 || status === 422) return status;
    // Everything else (401/403 auth, 5xx) is an upstream failure.
    return 502;
}

/**
 * Thin client for the internal Python AI service. The browser never calls the
 * AI service directly — this BFF is the only caller, authenticating with the
 * shared service token over a private network.
 */
export async function callAiService<T>(
    path: string,
    body?: unknown,
    {
        timeoutMs = 20000,
        method = 'POST',
    }: { timeoutMs?: number; method?: 'GET' | 'POST' } = {},
): Promise<T> {
    if (!config.aiServiceToken) {
        throw new ApiError(
            503,
            'AI service is not configured (missing AI_SERVICE_TOKEN)',
        );
    }

    const url = `${config.aiServiceUrl.replace(/\/$/, '')}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'X-Service-Token': config.aiServiceToken,
                ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
            },
            ...(method === 'POST' ? { body: JSON.stringify(body ?? {}) } : {}),
            signal: controller.signal,
        });

        if (!response.ok) {
            let detail: unknown;
            try {
                detail = await response.json();
            } catch {
                detail = await response.text().catch(() => undefined);
            }
            throw new ApiError(mapUpstreamStatus(response.status), 'AI service error', [
                detail,
            ]);
        }

        return (await response.json()) as T;
    } catch (error: unknown) {
        if (error instanceof ApiError) throw error;
        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiError(504, 'AI service timed out');
        }
        throw new ApiError(502, 'AI service unavailable', [
            error instanceof Error ? error.message : String(error),
        ]);
    } finally {
        clearTimeout(timer);
    }
}

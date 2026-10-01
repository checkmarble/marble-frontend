import { env } from '@bo/env';
import { needAuth } from '@bo/middlewares/auth';
import { motivaMatchInputSchema, motivaMatchResponseSchema } from '@bo/schemas/screenings';
import { getMotivaMatchDataset } from '@bo/utils/motiva-provider';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

const MOTIVA_TIMEOUT_MS = 15_000;

const describeMotivaError = (error: unknown) => {
  if (error instanceof z.ZodError) return `Unexpected Motiva response:\n${z.prettifyError(error)}`;
  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return `Motiva did not respond within ${MOTIVA_TIMEOUT_MS / 1000}s`;
  }
  if (error instanceof Error) return error.message;
  return 'Unknown error';
};

export const runMotivaMatchFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(motivaMatchInputSchema)
  .handler(async ({ data }) => {
    try {
      const matchDataset = getMotivaMatchDataset(data.provider);
      const endpoint = new URL(`/match/${matchDataset}`, env.MOTIVA_BASE_URL);
      endpoint.searchParams.set('explain', 'true');
      endpoint.searchParams.set('threshold', '0.0');
      endpoint.searchParams.set('cutoff', '0.0');
      endpoint.searchParams.set('limit', '10');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.query),
        signal: AbortSignal.timeout(MOTIVA_TIMEOUT_MS),
      });

      if (!response.ok) {
        const body = (await response.text().catch(() => '')).slice(0, 500);
        throw new Error(`Motiva returned HTTP ${response.status}${body ? `: ${body}` : ''}`);
      }
      return motivaMatchResponseSchema.parse(await response.json());
    } catch (error) {
      console.error('Motiva match request failed', error);
      throw new Error(describeMotivaError(error));
    }
  });

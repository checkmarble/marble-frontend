import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isStatusConflictHttpError } from '@app-builder/models/http-errors';
import {
  availableFeatures,
  type SavedScreeningSearchPage,
  type Screening,
  type ScreeningMatchPayload,
} from '@app-builder/models/screening';
import { type ScreeningAiSuggestion } from '@app-builder/models/screening-ai-suggestion';
import { getServerEnv } from '@app-builder/utils/environment';
import { getScreeningFileUploadEndpoint } from '@app-builder/utils/files';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

/** Zod schemas and types */

export const refineSearchSchema = z.discriminatedUnion('entityType', [
  z.object({
    screeningId: z.uuid(),
    entityType: z.literal('Thing'),
    fields: z.object({
      name: z.string().optional(),
    }),
  }),
  z.object({
    screeningId: z.uuid(),
    entityType: z.literal('Person'),
    fields: z.object({
      name: z.string().optional(),
      birthDate: z.string().optional(),
      nationality: z.string().optional(),
      passportNumber: z.string().optional(),
      address: z.string().optional(),
    }),
  }),
  z.object({
    screeningId: z.uuid(),
    entityType: z.literal('Organization'),
    fields: z.object({
      name: z.string().optional(),
      country: z.string().optional(),
      registrationNumber: z.string().optional(),
      address: z.string().optional(),
    }),
  }),
  z.object({
    screeningId: z.uuid(),
    entityType: z.literal('Vehicle'),
    fields: z.object({
      name: z.string().optional(),
      registrationNumber: z.string().optional(),
    }),
  }),
]);

export type RefineSearchInput = z.infer<typeof refineSearchSchema>;

export const freeformSearchSchema = z.discriminatedUnion('entityType', [
  z.object({
    entityType: z.literal('Thing'),
    fields: z.object({
      name: z.string().min(1),
    }),
    datasets: z.array(z.string()).optional(),
    threshold: z.number().min(0).max(100).optional(),
    limit: z.number().min(10).max(50).optional(),
  }),
  z.object({
    entityType: z.literal('Person'),
    fields: z.object({
      name: z.string().min(1),
      birthDate: z.string().optional(),
      nationality: z.string().optional(),
      passportNumber: z.string().optional(),
      address: z.string().optional(),
    }),
    datasets: z.array(z.string()).optional(),
    threshold: z.number().min(0).max(100).optional(),
    limit: z.number().min(10).max(50).optional(),
  }),
  z.object({
    entityType: z.literal('Organization'),
    fields: z.object({
      name: z.string().min(1),
      country: z.string().optional(),
      registrationNumber: z.string().optional(),
      address: z.string().optional(),
    }),
    datasets: z.array(z.string()).optional(),
    threshold: z.number().min(0).max(100).optional(),
    limit: z.number().min(10).max(50).optional(),
  }),
  z.object({
    entityType: z.literal('Vehicle'),
    fields: z.object({
      name: z.string().min(1),
      registrationNumber: z.string().optional(),
    }),
    datasets: z.array(z.string()).optional(),
    threshold: z.number().min(0).max(100).optional(),
    limit: z.number().min(10).max(50).optional(),
  }),
]);

export const getEnrichedDataInputSchema = z.object({
  entityId: z.string(),
});
export type GetEnrichedDataInput = z.infer<typeof getEnrichedDataInputSchema>;

export const savedSearchFiltersSchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  name: z.string().optional(),
  ownerId: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
});
export type SavedSearchFiltersInput = z.infer<typeof savedSearchFiltersSchema>;

export type FreeformSearchInput = z.infer<typeof freeformSearchSchema>;
export type SearchActionResponse =
  | { success: true; data: ScreeningMatchPayload[] }
  | { success: false; error: unknown };

export type RefineActionResponse = { success: true; data: Screening } | { success: false; error: unknown };

export const getAvailableFiltersSchema = z.object({ feature: z.enum(availableFeatures) });
export type GetAvailableFiltersInput = z.infer<typeof getAvailableFiltersSchema>;

/** Server functions */

export const getListConfigFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(getAvailableFiltersSchema)
  .handler(async ({ context, data }) => {
    const filter = await context.authInfo.screening.getAvailableFilters({ feature: data.feature });
    return filter;
  });

export const getScreeningAiSuggestionsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ screeningId: z.string() }))
  .handler(async ({ context, data }): Promise<{ suggestions: ScreeningAiSuggestion[] }> => {
    const suggestions = await context.authInfo.screening.getAiSuggestions({ screeningId: data.screeningId });
    return { suggestions };
  });

export const getScreeningDetailFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ decisionId: z.string(), screeningId: z.string() }))
  .handler(async ({ context, data }): Promise<{ screening: Screening }> => {
    const screenings = await context.authInfo.screening.listScreenings({ decisionId: data.decisionId });
    const screeningItem = screenings.find((s) => s.id === data.screeningId);

    if (!screeningItem) {
      throw new Response(null, { status: 404, statusText: 'Not Found' });
    }

    return { screening: screeningItem };
  });

export const enrichMatchFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ matchId: z.string() }))
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.screening.enrichMatch({ matchId: data.matchId });
    } catch (error) {
      if (isStatusConflictHttpError(error)) {
        return { error: 'already_enriched' as const };
      }
      throw new Error('Failed to enrich match');
    }
  });

export const getScreeningDatasetsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const datasets = await context.authInfo.screening.listDatasets();
    return { datasets };
  });

export const searchScreeningMatchesFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(refineSearchSchema)
  .handler(async ({ context, data }) => {
    return await context.authInfo.screening.searchScreeningMatches(data);
  });

export const freeformSearchFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(freeformSearchSchema)
  .handler(async ({ context, data }) => {
    try {
      const result = await context.authInfo.screening.freeformSearch(data);
      return { success: true as const, data: result };
    } catch {
      return { success: false as const, error: 'Freeform search failed' };
    }
  });

export const listSavedFreeformSearchesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(savedSearchFiltersSchema)
  .handler(async ({ context, data }) => {
    try {
      const page = await context.authInfo.screening.listSavedScreeningSearches(data);
      return { success: true as const, data: page as SavedScreeningSearchPage };
    } catch {
      return { success: false as const, error: 'List saved searches failed' };
    }
  });

export const getEnrichedDataFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(getEnrichedDataInputSchema)
  .handler(async ({ context, data }) => {
    try {
      const result = await context.authInfo.screening.enrichedData(data);
      return { success: true as const, data: result as ScreeningMatchPayload };
    } catch {
      return { success: false as const, error: 'Enriched data failed' };
    }
  });

export const refineScreeningFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(refineSearchSchema)
  .handler(async ({ context, data }) => {
    return await context.authInfo.screening.refineScreening(data);
  });

export const uploadScreeningFileFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData');
    return data;
  })
  .handler(async ({ context, data }) => {
    const screeningId = data.get('screeningId') as string | null;
    if (!screeningId) return new Response(null, { status: 400 });

    const token = await context.authInfo.tokenService.getToken();

    const backendData = new FormData();
    for (const [key, value] of data.entries()) {
      if (key !== 'screeningId') backendData.append(key, value);
    }

    const upstream = await fetch(`${getServerEnv('MARBLE_API_URL')}${getScreeningFileUploadEndpoint(screeningId)}`, {
      body: backendData,
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const headers = new Headers(upstream.headers);
    headers.delete('content-encoding');
    headers.delete('content-length');
    const body = [204, 205, 304].includes(upstream.status) ? null : await upstream.arrayBuffer();
    return new Response(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  });

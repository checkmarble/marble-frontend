import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isStatusConflictHttpError } from '@app-builder/models/http-errors';
import { type Screening, type ScreeningMatchPayload } from '@app-builder/models/screening';
import { type ScreeningAiSuggestion } from '@app-builder/models/screening-ai-suggestion';
import { setToast } from '@app-builder/services/toast.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getScreeningFileUploadEndpoint } from '@app-builder/utils/files';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

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

export type FreeformSearchInput = z.infer<typeof freeformSearchSchema>;

export type SearchActionResponse =
  | { success: true; data: ScreeningMatchPayload[] }
  | { success: false; error: unknown };

export type RefineActionResponse = { success: true; data: Screening } | { success: false; error: unknown };

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
      await setToast({ type: 'success', message: 'screenings:success.match_enriched' });
    } catch (error) {
      if (isStatusConflictHttpError(error)) {
        await setToast({ type: 'error', message: 'screenings:error.match_already_enriched' });
      } else {
        await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
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
    try {
      return await context.authInfo.screening.searchScreeningMatches(data);
    } catch (err) {
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw err;
    }
  });

export const freeformSearchFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(freeformSearchSchema)
  .handler(async ({ context, data }) => {
    try {
      const results = await context.authInfo.screening.freeformSearch(data);
      return { success: true as const, data: results as ScreeningMatchPayload[] };
    } catch {
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      return { success: false as const, error: 'Freeform search failed' };
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

    return fetch(`${getServerEnv('MARBLE_API_URL')}${getScreeningFileUploadEndpoint(screeningId)}`, {
      body: backendData,
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  });

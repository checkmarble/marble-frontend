import { z } from 'zod/v4';

export const CLIENT_OBJECT_NOT_FOUND_ERROR = 'client-object-not-found';
export const CLIENT_OBJECT_FORBIDDEN_ERROR = 'client-object-forbidden';
export const CLIENT_OBJECT_FETCH_ERROR = 'client-object-fetch-failed';

export const SCREENING_PROVIDERS = ['opensanctions', 'lexisnexis'] as const;
export const screeningProviderSchema = z.enum(SCREENING_PROVIDERS);

export const organizationScreeningsSearchSchema = z.object({
  provider: screeningProviderSchema.optional().catch(undefined),
  table: z.string().trim().min(1).optional().catch(undefined),
  objectId: z.string().trim().min(1).optional().catch(undefined),
});

export const organizationDataModelInputSchema = z.object({
  orgId: z.uuid(),
});

export const organizationClientObjectInputSchema = organizationDataModelInputSchema.extend({
  tableName: z.string().trim().min(1),
  objectId: z.string().trim().min(1),
});

export const motivaPropertiesSchema = z.record(z.string().min(1), z.array(z.string()));

export const motivaQuerySchema = z.object({
  queries: z.record(
    z.string().min(1),
    z.object({
      schema: z.string().min(1),
      properties: motivaPropertiesSchema,
    }),
  ),
});

export const motivaMatchInputSchema = z.object({
  provider: screeningProviderSchema,
  query: motivaQuerySchema,
});

// Motiva schemas keep unmodeled fields (typed as JSON so server functions can serialize them),
// so the raw payload stays inspectable.
const looseJsonObject = <Shape extends z.ZodRawShape>(shape: Shape) => z.object(shape).catchall(z.json());

const motivaExplanationSchema = looseJsonObject({
  score: z.number().optional(),
  weighted: z.number().optional(),
  detail: z.string().optional(),
});

export const motivaMatchResultSchema = looseJsonObject({
  id: z.string(),
  caption: z.string(),
  schema: z.string(),
  score: z.number(),
  datasets: z.array(z.string()).default([]),
  referents: z.array(z.string()).default([]),
  target: z.boolean().optional(),
  first_seen: z.string().nullish(),
  last_seen: z.string().nullish(),
  last_change: z.string().nullish(),
  properties: z.record(z.string(), z.array(z.string())).default({}),
  features: z.record(z.string(), z.number()).optional(),
  explanations: z.record(z.string(), motivaExplanationSchema).default({}),
  match: z.boolean().optional(),
});

export const motivaMatchResponseSchema = looseJsonObject({
  responses: z.record(
    z.string(),
    looseJsonObject({
      status: z.number(),
      results: z.array(motivaMatchResultSchema),
      total: looseJsonObject({
        relation: z.string(),
        value: z.number(),
      }),
    }),
  ),
  limit: z.number(),
});

export type MotivaMatchResponse = z.infer<typeof motivaMatchResponseSchema>;
export type MotivaMatchResult = z.infer<typeof motivaMatchResultSchema>;
export type MotivaQuery = z.infer<typeof motivaQuerySchema>;
export type MotivaProperties = z.infer<typeof motivaPropertiesSchema>;

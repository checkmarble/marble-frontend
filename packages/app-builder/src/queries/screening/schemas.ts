import { z } from 'zod/v4';

export const refineScreeningPayloadSchema = z.discriminatedUnion('entityType', [
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

export type RefineScreeningPayload = z.infer<typeof refineScreeningPayloadSchema>;

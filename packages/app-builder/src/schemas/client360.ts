import { semanticTypes } from '@app-builder/constants/client360';
import { z } from 'zod/v4';

export const client360SearchPayloadSchema = z.object({
  table: z.string(),
  terms: z.string(),
});
export type Client360SearchPayload = z.infer<typeof client360SearchPayloadSchema>;

export const addConfigurationPayloadSchema = z.object({
  tableId: z.uuid(),
  semanticType: z.enum(semanticTypes),
  captionField: z.string().min(1),
  alias: z.string().optional(),
});
export type AddConfigurationPayload = z.infer<typeof addConfigurationPayloadSchema>;

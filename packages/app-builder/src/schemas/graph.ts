import { z } from 'zod/v4';

export const createGraphRelationPayloadSchema = z.object({
  label: z.string().min(1),
  leftType: z.string().min(1),
  leftField: z.string().min(1),
  rightType: z.string().min(1),
  rightField: z.string().min(1),
});
export type CreateGraphRelationPayload = z.infer<typeof createGraphRelationPayloadSchema>;

export const deleteGraphRelationPayloadSchema = z.object({
  relationId: z.uuid(),
});
export type DeleteGraphRelationPayload = z.infer<typeof deleteGraphRelationPayloadSchema>;

export const generateGraphPayloadSchema = z.object({
  recordType: z.string().min(1),
  recordId: z.string().min(1),
});
export type GenerateGraphPayload = z.infer<typeof generateGraphPayloadSchema>;

import z from 'zod/v4';

// Create

export const createListPayloadSchema = z.object({
  name: z.string().nonempty(),
  description: z.string(),
  kind: z.enum(['text', 'cidrs']),
});

export type CreateListPayload = z.infer<typeof createListPayloadSchema>;

// Delete

export const deleteListPayloadSchema = z.object({
  listId: z.uuid(),
});

export type DeleteListPayload = z.infer<typeof deleteListPayloadSchema>;

// Edit

export const editListPayloadSchema = z.object({
  listId: z.uuid(),
  name: z.string().nonempty(),
  description: z.string(),
});

export type EditListPayload = z.infer<typeof editListPayloadSchema>;

// Add value

export const cidrValueSchema = z.union([z.cidrv4(), z.cidrv6(), z.ipv4(), z.ipv6()]);

/** Normalize bare IPs to CIDR notation: IPv4 → /32, IPv6 → /128 */
export function normalizeCidr(value: string): string {
  const trimmed = value.trim();
  if (trimmed.includes('/')) return trimmed;
  if (z.ipv4().safeParse(trimmed).success) return `${trimmed}/32`;
  if (z.ipv6().safeParse(trimmed).success) return `${trimmed}/128`;
  return trimmed;
}

export const addValuePayloadSchema = z.object({
  listId: z.uuid(),
  value: z.string().nonempty(),
  kind: z.enum(['text', 'cidrs']),
});

export const addCidrValuePayloadSchema = z.object({
  listId: z.uuid(),
  value: cidrValueSchema,
  kind: z.literal('cidrs'),
});

export type AddValuePayload = z.infer<typeof addValuePayloadSchema>;

// Delete value

export const deleteValuePayloadSchema = z.object({
  listId: z.uuid(),
  listValueId: z.uuid(),
});

export type DeleteValuePayload = z.infer<typeof deleteValuePayloadSchema>;

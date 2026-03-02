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

/**
 * Accept both bare IPs and CIDR notation.
 * Bare IPv4 addresses are auto-converted to /32, IPv6 to /128.
 */
const ipv4Regex = /^\d{1,3}(\.\d{1,3}){3}$/;
const ipv6Regex = /^[0-9a-fA-F:]+$/;

export const cidrValueSchema = z
  .string()
  .nonempty()
  .transform((val) => {
    const trimmed = val.trim();
    if (trimmed.includes('/')) return trimmed;
    if (ipv4Regex.test(trimmed)) return `${trimmed}/32`;
    if (ipv6Regex.test(trimmed)) return `${trimmed}/128`;
    return trimmed;
  })
  .pipe(z.union([z.cidrv4(), z.cidrv6()]));

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

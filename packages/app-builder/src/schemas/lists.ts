import z from 'zod/v4';

// Create

export const createListPayloadSchema = z.object({
  name: z.string().nonempty(),
  description: z.string(),
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

export const addValuePayloadSchema = z.object({
  listId: z.uuid(),
  value: z.string().nonempty(),
});

export type AddValuePayload = z.infer<typeof addValuePayloadSchema>;

// Delete value

export const deleteValuePayloadSchema = z.object({
  listId: z.uuid(),
  listValueId: z.uuid(),
});

export type DeleteValuePayload = z.infer<typeof deleteValuePayloadSchema>;

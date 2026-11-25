import * as z from 'zod/v4';

export const toastMessageSchema = z.object({
  type: z.enum(['success', 'error', 'loading', 'custom']),
  message: z.string(),
});

export type ToastMessage = z.infer<typeof toastMessageSchema>;

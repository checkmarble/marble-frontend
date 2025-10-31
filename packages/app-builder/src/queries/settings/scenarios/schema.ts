import z from 'zod';

export const ingestedDataFieldSchema = z.object({
  path: z.array(z.string()),
  name: z.string(),
});

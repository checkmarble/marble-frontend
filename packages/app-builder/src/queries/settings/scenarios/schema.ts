import { protectArray } from '@app-builder/utils/schema/helpers/array';
import z from 'zod';

export const ingestedDataFieldSchema = z.object({
  path: protectArray(z.array(z.string())),
  name: z.string(),
});

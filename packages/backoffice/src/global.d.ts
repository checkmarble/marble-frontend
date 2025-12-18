import '@tanstack/react-query';
import { ZodObject, ZodType } from 'zod/v4';

interface MutationMeta extends Record<string, unknown> {
  invalidates: (variables: any) => string[][];
}

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: MutationMeta;
  }
}

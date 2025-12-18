import '@tanstack/react-query';

interface MutationMeta extends Record<string, unknown> {
  invalidates: (variables: any) => string[][];
}

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: MutationMeta;
  }
}

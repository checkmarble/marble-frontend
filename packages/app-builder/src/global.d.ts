import '@tanstack/react-query';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV?: 'development' | 'production' | 'test';
    }
  }
}

interface MutationMeta extends Record<string, unknown> {
  invalidates: (variables: any) => string[][];
}

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: MutationMeta;
  }
}

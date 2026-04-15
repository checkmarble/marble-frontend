import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/healthcheck')({
  server: {
    handlers: {
      GET: async () => {
        try {
          return new Response('OK');
        } catch (error: unknown) {
          console.error('healthcheck ❌', { error });
          return new Response('ERROR', { status: 500 });
        }
      },
    },
  },
});

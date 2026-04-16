import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  server: {
    handlers: {
      GET: async () => {
        return new Response(null, { status: 302, headers: { Location: '/sign-in' } });
      },
    },
  },
});

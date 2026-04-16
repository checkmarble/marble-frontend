import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/robots/txt')({
  server: {
    handlers: {
      GET: async () => {
        const content = ['User-agent: *', 'Disallow: /'];

        return new Response(content.join('\n'), {
          status: 200,
          headers: {
            'content-type': 'text/plain',
          },
        });
      },
    },
  },
});

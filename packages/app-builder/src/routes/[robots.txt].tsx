import { createServerFn } from '@app-builder/core/requests';

export const loader = createServerFn([], async function robotsTxtLoader() {
  const content = ['User-agent: *', 'Disallow: /'];

  return new Response(content.join('\n'), {
    status: 200,
    headers: {
      'content-type': 'text/plain',
    },
  });
});

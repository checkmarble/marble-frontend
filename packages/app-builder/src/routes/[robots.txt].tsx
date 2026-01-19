export const loader = () => {
  let content = ['User-agent: *', 'Disallow: /'];

  return new Response(content.join('\n'), {
    status: 200,
    headers: {
      'content-type': 'text/plain',
    },
  });
};

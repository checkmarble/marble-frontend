// Deprecated REST endpoint replaced by tRPC at /api/trpc
export async function loader() {
  return new Response('Not Found', { status: 404 });
}

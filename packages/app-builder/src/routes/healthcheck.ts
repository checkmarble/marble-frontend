export function loader() {
  try {
    return new Response('OK');
  } catch (error: unknown) {
    console.error('healthcheck ❌', { error });
    return new Response('ERROR', { status: 500 });
  }
}

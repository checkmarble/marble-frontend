import { type LoaderFunctionArgs } from '@remix-run/node';

async function isServerLive(request: LoaderFunctionArgs['request']) {
  const host =
    request.headers.get('X-Forwarded-Host') ??
    request.headers.get('host') ??
    'NO_HOST';
  const url = new URL('/', `http://${host}`);

  return fetch(url.href, { method: 'HEAD' }).then((r) => {
    if (!r.ok) return Promise.reject(r);
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    await Promise.all([isServerLive(request)]);
    return new Response('OK');
  } catch (error: unknown) {
    console.log('healthcheck ❌', { error });
    return new Response('ERROR', { status: 500 });
  }
}

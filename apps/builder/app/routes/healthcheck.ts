import type { LoaderArgs } from '@remix-run/node';

async function isServerLive(request: LoaderArgs["request"]){
  const host =
    request.headers.get('X-Forwarded-Host') ?? request.headers.get('host');
  const url = new URL('/', `http://${host}`);
  
  return fetch(url.toString(), { method: 'HEAD' }).then((r) => {
    if (!r.ok) return Promise.reject(r);
  }),
}

export async function loader({ request }: LoaderArgs) {
  try {
    await Promise.all([
      isServerLive(request)
    ]);
    return new Response('OK');
  } catch (error: unknown) {
    console.log('healthcheck ❌', { error });
    return new Response('ERROR', { status: 500 });
  }
}

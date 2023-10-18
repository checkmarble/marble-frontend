import { useFetcher } from '@remix-run/react';
import { Button } from '@ui-design-system';

export function loader() {
  return 'ok';
}

export function action() {
  throw new Error('This is an error from an action');
}

export default function Sentry() {
  const fetcher = useFetcher<typeof action>();
  const iStillDoNotExist = () => {
    throw new Error('This is an error from a component');
  };
  return (
    <div>
      <h1>Test Sentry</h1>
      <Button onClick={() => iStillDoNotExist()}>
        Crash the app from the browser
      </Button>
      <fetcher.Form method="POST" action="/sentry">
        <Button type="submit">Crash the app with a server error</Button>
      </fetcher.Form>
    </div>
  );
}

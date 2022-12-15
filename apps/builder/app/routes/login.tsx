import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

/**
 * TODO(auth): protect routes in __builder
 */

export const loader: LoaderFunction = async ({ request }) => {
  /**
   * TODO(data): get the real user data
   */
  // const user = await getUser(request);
  const user = {
    companyName: 'Acme.',
    name: 'D. Brown',
  };
  if (user) return redirect('/');
};

export default function Login() {
  return <div>TODO</div>;
}

import { type LoaderFunctionArgs, redirect } from '@remix-run/node';

// Redirect to new Detection > Decisions route, preserving query params
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = url.search || '?dateRange%5Btype%5D=dynamic&dateRange%5BfromNow%5D=-P30D';
  return redirect(`/detection/decisions${search}`);
}

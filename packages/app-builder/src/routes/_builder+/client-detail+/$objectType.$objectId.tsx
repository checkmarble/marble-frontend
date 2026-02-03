import { ClientDetailPage as ClientDetailPageComponent } from '@app-builder/components/ClientDetail/ClientDetailPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

export const loader = createServerFn([authMiddleware], async ({ context, params }) => {
  const objectType = params['objectType'];
  const objectId = params['objectId'];

  invariant(objectType, 'Object type is required');
  invariant(objectId, 'Object ID is required');

  return { objectType, objectId };
});

export default function ClientDetailPage() {
  const { objectType, objectId } = useLoaderData<typeof loader>();

  return <ClientDetailPageComponent objectType={objectType} objectId={objectId} />;
}

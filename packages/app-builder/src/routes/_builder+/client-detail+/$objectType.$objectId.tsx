import { ClientDetailPage as ClientDetailPageComponent } from '@app-builder/components/ClientDetail/ClientDetailPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { redirect, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

export const loader = createServerFn([authMiddleware], async ({ context, params }) => {
  const objectType = params['objectType'];
  const objectId = params['objectId'];

  invariant(objectType, 'Object type is required');
  invariant(objectId, 'Object ID is required');

  const objectDetails = await context.authInfo.dataModelRepository.getIngestedObject(objectType, objectId);
  if (!objectDetails) {
    // TODO: Handle 404
    throw redirect(getRoute('/client-detail'));
  }

  const tables = await context.authInfo.client360.getClient360Tables();
  const tableMetadata = tables.find((table) => table.name === objectType);

  if (!tableMetadata) {
    throw redirect(getRoute('/client-detail'));
  }

  return { objectType, objectId, objectDetails, metadata: tableMetadata };
});

export default function ClientDetailPage() {
  const { objectType, objectId, objectDetails, metadata } = useLoaderData<typeof loader>();

  return (
    <ClientDetailPageComponent
      objectType={objectType}
      objectId={objectId}
      objectDetails={objectDetails}
      metadata={metadata}
    />
  );
}

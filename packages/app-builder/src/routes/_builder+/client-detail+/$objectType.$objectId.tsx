import { ClientDetailPage as ClientDetailPageComponent } from '@app-builder/components/ClientDetail/ClientDetailPage';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isNotFoundHttpError } from '@app-builder/models';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { getRoute } from '@app-builder/utils/routes';
import { redirect, useLoaderData } from '@remix-run/react';
import { Namespace } from 'i18next';
import invariant from 'tiny-invariant';

export const handle = {
  i18n: ['common', 'cases', 'screenings', 'client360'] satisfies Namespace,
  BreadCrumbs: [],
};

export const loader = createServerFn([authMiddleware], async ({ request, context, params }) => {
  const objectType = params['objectType'];
  const objectId = params['objectId'];
  const {
    toastSessionService,
    i18nextService: { getFixedT },
  } = context.services;

  invariant(objectType, 'Object type is required');
  invariant(objectId, 'Object ID is required');

  const toastSession = await toastSessionService.getSession(request);
  const t = await getFixedT(request, ['common']);

  try {
    const objectDetails = await context.authInfo.dataModelRepository.getIngestedObject(objectType, objectId);

    const tables = await context.authInfo.client360.getClient360Tables();
    const { user, dataModelRepository, entitlements } = context.authInfo;

    const tableMetadata = tables.find((table) => table.name === objectType);

    if (!tableMetadata) {
      throw redirect(getRoute('/client-detail'));
    }
    const dataModel = await dataModelRepository.getDataModel();

    const dataModelFeatureAccess = dataModelFeatureAccessLoader(user, entitlements);

    return {
      objectType,
      objectId,
      objectDetails,
      metadata: tableMetadata,
      allMetadata: tables,
      dataModel,
      dataModelFeatureAccess,
    };
  } catch (error) {
    if (isNotFoundHttpError(error)) {
      setToastMessage(toastSession, {
        type: 'error',
        message: t('client360:client_detail.no_object_found', { objectType }),
      });
      throw redirect(getRoute('/client-detail'), {
        headers: {
          'Set-Cookie': await toastSessionService.commitSession(toastSession),
        },
      });
    }

    throw error;
  }
});

export default function ClientDetailPage() {
  const { objectType, objectId, objectDetails, metadata, allMetadata, dataModel, dataModelFeatureAccess } =
    useLoaderData<typeof loader>();

  return (
    <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
      <ClientDetailPageComponent
        key={`${objectType}_${objectId}`}
        objectType={objectType}
        objectId={objectId}
        objectDetails={objectDetails}
        metadata={metadata}
        allMetadata={allMetadata}
      />
    </DataModelContextProvider>
  );
}

import { ClientDetailPage as ClientDetailPageComponent } from '@app-builder/components/ClientDetail/ClientDetailPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isNotFoundHttpError } from '@app-builder/models';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { setToast } from '@app-builder/services/toast.server';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod/v4';

const paramsSchema = z.object({
  objectType: z.string(),
  objectId: z.string(),
});

const getDataFn = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(paramsSchema)
  .handler(async ({ context, data: { objectId, objectType } }) => {
    const request = getRequest();
    const { i18nextService } = context.services;

    const t = await i18nextService.getFixedT(request, ['common']);

    try {
      const objectDetails = await context.authInfo.dataModelRepository.getIngestedObject(objectType, objectId);

      const scoringSettings = await context.authInfo.userScoring.getSettings();
      let activeScore = null;
      try {
        activeScore = (await context.authInfo.userScoring.getScoreLatest(objectType, objectId)) ?? null;
      } catch (error) {
        if (!isNotFoundHttpError(error)) throw error;
      }

      const tables = await context.authInfo.client360.getClient360Tables();
      const { user, dataModelRepository, entitlements } = context.authInfo;

      const tableMetadata = tables.find((table) => table.name === objectType);

      if (!tableMetadata) {
        throw redirect({ to: '/client-detail' });
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
        scoringSettings,
        activeScore,
        userScoringAccess: entitlements.userScoring,
      };
    } catch (error) {
      if (isNotFoundHttpError(error)) {
        setToast({
          type: 'error',
          message: t('client360:client_detail.no_object_found', { objectType }),
        });
        throw redirect({ to: '/client-detail' });
      }

      throw error;
    }
  });

export const Route = createFileRoute('/_app/_builder/client-detail/$objectType/$objectId')({
  loader: ({ params }) => getDataFn({ data: params }),
  component: ClientDetailPage,
});

function ClientDetailPage() {
  const {
    objectType,
    objectId,
    objectDetails,
    metadata,
    allMetadata,
    dataModel,
    dataModelFeatureAccess,
    scoringSettings,
    activeScore,
    userScoringAccess,
  } = Route.useLoaderData();

  return (
    <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
      <ClientDetailPageComponent
        key={`${objectType}_${objectId}`}
        objectType={objectType}
        objectId={objectId}
        objectDetails={objectDetails}
        metadata={metadata}
        allMetadata={allMetadata}
        scoringSettings={scoringSettings}
        activeScore={activeScore}
        userScoringAccess={userScoringAccess}
      />
    </DataModelContextProvider>
  );
}

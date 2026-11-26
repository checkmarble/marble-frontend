import { ClientDetailPage as ClientDetailPageComponent } from '@app-builder/components/ClientDetail/ClientDetailPage';
import { ErrorComponent } from '@app-builder/components/ErrorComponent';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin, isForbiddenHttpError, isNotFoundHttpError, isUnauthorizedHttpError } from '@app-builder/models';
import { getClient360Tables } from '@app-builder/server/client-360';
import { loadClientDetailObject } from '@app-builder/server/client-detail-object';
import { getDataModel } from '@app-builder/server/data-model';
import { getScoreLatestWithEvaluation, getSettings } from '@app-builder/server/user-scoring';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { getFixedT } from '@app-builder/services/i18n/i18next.server';
import { setToast } from '@app-builder/services/toast.server';
import { decodeClientDetailObjectIdParam } from '@app-builder/utils/routes/client-detail-url';
import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod/v4';

const paramsSchema = z.object({
  objectType: z.string(),
  objectId: z.string(),
});

const getDataFn = createServerFn()
  .middleware([authMiddleware])
  .validator(paramsSchema)
  .handler(async ({ context, data: { objectId, objectType } }) => {
    try {
      const request = getRequest();
      const t = await getFixedT(request, ['common', 'client360']);
      const { api, user, entitlements } = context;

      const objectPromise = loadClientDetailObject(api, objectType, objectId).catch(async (error) => {
        if (isNotFoundHttpError(error)) {
          await setToast({
            type: 'error',
            message: t('client360:client_detail.no_object_found', { objectType }),
          });
          throw redirect({ to: '/client-detail' });
        }
        throw error;
      });

      const [objectDetails, scoringSettings, tables, dataModel] = await Promise.all([
        objectPromise,
        getSettings(api),
        getClient360Tables(api),
        getDataModel(api),
      ]);

      let activeScore = null;
      try {
        activeScore = (await getScoreLatestWithEvaluation(api, objectType, objectId)) ?? null;
      } catch (error) {
        if (!isNotFoundHttpError(error) && !isUnauthorizedHttpError(error) && !isForbiddenHttpError(error)) throw error;
      }

      const tableMetadata = tables.find((table) => table.name === objectType);
      if (!tableMetadata) {
        throw redirect({ to: '/client-detail' });
      }

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
        isAdmin: isAdmin(user),
      };
    } catch (error) {
      if (isRedirect(error) || error instanceof Response) throw error;
      console.error('Failed to load client detail data', error);
      throw new Response('Internal Server Error', { status: 500, headers: { 'Content-Type': 'text/plain' } });
    }
  });

export const Route = createFileRoute('/_app/_builder/client-detail/$objectType/$objectId')({
  loader: ({ params: { objectType, objectId } }) =>
    getDataFn({ data: { objectType, objectId: decodeClientDetailObjectIdParam(objectId) } }),
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
  component: ClientDetailPage,
});

function ClientDetailPage() {
  const loaderData = Route.useLoaderData();
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
    isAdmin,
  } = loaderData;

  // Guard against the concurrent-render window where the router transitions
  // to this route before the loader result is committed to the router state.
  if (!metadata) return null;

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
        isAdmin={isAdmin}
      />
    </DataModelContextProvider>
  );
}

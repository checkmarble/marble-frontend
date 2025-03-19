import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { IngestedObjectDetail } from '@app-builder/components/Data/IngestedObjectDetail';
import { useDataModel } from '@app-builder/services/data/data-model';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { HttpError } from '@oazapfts/runtime';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

export const handle = {
  BreadCrumbs: [
    ({
      isLast,
      data: { tableName, objectId },
    }: BreadCrumbProps<{ tableName: string; objectId: string }>) => {
      return (
        <BreadCrumbLink
          to={getRoute('/data/view/:tableName/:objectId', {
            tableName,
            objectId,
          })}
          isLast={isLast}
        >
          {tableName} - {objectId}
        </BreadCrumbLink>
      );
    },
  ],
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const tableName = params['tableName'] ?? '';
  const objectId = params['objectId'] ?? '';

  try {
    const object = await dataModelRepository.getIngestedObject(tableName, objectId);

    return {
      tableName,
      objectId,
      object,
    };
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) {
      return { tableName, objectId, object: null };
    }
    throw err;
  }
}

export default function DataSearchObjectPage() {
  const { t } = useTranslation(['data']);
  const { tableName, objectId, object } = useLoaderData<typeof loader>();
  const dataModel = useDataModel();

  if (!object) {
    return (
      <div className="border-grey-90 bg-grey-100 rounded border p-4 text-center">
        {t('data:viewer.no_object_found', { tableName, objectId })}
      </div>
    );
  }

  return (
    <IngestedObjectDetail
      light
      object={object}
      objectId={objectId}
      tableName={tableName}
      dataModel={dataModel}
    />
  );
}

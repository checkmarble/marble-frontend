import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { DataFields, DataFieldsHeader } from '@app-builder/components/Data/DataVisualisation/DataFields';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { HttpError } from '@oazapfts/runtime';
import { useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

export const handle = {
  BreadCrumbs: [
    ({ isLast, data: { tableName, objectId } }: BreadCrumbProps<{ tableName: string; objectId: string }>) => {
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

export const loader = createServerFn([authMiddleware], async function viewObjectLoader({ params, context }) {
  const { dataModelRepository } = context.authInfo;

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
});

export default function DataSearchObjectPage() {
  const { t } = useTranslation(['data']);
  const { tableName, objectId, object } = useLoaderData<typeof loader>();
  // const dataModel = useDataModel();

  if (!object) {
    return (
      <div className="border-grey-border bg-surface-card rounded-sm border p-4 text-center">
        {t('data:viewer.no_object_found', { tableName, objectId })}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 p-4 border-grey-border rounded-md border bg-grey-background-light overflow-y-auto max-h-[calc(100vh-140px)] max-w-3xl">
        <DataFieldsHeader object={object} />
        <DataFields table={tableName} object={object} options={{ mapHeight: 200 }} />
      </div>
    </>
  );
}

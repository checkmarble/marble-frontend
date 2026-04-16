import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { DataFields } from '@app-builder/components/Data/DataVisualisation/DataFields';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { HttpError } from '@oazapfts/runtime';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';

const viewObjectLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function viewObjectLoader({ data, context }) {
    const { dataModelRepository } = context.authInfo;

    const tableName = data?.params?.['tableName'] ?? '';
    const objectId = data?.params?.['objectId'] ?? '';

    try {
      const object = await dataModelRepository.getIngestedObject(tableName, objectId);
      return { tableName, objectId, object };
    } catch (err) {
      if (err instanceof HttpError && err.status === 404) {
        return { tableName, objectId, object: null };
      }
      throw err;
    }
  });

export const Route = createFileRoute('/_app/_builder/data/view/$tableName/$objectId')({
  loader: ({ params }) => viewObjectLoader({ data: { params } }),
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { tableName, objectId } = Route.useLoaderData();
        return (
          <BreadCrumbLink to="/data/view/$tableName/$objectId" params={{ tableName, objectId }} isLast={isLast}>
            {tableName} - {objectId}
          </BreadCrumbLink>
        );
      },
    ],
  },
  component: DataSearchObjectPage,
});

function DataSearchObjectPage() {
  const { t } = useTranslation(['data']);
  const { tableName, objectId, object } = Route.useLoaderData();

  if (!object) {
    return (
      <div className="border-grey-border bg-surface-card rounded-sm border p-4 text-center">
        {t('data:viewer.no_object_found', { tableName, objectId })}
      </div>
    );
  }

  return (
    <div className="border-grey-border bg-grey-background-light flex max-h-[calc(100vh-140px)] max-w-3xl flex-col gap-4 overflow-y-auto rounded-md border p-4">
      <DataFields table={tableName} object={object} options={{ mapHeight: 200, showHeader: true }} />
    </div>
  );
}

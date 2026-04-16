import { DataModelFlow, dataModelFlowStyles } from '@app-builder/components/Data/DataModelFlow';
import { DataTabs } from '@app-builder/components/Data/DataTabs';
import { dataI18n } from '@app-builder/components/Data/data-i18n';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { useDataModel } from '@app-builder/services/data/data-model';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { type Namespace } from 'i18next';

// React Flow requires a stylesheet. Since TanStack Start doesn't have LinksFunction,
// we import the URL and inject it via a <link> tag rendered in the component.
const flowStylesHref = dataModelFlowStyles;

const dataSchemaLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function dataSchemaLoader({ context }) {
    const { dataModelRepository } = context.authInfo;
    const pivots = await dataModelRepository.listPivots({});
    return { pivots };
  });

export const Route = createFileRoute('/_app/_builder/data/schema')({
  staticData: {
    i18n: dataI18n satisfies Namespace,
  },
  loader: () => dataSchemaLoader(),
  component: DataSchema,
});

function DataSchema() {
  const dataModel = useDataModel();
  const { pivots } = Route.useLoaderData();

  return (
    <div className="flex size-full flex-col">
      <link rel="stylesheet" href={flowStylesHref} />
      <DataModelFlow dataModel={dataModel} pivots={pivots}>
        <div className="absolute left-4 top-4 z-10 lg:left-8 lg:top-8">
          <DataTabs />
        </div>
      </DataModelFlow>
    </div>
  );
}

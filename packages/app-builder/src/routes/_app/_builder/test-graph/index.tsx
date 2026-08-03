import { Page } from '@app-builder/components';
import { CustomerGraphProvider } from '@app-builder/components/Graph/CustomerGraphContext';
import { GraphImpl } from '@app-builder/components/Graph/GraphImpl';
import { GraphSelectionToolbar } from '@app-builder/components/Graph/GraphSelectionToolbar';
import { GraphSettingsPanel } from '@app-builder/components/Graph/GraphSettingsPanel';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { ReactFlowProvider } from '@xyflow/react';
import { useState } from 'react';
import { Card, cn } from 'ui-design-system';
import { GRAPH_DATASET_LABELS, graphDatasets } from './-data';

const HOP_OPTIONS = [0, 1, 2, 3, 4, 5] as const;

const uploadLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function testGraphLoader({ context }) {
    const { user, dataModelRepository, entitlements } = context.authInfo;
    const dataModel = await dataModelRepository.getDataModel();
    return {
      dataModel,
      dataModelFeatureAccess: dataModelFeatureAccessLoader(user, entitlements),
    };
  });

export const Route = createFileRoute('/_app/_builder/test-graph/')({
  loader: () => uploadLoader(),
  component: RouteComponent,
});

function RouteComponent() {
  const { dataModel, dataModelFeatureAccess } = Route.useLoaderData();
  const [datasetIndex, setDatasetIndex] = useState(0);
  const [maxExplorationHops, setMaxExplorationHops] = useState(0);
  const data = graphDatasets[datasetIndex] ?? graphDatasets[0]!;

  return (
    <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
      <CustomerGraphProvider
        key={datasetIndex}
        initialSelectedObject={{
          nodeType: 'person',
          objectType: data.start.type,
          objectId: data.start.id,
        }}
      >
        <Page.Main className="min-h-0 overflow-hidden">
          <Page.Header className="justify-between gap-md">
            <span>Test graph</span>
            <div className="flex flex-wrap items-center justify-end gap-md">
              <div className="flex items-center gap-xs">
                <span className="text-grey-secondary text-xs whitespace-nowrap">Dataset</span>
                <div className="flex flex-wrap items-center gap-xs">
                  {GRAPH_DATASET_LABELS.map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setDatasetIndex(index)}
                      title={label}
                      aria-label={`Dataset ${label}`}
                      aria-pressed={datasetIndex === index}
                      className={cn(
                        'rounded-sm px-xs py-px text-xs font-medium border transition-colors',
                        datasetIndex === index
                          ? 'bg-purple-primary border-purple-primary text-grey-white'
                          : 'bg-grey-white border-grey-border text-grey-primary hover:bg-grey-background',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-xs">
                <span className="text-grey-secondary text-xs whitespace-nowrap">Max hops</span>
                <div className="flex flex-wrap items-center gap-xs">
                  {HOP_OPTIONS.map((hops) => (
                    <button
                      key={hops}
                      type="button"
                      onClick={() => setMaxExplorationHops(hops)}
                      title={hops === 0 ? 'Explore all' : `Stop after ${hops} hops`}
                      aria-label={hops === 0 ? 'Explore all hops' : `Max ${hops} hops`}
                      aria-pressed={maxExplorationHops === hops}
                      className={cn(
                        'min-w-7 rounded-sm px-xs py-px text-xs font-medium border transition-colors',
                        maxExplorationHops === hops
                          ? 'bg-purple-primary border-purple-primary text-white'
                          : 'bg-grey-white border-grey-border text-grey-primary hover:bg-grey-background',
                      )}
                    >
                      {hops === 0 ? 'All' : hops}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Page.Header>
          <Page.Container className="min-h-0">
            <Page.Content className="min-h-0 flex-1" width="fluid">
              <Card className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row overflow-hidden p-sm">
                <GraphSettingsPanel />
                <ReactFlowProvider key={datasetIndex}>
                  <div className="relative min-h-0 flex-1">
                    <GraphSelectionToolbar />
                    <GraphImpl data={data} dataModel={dataModel} maxExplorationHops={maxExplorationHops} />
                  </div>
                </ReactFlowProvider>
              </Card>
            </Page.Content>
          </Page.Container>
        </Page.Main>
      </CustomerGraphProvider>
    </DataModelContextProvider>
  );
}

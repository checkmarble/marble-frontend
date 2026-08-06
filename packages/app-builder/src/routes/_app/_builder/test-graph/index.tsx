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
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, cn, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { GRAPH_DATASET_LABELS, generateCustomGraph, graphDatasets } from './-data';

const HOP_OPTIONS = [0, 1, 2, 3, 4, 5] as const;
const NODE_COUNT_OPTIONS = [20, 40, 75, 100, 150, 200] as const;
const START_CONNECTION_OPTIONS = [1, 2, 5, 10, 20, 50] as const;

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

function OptionSelect<T extends string | number>({
  value,
  options,
  onChange,
  disabled,
  ariaLabel,
  formatLabel = String,
  className,
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  disabled?: boolean;
  ariaLabel: string;
  formatLabel?: (value: T) => string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton
          size="small"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn('min-w-16', disabled && 'opacity-40', className)}
        >
          {formatLabel(value)}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth>
        <MenuCommand.List>
          {options.map((option) => (
            <MenuCommand.Item
              key={String(option)}
              value={String(option)}
              onSelect={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {formatLabel(option)}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

function RouteComponent() {
  const { dataModel, dataModelFeatureAccess } = Route.useLoaderData();
  const [dataset, setDataset] = useState<(typeof GRAPH_DATASET_LABELS)[number]>(GRAPH_DATASET_LABELS[0]!);
  const [maxExplorationHops, setMaxExplorationHops] = useState(0);
  const [nodeCount, setNodeCount] = useState<(typeof NODE_COUNT_OPTIONS)[number]>(NODE_COUNT_OPTIONS[0]);
  const [startConnections, setStartConnections] = useState<(typeof START_CONNECTION_OPTIONS)[number]>(5);
  const [customSeed, setCustomSeed] = useState(0);
  const isCustom = dataset === 'custom';

  const startConnectionOptions = useMemo(
    () => START_CONNECTION_OPTIONS.filter((count) => count < nodeCount),
    [nodeCount],
  );

  useEffect(() => {
    if (!startConnectionOptions.includes(startConnections)) {
      setStartConnections(startConnectionOptions[startConnectionOptions.length - 1] ?? 1);
    }
  }, [startConnectionOptions, startConnections]);

  const graphKey = isCustom ? `${dataset}-${nodeCount}-${startConnections}-${customSeed}` : dataset;

  const data = useMemo(() => {
    if (isCustom) return generateCustomGraph(nodeCount, startConnections);
    return graphDatasets[dataset] ?? graphDatasets[GRAPH_DATASET_LABELS[0]!]!;
  }, [dataset, isCustom, nodeCount, startConnections, customSeed]);

  return (
    <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
      <CustomerGraphProvider
        key={graphKey}
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
                <OptionSelect
                  value={dataset}
                  options={GRAPH_DATASET_LABELS}
                  onChange={setDataset}
                  ariaLabel="Dataset"
                  className="min-w-24"
                />
              </div>
              <div className="flex items-center gap-xs">
                <span className="text-grey-secondary text-xs whitespace-nowrap">Nodes</span>
                <OptionSelect
                  value={nodeCount}
                  options={NODE_COUNT_OPTIONS}
                  onChange={setNodeCount}
                  disabled={!isCustom}
                  ariaLabel="Number of nodes"
                />
              </div>
              <div className="flex items-center gap-xs">
                <span className="text-grey-secondary text-xs whitespace-nowrap">Start links</span>
                <OptionSelect
                  value={startConnections}
                  options={startConnectionOptions}
                  onChange={setStartConnections}
                  disabled={!isCustom}
                  ariaLabel="Start node connections"
                />
              </div>
              <div className="flex items-center gap-xs">
                <span className="text-grey-secondary text-xs whitespace-nowrap">Max hops</span>
                <OptionSelect
                  value={maxExplorationHops}
                  options={HOP_OPTIONS}
                  onChange={setMaxExplorationHops}
                  ariaLabel="Max exploration hops"
                  formatLabel={(hops) => (hops === 0 ? 'All' : String(hops))}
                />
              </div>
              <Button
                variant="secondary"
                size="small"
                disabled={!isCustom}
                aria-label="Regenerate custom graph"
                onClick={() => setCustomSeed((seed) => seed + 1)}
              >
                <Icon icon="restart-alt" className="size-4" />
                Regenerate
              </Button>
            </div>
          </Page.Header>
          <Page.Container className="min-h-0">
            <Page.Content className="min-h-0 flex-1" width="fluid">
              <Card className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row overflow-hidden p-sm">
                <GraphSettingsPanel />
                <ReactFlowProvider key={graphKey}>
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

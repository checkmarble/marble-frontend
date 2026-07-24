import { Page } from '@app-builder/components';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { ReactFlowProvider } from '@xyflow/react';
import { useState } from 'react';
import { cn } from 'ui-design-system';
import { graphData } from './data';
import { GraphImpl } from './GraphImpl';

const HOP_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const uploadLoader = createServerFn().handler(() => ({ data: graphData }));

export const Route = createFileRoute('/_app/_builder/test-graph/')({
  loader: () => uploadLoader(),
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = Route.useLoaderData();
  const [maxExplorationHops, setMaxExplorationHops] = useState(0);

  return (
    <Page.Main>
      <Page.Header className="justify-between gap-md">
        <span>Test graph</span>
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
      </Page.Header>
      <Page.Container>
        <Page.Content>
          <ReactFlowProvider>
            <GraphImpl data={data} maxExplorationHops={maxExplorationHops} />
          </ReactFlowProvider>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

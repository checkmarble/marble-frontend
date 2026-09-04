import { GraphSessionProvider, useGraphSession } from '@app-builder/components/Graph/contexts/GraphSessionContext';
import { GraphAccessPlaceholder } from '@app-builder/components/Graph/GraphAccessPlaceholder';
import { SessionGraphCanvas } from '@app-builder/components/Graph/SessionGraphCanvas';
import { useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { getGraphExplorationDisplay } from '@app-builder/services/feature-access';
import { Card, cn } from 'ui-design-system';

interface CaseManagerLinksPageProps {
  objectType: string;
  objectId: string;
}

export function CaseManagerLinksPage({ objectType, objectId }: CaseManagerLinksPageProps) {
  const graphDisplay = getGraphExplorationDisplay(useDataModelFeatureAccess());

  if (graphDisplay === 'hidden') return null;
  if (graphDisplay !== 'graph') {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <GraphAccessPlaceholder />
      </div>
    );
  }

  return (
    <GraphSessionProvider
      key={`${objectType}:${objectId}`}
      initialRecord={{ recordType: objectType, recordId: objectId }}
    >
      <LinksGraphBody />
    </GraphSessionProvider>
  );
}

function LinksGraphBody() {
  const { isGeneratingGraph } = useGraphSession();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SessionGraphCanvas
        placeholder={<Card className={cn('min-h-0 flex-1', isGeneratingGraph && 'animate-pulse bg-grey-background')} />}
      />
    </div>
  );
}

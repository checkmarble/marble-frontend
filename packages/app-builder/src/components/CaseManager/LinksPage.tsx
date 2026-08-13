import { GraphSessionProvider, useGraphSession } from '@app-builder/components/Graph/GraphSessionContext';
import { SessionGraphCanvas } from '@app-builder/components/Graph/SessionGraphCanvas';
import { Card, cn } from 'ui-design-system';

interface CaseManagerLinksPageProps {
  objectType: string;
  objectId: string;
}

export function CaseManagerLinksPage({ objectType, objectId }: CaseManagerLinksPageProps) {
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

import { Page } from '@app-builder/components';
import { GraphRelationsSettings } from '@app-builder/components/Graph/GraphRelationsSettings';
import { useDataModel } from '@app-builder/services/data/data-model';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/test-graph/settings')({
  component: TestGraphSettingsRoute,
});

function TestGraphSettingsRoute() {
  const dataModel = useDataModel();

  return (
    <Page.Content width="form">
      <GraphRelationsSettings dataModel={dataModel} />
    </Page.Content>
  );
}

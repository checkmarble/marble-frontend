import { Page } from '@app-builder/components';
import { GraphRelationsSettings } from '@app-builder/components/Graph/GraphRelationsSettings';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const graphRelationsLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function graphRelationsLoader({ context }) {
    const { user, dataModelRepository } = context.authInfo;

    if (!isAdmin(user)) {
      throw redirect({ to: '/' });
    }

    return {
      dataModel: await dataModelRepository.getDataModel(),
    };
  });

export const Route = createFileRoute('/_app/_builder/settings/graph-relations')({
  loader: () => graphRelationsLoader(),
  component: GraphRelationsSettingsPage,
});

function GraphRelationsSettingsPage() {
  const { dataModel } = Route.useLoaderData();

  return (
    <Page.Content width="readable">
      <GraphRelationsSettings dataModel={dataModel} />
    </Page.Content>
  );
}

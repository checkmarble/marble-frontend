import { Page } from '@app-builder/components';
import { AstBuilder } from '@app-builder/components/AstBuilder';
import {
  type AstNode,
  NewAstNode,
  NewUndefinedAstNode,
} from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, toUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { customListsRepository, editor, dataModelRepository, scenario } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  const scenarioId = fromParams(params, 'scenarioId');

  const [currentScenario, accessors, dataModel, customLists] =
    await Promise.all([
      scenario.getScenario({ scenarioId }),
      editor.listAccessors({
        scenarioId,
      }),
      dataModelRepository.getDataModel(),
      customListsRepository.listCustomLists(),
    ]);

  return {
    scenarioId,
    triggerObjectType: currentScenario.triggerObjectType,
    databaseAccessors: accessors.databaseAccessors,
    payloadAccessors: accessors.payloadAccessors,
    dataModel,
    customLists,
  };
}

export default function ScenarioBuilderPage() {
  const data = useLoaderData<typeof loader>();
  // const node = NewConstantAstNode({ constant: 3 });
  const node = NewAstNode({
    name: '=',
    children: [
      NewAstNode({
        name: '=',
        children: [NewUndefinedAstNode(), NewUndefinedAstNode()],
      }),
      NewUndefinedAstNode(),
    ],
  });
  const { scenarioId } = useParams();
  const handleChange = (_node: AstNode) => {
    // Do whatever on change
  };

  invariant(scenarioId, 'scenario id is not in the url');

  return (
    <Page.Content>
      <AstBuilder.Provider scenarioId={toUUID(scenarioId)} initialData={data}>
        <AstBuilder.Root initialNode={node} nodeStoreRef={() => {}} />
      </AstBuilder.Provider>
    </Page.Content>
  );
}

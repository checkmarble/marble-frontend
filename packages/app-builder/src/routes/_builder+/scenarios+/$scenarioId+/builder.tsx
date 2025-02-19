import { Page } from '@app-builder/components';
import { AstBuilder } from '@app-builder/components/AstBuilder';
import { type AstBuilderNodeSharpFactory } from '@app-builder/components/AstBuilder/edition/node-store';
import { NewEmptyRuleAstNode } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, toUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import { useRef } from 'react';
import { type InferSharpApi } from 'sharpstate';
import invariant from 'tiny-invariant';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { customListsRepository, editor, dataModelRepository, scenario } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  const scenarioId = fromParams(params, 'scenarioId');

  const [currentScenario, accessors, dataModel, customLists] = await Promise.all([
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
  const nodeStoreRef = useRef<InferSharpApi<typeof AstBuilderNodeSharpFactory>>();
  const node = NewEmptyRuleAstNode();

  const { scenarioId } = useParams();
  invariant(scenarioId, 'scenario id is not in the url');

  return (
    <Page.Content>
      <AstBuilder.Provider scenarioId={toUUID(scenarioId)} initialData={data} mode="edit">
        <AstBuilder.Root
          node={node}
          onStoreInit={(nodeStore) => (nodeStoreRef.current = nodeStore)}
          returnType="bool"
        />
      </AstBuilder.Provider>
    </Page.Content>
  );
}

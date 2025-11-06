import { type DataModel } from '@app-builder/models';
import { type DatabaseAccessAstNode, type PayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import { type CustomList } from '@app-builder/models/custom-list';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';

export type BuilderOptionsResource = {
  customLists: CustomList[];
  triggerObjectType: string;
  dataModel: DataModel;
  databaseAccessors: DatabaseAccessAstNode[];
  payloadAccessors: PayloadAstNode[];
};

export async function loader({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const { editor, scenario, dataModelRepository, customListsRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioId = fromParams(params, 'scenarioId');
  const [currentScenario, customLists, dataModel, accessors] = await Promise.all([
    scenario.getScenario({ scenarioId }),
    customListsRepository.listCustomLists(),
    dataModelRepository.getDataModel(),
    editor.listAccessors({ scenarioId }),
  ]);

  return Response.json({
    scenarioId,
    triggerObjectType: currentScenario.triggerObjectType,
    customLists,
    dataModel,
    databaseAccessors: accessors.databaseAccessors,
    payloadAccessors: accessors.payloadAccessors,
  });
}

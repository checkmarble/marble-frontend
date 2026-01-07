import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type DataModel } from '@app-builder/models';
import { type DatabaseAccessAstNode, type PayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import { type CustomList } from '@app-builder/models/custom-list';
import { hasAnyEntitlement } from '@app-builder/services/feature-access';
import { fromParams } from '@app-builder/utils/short-uuid';

export type BuilderOptionsResource = {
  customLists: CustomList[];
  triggerObjectType: string;
  dataModel: DataModel;
  databaseAccessors: DatabaseAccessAstNode[];
  payloadAccessors: PayloadAstNode[];
  hasValidLicense?: boolean;
};

export const loader = createServerFn([authMiddleware], async function builderOptionsLoader({ params, context }) {
  const { editor, scenario, dataModelRepository, customListsRepository, entitlements } = context.authInfo;

  const scenarioId = fromParams(params, 'scenarioId');
  const [currentScenario, customLists, dataModel, accessors] = await Promise.all([
    scenario.getScenario({ scenarioId }),
    customListsRepository.listCustomLists(),
    dataModelRepository.getDataModel(),
    editor.listAccessors({ scenarioId }),
  ]);

  return {
    scenarioId,
    triggerObjectType: currentScenario.triggerObjectType,
    customLists,
    dataModel,
    databaseAccessors: accessors.databaseAccessors,
    payloadAccessors: accessors.payloadAccessors,
    hasValidLicense: hasAnyEntitlement(entitlements),
  };
});

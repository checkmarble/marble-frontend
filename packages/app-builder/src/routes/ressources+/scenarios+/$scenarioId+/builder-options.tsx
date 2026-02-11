import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type DataModel } from '@app-builder/models';
import { type DatabaseAccessAstNode, type PayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import { type ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { type CustomList } from '@app-builder/models/custom-list';
import { hasAnyEntitlement, isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import { fromParams } from '@app-builder/utils/short-uuid';

export type BuilderOptionsResource = {
  customLists: CustomList[];
  triggerObjectType: string;
  dataModel: DataModel;
  databaseAccessors: DatabaseAccessAstNode[];
  payloadAccessors: PayloadAstNode[];
  hasValidLicense?: boolean;
  hasContinuousScreening?: boolean;
  screeningConfigs: ContinuousScreeningConfig[];
};

export const loader = createServerFn([authMiddleware], async function builderOptionsLoader({ params, context }) {
  const { editor, scenario, dataModelRepository, customListsRepository, continuousScreening, entitlements } =
    context.authInfo;

  const scenarioId = fromParams(params, 'scenarioId');
  const [currentScenario, customLists, dataModel, accessors, screeningConfigs] = await Promise.all([
    scenario.getScenario({ scenarioId }),
    customListsRepository.listCustomLists(),
    dataModelRepository.getDataModel(),
    editor.listAccessors({ scenarioId }),
    isContinuousScreeningAvailable(entitlements) ? continuousScreening.listConfigurations() : Promise.resolve([]),
  ]);

  return {
    scenarioId,
    triggerObjectType: currentScenario.triggerObjectType,
    customLists,
    dataModel,
    databaseAccessors: accessors.databaseAccessors,
    payloadAccessors: accessors.payloadAccessors,
    hasValidLicense: hasAnyEntitlement(entitlements),
    hasContinuousScreening: isContinuousScreeningAvailable(entitlements),
    screeningConfigs,
  };
});

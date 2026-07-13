import { RulesPage } from '@app-builder/components/Scenario/Rules/RulesPage';
import { useDerivedIterationRuleGroupsData } from '@app-builder/hooks/routes-layout-data';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAccessible, isAiRuleBuildingAvailable } from '@app-builder/services/feature-access';
import { useParam } from '@app-builder/utils/short-uuid';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const rulesLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function rulesLoader({ context }) {
    const { entitlements } = context.authInfo;

    return {
      isSanctionAvailable: entitlements.sanctions,
      isAiRuleDescriptionEnabled: isAiRuleBuildingAvailable(entitlements),
      isNameRecognitionAvailable: isAccessible(entitlements.nameRecognition),
    };
  });

export const Route = createFileRoute('/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/rules')({
  loader: () => rulesLoader(),
  component: PageComponent,
});

function PageComponent() {
  const router = useRouter();
  const iterationId = useParam('iterationId');
  const { editorMode, rulesList, screeningsConfigs, currentScenario, scenarioValidation } = Route.useRouteContext();
  const { isAiRuleDescriptionEnabled, isSanctionAvailable, isNameRecognitionAvailable } = Route.useLoaderData();
  const ruleGroups = useDerivedIterationRuleGroupsData();

  const handleRuleEditSuccess = async () => {
    await router.invalidate();
  };

  return (
    <RulesPage
      scenario={currentScenario}
      iterationId={iterationId}
      screeningConfigs={screeningsConfigs}
      scenarioValidation={scenarioValidation}
      editorMode={editorMode}
      list={rulesList}
      ruleGroups={ruleGroups}
      isSanctionAvailable={isSanctionAvailable}
      isAiRuleDescriptionEnabled={isAiRuleDescriptionEnabled}
      isNameRecognitionAvailable={isNameRecognitionAvailable}
      onRuleEditSuccess={handleRuleEditSuccess}
    />
  );
}

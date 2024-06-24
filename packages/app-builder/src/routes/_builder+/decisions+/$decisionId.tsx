import {
  CopyToClipboardButton,
  DecisionDetail,
  DecisionRightPanel,
  decisionsI18n,
  ErrorComponent,
  OutcomePanel,
  Page,
  RulesDetail,
  useDecisionRightPanelContext,
} from '@app-builder/components';
import { PivotDetail } from '@app-builder/components/Decisions/PivotDetail';
import { ScorePanel } from '@app-builder/components/Decisions/Score';
import { TriggerObjectDetail } from '@app-builder/components/Decisions/TriggerObjectDetail';
import { isNotFoundHttpError } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { handleParseParamError } from '@app-builder/utils/http/handle-errors';
import { notFound } from '@app-builder/utils/http/http-responses';
import { parseParamsSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { shortUUIDSchema } from '@app-builder/utils/schema/shortUUIDSchema';
import { defer, type LoaderFunctionArgs } from '@remix-run/node';
import {
  isRouteErrorResponse,
  useLoaderData,
  useNavigate,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import * as z from 'zod';

export const handle = {
  i18n: ['common', 'navigation', ...decisionsI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { decision, editor, apiClient, scenario, dataModelRepository } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });
  const parsedParam = await parseParamsSafe(
    params,
    z.object({ decisionId: shortUUIDSchema }),
  );
  if (!parsedParam.success) {
    return handleParseParamError(request, parsedParam.error);
  }
  const { decisionId } = parsedParam.data;

  try {
    const currentDecision = await decision.getDecisionById(decisionId);

    const pivotsPromise = dataModelRepository.listPivots({});

    const astRuleData = Promise.all([
      scenario.getScenarioIteration({
        iterationId: currentDecision.scenario.scenarioIterationId,
      }),
      editor.listOperators({
        scenarioId: currentDecision.scenario.id,
      }),
      editor.listAccessors({
        scenarioId: currentDecision.scenario.id,
      }),
      dataModelRepository.getDataModel(),
      apiClient.listCustomLists(),
    ]).then(
      ([
        scenarioIteration,
        operators,
        accessors,
        dataModel,
        { custom_lists },
      ]) => ({
        rules: scenarioIteration.rules,
        databaseAccessors: accessors.databaseAccessors,
        payloadAccessors: accessors.payloadAccessors,
        operators,
        dataModel,
        customLists: custom_lists,
      }),
    );

    return defer({
      decision: currentDecision,
      pivots: await pivotsPromise,
      astRuleData,
    });
  } catch (error) {
    if (isNotFoundHttpError(error)) {
      return notFound(null);
    } else {
      throw error;
    }
  }
}

export default function DecisionPage() {
  const { decision, pivots, astRuleData } = useLoaderData<typeof loader>();
  const { t } = useTranslation(decisionsI18n);

  const pivotValues = R.pipe(
    decision.pivotValues,
    R.map(({ id, value }) => {
      if (!id || !value) return null;
      const pivot = pivots.find((p) => p.id === id);
      if (!pivot) return null;
      return {
        pivot,
        value,
      };
    }),
    R.filter(R.isNonNullish),
  );

  const existingPivotDefinition = pivots.some(
    (pivot) => pivot.baseTable === decision.triggerObjectType,
  );

  return (
    <DecisionRightPanel.Root>
      <Page.Container>
        <Page.Header className="justify-between gap-8">
          <div className="flex flex-row items-center gap-4">
            <Page.BackButton />
            <span className="line-clamp-1 text-left">
              {t('decisions:decision')}
            </span>
            <CopyToClipboardButton toCopy={decision.id}>
              <span className="text-s line-clamp-1 font-normal">
                <span className="font-medium">ID</span> {decision.id}
              </span>
            </CopyToClipboardButton>
          </div>
          {!decision.case ? <AddToCase decisionIds={[decision.id]} /> : null}
        </Page.Header>
        <Page.Content>
          <div className="grid grid-cols-[2fr_1fr] gap-4 lg:gap-6">
            <div className="flex flex-col gap-4 lg:gap-6">
              <DecisionDetail decision={decision} />
              <PivotDetail
                pivotValues={pivotValues}
                existingPivotDefinition={existingPivotDefinition}
              />
              <RulesDetail
                ruleExecutions={decision.rules}
                triggerObjectType={decision.triggerObjectType}
                astRuleData={astRuleData}
              />
            </div>
            <div className="flex flex-col gap-4 lg:gap-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                <ScorePanel score={decision.score} />
                <OutcomePanel outcome={decision.outcome} />
              </div>
              <TriggerObjectDetail triggerObject={decision.triggerObject} />
            </div>
          </div>
        </Page.Content>
      </Page.Container>
    </DecisionRightPanel.Root>
  );
}

function AddToCase({ decisionIds }: { decisionIds: string[] }) {
  const { t } = useTranslation(decisionsI18n);
  const { onTriggerClick } = useDecisionRightPanelContext();
  return (
    <DecisionRightPanel.Trigger
      asChild
      onClick={() => {
        onTriggerClick({ decisionIds });
      }}
    >
      <Button>
        <Icon icon="plus" className="size-5" />
        {t('decisions:add_to_case')}
      </Button>
    </DecisionRightPanel.Trigger>
  );
}

const DecisionNotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  return (
    <div className="m-auto flex flex-col items-center gap-4">
      {t('common:errors.not_found')}
      <div className="mb-1">
        <Button onClick={() => navigate(-1)}>{t('common:go_back')}</Button>
      </div>
    </div>
  );
};

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <DecisionNotFound />;
  }

  return <ErrorComponent error={error} />;
}

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
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { PivotDetail } from '@app-builder/components/Decisions/PivotDetail';
import { ScorePanel } from '@app-builder/components/Decisions/Score';
import { ScreeningDetail } from '@app-builder/components/Decisions/ScreeningDetail';
import { DecisionDetailTriggerObject } from '@app-builder/components/Decisions/TriggerObjectDetail';
import { isNotFoundHttpError, Pivot } from '@app-builder/models';
import { DecisionDetails } from '@app-builder/models/decision';
import { type ScenarioIterationRule } from '@app-builder/models/scenario/iteration-rule';
import { Screening } from '@app-builder/models/screening';
import { initServerServices } from '@app-builder/services/init.server';
import { handleParseParamError } from '@app-builder/utils/http/handle-errors';
import { notFound } from '@app-builder/utils/http/http-responses';
import { parseParamsSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { shortUUIDSchema } from '@app-builder/utils/schema/shortUUIDSchema';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { isRouteErrorResponse, useLoaderData, useNavigate, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import * as z from 'zod/v4';

export type LoaderData = {
  decision: DecisionDetails;
  scenarioRules: ScenarioIterationRule[];
  pivots: Pivot[];
  screening: Screening[];
};

export const handle = {
  i18n: ['common', 'navigation', 'screeningTopics', ...decisionsI18n] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['decisions']);
      const { decision } = useLoaderData<typeof loader>();

      return (
        <div className="flex items-center gap-4">
          <BreadCrumbLink
            isLast={isLast}
            to={getRoute('/decisions/:decisionId', {
              decisionId: fromUUIDtoSUUID(decision.id),
            })}
          >
            <span className="line-clamp-1 text-start">{t('decisions:decision')}</span>
          </BreadCrumbLink>
          <CopyToClipboardButton toCopy={decision.id}>
            <span className="text-s line-clamp-1 max-w-40 font-normal">
              <span className="font-medium">ID</span> {decision.id}
            </span>
          </CopyToClipboardButton>
        </div>
      );
    },
  ],
};

export async function loader({ request, params }: LoaderFunctionArgs): Promise<LoaderData> {
  const { authService } = initServerServices(request);
  const { decision, scenario, dataModelRepository, screening } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );
  const parsedParam = await parseParamsSafe(params, z.object({ decisionId: shortUUIDSchema }));
  if (!parsedParam.success) {
    throw handleParseParamError(request, parsedParam.error);
  }

  try {
    const independentOperations = Promise.all([
      dataModelRepository.listPivots({}),
      screening.listScreenings({ decisionId: parsedParam.data.decisionId }),
      screening.listDatasets(),
    ]);

    const currentDecision = await decision.getDecisionById(parsedParam.data.decisionId);
    const scenarioRules = await scenario
      .getScenarioIteration({
        iterationId: currentDecision.scenario.scenarioIterationId,
      })
      .then((iteration) => iteration.rules);

    const [pivots, screeningResult, { sections }] = await independentOperations;

    const datasets: Map<string, string> = new Map(
      sections?.flatMap(
        ({ datasets }) => datasets?.map(({ name, title }) => [name, title]) ?? [],
      ) ?? [],
    );

    const sanctionsDatasets = [
      ...new Set(
        screeningResult.flatMap(({ matches }) =>
          matches.flatMap(({ payload }) => payload.datasets),
        ),
      ),
    ];

    return {
      decision: currentDecision,
      scenarioRules,
      pivots,
      screening: screeningResult.map(({ matches, ...rest }) => ({
        ...rest,
        matches: matches.map(({ payload, ...rest }) => ({
          ...rest,
          payload: {
            ...payload,
            datasets: payload.datasets
              ?.filter((dataset) => !sanctionsDatasets.includes(dataset))
              .map((dataset) => datasets.get(dataset) ?? dataset),
          },
        })),
      })),
    };
  } catch (error) {
    if (isNotFoundHttpError(error)) {
      return notFound(null);
    } else {
      throw error;
    }
  }
}

export default function DecisionPage() {
  const { decision, pivots, scenarioRules, screening } = useLoaderData<typeof loader>();

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
      <Page.Main>
        <Page.Header className="justify-between">
          <BreadCrumbs />
          {!decision.case ? <AddToCase decisionIds={[decision.id]} /> : null}
        </Page.Header>
        <Page.Container>
          <Page.Content>
            <div className="grid grid-cols-[2fr_1fr] gap-4 lg:gap-8">
              <div className="flex flex-col gap-4 lg:gap-8">
                <DecisionDetail decision={decision} />
                <PivotDetail
                  pivotValues={pivotValues}
                  existingPivotDefinition={existingPivotDefinition}
                />
                <RulesDetail
                  scenarioId={decision.scenario.id}
                  ruleExecutions={decision.rules}
                  rules={scenarioRules}
                />
                {screening.map((s) => (
                  <ScreeningDetail key={s.id} screening={s} />
                ))}
              </div>
              <div className="flex flex-col gap-4 lg:gap-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
                  <ScorePanel score={decision.score} />
                  <OutcomePanel outcome={decision.outcome} />
                </div>
                <DecisionDetailTriggerObject triggerObject={decision.triggerObject} />
              </div>
            </div>
          </Page.Content>
        </Page.Container>
      </Page.Main>
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

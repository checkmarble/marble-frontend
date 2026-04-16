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
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { AddToCaseForm } from '@app-builder/components/Decisions/AddToCaseForm';
import { PivotDetail } from '@app-builder/components/Decisions/PivotDetail';
import { ScorePanel } from '@app-builder/components/Decisions/Score';
import { ScreeningDetail } from '@app-builder/components/Decisions/ScreeningDetail';
import { DecisionDetailTriggerObject } from '@app-builder/components/Decisions/TriggerObjectDetail';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { DataModel, isNotFoundHttpError } from '@app-builder/models';
import { Screening } from '@app-builder/models/screening';
import { ScreeningRepository } from '@app-builder/repositories/ScreeningRepository';
import { setToast } from '@app-builder/services/toast.server';
import { handleParseParamError } from '@app-builder/utils/http/handle-errors';
import { parseParamsSafe } from '@app-builder/utils/input-validation';
import { shortUUIDSchema } from '@app-builder/utils/schema/shortUUIDSchema';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import * as z from 'zod/v4';

const handleScreenings = async (screenings: Screening[], screeningRepository: ScreeningRepository) => {
  if (screenings.length === 0) {
    return [];
  }

  const { sections } = await screeningRepository.listDatasets();

  const datasets: Map<string, string> = new Map(
    sections?.flatMap(({ datasets }) => datasets?.map(({ name, title }) => [name, title]) ?? []) ?? [],
  );

  const sanctionsDatasets = [
    ...new Set(screenings.flatMap(({ matches }) => matches.flatMap(({ payload }) => payload.datasets))),
  ];

  return screenings.map(({ matches, ...rest }) => ({
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
  }));
};

const decisionLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function decisionLoader({ context, data }) {
    const request = getRequest();
    const {
      i18nextService: { getFixedT },
    } = context.services;
    const { decision, scenario, dataModelRepository, screening } = context.authInfo;

    const parsedParam = await parseParamsSafe(data?.params ?? {}, z.object({ decisionId: shortUUIDSchema }));
    if (!parsedParam.success) {
      throw handleParseParamError(request, parsedParam.error);
    }

    const t = await getFixedT(request, ['decisions']);

    const currentDecision = await decision.getDecisionById(parsedParam.data.decisionId).catch(async (error) => {
      if (isNotFoundHttpError(error)) {
        await setToast({
          type: 'error',
          message: t('decisions:errors.decision_not_found'),
        });

        let redirectPath = '/detection/decisions';
        try {
          const referer = request.headers.get('Referer');
          if (referer) {
            const { pathname, search } = new URL(referer);
            if (pathname.startsWith('/detection/decisions')) {
              redirectPath = pathname + search;
            }
          }
        } catch {
          // Malformed referer URL, use default redirect
        }

        throw redirect({ href: redirectPath });
      }
      throw error;
    });

    const independentOperations = Promise.all([
      dataModelRepository.getDataModel().catch(() => [] as DataModel),
      dataModelRepository.listPivots({}),
      screening.listScreenings({ decisionId: parsedParam.data.decisionId }),
    ]);

    const scenarioIteration = await scenario.getScenarioIteration({
      iterationId: currentDecision.scenario.scenarioIterationId,
    });
    const scenarioRules = scenarioIteration.rules;

    const [dataModel, pivots, screeningResult] = await independentOperations;

    const pivotObjects = await Promise.all(
      currentDecision.pivotValues.map(async ({ id, value }) => {
        if (!id || !value) return null;
        const pivot = pivots.find((p) => p.id === id);
        if (!pivot || pivot.type === 'field') return null;
        const object = await dataModelRepository.getIngestedObject(pivot.pivotTable, value).catch(() => null);
        if (!object) return null;
        return { pivotId: id, value, object };
      }),
    ).then((results) => R.filter(results, R.isNonNullish));

    return {
      decision: currentDecision,
      scenarioRules,
      dataModel,
      pivots,
      pivotObjects,
      screening: await handleScreenings(screeningResult, screening),
      isIterationArchived: scenarioIteration.archived,
    };
  });

export const Route = createFileRoute('/_app/_builder/detection/decisions/$decisionId')({
  loader: ({ params }) => decisionLoader({ data: { params } }),
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['decisions']);
        const { decision } = Route.useLoaderData();

        return (
          <div className="flex items-center gap-4">
            <BreadCrumbLink
              isLast={isLast}
              to="/detection/decisions/$decisionId"
              params={{ decisionId: fromUUIDtoSUUID(decision.id) }}
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
  },
  errorComponent: ({ error }) => {
    Sentry.captureException(error);
    return <ErrorComponent error={error} />;
  },
  component: DecisionPage,
});

function DecisionPage() {
  const { decision, pivots, pivotObjects, scenarioRules, screening, isIterationArchived } = Route.useLoaderData();

  const pivotValues = R.pipe(
    decision.pivotValues,
    R.map(({ id, value }) => {
      if (!id || !value) return null;
      const pivot = pivots.find((p) => p.id === id);
      if (!pivot) return null;
      const pivotObject = pivotObjects.find((o) => o.pivotId === id && o.value === value);
      return {
        pivot,
        value,
        object: pivotObject?.object ?? null,
      };
    }),
    R.filter(R.isNonNullish),
  );

  const existingPivotDefinition = pivots.some((pivot) => pivot.baseTable === decision.triggerObjectType);

  return (
    <DecisionRightPanel.Root content={<AddToCaseForm />}>
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
                <PivotDetail pivotValues={pivotValues} existingPivotDefinition={existingPivotDefinition} />
                <RulesDetail
                  scenarioId={decision.scenario.id}
                  ruleExecutions={decision.rules}
                  rules={scenarioRules}
                  isIterationArchived={isIterationArchived}
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
                <DecisionDetailTriggerObject
                  table={decision.triggerObjectType}
                  triggerObject={decision.triggerObject}
                />
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
      <Button variant="primary">
        <Icon icon="plus" className="size-5" />
        {t('decisions:add_to_case')}
      </Button>
    </DecisionRightPanel.Trigger>
  );
}

import { Page, scenarioI18n } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { DeleteScreeningRule } from '@app-builder/components/Scenario/Screening/Actions/DeleteScreeningRule';
import { SEARCH_ENTITIES } from '@app-builder/constants/screening-entity';
import { useDetectionScenarioData, useDetectionScenarioIterationData } from '@app-builder/hooks/routes-layout-data';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { NewUndefinedAstNode } from '@app-builder/models';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import { setToast } from '@app-builder/services/toast.server';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { fromParams, fromUUIDtoSUUID, useParam } from '@app-builder/utils/short-uuid';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { pick } from 'radash';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

const screeningLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function screeningLoader({ data, context }) {
    const scenarioId = fromParams(data?.params ?? {}, 'scenarioId');
    const { customListsRepository, editor, dataModelRepository, screening, continuousScreening, entitlements } =
      context.authInfo;

    const [{ databaseAccessors, payloadAccessors }, dataModel, customLists, { sections }, screeningConfigs] =
      await Promise.all([
        editor.listAccessors({ scenarioId }),
        dataModelRepository.getDataModel(),
        customListsRepository.listCustomLists(),
        screening.listDatasets(),
        isContinuousScreeningAvailable(entitlements) ? continuousScreening.listConfigurations() : Promise.resolve([]),
      ]);

    return {
      databaseAccessors,
      payloadAccessors,
      dataModel,
      customLists,
      sections,
      entitlements,
      screeningConfigs,
    };
  });

const editScreeningFormSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  ruleGroup: z.string().optional(),
  datasets: protectArray(z.array(z.string())),
  threshold: z.number().optional(),
  forcedOutcome: z.enum(['review', 'decline', 'block_and_review']),
  triggerRule: z.any(),
  entityType: z.enum(['Person', 'Organization', 'Vehicle', 'Thing']).optional(),
  query: z.record(z.string(), z.any()),
  counterPartyId: z.any().nullish(),
  preprocessing: z
    .object({
      useNer: z.boolean().optional(),
      nerIgnoreClassification: z.boolean().optional(),
      skipIfUnder: z.number().nullish(),
      removeNumbers: z.boolean().optional(),
      blacklistListId: z.string().nullish(),
    })
    .optional(),
});

type EditScreeningForm = z.infer<typeof editScreeningFormSchema>;

const clearQuery = (
  entityType: EditScreeningForm['entityType'],
  query: Record<string, unknown>,
): Record<string, unknown> => (entityType ? pick(query, SEARCH_ENTITIES[entityType].fields) : query);

type EditScreeningResult = { status: 'success' | 'error'; errors: any };

const editScreeningAction = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function editScreeningAction({ context, data }): Promise<EditScreeningResult> {
    const request = getRequest();
    const { scenarioIterationScreeningRepository } = context.authInfo;

    const raw = await request.json();

    const { error, data: parsedData, success } = editScreeningFormSchema.safeParse(raw);

    if (!success) {
      return { status: 'error' as const, errors: z.treeifyError(error) };
    }

    try {
      await scenarioIterationScreeningRepository.updateScreeningConfig({
        iterationId: fromParams(data?.params ?? {}, 'iterationId'),
        screeningId: fromParams(data?.params ?? {}, 'screeningId'),
        changes: {
          ...parsedData,
          counterPartyId: parsedData.counterPartyId ?? NewUndefinedAstNode(),
          query: clearQuery(parsedData.entityType, parsedData.query) as Partial<{
            [key: string]: import('@app-builder/models').AstNode;
          }>,
          preprocessing: {
            ...parsedData.preprocessing,
            useNer: parsedData.entityType === 'Thing' ? parsedData.preprocessing?.useNer : undefined,
            nerIgnoreClassification: parsedData.preprocessing?.useNer
              ? parsedData.preprocessing?.nerIgnoreClassification
              : undefined,
            skipIfUnder: parsedData.preprocessing?.skipIfUnder ?? undefined,
            blacklistListId: parsedData.preprocessing?.blacklistListId ?? undefined,
          },
        } as any,
      });

      await setToast({
        type: 'success',
        messageKey: 'common:success.save',
      });

      return { status: 'success' as const, errors: [] };
    } catch (_error) {
      await setToast({
        type: 'error',
        messageKey: 'common:errors.unknown',
      });

      return { status: 'error' as const, errors: [] };
    }
  });

export const Route = createFileRoute(
  '/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/screenings/$screeningId',
)({
  loader: ({ params }) => screeningLoader({ data: { params } }),
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['navigation']);
        const scenarioId = useParam('scenarioId');
        const iterationId = useParam('iterationId');

        return (
          <BreadCrumbLink
            isLast={isLast}
            to="/detection/scenarios/$scenarioId/i/$iterationId/rules"
            params={{ scenarioId: fromUUIDtoSUUID(scenarioId), iterationId: fromUUIDtoSUUID(iterationId) }}
          >
            {t('navigation:scenario.rules')}
          </BreadCrumbLink>
        );
      },
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['common']);
        const { scenarioIteration } = useDetectionScenarioIterationData();
        const editorMode = useEditorMode();
        const configId = useParam('screeningId');

        return (
          <div className="flex items-center gap-2">
            <BreadCrumbLink
              isLast={isLast}
              to="/detection/scenarios/$scenarioId/i/$iterationId/screenings/$screeningId"
              params={{
                scenarioId: fromUUIDtoSUUID(scenarioIteration.scenarioId),
                iterationId: fromUUIDtoSUUID(scenarioIteration.id),
                screeningId: fromUUIDtoSUUID(configId),
              }}
            >
              {scenarioIteration.screeningConfigs.find((c) => c.id === configId)?.name ?? t('common:no_name')}
            </BreadCrumbLink>
            {editorMode === 'edit' ? <Tag size="big">{t('common:edit')}</Tag> : null}
          </div>
        );
      },
    ],
  },
  component: ScreeningDetail,
});

function ScreeningDetail() {
  const { t } = useTranslation([...scenarioI18n, 'common', 'decisions']);
  const screeningId = useParam('screeningId');
  const scenarioId = useParam('scenarioId');
  const iterationId = useParam('iterationId');

  const { currentScenario } = useDetectionScenarioData();
  const { scenarioIteration } = useDetectionScenarioIterationData();
  const editorMode = useEditorMode();

  const screeningConfig = scenarioIteration.screeningConfigs.find((c) => c.id === screeningId);

  const mutation = useMutation({
    mutationFn: (value: EditScreeningForm) =>
      editScreeningAction({ data: { params: { scenarioId, iterationId, screeningId }, ...value } }),
  });

  const form = useForm({
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        mutation.mutate(value as EditScreeningForm);
      }
    },
    validators: {
      onSubmit: editScreeningFormSchema as any,
    },
    defaultValues: screeningConfig
      ? {
          id: screeningConfig.id ?? '',
          name: screeningConfig.name ?? '',
          description: screeningConfig.description ?? '',
          ruleGroup: screeningConfig.ruleGroup ?? '',
          datasets: screeningConfig.datasets ?? [],
          threshold: screeningConfig.threshold ?? undefined,
          forcedOutcome: (screeningConfig.forcedOutcome as EditScreeningForm['forcedOutcome']) ?? 'review',
          triggerRule: screeningConfig.triggerRule,
          entityType: screeningConfig.entityType as EditScreeningForm['entityType'],
          query: screeningConfig.query ?? {},
          counterPartyId: screeningConfig.counterPartyId,
          preprocessing: screeningConfig.preprocessing,
        }
      : undefined,
  });

  if (!screeningConfig) return null;

  return (
    <Page.Main>
      <Page.Header>
        <BreadCrumbs
          back={`/detection/scenarios/${fromUUIDtoSUUID(currentScenario.id)}/i/${fromUUIDtoSUUID(iterationId)}/rules`}
        />
      </Page.Header>
      <Page.Container>
        <Page.Content>
          <form
            className="relative flex flex-col gap-8"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <p className="text-grey-primary text-l font-semibold">{screeningConfig.name}</p>
            {editorMode === 'edit' ? (
              <div className="flex items-center gap-2 self-end">
                <DeleteScreeningRule iterationId={iterationId} screeningId={screeningId} scenarioId={scenarioId}>
                  <Button variant="destructive" type="button">
                    <Icon icon="delete" className="size-5" aria-hidden />
                    {t('common:delete')}
                  </Button>
                </DeleteScreeningRule>
                <Button variant="primary" type="submit">
                  <Icon icon="save" className="size-5" aria-hidden />
                  {t('common:save')}
                </Button>
              </div>
            ) : null}
          </form>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

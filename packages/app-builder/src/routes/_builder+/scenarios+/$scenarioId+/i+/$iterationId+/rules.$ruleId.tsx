import { Page, scenarioI18n } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { DeleteRule } from '@app-builder/components/Scenario/Rules/Actions/DeleteRule';
import { DuplicateRule } from '@app-builder/components/Scenario/Rules/Actions/DuplicateRule';
import { AiDescription } from '@app-builder/components/Scenario/Rules/AiDescription';
import { FieldAstFormula } from '@app-builder/components/Scenario/Screening/FieldAstFormula';
import { FieldRuleGroup } from '@app-builder/components/Scenario/Screening/FieldRuleGroup';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import useIntersection from '@app-builder/hooks/useIntersection';
import { AstNode, NewEmptyRuleAstNode } from '@app-builder/models';
import {
  AdaptedEditRulePayloadSchema,
  EditRulePayload,
  editRulePayloadSchema,
  useEditRuleMutation,
} from '@app-builder/queries/scenarios/edit-rule';
import { useRuleDescriptionMutation } from '@app-builder/queries/scenarios/rule-description';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID, useParam } from '@app-builder/utils/short-uuid';
import * as Ariakit from '@ariakit/react';
import { useDebouncedCallbackRef } from '@marble/shared';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, CtaClassName, cn, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { useCurrentScenarioIterationRule, useRuleGroups } from './_layout';

export const handle = {
  i18n: [...scenarioI18n, 'common'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);
      const scenarioId = useParam('scenarioId');
      const iterationId = useParam('iterationId');

      return (
        <BreadCrumbLink
          isLast={isLast}
          to={getRoute('/scenarios/:scenarioId/i/:iterationId/rules', {
            scenarioId: fromUUIDtoSUUID(scenarioId),
            iterationId: fromUUIDtoSUUID(iterationId),
          })}
        >
          {t('navigation:scenario.rules')}
        </BreadCrumbLink>
      );
    },
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['common']);
      const rule = useCurrentScenarioIterationRule();
      const scenarioId = useParam('scenarioId');
      const iterationId = useParam('iterationId');
      const editorMode = useEditorMode();

      return (
        <div className="flex items-center gap-2">
          <BreadCrumbLink
            isLast={isLast}
            to={getRoute('/scenarios/:scenarioId/i/:iterationId/rules/:ruleId', {
              scenarioId: fromUUIDtoSUUID(scenarioId),
              iterationId: fromUUIDtoSUUID(iterationId),
              ruleId: fromUUIDtoSUUID(rule.id),
            })}
          >
            {rule.name ?? fromUUIDtoSUUID(rule.id)}
          </BreadCrumbLink>
          {editorMode === 'edit' ? (
            <Tag size="big" border="square">
              {t('common:edit')}
            </Tag>
          ) : null}
        </div>
      );
    },
  ],
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService, appConfigRepository } = initServerServices(request);
  const { customListsRepository, editor, dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  const [{ databaseAccessors, payloadAccessors }, dataModel, customLists, appConfig] = await Promise.all([
    editor.listAccessors({ scenarioId }),
    dataModelRepository.getDataModel(),
    customListsRepository.listCustomLists(),
    appConfigRepository.getAppConfig(),
  ]);

  return {
    iterationId,
    scenarioId,
    databaseAccessors,
    payloadAccessors,
    dataModel,
    customLists,
    isAiRuleDescriptionEnabled: appConfig.isManagedMarble,
  };
}

export default function RuleDetail() {
  const {
    iterationId,
    scenarioId,
    databaseAccessors,
    payloadAccessors,
    dataModel,
    customLists,
    isAiRuleDescriptionEnabled,
  } = useLoaderData<typeof loader>();

  const { t } = useTranslation(handle.i18n);
  const revalidate = useLoaderRevalidator();

  const scenario = useCurrentScenario();
  const rule = useCurrentScenarioIterationRule();
  const editor = useEditorMode();
  const ruleGroups = useRuleGroups();
  const editRuleMutation = useEditRuleMutation(rule.id);

  const descriptionRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(descriptionRef, {
    root: containerRef.current,
    rootMargin: '-30px',
    threshold: 1,
  });

  const form = useForm({
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        editRuleMutation.mutateAsync(value).then((res) => {
          revalidate();
        });
      }
    },
    validators: {
      onSubmit: editRulePayloadSchema as AdaptedEditRulePayloadSchema,
    },
    defaultValues: rule as EditRulePayload,
  });

  const ruleDescriptionMutation = useRuleDescriptionMutation(rule.id);
  const [ruleDescription, setRuleDescription] = useState<string | undefined>(undefined);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    if (!isAiRuleDescriptionEnabled) return;

    setRuleDescription(undefined);
    if (rule.formula) {
      ruleDescriptionMutation.mutateAsync({ scenarioId: scenario.id, astNode: rule.formula }).then((res) => {
        if (res.success && !ruleDescription && res.data.isRuleValid) {
          setRuleDescription(res.data.description);
        }
      });
    }
  }, [rule.id]);

  const innerHandleFormulaChange = useDebouncedCallbackRef((value: AstNode | undefined) => {
    setIsDebouncing(false);
    if (value) {
      ruleDescriptionMutation.mutateAsync({ scenarioId: scenario.id, astNode: value }).then((res) => {
        if (res.success && res.data.isRuleValid) {
          setRuleDescription(res.data.description);
        }
      });
    }
  }, 3000);
  const handleFormulaChange = (value: AstNode | undefined) => {
    if (!isAiRuleDescriptionEnabled) return;

    setIsDebouncing(true);
    innerHandleFormulaChange(value);
  };

  const options = {
    databaseAccessors,
    payloadAccessors,
    dataModel,
    customLists,
    triggerObjectType: scenario.triggerObjectType,
  };

  //TODO Add errors from the servers if they are present

  return (
    <Page.Main>
      <Page.Header>
        <BreadCrumbs back={getRoute('/scenarios/:scenarioId/i/:iterationId/rules', { iterationId, scenarioId })} />
      </Page.Header>
      <Page.Container>
        <Page.Content>
          <form className="relative flex flex-col" onSubmit={handleSubmit(form)}>
            <div
              className={cn('bg-purple-99 sticky top-0 flex h-[88px] items-center justify-between gap-4 max-w-3xl', {
                'border-b-grey-90 border-b': !intersection?.isIntersecting,
              })}
            >
              <form.Field
                name="name"
                validators={{
                  onChange: editRulePayloadSchema.shape.name,
                  onBlur: editRulePayloadSchema.shape.name,
                }}
              >
                {(field) => (
                  <div className="flex w-full flex-col gap-1">
                    <input
                      type="text"
                      name={field.name}
                      disabled={editor === 'view'}
                      defaultValue={field.state.value}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      className="text-grey-00 text-l w-full border-none bg-transparent font-normal outline-hidden"
                      placeholder={t('scenarios:edit_rule.name_placeholder')}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
              {editor === 'edit' ? (
                <div className="flex items-center gap-2">
                  <Ariakit.MenuProvider>
                    <Ariakit.MenuButton
                      className={CtaClassName({
                        variant: 'secondary',
                        size: 'icon',
                        className: 'size-[40px]',
                      })}
                    >
                      <Icon icon="dots-three" className="size-4" />
                    </Ariakit.MenuButton>
                    <Ariakit.Menu
                      shift={-80}
                      className="bg-grey-100 border-grey-90 mt-2 flex flex-col gap-2 rounded-sm border p-2"
                    >
                      <DuplicateRule ruleId={rule.id} iterationId={rule.scenarioIterationId} scenarioId={scenarioId}>
                        <Button variant="secondary" type="button">
                          <Icon icon="copy" className="size-5" aria-hidden />
                          {t('scenarios:clone_rule.button')}
                        </Button>
                      </DuplicateRule>

                      <DeleteRule ruleId={rule.id} iterationId={rule.scenarioIterationId} scenarioId={scenarioId}>
                        <Button color="red" type="button">
                          <Icon icon="delete" className="size-5" aria-hidden />
                          {t('common:delete')}
                        </Button>
                      </DeleteRule>
                    </Ariakit.Menu>
                  </Ariakit.MenuProvider>

                  <Button type="submit" className="flex-1">
                    <Icon icon="save" className="size-5" aria-hidden />
                    {t('common:save')}
                  </Button>
                </div>
              ) : null}
            </div>
            <div className="flex flex-col gap-8">
              <div className="border-grey-90 flex flex-col items-start gap-6 border-b pb-6 max-w-3xl">
                <form.Field
                  name="description"
                  validators={{
                    onChange: editRulePayloadSchema.shape.description,
                    onBlur: editRulePayloadSchema.shape.description,
                  }}
                >
                  {(field) => (
                    <div ref={descriptionRef} className="flex w-full flex-col gap-1">
                      <textarea
                        name={field.name}
                        disabled={editor === 'view'}
                        defaultValue={field.state.value}
                        onChange={(e) => field.handleChange(e.currentTarget.value)}
                        onBlur={field.handleBlur}
                        className="form-textarea text-grey-50 text-s w-full resize-none border-none bg-transparent font-medium outline-hidden"
                        placeholder={t('scenarios:edit_rule.description_placeholder')}
                      />
                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                    </div>
                  )}
                </form.Field>
                <form.Field
                  name="ruleGroup"
                  validators={{
                    onChange: editRulePayloadSchema.shape.ruleGroup,
                    onBlur: editRulePayloadSchema.shape.ruleGroup,
                  }}
                >
                  {(field) => (
                    <div className="flex flex-col gap-2">
                      <FieldRuleGroup
                        disabled={editor === 'view'}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        selectedRuleGroup={field.state.value}
                        ruleGroups={ruleGroups}
                      />
                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                    </div>
                  )}
                </form.Field>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-s font-medium">{t('scenarios:edit_rule.formula')}</span>
                <div className="grid grid-cols-[var(--container-3xl)_1fr] gap-v2-lg">
                  <div className="bg-grey-100 border-grey-90 rounded-md border p-6 max-w-3xl">
                    <form.Field
                      name="formula"
                      validators={{
                        onChange: editRulePayloadSchema.shape.formula,
                        onBlur: editRulePayloadSchema.shape.formula,
                      }}
                    >
                      {(field) => (
                        <FieldAstFormula
                          type="rule"
                          scenarioId={scenario.id}
                          options={options}
                          onBlur={field.handleBlur}
                          onChange={(node) => {
                            field.handleChange(node);
                            handleFormulaChange(node);
                          }}
                          astNode={field.state.value}
                          defaultValue={NewEmptyRuleAstNode()}
                        />
                      )}
                    </form.Field>
                  </div>

                  {isAiRuleDescriptionEnabled ? (
                    <AiDescription
                      isPending={isDebouncing || ruleDescriptionMutation.isPending}
                      description={ruleDescription}
                      className="self-start max-w-2xl"
                    />
                  ) : null}
                </div>
                <div className="bg-grey-100 border-grey-90 rounded-md border p-6 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-grey-95 text-grey-50 text-s inline-flex rounded-sm p-2 font-medium">
                      {t('scenarios:edit_rule.score_heading')}
                    </span>
                    <form.Field
                      name="scoreModifier"
                      validators={{
                        onChange: editRulePayloadSchema.shape.scoreModifier,
                        onBlur: editRulePayloadSchema.shape.scoreModifier,
                      }}
                    >
                      {(field) => (
                        <div className="flex flex-col gap-1">
                          <FormInput
                            type="number"
                            name={field.name}
                            defaultValue={field.state.value}
                            onBlur={field.handleBlur}
                            disabled={editor === 'view'}
                            onChange={(e) => field.handleChange(+e.currentTarget.value)}
                            valid={field.state.meta.errors?.length === 0}
                          />
                          <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                        </div>
                      )}
                    </form.Field>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

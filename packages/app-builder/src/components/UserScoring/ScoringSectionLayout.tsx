import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type DurationUnit, SECONDS_PER_UNIT, secondsToDisplay } from '@app-builder/models/scoring';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { useListScoringRulesetsQuery } from '@app-builder/queries/scoring/list-rulesets';
import { useUpdateScoringRulesetMutation } from '@app-builder/queries/scoring/update-ruleset';
import { type UpdateScoringRulesetPayload, updateScoringRulesetPayloadSchema } from '@app-builder/schemas/user-scoring';
import { handleSubmit } from '@app-builder/utils/form';
import { createSimpleContext } from '@marble/shared';
import { useForm } from '@tanstack/react-form';
import { Link, Outlet, useMatches } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, NumberInput, type SelectOption, SelectV2, Tabs, tabClassName } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { Page } from '../Page';
import { PanelContainer, PanelRoot } from '../Panel';
import { PanelSharpFactory } from '../Panel/Panel';
import { Spinner } from '../Spinner';
import { ScoringLevelThresholds } from './ScoringLevelThresholds';

export const CreateRulesetPanelContext = createSimpleContext<{ open: boolean; setOpen: (state: boolean) => void }>(
  'CreateRulesetPanel',
);

export function ScoringSectionLayout({ maxRiskLevel }: { maxRiskLevel: number | null | undefined }) {
  const { t } = useTranslation(['user-scoring']);
  const [panelOpen, setPanelOpen] = useState(false);
  const { data, isPending } = useListScoringRulesetsQuery();
  const matches = useMatches();
  const showCreateButton = matches.some(
    (m) => (m.staticData as { showCreateRulesetButton?: boolean })?.showCreateRulesetButton,
  );
  const rulesets = data?.rulesets ?? [];

  return (
    <CreateRulesetPanelContext.Provider value={{ open: panelOpen, setOpen: setPanelOpen }}>
      <Page.Main>
        <Page.Container>
          <Page.ContentV2 className="flex flex-col gap-v2-md container mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-h1 font-bold">{t('user-scoring:section.title')}</h1>
              {showCreateButton ? (
                <Button variant="secondary" onClick={() => setPanelOpen(true)}>
                  {t('user-scoring:section.configure_button')}
                </Button>
              ) : null}
            </div>
            <Tabs>
              <Link to="/user-scoring/overview" className={tabClassName}>
                {t('user-scoring:section.tab_overview')}
              </Link>
              {isPending ? (
                <div className="h-full flex items-center px-v2-sm">
                  <Spinner className="size-4" />
                </div>
              ) : (
                rulesets.map((ruleset) => (
                  <Link
                    key={ruleset.id}
                    to="/user-scoring/$recordType/$version"
                    params={{
                      recordType: ruleset.recordType,
                      version: ruleset.status === 'draft' ? 'draft' : ruleset.version.toString(),
                    }}
                    className={tabClassName}
                  >
                    {ruleset.name}
                  </Link>
                ))
              )}
            </Tabs>
            <Outlet />
            {maxRiskLevel ? (
              <PanelRoot open={panelOpen} onOpenChange={setPanelOpen}>
                <ScoringRulesetCreationPanel maxRiskLevel={maxRiskLevel} />
              </PanelRoot>
            ) : null}
          </Page.ContentV2>
        </Page.Container>
      </Page.Main>
    </CreateRulesetPanelContext.Provider>
  );
}

function DurationSecondsField({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (seconds: number | undefined) => void;
}) {
  const { t } = useTranslation(['common', 'user-scoring']);
  const initial = value !== undefined ? secondsToDisplay(value) : { value: 0, unit: 'days' as DurationUnit };
  const [inputValue, setInputValue] = useState(initial.value);
  const [unit, setUnit] = useState<DurationUnit | null>(initial.unit);

  const durationUnitOptions: SelectOption<DurationUnit | null>[] = [
    { label: t('user-scoring:section.create_panel.unit_placeholder'), value: null },
    { label: t('common:duration_unit.days'), value: 'days' },
    { label: t('common:duration_unit.months'), value: 'months' },
    { label: t('common:duration_unit.years'), value: 'years' },
  ];

  return (
    <>
      <NumberInput
        className="max-w-15"
        value={inputValue}
        onChange={(v) => {
          setInputValue(v);
          if (unit) {
            onChange(v > 0 ? v * SECONDS_PER_UNIT[unit] : undefined);
          }
        }}
      />
      <SelectV2<DurationUnit | null>
        placeholder={t('user-scoring:section.create_panel.unit_placeholder')}
        options={durationUnitOptions}
        value={unit}
        onChange={(u) => {
          setUnit(u);
          if (u) {
            onChange(inputValue > 0 ? inputValue * SECONDS_PER_UNIT[u] : undefined);
          }
        }}
        className="text-small min-w-22"
      />
    </>
  );
}

function ScoringRulesetCreationPanel({ maxRiskLevel }: { maxRiskLevel: number }) {
  const { t } = useTranslation(['user-scoring']);
  const revalidate = useLoaderRevalidator();
  const updateScoringRulesetMutation = useUpdateScoringRulesetMutation();
  const dataModelQuery = useDataModelQuery();
  const panelSharp = PanelSharpFactory.useSharp();
  const form = useForm({
    defaultValues: {
      name: '',
      recordType: '',
      thresholds: Array.from({ length: maxRiskLevel - 1 }, (_, i) => (i + 1) * 10) as number[],
      rules: [],
      cooldownSeconds: 0,
      scoringIntervalSeconds: 0,
    } as UpdateScoringRulesetPayload,
    validators: {
      onSubmit: updateScoringRulesetPayloadSchema,
      onChange: updateScoringRulesetPayloadSchema,
      onMount: updateScoringRulesetPayloadSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      if (formApi.state.isValid) {
        await updateScoringRulesetMutation.mutateAsync(value).then(() => {
          panelSharp.actions.close();
          revalidate();
        });
      }
    },
  });

  const entityOptions: SelectOption<string>[] = (dataModelQuery.data?.dataModel ?? []).map((t) => ({
    label: t.name,
    value: t.name,
  }));

  return (
    <PanelContainer size="lg" className="flex-col gap-v2-md">
      <form className="contents" onSubmit={handleSubmit(form)}>
        <div className="flex items-center gap-v2-md">
          <button type="button" onClick={() => panelSharp.actions.close()}>
            <Icon icon="x" className="size-6" />
          </button>
          <h2 className="text-h2 font-semibold">{t('user-scoring:section.create_panel.title')}</h2>
        </div>
        <div>
          <form.Field name="recordType">
            {(field) => (
              <SelectV2
                placeholder={t('user-scoring:section.create_panel.entity_placeholder')}
                value={field.state.value}
                options={entityOptions}
                onChange={field.handleChange}
                className="w-full"
              />
            )}
          </form.Field>
        </div>
        <div className="flex flex-col gap-v2-sm">
          {t('user-scoring:section.create_panel.general_settings')}
          <div className="border border-grey-border rounded-v2-md p-v2-md grid grid-cols-[1fr_repeat(3,_auto)] gap-x-v2-sm gap-y-v2-md">
            <div className="grid grid-cols-subgrid col-span-full items-center">
              <span className="text-small">{t('user-scoring:section.create_panel.recalculation_duration')}</span>
              <form.Field name="cooldownSeconds">
                {(field) => <DurationSecondsField value={field.state.value} onChange={field.handleChange} />}
              </form.Field>
              <Icon icon="helpcenter" className="size-5 text-grey-secondary" />
            </div>
            <div className="grid grid-cols-subgrid col-span-full items-center">
              <span className="text-small">{t('user-scoring:section.create_panel.lower_score_duration')}</span>
              <form.Field name="scoringIntervalSeconds">
                {(field) => <DurationSecondsField value={field.state.value} onChange={field.handleChange} />}
              </form.Field>
              <Icon icon="helpcenter" className="size-5 text-grey-secondary" />
            </div>
          </div>
        </div>
        <form.Field name="thresholds">
          {(field) => (
            <ScoringLevelThresholds
              maxRiskLevel={maxRiskLevel}
              thresholds={field.state.value}
              onThresholdsChange={field.handleChange}
            />
          )}
        </form.Field>
        <div className="flex gap-v2-sm justify-end mt-auto">
          <Button
            appearance="stroked"
            onClick={() => {
              panelSharp.actions.close();
            }}
          >
            {t('user-scoring:section.create_panel.cancel')}
          </Button>
          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button disabled={!canSubmit || isSubmitting} type="submit">
                {t('user-scoring:section.create_panel.validate')}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </PanelContainer>
  );
}

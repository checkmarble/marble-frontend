import { SECONDS_PER_UNIT } from '@app-builder/models/scoring';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { useListScoringRulesetsQuery } from '@app-builder/queries/scoring/list-rulesets';
import { useUpdateScoringRulesetMutation } from '@app-builder/queries/scoring/update-ruleset';
import { type UpdateScoringRulesetPayload, updateScoringRulesetPayloadSchema } from '@app-builder/schemas/user-scoring';
import { handleSubmit } from '@app-builder/utils/form';
import { createSimpleContext } from '@marble/shared';
import { useForm } from '@tanstack/react-form';
import { Link, Outlet, useMatches, useNavigate, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, NumberInput, type SelectOption, SelectV2, Tabs, Tooltip, tabClassName } from 'ui-design-system';
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

function DurationDaysField({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (seconds: number | undefined) => void;
}) {
  const { t } = useTranslation(['common']);
  const [days, setDays] = useState(value !== undefined ? value / SECONDS_PER_UNIT.days : 0);

  return (
    <>
      <NumberInput
        className="max-w-15"
        borderColor={days < 1 ? 'redfigma-47' : 'greyfigma-90'}
        value={days}
        onChange={(v) => {
          setDays(v);
          onChange(v > 0 ? v * SECONDS_PER_UNIT.days : undefined);
        }}
      />
      <span className="text-grey-secondary">{t('common:duration_unit.days')}</span>
    </>
  );
}

function ScoringRulesetCreationPanel({ maxRiskLevel }: { maxRiskLevel: number }) {
  const { t } = useTranslation(['common', 'user-scoring']);
  const router = useRouter();
  const navigate = useNavigate();
  const updateScoringRulesetMutation = useUpdateScoringRulesetMutation();
  const dataModelQuery = useDataModelQuery();
  const panelSharp = PanelSharpFactory.useSharp();
  const form = useForm({
    defaultValues: {
      name: '',
      recordType: '',
      thresholds: Array.from({ length: maxRiskLevel - 1 }, (_, i) => (i + 1) * 10) as number[],
      rules: [],
      cooldownSeconds: 90 * SECONDS_PER_UNIT.days,
      scoringIntervalSeconds: 180 * SECONDS_PER_UNIT.days,
    } as UpdateScoringRulesetPayload,
    validators: {
      onSubmit: updateScoringRulesetPayloadSchema,
      onChange: updateScoringRulesetPayloadSchema,
      onMount: updateScoringRulesetPayloadSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      if (formApi.state.isValid) {
        try {
          let ruleset = await updateScoringRulesetMutation.mutateAsync(value);

          toast.success(t('common:success.save'));

          panelSharp.actions.close();
          await router.invalidate();

          if (ruleset) {
            navigate({
              to: '/user-scoring/$recordType/$version',
              params: {
                recordType: ruleset.recordType,
                version: 'draft',
              },
            });
          }
        } catch {
          toast.error(t('common:errors.unknown'));
        }
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
              <span className="text-small">{t('user-scoring:section.create_panel.lower_score_duration')}</span>
              <form.Field name="cooldownSeconds">
                {(field) => <DurationDaysField value={field.state.value} onChange={field.handleChange} />}
              </form.Field>
              <Tooltip.Default content={t('user-scoring:section.create_panel.lower_score_duration_tooltip')}>
                <Icon icon="helpcenter" className="size-5 text-grey-secondary" />
              </Tooltip.Default>
            </div>
            <div className="grid grid-cols-subgrid col-span-full items-center">
              <span className="text-small">{t('user-scoring:section.create_panel.recalculation_duration')}</span>
              <form.Field name="scoringIntervalSeconds">
                {(field) => <DurationDaysField value={field.state.value} onChange={field.handleChange} />}
              </form.Field>
              <Tooltip.Default content={t('user-scoring:section.create_panel.recalculation_duration_tooltip')}>
                <Icon icon="helpcenter" className="size-5 text-grey-secondary" />
              </Tooltip.Default>
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

import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { useListScoringRulesetsQuery } from '@app-builder/queries/scoring/list-rulesets';
import {
  type UpdateScoringRulesetPayload,
  updateScoringRulesetPayloadSchema,
  useUpdateScoringRulesetMutation,
} from '@app-builder/queries/scoring/update-ruleset';
import { handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { createSimpleContext } from '@marble/shared';
import { NavLink, Outlet, useMatches } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, SelectOption, SelectV2, Tabs, tabClassName } from 'ui-design-system';
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
    (m) => (m.handle as { showCreateRulesetButton?: boolean })?.showCreateRulesetButton,
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
              <NavLink to={getRoute('/user-scoring/overview')} className={tabClassName}>
                {t('user-scoring:section.tab_overview')}
              </NavLink>
              {isPending ? (
                <div className="h-full flex items-center px-v2-sm">
                  <Spinner className="size-4" />
                </div>
              ) : (
                rulesets.map((ruleset) => (
                  <NavLink
                    key={ruleset.id}
                    to={getRoute('/user-scoring/:recordType/:version', {
                      recordType: ruleset.recordType,
                      version: ruleset.status === 'draft' ? 'draft' : ruleset.version.toString(),
                    })}
                    className={tabClassName}
                  >
                    {ruleset.name}
                  </NavLink>
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
    } as UpdateScoringRulesetPayload,
    validators: {
      onSubmit: updateScoringRulesetPayloadSchema,
      onChange: updateScoringRulesetPayloadSchema,
      onMount: updateScoringRulesetPayloadSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      if (formApi.state.isValid) {
        await updateScoringRulesetMutation.mutateAsync(value).then((res) => {
          if (res.success) {
            panelSharp.actions.close();
          }
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
              <Input className="max-w-15" />
              <SelectV2
                placeholder={t('user-scoring:section.create_panel.unit_placeholder')}
                options={[]}
                value={undefined}
                onChange={() => undefined}
              />
              <Icon icon="helpcenter" className="size-5 text-grey-secondary" />
            </div>
            <div className="grid grid-cols-subgrid col-span-full items-center">
              <span className="text-small">{t('user-scoring:section.create_panel.lower_score_duration')}</span>
              <Input className="max-w-15" />
              <SelectV2
                placeholder={t('user-scoring:section.create_panel.unit_placeholder')}
                options={[]}
                value={undefined}
                onChange={() => undefined}
              />
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

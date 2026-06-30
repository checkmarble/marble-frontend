import { casesI18n } from '@app-builder/components/Cases';
import { AddRuleSnooze } from '@app-builder/components/Cases/AddRuleSnooze';
import { Nudge } from '@app-builder/components/Nudge';
import { Panel } from '@app-builder/components/Panel';
import { RuleGroup } from '@app-builder/components/Scenario/Rules/RuleGroup';
import { ScoreModifier } from '@app-builder/components/Scenario/Rules/ScoreModifier';
import { DataModel } from '@app-builder/models';
import { CaseDetail, type PivotObject } from '@app-builder/models/cases';
import { isRuleExecutionHit } from '@app-builder/models/decision';
import { FeatureAccesses } from '@app-builder/models/feature-access';
import { useRulesByPivotQuery } from '@app-builder/queries/cases/rules-by-pivot';
import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { useFormatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { Dict } from '@swan-io/boxed';
import { formatRelative } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Tabs, tabClassName } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { PivotObjectDetails } from '../../CaseManager/PivotsPanel/PivotsPanelContent';

const findDataFromPivotValue = (pivots: PivotObject[], pivotValue: string) => {
  return pivots.find((p) => p.pivotValue === pivotValue);
};

type CaseSnoozePanelProps = {
  onClose: () => void;
  caseDetail: CaseDetail;
  dataModel: DataModel;
  pivotObjects: PivotObject[];
  entitlements: FeatureAccesses;
};

export function CaseSnoozePanel({ onClose, caseDetail, dataModel, pivotObjects, entitlements }: CaseSnoozePanelProps) {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();
  const rulesByPivotQuery = useRulesByPivotQuery(caseDetail.id);

  const pivotKeys = rulesByPivotQuery.data ? Object.keys(rulesByPivotQuery.data.rulesByPivot) : [];
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const effectiveActiveTab = activeTab ?? pivotKeys[0] ?? null;

  if (rulesByPivotQuery.isPending) {
    return <div>Loading...</div>;
  }
  if (rulesByPivotQuery.isError) {
    return <div>Error</div>;
  }

  const rulesByPivot = rulesByPivotQuery.data.rulesByPivot;

  return (
    <>
      <Panel.Header>Rules</Panel.Header>
      <div className="flex w-full flex-col gap-lg px-sm">
        {pivotKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-md py-xl text-center">
            <Icon icon="inbox" className="size-8 text-grey-secondary" />
            <p className="text-sm text-grey-secondary">{t('cases:case_detail.rules.no_rules')}</p>
          </div>
        ) : (
          <div className="flex w-full flex-col">
            <Tabs>
              {pivotKeys.map((pivotValue) => {
                return (
                  <button
                    key={`trigger-${pivotValue}`}
                    type="button"
                    className={cn(tabClassName, 'gap-sm')}
                    data-status={effectiveActiveTab === pivotValue ? 'active' : undefined}
                    onClick={() => setActiveTab(pivotValue)}
                  >
                    <span className="font-medium">{pivotValue}</span>
                  </button>
                );
              })}
            </Tabs>
            {Dict.entries(rulesByPivot).map(([pivotValue, rules]) => {
              if (effectiveActiveTab !== pivotValue) return null;
              const client = findDataFromPivotValue(pivotObjects, pivotValue);
              const table = dataModel.find((t) => t.name === client?.pivotObjectName);

              return (
                <div className="mt-lg flex w-full flex-col items-start gap-lg" key={`content-${pivotValue}`}>
                  {table && client ? (
                    <div className="border-grey-border flex flex-col gap-md border p-md bg-grey-background-light rounded-lg">
                      <div className="capitalize font-semibold">{table.name}</div>
                      <PivotObjectDetails tableModel={table} dataModel={dataModel} pivotObject={client} />
                    </div>
                  ) : null}
                  <div className="border-grey-border bg-surface-card relative w-full rounded-lg border">
                    <div className="text-2xs text-grey-secondary relative grid grid-cols-[150px_120px_1fr_1fr_0.5fr_0.5fr_150px] font-normal">
                      <span className="inline-flex items-center gap-sm p-sm">
                        <span>{t('cases:decisions.rule.snooze')}</span>
                        {entitlements.ruleSnoozes !== 'allowed' ? (
                          <Nudge
                            className="size-4"
                            iconClass="size-2.5"
                            kind={entitlements.ruleSnoozes}
                            link="https://docs.checkmarble.com/docs/rule-snoozes"
                            content={
                              entitlements.ruleSnoozes === 'missing_configuration'
                                ? t('common:missing_configuration')
                                : t('cases:case_detail.add_rule_snooze.nudge')
                            }
                          />
                        ) : null}
                      </span>
                      <span className="p-sm">{t('cases:decisions.rule.last_hit_timestamp')}</span>
                      <span className="p-sm">{t('cases:decisions.rule.name_and_score')}</span>
                      <span className="p-sm">{t('cases:decisions.rule.description')}</span>
                      <span className="p-sm">{t('cases:decisions.rule.rule_group')}</span>
                      <span className="p-sm">{t('cases:decisions.rule.snooze_until')}</span>
                    </div>
                    {rules.map((r) => {
                      const formattedHitAt = (
                        <span className={cn('text-grey-secondary text-xs', { 'opacity-30': r.isSnoozed })}>
                          {formatDateTime(r.hitAt, { dateStyle: 'short' })}
                        </span>
                      );

                      return (
                        <div
                          key={r.ruleId}
                          className="border-grey-border hover:bg-purple-background-light grid grid-cols-[150px_120px_1fr_1fr_0.5fr_0.5fr_150px] items-center border-t transition-colors"
                        >
                          <div className="flex min-h-full items-center justify-center p-sm">
                            <AddRuleSnooze decisionId={r.decisionId} ruleId={r.ruleId}>
                              <Button
                                variant="secondary"
                                size="small"
                                className={cn({ 'bg-purple-background': r.isSnoozed })}
                                disabled={
                                  r.isSnoozed ||
                                  (entitlements.ruleSnoozes !== 'allowed' && entitlements.ruleSnoozes !== 'test')
                                }
                              >
                                <Icon icon={r.isSnoozed ? 'snooze-on' : 'snooze'} className="size-4" aria-hidden />
                                <span className="text-xs font-medium">{t('cases:decisions.rule.snooze')}</span>
                              </Button>
                            </AddRuleSnooze>
                          </div>
                          <div className="border-grey-border flex min-h-full items-center justify-center border-x p-sm">
                            {formattedHitAt}
                          </div>
                          <div className="border-grey-border flex min-h-full items-center justify-between border-r p-sm">
                            <span
                              className={cn('text-grey-primary text-xs font-normal', {
                                'opacity-30': r.isSnoozed,
                              })}
                            >
                              {r.name}
                            </span>
                            <ScoreModifier
                              score={isRuleExecutionHit(r) ? r.scoreModifier : 0}
                              className={cn({ 'opacity-30': r.isSnoozed })}
                            />
                          </div>
                          <div className="border-grey-border flex min-h-full items-center border-r p-sm">
                            <span className={cn('text-xs', { 'opacity-30': r.isSnoozed })}>{r.description}</span>
                          </div>
                          <div className="border-grey-border flex min-h-full items-center border-r p-sm">
                            {r.ruleGroup ? (
                              <RuleGroup className={cn({ 'opacity-30': r.isSnoozed })} ruleGroup={r.ruleGroup} />
                            ) : null}
                          </div>
                          <div className="flex min-h-full items-center p-sm">
                            {r.isSnoozed && r.end ? (
                              <span className="opacity-30">
                                {formatRelative(r.end, new Date(), {
                                  locale: getDateFnsLocale(language),
                                })}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

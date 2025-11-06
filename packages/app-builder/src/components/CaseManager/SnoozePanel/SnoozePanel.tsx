import { casesI18n } from '@app-builder/components/Cases';
import { AddRuleSnooze } from '@app-builder/components/Cases/AddRuleSnooze';
import { Nudge } from '@app-builder/components/Nudge';
import { RuleGroup } from '@app-builder/components/Scenario/Rules/RuleGroup';
import { ScoreModifier } from '@app-builder/components/Scenario/Rules/ScoreModifier';
import { type PivotObject } from '@app-builder/models/cases';
import { isRuleExecutionHit } from '@app-builder/models/decision';
import { useRulesByPivotQuery } from '@app-builder/queries/cases/rules-by-pivot';
import { type loader } from '@app-builder/routes/_builder+/cases+/$caseId+/_index';
import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { useLoaderData } from '@remix-run/react';
import { Dict } from '@swan-io/boxed';
import { formatRelative } from 'date-fns';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Tabs, TabsContent, TabsList, TabsTrigger } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { DrawerContext } from '../Drawer/Drawer';
import { PivotObjectDetails } from '../PivotsPanel/PivotsPanelContent';

const findDataFromPivotValue = (pivots: PivotObject[], pivotValue: string) => {
  return pivots.find((p) => p.pivotValue === pivotValue);
};

export const SnoozePanel = ({
  setDrawerContentMode,
}: {
  setDrawerContentMode: (mode: 'pivot' | 'decision' | 'snooze') => void;
}) => {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const { case: caseDetail, dataModelWithTableOptions, pivotObjects, entitlements } = useLoaderData<typeof loader>();
  const { setExpanded } = DrawerContext.useValue();
  const rulesByPivotQuery = useRulesByPivotQuery(caseDetail.id);

  useEffect(() => {
    setExpanded(true);
  }, [setExpanded]);

  if (rulesByPivotQuery.isPending) {
    return <div>Loading...</div>;
  }
  if (rulesByPivotQuery.isError) {
    return <div>Error</div>;
  }

  const rulesByPivot = rulesByPivotQuery.data.rulesByPivot;

  return (
    <div className="flex flex-col gap-6 p-4">
      <Button
        variant="secondary"
        size="small"
        onClick={() => {
          setExpanded(false);
          setDrawerContentMode('pivot');
        }}
      >
        <Icon icon="left-panel-close" className="size-5" />
      </Button>

      <div className="flex w-full flex-col gap-6 px-2">
        <span className="text-l font-semibold">Rules</span>
        <Tabs className="flex w-full flex-col" defaultValue={Object.keys(rulesByPivot)[0]}>
          <TabsList className="mb-6 w-fit">
            {Object.keys(rulesByPivot).map((pivotValue) => {
              return (
                <TabsTrigger key={`trigger-${pivotValue}`} value={pivotValue} className="gap-2">
                  <span className="font-medium">{pivotValue}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {Dict.entries(rulesByPivot).map(([pivotValue, rules]) => {
            const client = findDataFromPivotValue(pivotObjects ?? [], pivotValue);
            const table = dataModelWithTableOptions.find((t) => t.name === client?.pivotObjectName);

            return (
              <TabsContent
                className="flex w-full flex-col items-start gap-6"
                key={`content-${pivotValue}`}
                value={pivotValue}
              >
                {table && client ? (
                  <div className="border-grey-90 flex flex-col gap-v2-md border p-v2-md bg-grey-background-light rounded-v2-lg">
                    <div className="capitalize font-semibold">{table.name}</div>
                    <PivotObjectDetails tableModel={table} dataModel={dataModelWithTableOptions} pivotObject={client} />
                  </div>
                ) : null}
                <div className="border-grey-90 bg-grey-100 relative w-full rounded-lg border">
                  <div className="text-2xs text-grey-50 relative grid grid-cols-[150px_120px_1fr_1fr_0.5fr_0.5fr_150px] font-normal">
                    <span className="inline-flex items-center gap-2 p-2">
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
                    <span className="p-2">{t('cases:decisions.rule.last_hit_timestamp')}</span>
                    <span className="p-2">{t('cases:decisions.rule.name_and_score')}</span>
                    <span className="p-2">{t('cases:decisions.rule.description')}</span>
                    <span className="p-2">{t('cases:decisions.rule.rule_group')}</span>
                    <span className="p-2">{t('cases:decisions.rule.snooze_until')}</span>
                  </div>
                  {rules.map((r) => {
                    const formattedHitAt = (
                      <span className={cn('text-grey-50 text-xs', { 'opacity-30': r.isSnoozed })}>
                        {formatDateTimeWithoutPresets(r.hitAt, {
                          language,
                          dateStyle: 'short',
                        })}
                      </span>
                    );

                    return (
                      <div
                        key={r.ruleId}
                        className="border-grey-90 hover:bg-purple-98 grid grid-cols-[150px_120px_1fr_1fr_0.5fr_0.5fr_150px] items-center border-t transition-colors"
                      >
                        <div className="flex min-h-full items-center justify-center p-2">
                          <AddRuleSnooze decisionId={r.decisionId} ruleId={r.ruleId}>
                            <Button
                              variant="secondary"
                              size="small"
                              className={cn({ 'bg-purple-96': r.isSnoozed })}
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
                        <div className="border-grey-90 flex min-h-full items-center justify-center border-x p-2">
                          {formattedHitAt}
                        </div>
                        <div className="border-grey-90 flex min-h-full items-center justify-between border-r p-2">
                          <span
                            className={cn('text-grey-00 text-xs font-normal', {
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
                        <div className="border-grey-90 flex min-h-full items-center border-r p-2">
                          <span className={cn('text-xs', { 'opacity-30': r.isSnoozed })}>{r.description}</span>
                        </div>
                        <div className="border-grey-90 flex min-h-full items-center border-r p-2">
                          {r.ruleGroup ? (
                            <RuleGroup className={cn({ 'opacity-30': r.isSnoozed })} ruleGroup={r.ruleGroup} />
                          ) : null}
                        </div>
                        <div className="flex min-h-full items-center p-2">
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
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};

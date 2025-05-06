import { casesI18n } from '@app-builder/components/Cases';
import { ClientObjectDataList } from '@app-builder/components/DataModelExplorer/ClientObjectDataList';
import { OutcomeBadge } from '@app-builder/components/Decisions';
import { RuleGroup } from '@app-builder/components/Scenario/Rules/RuleGroup';
import { ScoreModifier } from '@app-builder/components/Scenario/Rules/ScoreModifier';
import { type loader } from '@app-builder/routes/_builder+/cases+/$caseId+/_index';
import { AddRuleSnooze } from '@app-builder/routes/ressources+/cases+/add-rule-snooze';
import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { Await, useLoaderData } from '@remix-run/react';
import { Dict } from '@swan-io/boxed';
import { formatRelative } from 'date-fns';
import { capitalize } from 'radash';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Tabs, TabsContent, TabsList, TabsTrigger, TooltipV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { DrawerContext } from '../Drawer/Drawer';

export const SnoozePanel = ({
  setDrawerContentMode,
}: {
  setDrawerContentMode: (mode: 'pivot' | 'decision' | 'snooze') => void;
}) => {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const { rulesByPivotPromise, dataModelWithTableOptions, pivotObjects } =
    useLoaderData<typeof loader>();
  const { setExpanded } = DrawerContext.useValue();

  if (!pivotObjects?.[0]) throw new Error('no pivot object');

  console.log('Pivot Objects', pivotObjects);
  console.log('DataModel', dataModelWithTableOptions);

  const currentTable = dataModelWithTableOptions.find(
    (t) => t.name === pivotObjects[0]!.pivotObjectName,
  );

  console.log('Current Table', currentTable);

  useEffect(() => {
    setExpanded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={rulesByPivotPromise}>
          {(rulesByPivot) => (
            <div className="flex flex-col gap-6 px-2">
              <span className="text-l font-semibold">Rules</span>
              <Tabs className="flex flex-col gap-6" value={Object.keys(rulesByPivot)[0]}>
                <TabsList className="w-fit">
                  {Object.keys(rulesByPivot).map((id) => (
                    <TabsTrigger key={`trigger-${id}`} value={id} className="gap-2">
                      <span>{currentTable ? capitalize(currentTable.name) : 'Client'}</span>
                      <span>
                        {'name' in pivotObjects[0]!.pivotObjectData.data
                          ? (pivotObjects[0]!.pivotObjectData.data['name'] as string)
                          : id}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Dict.entries(rulesByPivot).map(([id, rules]) => (
                  <TabsContent
                    className="flex flex-col items-start gap-6"
                    key={`content-${id}`}
                    value={id}
                  >
                    {currentTable ? (
                      <ClientObjectDataList
                        className="bg-grey-98 border-grey-95 rounded border p-2"
                        tableModel={currentTable}
                        data={pivotObjects[0]!.pivotObjectData.data}
                      />
                    ) : null}
                    <div className="border-grey-90 bg-grey-100 rounded-lg border">
                      <div className="text-2xs text-grey-50 grid grid-cols-[110px_90px_1fr_1fr_176px_176px] font-normal">
                        <span className="p-2">{t('cases:snooze.title')}</span>
                        <span className="p-2">Hit date</span>
                        <span className="p-2">Name and Score Modifier</span>
                        <span className="p-2">Description</span>
                        <span className="p-2">Rule Group</span>
                        <span className="p-2">Outcome</span>
                      </div>
                      {rules.map((r) => {
                        const formattedHitAt = (
                          <span
                            className={cn('text-grey-50 text-xs', { 'opacity-30': r.isSnoozed })}
                          >
                            {formatDateTime(r.hitAt, { language, timeStyle: undefined })}
                          </span>
                        );

                        return (
                          <div
                            key={r.ruleId}
                            className="border-grey-90 hover:bg-purple-98 grid grid-cols-[110px_90px_1fr_1fr_176px_176px] items-center border-t transition-colors"
                          >
                            <div className="flex min-h-full justify-center p-2">
                              <AddRuleSnooze decisionId={r.decisionId} ruleId={r.ruleId}>
                                <Button
                                  variant="secondary"
                                  size="small"
                                  className={cn({ 'bg-purple-96': r.isSnoozed })}
                                  disabled={r.isSnoozed}
                                >
                                  <Icon
                                    icon={r.isSnoozed ? 'snooze-on' : 'snooze'}
                                    className="size-4"
                                    aria-hidden
                                  />
                                  <span className="text-xs font-medium">
                                    {t('cases:snooze.title')}
                                  </span>
                                </Button>
                              </AddRuleSnooze>
                            </div>
                            <div className="border-grey-90 flex min-h-full items-center justify-center border-x p-2">
                              {r.isSnoozed ? (
                                <TooltipV2.Provider>
                                  <TooltipV2.Tooltip>
                                    <TooltipV2.TooltipTrigger>
                                      {formattedHitAt}
                                    </TooltipV2.TooltipTrigger>
                                    <TooltipV2.TooltipContent>
                                      <span className="text-2xs inline-flex items-center gap-1">
                                        <span>Snooze until</span>
                                        <span>
                                          {formatRelative(r.hitAt, new Date(), {
                                            locale: getDateFnsLocale(language),
                                          })}
                                        </span>
                                      </span>
                                    </TooltipV2.TooltipContent>
                                  </TooltipV2.Tooltip>
                                </TooltipV2.Provider>
                              ) : (
                                formattedHitAt
                              )}
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
                                score={r.scoreModifier}
                                className={cn({ 'opacity-30': r.isSnoozed })}
                              />
                            </div>
                            <div className="border-grey-90 flex min-h-full items-center border-r p-2">
                              <span className={cn('text-xs', { 'opacity-30': r.isSnoozed })}>
                                {r.description}
                              </span>
                            </div>
                            <div className="border-grey-90 flex min-h-full items-center border-r p-2">
                              {r.ruleGroup ? (
                                <RuleGroup
                                  className={cn({ 'opacity-30': r.isSnoozed })}
                                  ruleGroup={r.ruleGroup}
                                />
                              ) : null}
                            </div>
                            <div className="flex min-h-full items-center p-2">
                              <OutcomeBadge
                                className={cn({ 'opacity-30': r.isSnoozed })}
                                outcome={r.outcome}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </Await>
      </Suspense>
    </div>
  );
};

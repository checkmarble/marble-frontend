import { casesI18n } from '@app-builder/components/Cases';
import { type loader } from '@app-builder/routes/_builder+/cases+/$caseId+/_index';
import { AddRuleSnooze } from '@app-builder/routes/ressources+/cases+/add-rule-snooze';
import { Await, useLoaderData } from '@remix-run/react';
import { Dict } from '@swan-io/boxed';
import { isAfter } from 'date-fns';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, cn, Tabs, TabsContent, TabsList, TabsTrigger } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { CaseManagerDrawerButtons, DrawerContext } from '../Drawer/Drawer';

export const SnoozePanel = ({
  setDrawerContentMode,
}: {
  setDrawerContentMode: (mode: 'pivot' | 'decision' | 'snooze') => void;
}) => {
  const { t } = useTranslation(casesI18n);
  const { rulesByPivotPromise } = useLoaderData<typeof loader>();
  const { setExpanded } = DrawerContext.useValue();

  useEffect(() => {
    setExpanded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col pl-4">
      <div className="sticky top-0 z-10 flex items-center">
        <Button
          variant="secondary"
          size="small"
          onClick={() => {
            setExpanded(false);
            setDrawerContentMode('pivot');
          }}
        >
          <Icon icon="left-panel-close" className="size-4" />
        </Button>
        <CaseManagerDrawerButtons expandable={false} />
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={rulesByPivotPromise}>
          {(rulesByPivot) => (
            <div className="flex flex-col gap-6 pr-2">
              <span className="text-l font-semibold">Rules</span>
              <Tabs className="flex flex-col gap-6" value={Object.keys(rulesByPivot)[0]}>
                <TabsList className="w-fit">
                  {Object.keys(rulesByPivot).map((id) => (
                    <TabsTrigger key={id} value={id}>{`Client ${id}`}</TabsTrigger>
                  ))}
                </TabsList>
                {Dict.entries(rulesByPivot).map(([id, rules]) => (
                  <TabsContent
                    key={id}
                    value={id}
                    className="border-grey-90 bg-grey-100 rounded-lg border"
                  >
                    <div className="text-2xs text-grey-50 grid grid-cols-[fit-content(89px)_1fr_1fr_176px_176px] font-normal">
                      <span className="p-2">Snooze</span>
                      <span className="p-2">Name and Score Modifier</span>
                      <span className="p-2">Description</span>
                      <span className="p-2">Rule Group</span>
                      <span className="p-2">Outcome</span>
                    </div>
                    {rules.map((r) => {
                      const isSnoozed = isAfter(new Date(r.end), new Date());

                      return (
                        <div
                          key={r.ruleId}
                          className="border-grey-90 grid grid-cols-[fit-content(89px)_1fr_1fr_176px_176px] items-center border-t"
                        >
                          <div className="min-h-full p-2">
                            <AddRuleSnooze decisionId={r.decisionId} ruleId={r.ruleId}>
                              <Button
                                variant="secondary"
                                size="small"
                                className={cn({
                                  'bg-purple-96': isSnoozed,
                                })}
                              >
                                <Icon
                                  icon={isSnoozed ? 'snooze-on' : 'snooze'}
                                  className="size-5"
                                  aria-hidden
                                />
                                {t('cases:snooze.title')}
                              </Button>
                            </AddRuleSnooze>
                          </div>
                          <div
                            className={cn(
                              'border-grey-90 flex min-h-full items-center justify-between border-x p-2',
                              { 'opacity-50': isSnoozed },
                            )}
                          >
                            <span className="text-xs font-normal">{r.name}</span>
                            <span className="bg-purple-96 text-purple-65 rounded-full px-2 py-[3px] text-xs font-normal">
                              +{r.scoreModifier}
                            </span>
                          </div>
                          <div
                            className={cn(
                              'border-grey-90 flex min-h-full items-center border-r p-2',
                              { 'opacity-50': isSnoozed },
                            )}
                          >
                            <span className="text-xs">{r.description}</span>
                          </div>
                          <div
                            className={cn(
                              'border-grey-90 flex min-h-full items-center border-r p-2',
                              { 'opacity-50': isSnoozed },
                            )}
                          >
                            <span className="text-xs">{r.ruleGroup}</span>
                          </div>
                          <div
                            className={cn('flex min-h-full items-center p-2', {
                              'opacity-50': isSnoozed,
                            })}
                          >
                            <div className="flex items-center gap-1">
                              <div
                                className={cn('size-4 rounded-full', {
                                  'bg-green-38': r.outcome === 'approve',
                                  'bg-red-47': r.outcome === 'decline',
                                  'border-red-47 border-2': r.outcome === 'review',
                                  'border-2 border-yellow-50': r.outcome === 'block_and_review',
                                  'bg-grey-50': r.outcome === 'unknown',
                                })}
                              />
                              <span className="text-xs font-medium">
                                {match(r.outcome)
                                  .with('approve', () => 'Manually approved')
                                  .with('decline', () => 'Manually declined')
                                  .with('block_and_review', () => 'Blocked and review')
                                  .with('review', () => 'Review')
                                  .with('unknown', () => 'Unknown')
                                  .exhaustive()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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

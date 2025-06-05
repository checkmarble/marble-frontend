import { type loader } from '@app-builder/routes/_builder+/cases+/$caseId+/_index';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { filter, map, pipe, take } from 'remeda';
import { Button, cn } from 'ui-design-system';

import { OutcomeBadge } from '../Decisions';
import { FormatData } from '../FormatData';
import { ScoreModifier } from '../Scenario/Rules/ScoreModifier';
import { casesI18n } from './cases-i18n';
import { RequiredActions } from './RequiredActions';

const MAX_ITEMS_DISPLAYED = 4;

export const CaseAlerts = ({
  selectDecision,
  setDrawerContentMode,
  drawerContentMode,
}: {
  selectDecision: (id: string) => void;
  setDrawerContentMode: (mode: 'pivot' | 'decision' | 'snooze') => void;
  drawerContentMode: 'pivot' | 'decision' | 'snooze';
}) => {
  const { t } = useTranslation(casesI18n);
  const {
    decisionsPromise,
    case: caseDetail,
    dataModelWithTableOptions,
  } = useLoaderData<typeof loader>();
  const language = useFormatLanguage();
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);

  return (
    <Suspense fallback={<div>...</div>}>
      <Await resolve={decisionsPromise}>
        {(decisions) =>
          decisions ? (
            <div className="border-grey-90 bg-grey-100 rounded-lg border">
              <div className="text-2xs text-grey-50 grid grid-cols-[82px_2fr_1.3fr_1fr] font-normal">
                <span className="p-2">{t('cases:decisions.date')}</span>
                <span className="p-2">{t('cases:decisions.alert')}</span>
                <span className="p-2">{t('cases:decisions.trigger_object')}</span>
                <span className="p-2">{t('cases:decisions.rule_hits')}</span>
              </div>
              {decisions.map((decision) => {
                const triggerObjectOptions = dataModelWithTableOptions.find(
                  ({ name }) => name === decision.triggerObjectType,
                );

                return (
                  <div
                    key={decision.id}
                    className={cn(
                      'border-grey-90 hover:bg-grey-98 group grid min-h-28 grid-cols-[82px_2fr_1.3fr_1fr] border-t transition-colors',
                      {
                        'bg-purple-98':
                          selectedDecision === decision.id && drawerContentMode === 'decision',
                      },
                    )}
                  >
                    <div className="flex min-h-full flex-col items-center p-2">
                      <span className="text-grey-50 text-xs font-normal">
                        {formatDateTimeWithoutPresets(decision.createdAt, {
                          language,
                          dateStyle: 'short',
                        })}
                      </span>
                    </div>
                    <div className="border-grey-90 flex min-h-full flex-col gap-2 border-x p-2">
                      <div className="relative flex items-center justify-between">
                        <div className="flex size-full items-center gap-2.5">
                          <OutcomeBadge
                            outcome={decision.outcome}
                            reviewStatus={decision.reviewStatus}
                            showBackground={false}
                          />
                          <span className="text-grey-50 text-ellipsis text-xs font-normal">
                            {decision.scenario.name}
                          </span>
                          <ScoreModifier score={decision.score} />
                        </div>
                        <Button
                          variant="secondary"
                          size="xs"
                          className="absolute right-0 top-0 hidden group-hover:flex"
                          onClick={() => {
                            selectDecision(decision.id);
                            setSelectedDecision(decision.id);
                            setDrawerContentMode('decision');
                          }}
                        >
                          {t('common:open')}
                        </Button>
                      </div>
                      <RequiredActions decision={decision} caseId={caseDetail.id} />
                    </div>
                    <div className="border-grey-90 flex h-full flex-col items-start gap-1 overflow-hidden border-r p-2">
                      {pipe(
                        triggerObjectOptions?.options.fieldOrder ?? [],
                        filter((id) =>
                          triggerObjectOptions?.options.displayedFields
                            ? triggerObjectOptions.options.displayedFields.includes(id)
                            : true,
                        ),
                        take(MAX_ITEMS_DISPLAYED),
                        map((id) => {
                          const property = triggerObjectOptions?.fields.find(
                            (f) => f.id === id,
                          )?.name;

                          return property ? (
                            <span
                              key={id}
                              className="border-grey-90 flex w-fit gap-1 truncate rounded-sm border px-1.5 py-0.5 text-xs"
                            >
                              <span>{property}:</span>
                              <FormatData
                                data={parseUnknownData(decision.triggerObject[property])}
                                language={language}
                              />
                            </span>
                          ) : null;
                        }),
                      )}
                    </div>
                    <div className="flex min-h-full flex-col items-start gap-1 truncate p-2">
                      {pipe(
                        decision.ruleExecutions,
                        filter((r) => r.outcome === 'hit'),
                        (arr) => {
                          if (arr.length > MAX_ITEMS_DISPLAYED) {
                            // We add a fake rule execution to display the number of remaining executions
                            const items = take(arr, MAX_ITEMS_DISPLAYED - 1);
                            items.push({
                              name: 'executions-remains',
                              scoreModifier: arr.length - items.length,
                              outcome: 'hit',
                              ruleId: '',
                            });
                            return items;
                          }
                          return take(arr, MAX_ITEMS_DISPLAYED);
                        },
                        map((r) => (
                          <span
                            key={r.name}
                            className="border-grey-90 flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs font-normal"
                          >
                            {r.name === 'executions-remains' ? (
                              <span>{t('common:more_remains', { count: r.scoreModifier })}</span>
                            ) : (
                              <>
                                <span>{r.scoreModifier > 0 ? '+' : '-'}</span>
                                <span>{Math.abs(r.scoreModifier)}</span>
                                <span>{r.name}</span>
                              </>
                            )}
                          </span>
                        )),
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null
        }
      </Await>
    </Suspense>
  );
};

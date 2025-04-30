import { type loader } from '@app-builder/routes/_builder+/cases+/$caseId+/_index';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { Await, useLoaderData } from '@remix-run/react';
import { Dict } from '@swan-io/boxed';
import { Suspense } from 'react';
import { match } from 'ts-pattern';
import { Button, cn } from 'ui-design-system';

import { FormatData } from '../FormatData';
import { RequiredActions } from './RequiredActions';

export const CaseAlerts = ({
  selectDecision,
  setDrawerContentMode,
}: {
  selectDecision: (id: string) => void;
  setDrawerContentMode: (mode: 'pivot' | 'decision' | 'snooze') => void;
}) => {
  const { decisionsPromise } = useLoaderData<typeof loader>();
  const language = useFormatLanguage();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={decisionsPromise}>
        {(decisions) => (
          <div className="border-grey-90 bg-grey-100 rounded-lg border">
            <div className="text-2xs text-grey-50 grid grid-cols-[82px_1fr_250px_175px] font-normal">
              <span className="p-2">Date</span>
              <span className="p-2">Alert</span>
              <span className="p-2">Trigger object</span>
              <span className="p-2">Rules hit</span>
            </div>
            {decisions.map((decision) => (
              <div
                key={decision.id}
                className="border-grey-90 hover:bg-grey-98 group grid min-h-24 grid-cols-[82px_1fr_250px_175px] border-t transition-colors"
              >
                <div className="flex min-h-full flex-col items-center p-2">
                  <span className="text-grey-50 text-xs font-normal">
                    {formatDateTime(decision.createdAt, { language, timeStyle: undefined })}
                  </span>
                </div>
                <div className="border-grey-90 flex min-h-full flex-col gap-2 border-x p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex size-full items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div
                          className={cn('size-4 rounded-full', {
                            'bg-green-38': decision.outcome === 'approve',
                            'bg-red-47': decision.outcome === 'decline',
                            'border-red-47 border-2': decision.outcome === 'review',
                            'border-2 border-yellow-50': decision.outcome === 'block_and_review',
                            'bg-grey-50': decision.outcome === 'unknown',
                          })}
                        />
                        <span className="text-xs font-medium">
                          {match(decision.outcome)
                            .with('approve', () => 'Manually approved')
                            .with('decline', () => 'Manually declined')
                            .with('block_and_review', () => 'Blocked and review')
                            .with('review', () => 'Review')
                            .with('unknown', () => 'Unknown')
                            .exhaustive()}
                        </span>
                      </div>
                      <span className="text-ellipsis text-xs font-normal">
                        {decision.scenario.name}
                      </span>
                      <span className="bg-purple-96 text-purple-65 rounded-full px-2 py-[3px] text-xs font-normal">
                        +{decision.score}
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="xs"
                      className="hidden group-hover:flex"
                      onClick={() => {
                        selectDecision(decision.id);
                        setDrawerContentMode('decision');
                      }}
                    >
                      Open
                    </Button>
                  </div>
                  <RequiredActions decision={decision} />
                </div>
                <div className="border-grey-90 flex h-0 min-h-full flex-col items-start gap-1 truncate border-r p-2">
                  {Dict.entries(decision.triggerObject).map(([key, value]) => {
                    if (['account_id', 'object_id', 'company_id'].includes(key)) return null;

                    return (
                      <span
                        key={key}
                        className="border-grey-90 flex gap-1 rounded-sm border px-1.5 py-0.5 text-xs"
                      >
                        <span>{key}:</span>
                        <FormatData data={parseUnknownData(value)} language={language} />
                      </span>
                    );
                  })}
                </div>
                <div className="flex min-h-full flex-col items-start gap-1 truncate p-2">
                  {decision.ruleExecutions
                    .filter((r) => r.outcome === 'hit')
                    .map((r) => (
                      <span
                        key={r.name}
                        className="border-grey-90 flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs font-normal"
                      >
                        <span>{r.scoreModifier > 0 ? '+' : '-'}</span>
                        <span>{r.scoreModifier}</span>
                        <span>{r.name}</span>
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Await>
    </Suspense>
  );
};

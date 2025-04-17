import { type Decision } from '@app-builder/models/decision';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { match } from 'ts-pattern';
import { cn } from 'ui-design-system';

import { FormatData } from '../FormatData';

export const CaseAlerts = ({ decisions }: { decisions: Decision[] }) => {
  const language = useFormatLanguage();

  return (
    <div className="border-grey-90 bg-grey-100 rounded-lg border">
      <table className="size-full">
        <thead>
          <tr className="text-2xs text-grey-50 text-left">
            <th className="p-2 font-normal">Date</th>
            <th className="p-2 font-normal">Alert</th>
            <th className="p-2 font-normal">Trigger object</th>
            <th className="p-2 font-normal">Rules hit</th>
          </tr>
        </thead>
        <tbody>
          {decisions.map((decision, index) => (
            <tr
              key={decision.id}
              className={cn('border-grey-90 hover:bg-grey-98 border-y transition-colors', {
                'border-b-0': index === decisions.length - 1,
              })}
            >
              <td className="text-grey-50 w-20 p-2 text-center align-top text-xs font-normal">
                {formatDateTime(decision.createdAt, { language, timeStyle: undefined })}
              </td>
              <td className="border-grey-90 flex h-full items-start justify-between border-x p-2">
                <div className="flex items-center gap-2">
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
                <span className="bg-purple-96 text-purple-65 rounded-full px-2 py-[3px] text-xs font-normal">
                  +{decision.score}
                </span>
              </td>
              <td className="border-grey-90 min-w-44 max-w-56 border-r p-2">
                <div className="flex max-h-32 flex-wrap items-center gap-1 overflow-y-auto">
                  {Object.entries(decision.triggerObject).map(([key, value]) => {
                    if (['account_id', 'object_id', 'company_id'].includes(key)) return null;

                    return (
                      <span
                        key={key}
                        className="border-grey-90 inline-flex justify-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs font-normal"
                      >
                        <span>{key}:</span>
                        <FormatData data={parseUnknownData(value)} language={language} />
                      </span>
                    );
                  })}
                </div>
              </td>
              <td className="max-h-32 w-40 overflow-y-auto p-2">
                Here resides the rules hit
                {/* <div className="flex flex-col gap-1">
                  {decision.rules
                    .filter((r) => r.outcome === 'hit')
                    .map((r) => {
                      return (
                        <div key={r.name} className="flex items-center gap-1">
                          <span className="bg-purple-96 text-purple-65 rounded-full px-2 py-[3px] text-xs font-normal">
                            +{r.scoreModifier}
                          </span>
                          <span>{r.name}</span>
                        </div>
                      );
                    })}
                </div> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

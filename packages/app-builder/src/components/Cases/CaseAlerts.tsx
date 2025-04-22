import { type DecisionDetail as RawDecisionDetail } from '@app-builder/models/decision';
import { type RuleExecution } from '@app-builder/models/decision';
import { type SanctionCheck } from '@app-builder/models/sanction-check';
import { type ScenarioIterationRule } from '@app-builder/models/scenario-iteration-rule';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { Dict } from '@swan-io/boxed';
import { match } from 'ts-pattern';
import { Button, cn } from 'ui-design-system';

import { FormatData } from '../FormatData';

type DecisionDetail = {
  ruleExecutions: RuleExecution[];
  scenarioRules: ScenarioIterationRule[];
  sanctionChecks: SanctionCheck[];
} & Pick<RawDecisionDetail, 'id' | 'createdAt' | 'triggerObject' | 'score' | 'outcome'>;

export const CaseAlerts = ({ decisions }: { decisions: DecisionDetail[] }) => {
  const language = useFormatLanguage();

  return (
    <div className="border-grey-90 bg-grey-100 rounded-lg border">
      <table className="size-full table-fixed">
        <thead>
          <tr className="text-2xs text-grey-50 text-left">
            <th className="w-[82px] p-2 font-normal">Date</th>
            <th className="p-2 font-normal">Alert</th>
            <th className="w-[250px] p-2 font-normal">Trigger object</th>
            <th className="w-[175px] p-2 font-normal">Rules hit</th>
          </tr>
        </thead>
        <tbody>
          {decisions.map((decision, index) => (
            <tr
              key={decision.id}
              className={cn('border-grey-90 hover:bg-grey-98 max-h-32 border-y transition-colors', {
                'border-b-0': index === decisions.length - 1,
              })}
            >
              <td className="text-grey-50 p-2 text-center align-top text-xs font-normal">
                {formatDateTime(decision.createdAt, { language, timeStyle: undefined })}
              </td>
              <td className="border-grey-90 border-x p-2">
                <div className="flex size-full flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex size-full flex-row items-start gap-2">
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
                      <span className="">Scenario Name</span>
                    </div>
                    <span className="bg-purple-96 text-purple-65 rounded-full px-2 py-[3px] text-xs font-normal">
                      +{decision.score}
                    </span>
                  </div>
                  {decision.sanctionChecks.length > 0 ? (
                    <Button variant="primary" size="small">
                      Review pending sanction checks
                    </Button>
                  ) : null}
                </div>
              </td>
              <td className="border-grey-90 border-r p-2">
                <div className="flex size-full max-h-32 flex-col items-start gap-1 overflow-hidden text-nowrap">
                  {Dict.entries(decision.triggerObject).map(([key, value]) => {
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
              <td className="p-2">
                <div className="flex size-full max-h-32 flex-col items-start gap-1 overflow-hidden text-nowrap">
                  {decision.ruleExecutions
                    .filter((r) => r.outcome === 'hit')
                    .map((r) => (
                      <span
                        key={r.name}
                        className="border-grey-90 inline-flex items-center justify-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs font-normal"
                      >
                        <span className="text-xs font-normal">
                          {r.scoreModifier > 0 ? '+' : '-'}
                        </span>
                        <span className="text-xs font-normal">{r.scoreModifier}</span>
                        <span>{r.name}</span>
                      </span>
                    ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

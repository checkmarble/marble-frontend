import { DetailedCaseDecision } from '@app-builder/models/cases';
import { type ScreeningStatus } from '@app-builder/models/screening';
import { useCaseDecisionsQuery } from '@app-builder/queries/cases/list-decisions';
import { type loader } from '@app-builder/routes/_builder+/cases+/_detail+/s.$caseId';
import { ReviewDecisionModal } from '@app-builder/routes/ressources+/cases+/review-decision';
import { useFormatDateTime } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link, useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { filter, map, pipe, take } from 'remeda';
import { Button, CtaV2ClassName, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { OutcomeBadge } from '../Decisions';
import { FormatData } from '../FormatData';
import { casesI18n } from './cases-i18n';

const MAX_TRIGGER_FIELDS_DISPLAYED = 4;
const MAX_RULES_DISPLAYED = 3;

export const CaseAlerts = ({
  selectDecision,
  setDrawerContentMode,
  drawerContentMode,
}: {
  selectDecision: (decision: DetailedCaseDecision) => void;
  setDrawerContentMode: (mode: 'pivot' | 'decision' | 'snooze') => void;
  drawerContentMode: 'pivot' | 'decision' | 'snooze';
}) => {
  const { t } = useTranslation(casesI18n);
  const { case: caseDetail, dataModelWithTableOptions } = useLoaderData<typeof loader>();
  const formatDateTime = useFormatDateTime();
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const caseDecisionsQuery = useCaseDecisionsQuery(caseDetail.id);

  if (caseDecisionsQuery.isPending) {
    return <div>...</div>;
  }

  if (caseDecisionsQuery.isError) {
    return <div>Error</div>;
  }

  const decisions = caseDecisionsQuery.data.pages.flatMap((page) => page.decisions);

  return decisions ? (
    <>
      <div className="flex flex-col gap-2">
        {decisions.map((decision) => {
          const triggerObjectOptions = dataModelWithTableOptions.find(
            ({ name }) => name === decision.triggerObjectType,
          );

          const triggerObjectFields = pipe(
            triggerObjectOptions?.options.fieldOrder ?? [],
            filter((id) =>
              triggerObjectOptions?.options.displayedFields
                ? triggerObjectOptions.options.displayedFields.includes(id)
                : true,
            ),
            map((id) => {
              const field = triggerObjectOptions?.fields.find((f) => f.id === id);
              return field ? { id, name: field.name } : null;
            }),
            filter((f): f is { id: string; name: string } => f !== null),
          );

          const hitRules = pipe(
            decision.rules,
            filter((r) => r.outcome === 'hit'),
          );

          const isPendingReview = decision.outcome === 'block_and_review' && decision.reviewStatus === 'pending';
          const isActive = selectedDecision === decision.id && drawerContentMode === 'decision';

          return (
            <div
              key={decision.id}
              role="button"
              tabIndex={0}
              className={cn(
                'border-grey-border bg-surface-card grid cursor-pointer grid-cols-[80px_1fr] gap-2 rounded-lg border p-4 transition-colors',
                { 'bg-purple-background-light': isActive },
              )}
              onClick={() => {
                selectDecision(decision);
                setSelectedDecision(decision.id);
                setDrawerContentMode('decision');
              }}
            >
              {/* Left column: Date */}
              <div className="flex h-6 items-center">
                <span className="text-grey-secondary text-xs font-normal">
                  {formatDateTime(decision.createdAt, { dateStyle: 'short' })}
                </span>
              </div>

              {/* Right column: Vertical content */}
              <div className="flex flex-col gap-1">
                {/* Row 1: Header — outcome, scenario, score, actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <OutcomeBadge
                      outcome={decision.outcome}
                      reviewStatus={decision.reviewStatus}
                      showBackground={false}
                      className="gap-1 p-0"
                    />
                    <span className="truncate text-xs font-normal">{decision.scenario.name}</span>
                    <span className="border-grey-placeholder text-grey-placeholder inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-normal">
                      {decision.score >= 0 ? '+' : ''}
                      {decision.score}
                    </span>
                  </div>
                  {isPendingReview ? (
                    <ReviewDecisionModal decisionId={decision.id} screening={decision.screenings[0]}>
                      <Button variant="primary" size="small" onClick={(e) => e.stopPropagation()}>
                        {t('cases:decisions.approve_or_decline')}
                      </Button>
                    </ReviewDecisionModal>
                  ) : null}
                </div>

                {/* Row 2: Trigger objects */}
                {triggerObjectFields.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    <span className="text-grey-secondary shrink-0">{t('cases:decisions.trigger_objects')}</span>
                    {pipe(
                      triggerObjectFields,
                      take(MAX_TRIGGER_FIELDS_DISPLAYED),
                      map((field) => (
                        <span
                          key={field.id}
                          className="border-grey-border inline-flex items-center gap-1 truncate rounded-xs border px-1.5 py-0.5 text-xs"
                        >
                          <span className="font-medium">{field.name}:</span>
                          <FormatData data={parseUnknownData(decision.triggerObject[field.name])} />
                        </span>
                      )),
                    )}
                    {triggerObjectFields.length > MAX_TRIGGER_FIELDS_DISPLAYED ? (
                      <span className="border-grey-border rounded-xs border px-1.5 py-0.5 text-xs font-medium">
                        +{triggerObjectFields.length - MAX_TRIGGER_FIELDS_DISPLAYED}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {/* Row 3: Rules hit */}
                {hitRules.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    <span className="text-grey-secondary shrink-0">{t('cases:decisions.rule_hits')}</span>
                    {pipe(
                      hitRules,
                      take(MAX_RULES_DISPLAYED),
                      map((r) => (
                        <span
                          key={r.ruleId || r.name}
                          className="border-grey-border truncate rounded-xs border px-1.5 py-0.5 text-xs font-normal"
                        >
                          {r.scoreModifier > 0 ? '+' : ''}
                          {r.scoreModifier} {r.name}
                        </span>
                      )),
                    )}
                    {hitRules.length > MAX_RULES_DISPLAYED ? (
                      <span className="border-grey-border rounded-xs border px-1.5 py-0.5 text-xs font-medium">
                        +{hitRules.length - MAX_RULES_DISPLAYED}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {/* Row 4: Status on hits (screenings) */}
                {decision.screenings.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-grey-secondary text-xs">{t('cases:decisions.status_on_hits')}</span>
                    <div className="flex flex-col gap-2">
                      {decision.screenings.map((screening) => (
                        <div key={screening.id} className="flex items-center gap-2">
                          <span className="text-grey-placeholder list-disc text-xs font-medium">&bull;</span>
                          <span className="text-grey-placeholder text-xs font-medium">{screening.name}</span>
                          <Link
                            to={getRoute('/cases/:caseId/d/:decisionId/screenings/:screeningId', {
                              caseId: fromUUIDtoSUUID(caseDetail.id),
                              decisionId: fromUUIDtoSUUID(decision.id),
                              screeningId: fromUUIDtoSUUID(screening.id),
                            })}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ScreeningStatusBadge status={screening.status} count={screening.count} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {caseDecisionsQuery.hasNextPage ? (
        <Button variant="secondary" onClick={() => caseDecisionsQuery.fetchNextPage()}>
          {t('common:load_more_results')}
        </Button>
      ) : null}
    </>
  ) : null;
};

const screeningStatusConfig: Record<
  ScreeningStatus,
  { variant: 'warning' | 'success' | 'destructive' | 'secondary'; appearance?: 'stroked' }
> = {
  in_review: { variant: 'warning' },
  no_hit: { variant: 'success', appearance: 'stroked' },
  confirmed_hit: { variant: 'destructive', appearance: 'stroked' },
  error: { variant: 'secondary' },
};

function ScreeningStatusBadge({ status, count }: { status: ScreeningStatus; count: number }) {
  const { t } = useTranslation(casesI18n);
  const config = screeningStatusConfig[status];

  return (
    <span
      className={cn(
        CtaV2ClassName({ variant: config.variant, appearance: config.appearance, size: 'small' }),
        'shadow-sm',
      )}
    >
      {t(`screenings:status.${status}`)}
      {status === 'in_review' && count > 0 ? ` (${count})` : ''}
      <Icon icon="eye" className="size-4 shrink-0" />
    </span>
  );
}

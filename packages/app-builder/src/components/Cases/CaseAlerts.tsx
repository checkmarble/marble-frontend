import { type DetailedCaseDecision } from '@app-builder/models/cases';
import { DataModel, getTriggerObjectFields } from '@app-builder/models/data-model';
import { type ReviewStatus } from '@app-builder/models/decision';
import { type Outcome } from '@app-builder/models/outcome';
import { type ScreeningStatus } from '@app-builder/models/screening';
import { useScreeningDetailQuery } from '@app-builder/queries/screening/get-screening-detail';
import { useFormatDateTime } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { map, pipe, take } from 'remeda';
import { match } from 'ts-pattern';
import { Button, cn, ExpandableGroupTagLine, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { DecisionPanel } from '../CaseManager/DecisionPanel/DecisionPanel';
import { ReviewStatusTag } from '../Decisions/ReviewStatusTag';
import { FormatData } from '../FormatData';
import { PanelContainer, PanelRoot } from '../Panel';
import { ScreeningHitsPanel } from '../Screenings/ScreeningPanel/ScreeningHitsPanel';
import { Spinner } from '../Spinner';
import { casesI18n } from './cases-i18n';

const MAX_RULES_DISPLAYED = 3;

type CaseAlertsProps = {
  caseDecisionsQuery: UseInfiniteQueryResult<
    InfiniteData<
      {
        decisions: DetailedCaseDecision[];
        pagination: {
          hasMore: boolean;
          cursorId: string | null;
        };
      },
      unknown
    >,
    Error
  >;
  dataModel: DataModel;
};

export const CaseAlerts = ({ caseDecisionsQuery, dataModel }: CaseAlertsProps) => {
  const { t } = useTranslation(casesI18n);

  return match(caseDecisionsQuery)
    .with({ isPending: true }, () => (
      <div className="flex items-center justify-center p-md">
        <Spinner />
      </div>
    ))
    .with({ isError: true }, () => (
      <div className="text-grey-secondary p-md text-center text-xs">{t('common:global_error')}</div>
    ))
    .otherwise((query) => {
      const decisions = query.data.pages.flatMap((page) => page.decisions);

      return (
        <>
          <div className="flex flex-col gap-sm">
            {decisions.map((decision) => {
              const triggerObjectFields = getTriggerObjectFields(dataModel, decision.triggerObjectType);

              return (
                <AlertCard
                  key={decision.id}
                  dataModel={dataModel}
                  decision={decision}
                  triggerObjectFields={triggerObjectFields}
                />
              );
            })}
          </div>
          {query.hasNextPage ? (
            <Button variant="secondary" onClick={() => query.fetchNextPage()}>
              {t('common:load_more_results')}
            </Button>
          ) : null}
        </>
      );
    });
};

export const AlertCard = ({
  dataModel,
  decision,
  triggerObjectFields,
}: {
  dataModel: DataModel;
  decision: DetailedCaseDecision;
  triggerObjectFields: { id: string; name: string }[];
}) => {
  const { t } = useTranslation(casesI18n);
  const formatDateTime = useFormatDateTime();
  const [panelScreeningId, setPanelScreeningId] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState(false);

  // Defensive default: legacy cached decisions (pre-adapter) can be served by
  // TanStack Query with `screenings` missing, which would crash every .find()/
  // .map()/.length read below.
  const screenings = decision.screenings ?? [];
  const hitRules = decision.rules.filter((r) => r.outcome === 'hit');

  const openScreening = screenings.find((s) => s.id === panelScreeningId);
  const onSelect = () => {
    setOpenDetails(true);
  };

  return (
    <>
      <div
        tabIndex={0}
        role="button"
        className={cn(
          'border-grey-border bg-surface-card grid grid-cols-[80px_1fr] gap-sm rounded-lg border p-md transition-colors cursor-pointer hover:bg-purple-background-light',
          { 'bg-purple-background-light': openDetails },
        )}
        onClick={() => {
          onSelect();
        }}
      >
        {/* Left column: Date */}
        <div className="flex h-6 items-center">
          <span className="text-grey-secondary text-xs font-normal">
            {formatDateTime(decision.createdAt, { dateStyle: 'short' })}
          </span>
        </div>

        {/* Right column: Vertical content */}
        <div className="flex flex-col gap-xs">
          {/* Row 1: Header — outcome, scenario, score, actions */}
          <div className="flex items-center justify-between gap-sm">
            <div className="flex items-center gap-sm overflow-hidden">
              <AlertOutcomeIcon outcome={decision.outcome} reviewStatus={decision.reviewStatus} />
              <span className="truncate text-xs font-normal">{decision.scenario.name}</span>
              {decision.rules.length > 0 ? (
                <span className="border-grey-placeholder text-grey-placeholder inline-flex shrink-0 items-center gap-xs rounded-full border px-xs py-0.5 text-xs font-normal">
                  {decision.score >= 0 ? '+' : ''}
                  {decision.score}
                </span>
              ) : null}
            </div>
            <div className="flex gap-sm">
              {decision.reviewStatus === 'approve' ? <ReviewStatusTag reviewStatus={decision.reviewStatus} /> : null}
              <Button variant="secondary" size="small" appearance="stroked" mode="icon" onClick={onSelect}>
                <Icon icon="eye" className="size-4" />
              </Button>
            </div>
          </div>

          {/* Row 2: Trigger objects */}
          {triggerObjectFields.length > 0 ? (
            <TriggerFieldsRow fields={triggerObjectFields} triggerObject={decision.triggerObject} />
          ) : null}

          {/* Row 3: Rules hit */}
          {hitRules.length > 0 ? (
            <div className="flex flex-wrap items-center gap-xs text-xs">
              <span className="text-grey-secondary shrink-0">{t('cases:decisions.rule_hits')}</span>
              {pipe(
                hitRules,
                take(MAX_RULES_DISPLAYED),
                map((r) => (
                  <span
                    key={r.ruleId || r.name}
                    className="border-grey-border truncate rounded-sm border px-xs py-2xs text-xs font-normal"
                  >
                    {r.scoreModifier > 0 ? '+' : ''}
                    {r.scoreModifier} {r.name}
                  </span>
                )),
              )}
              {hitRules.length > MAX_RULES_DISPLAYED ? (
                <span className="border-grey-border rounded-sm border px-xs py-2xs text-xs font-medium">
                  +{hitRules.length - MAX_RULES_DISPLAYED}
                </span>
              ) : null}
            </div>
          ) : null}

          {/* Row 4: Status on hits (screenings) */}
          {screenings.length > 0 ? (
            <div className="flex flex-col gap-xs">
              <span className="text-grey-secondary text-xs">{t('cases:decisions.status_on_hits')}</span>
              <div className="flex flex-col gap-sm">
                {screenings.map((screening) => {
                  return (
                    <div key={screening.id} className="flex items-center gap-sm">
                      <span className="text-grey-placeholder text-xs font-medium">&bull;</span>
                      <span className="text-grey-placeholder text-xs font-medium">{screening.name}</span>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPanelScreeningId(screening.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            setPanelScreeningId(screening.id);
                          }
                        }}
                      >
                        <ScreeningStatusBadge
                          status={screening.status}
                          decisionId={decision.id}
                          screeningId={screening.id}
                          nbHits={screening.count}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {openDetails ? (
        <PanelRoot open onOpenChange={(isOpen) => setOpenDetails(isOpen)}>
          <PanelContainer size="xxl">
            <DecisionPanel
              dataModel={dataModel}
              decision={decision}
              onClose={() => setOpenDetails(false)}
              onScreeningSelect={setPanelScreeningId}
            />
          </PanelContainer>
        </PanelRoot>
      ) : null}
      {openScreening ? (
        <ScreeningHitsPanel
          open
          onOpenChange={(isOpen) => {
            if (!isOpen) setPanelScreeningId(null);
          }}
          decisionId={decision.id}
          screeningId={openScreening.id}
          screeningName={openScreening.name}
          screeningStatus={openScreening.status}
        />
      ) : null}
    </>
  );
};

/**
 * Renders trigger object fields responsively — shows as many fields as fit
 * on one line, with a "+N" badge for overflow. Uses ResizeObserver to
 * recalculate when the container width changes.
 */

const TriggerFieldsRow = ({
  fields,
  triggerObject,
}: {
  fields: { id: string; name: string }[];
  triggerObject: Record<string, unknown>;
}) => {
  const { t } = useTranslation(casesI18n);
  const renderField = (field: { id: string; name: string }, index: number) => (
    <span key={field.id} data-field-item className="inline-flex shrink-0 items-baseline gap-xs">
      {index > 0 ? <span className="text-grey-placeholder">&middot;</span> : null}
      <span className="font-medium">{field.name}:</span>
      <span className="max-w-[120px] truncate">
        <FormatData data={parseUnknownData(triggerObject[field.name])} />
      </span>
    </span>
  );

  return (
    <div className="relative text-xs">
      <div className="flex items-baseline gap-sm">
        <span className="text-grey-secondary shrink-0">{t('cases:decisions.trigger_objects')}</span>
        <ExpandableGroupTagLine
          items={fields.map(renderField)}
          moreButton={(overflow) => (
            <Tooltip.Default content={<div className="flex flex-wrap w-min text-xs">{fields.map(renderField)}</div>}>
              <span className="border-grey-border ms-xs inline-flex shrink-0 rounded-sm border px-xs py-2xs text-xs font-medium">
                +{overflow}
              </span>
            </Tooltip.Default>
          )}
          overflowTagWidth={40}
          classname="gap-xs"
        />
      </div>
    </div>
  );
};

export const AlertOutcomeIcon = ({
  outcome,
  reviewStatus,
  showLabel = true,
}: {
  outcome: Outcome;
  reviewStatus?: ReviewStatus | null;
  showLabel?: boolean;
}) => {
  const { t } = useTranslation(casesI18n);

  const icon = match(outcome)
    .with('approve', () => <Icon icon="accepted" className="size-4 text-green-primary" />)
    .with('decline', () => <Icon icon="denied" className="size-4 text-red-primary" />)
    .with('review', () => <div className="size-3.5 rounded-full border-2 border-yellow-primary" />)
    .with('unknown', () => <div className="border-grey-placeholder size-4 rounded-full border-2" />)
    .with('block_and_review', () =>
      match(reviewStatus)
        .with('approve', () => <Icon icon="manually_accepted" className="size-4 text-green-primary" />)
        .with('decline', () => <Icon icon="manually_denied" className="size-4 text-red-primary" />)
        .otherwise(() => <Icon icon="block_and_review" className="size-4 text-orange-primary" />),
    )
    .exhaustive();

  const label = match(outcome)
    .with('approve', () => t('decisions:outcome.tag.approved.label'))
    .with('decline', () => t('decisions:outcome.tag.declined.label'))
    .with('review', () => t('decisions:outcome.tag.review.label'))
    .with('unknown', () => t('decisions:outcome.tag.unknown.label'))
    .with('block_and_review', () =>
      match(reviewStatus)
        .with('approve', () => t('decisions:outcome.tag.manually_approved.label'))
        .with('decline', () => t('decisions:outcome.tag.manually_declined.label'))
        .otherwise(() => t('decisions:outcome.block_and_review')),
    )
    .exhaustive();

  return (
    <span className="inline-flex shrink-0 items-center gap-xs">
      {icon}
      {showLabel ? <span className="text-xs font-medium">{label}</span> : null}
    </span>
  );
};

const screeningButtonStatusConfig: Record<'in_review' | 'error', { variant: 'primary' | 'secondary' }> = {
  in_review: { variant: 'primary' },
  error: { variant: 'secondary' },
};

const screeningLabelColors: Record<'confirmed_hit' | 'no_hit', string> = {
  confirmed_hit: 'text-red-primary',
  no_hit: 'text-green-primary',
};

export const ScreeningStatusBadge = ({
  status,
  decisionId,
  screeningId,
  nbHits,
}: {
  status: ScreeningStatus;
  decisionId: string;
  screeningId: string;
  nbHits: number;
}) => {
  const { t } = useTranslation(casesI18n);
  const screeningQuery = useScreeningDetailQuery(decisionId, screeningId, true);

  // confirmed_hit and no_hit render as borderless inline labels with eye icon
  if (status === 'confirmed_hit' || status === 'no_hit') {
    return (
      <span className={cn('inline-flex items-center gap-xs text-xs font-medium', screeningLabelColors[status])}>
        {t(`screenings:status.${status}`)}
        <Icon icon="eye" className="size-4 shrink-0" />
      </span>
    );
  }

  const config = screeningButtonStatusConfig[status];

  return (
    <Button variant={config.variant} size="small" className="shadow-sm" tabIndex={-1}>
      {match(screeningQuery)
        .with({ isPending: true }, () => <Spinner className="size-4" />)
        .with({ isError: true }, () => (
          <div className="text-grey-secondary p-xl text-center text-s">{t('common:global_error')}</div>
        ))
        .otherwise((query) => {
          const screeningData = query.data;
          if (!screeningData) {
            return <div className="text-grey-secondary p-xl text-center text-s">{t('common:global_error')}</div>;
          }

          return (
            <>
              <div key={status}>{t(`screenings:status.${status}`, { count: nbHits })}</div>
              <Icon icon="eye" className="size-4 shrink-0" />
            </>
          );
        })}
    </Button>
  );
};

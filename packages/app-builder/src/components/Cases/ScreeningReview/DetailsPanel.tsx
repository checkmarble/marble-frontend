import { CaseEvents } from '@app-builder/components/CaseManager/CaseEvents';
import { ObjectDetails } from '@app-builder/components/CaseManager/ContinuousScreening/ObjectDetails';
import { RequestDetail } from '@app-builder/components/CaseManager/ContinuousScreening/RequestDetail';
import {
  ScreeningEntityDetails,
  ScreeningTriggerCallout,
} from '@app-builder/components/CaseManager/ContinuousScreening/RequestSideInfo';
import { CaseStatusBadgeV2 } from '@app-builder/components/Cases/CaseStatus';
import { Spinner } from '@app-builder/components/Spinner';
import type { CaseEventType } from '@app-builder/models/cases';
import type { InboxMetadata } from '@app-builder/models/inbox';
import type { ScreeningReviewItem } from '@app-builder/models/screening-review';
import { useGetCaseDetailQuery } from '@app-builder/queries/cases/get-detail';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, cn, Tabs, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { OpenCaseLink } from './ActionDock';
import { ShortcutKeys } from './ShortcutHelp';

/** The panel's tabs, each with the key that opens it. */
export const DETAILS_PANEL_TABS = [
  { tab: 'customer', hotkey: 'P' },
  { tab: 'list_record', hotkey: 'L' },
  { tab: 'case', hotkey: 'H' },
] as const;
export type DetailsPanelTab = (typeof DETAILS_PANEL_TABS)[number]['tab'];

// The case events that tell a monitoring case's story, as on the case page.
const CASE_EVENT_TYPES: CaseEventType[] = [
  'case_created',
  'inbox_changed',
  'case_snoozed',
  'case_unsnoozed',
  'case_assigned',
];

export function DetailsPanel({
  item,
  stack,
  tab,
  inboxes,
  onTabChange,
  onSelect,
  onClose,
  className,
}: {
  item: ScreeningReviewItem;
  stack: readonly ScreeningReviewItem[];
  tab: DetailsPanelTab;
  inboxes: InboxMetadata[];
  onTabChange: (tab: DetailsPanelTab) => void;
  onSelect: (item: ScreeningReviewItem) => void;
  onClose: () => void;
  className?: string;
}) {
  const { t } = useTranslation(['cases']);
  const tabsId = useId();
  const title =
    tab === 'customer'
      ? item.customer.name
      : tab === 'list_record'
        ? item.listRecord.caption || item.listRecord.id
        : item.caseName;
  return (
    <Card
      as="aside"
      aria-label={t('cases:screening_review.panel.label')}
      className={cn('flex min-h-0 min-w-0 flex-col overflow-hidden', className)}
    >
      <header className="flex shrink-0 flex-col gap-sm border-b border-grey-border">
        <div className="flex items-start gap-sm">
          <div className="flex min-w-0 flex-col">
            <span className="text-xs text-grey-secondary">{t(`cases:screening_review.panel.heading.${tab}`)}</span>
            <Typo as="h2" variant="subtitle1" className="truncate">
              <bdi>{title}</bdi>
            </Typo>
          </div>
          <Button
            variant="secondary"
            appearance="link"
            className="ms-auto shrink-0"
            aria-label={t('cases:screening_review.panel.close')}
            onClick={onClose}
          >
            <Icon icon="cross" className="size-4" aria-hidden />
            <ShortcutKeys hotkeys={['Escape']} variant="small" />
          </Button>
        </div>
        <Tabs
          id={tabsId}
          value={tab}
          onValueChange={(value) => {
            const next = DETAILS_PANEL_TABS.find((candidate) => candidate.tab === value);
            if (next) onTabChange(next.tab);
          }}
        >
          {DETAILS_PANEL_TABS.map(({ tab: value, hotkey }) => (
            <Tabs.Button key={value} value={value} className="gap-xs">
              {t(`cases:screening_review.panel.tab.${value}`)}
              <ShortcutKeys hotkeys={[hotkey]} variant="small" />
            </Tabs.Button>
          ))}
        </Tabs>
      </header>
      <Tabs.Panel tabsId={tabsId} value={tab} className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-md">
        {tab === 'customer' ? (
          <ObjectDetails
            objectType={item.customer.objectType}
            objectId={item.customer.objectId}
            currentCaseId={item.caseId}
          />
        ) : tab === 'list_record' ? (
          <div className="flex flex-col gap-md">
            <ScreeningEntityDetails entity={item.listRecord} />
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            {stack.length > 1 ? <StackNavigation stack={stack} activeId={item.id} onSelect={onSelect} /> : null}
            <CaseAndHistory item={item} inboxes={inboxes} />
          </div>
        )}
      </Tabs.Panel>
      <footer className="flex shrink-0 flex-wrap items-center gap-xs border-t border-grey-border px-md py-sm text-xs text-grey-secondary">
        <span>{t('cases:screening_review.panel.follows_active_hit')}</span>
        <span aria-hidden>·</span>
        <ShortcutKeys hotkeys={['J', 'K']} variant="small" />
        <span>{t('cases:screening_review.panel.keep_working')}</span>
        <span aria-hidden>·</span>
        <ShortcutKeys hotkeys={['Escape']} variant="small" />
        <span>{t('cases:screening_review.panel.close_hint')}</span>
      </footer>
    </Card>
  );
}

/** One numbered button per hit of the stack, each opening its case. */
function StackNavigation({
  stack,
  activeId,
  onSelect,
}: {
  stack: readonly ScreeningReviewItem[];
  activeId: string;
  onSelect: (item: ScreeningReviewItem) => void;
}) {
  const { t } = useTranslation(['cases']);
  const label = t('cases:screening_review.stack.navigation');
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-xs">
      <span className="me-xs text-xs text-grey-secondary">{label}</span>
      {stack.map((member, index) => {
        const current = member.id === activeId;
        return (
          <Button
            key={member.id}
            variant={current ? 'primary' : 'secondary'}
            mode="icon"
            className="tabular-nums"
            aria-pressed={current}
            aria-label={`${index + 1} · ${member.caseName}`}
            title={member.caseName}
            onClick={() => onSelect(member)}
          >
            {index + 1}
          </Button>
        );
      })}
    </div>
  );
}

function CaseAndHistory({ item, inboxes }: { item: ScreeningReviewItem; inboxes: InboxMetadata[] }) {
  const { t } = useTranslation(['cases', 'common']);
  const query = useGetCaseDetailQuery(item.caseId);
  if (query.isPending) return <Spinner className="size-6" />;
  if (query.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-sm">
        <p>{t('common:generic_fetch_data_error')}</p>
        <Button variant="secondary" disabled={query.isFetching} onClick={() => void query.refetch()}>
          {t('cases:screening_review.retry')}
        </Button>
      </div>
    );
  }
  const { caseDetail } = query.data;
  const screening = caseDetail.continuousScreenings.find((candidate) => candidate.id === item.screeningId);
  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-wrap items-center gap-sm">
        <CaseStatusBadgeV2 status={caseDetail.status} outcome={caseDetail.outcome} variant="full" />
        <OpenCaseLink caseId={item.caseId} className="ms-auto" />
      </div>
      {screening ? (
        <section className="flex flex-col gap-sm" aria-label={t('cases:screening_review.panel.trigger')}>
          <ScreeningTriggerCallout screening={screening} />
          <RequestDetail configStableId={screening.continuousScreeningConfigStableId} request={screening.request} />
        </section>
      ) : null}
      <CaseEvents
        events={caseDetail.events}
        currentInboxId={caseDetail.inboxId}
        inboxes={inboxes}
        includeEventTypes={CASE_EVENT_TYPES}
        dueAt={caseDetail.dueAt}
        status={caseDetail.status}
      />
    </div>
  );
}

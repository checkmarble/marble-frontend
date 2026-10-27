import { OutcomeBadge } from '@app-builder/components/Decisions/OutcomeTag';
import type { DetailedCaseDecision } from '@app-builder/models/cases';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Modal, Tag } from 'ui-design-system';
import { ErrorBanner } from '../../Settings/ErrorBanner';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { summarizeTrigger } from './decision-summary';
import { operationCapacity, selectedDecisionIds } from './operations-model';
import { type AddOperationsPlan, planAddOperations } from './plan-add-operations';
import { snapshotMappingFor } from './snapshot-selection';
import { useDecisionListing } from './useDecisionListing';

type DecisionRowProps = {
  decision: DetailedCaseDecision;
  checked: boolean;
  alreadySelected: boolean;
  hasMapping: boolean;
  onToggle: (checked: boolean) => void;
};

function DecisionRow({ decision, checked, alreadySelected, hasMapping, onToggle }: DecisionRowProps) {
  const { t } = useTranslation(['tracfin']);
  const formatDateTime = useFormatDateTime();
  const trigger = summarizeTrigger(decision.triggerObject);
  const objectLabel = trigger.objectId ?? t('tracfin:draft.operations.picker.no_object_id');

  return (
    <li
      data-decision-id={decision.id}
      className="border-grey-border flex min-w-0 items-start gap-sm rounded-md border p-sm"
    >
      <Checkbox
        size="small"
        className="mt-2xs"
        aria-label={t('tracfin:draft.operations.picker.select_aria', {
          object: objectLabel,
          type: decision.triggerObjectType,
        })}
        checked={alreadySelected || checked}
        disabled={alreadySelected}
        onCheckedChange={(value) => onToggle(value === true)}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2xs">
        <div className="text-s flex flex-wrap items-center gap-x-sm gap-y-2xs">
          <time dateTime={decision.createdAt} className="font-medium">
            {formatDateTime(decision.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
          </time>
          <span>
            {decision.scenario.name} · v{decision.scenario.version}
          </span>
          <OutcomeBadge outcome={decision.outcome} />
        </div>
        <div className="text-s flex flex-wrap items-center gap-x-sm gap-y-2xs">
          <span>
            {t('tracfin:draft.operations.picker.historical_type')} :{' '}
            <span className="font-mono">{decision.triggerObjectType}</span>
          </span>
          <span>
            {t('tracfin:draft.operations.picker.object')} : <span className="font-mono break-all">{objectLabel}</span>
          </span>
        </div>
        {trigger.fields.length > 0 ? (
          <dl className="text-grey-secondary flex flex-wrap gap-x-md gap-y-2xs text-xs">
            {trigger.fields.map((field) => (
              <div key={field.name} className="flex gap-xs">
                <dt>{field.name}</dt>
                <dd className="break-all">{field.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <div className="flex flex-wrap items-center gap-xs">
          {alreadySelected ? (
            <Tag size="xs" color="grey">
              {t('tracfin:draft.operations.picker.already')}
            </Tag>
          ) : null}
          {!hasMapping ? (
            <Tag size="xs" color="orange">
              {t('tracfin:draft.operations.picker.no_mapping')}
            </Tag>
          ) : null}
        </div>
        {!hasMapping && !alreadySelected ? (
          <p className="text-grey-secondary text-xs">
            {t('tracfin:draft.operations.picker.no_mapping_help', { type: decision.triggerObjectType })}
          </p>
        ) : null}
      </div>
    </li>
  );
}

/**
 * Picks the decisions of the case that become principal operation lines (one decision = one line).
 * The list is the case's existing decision listing, loaded page by page and never presented as
 * complete while the server says more exist. Decisions whose historical type is not in the data model
 * (a deleted table) are listed and selectable like any other: the snapshot is what the declaration
 * reads. A decision already on a line cannot be picked again, and no more than the remaining capacity
 * can be ticked.
 */
export function DecisionPicker({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: (plan: AddOperationsPlan) => void;
}) {
  const { t } = useTranslation(['tracfin', 'common']);
  const editor = useTracfinDraftEditorContext();
  const { draft, caseId } = editor;
  const listing = useDecisionListing(caseId, open);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [refusal, setRefusal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const root = draft.document.root;
  const capacity = operationCapacity(root);
  const taken = selectedDecisionIds(root);
  const mappings = draft.configuration.mappings ?? [];
  const chosen = listing.decisions.filter((decision) => selected.has(decision.id) && !taken.has(decision.id));
  const atCapacity = capacity.remaining === 0 || refusal;

  const toggle = (decision: DetailedCaseDecision, checked: boolean) => {
    setError(null);
    if (!checked) {
      setRefusal(false);
      setSelected((previous) => new Set([...previous].filter((id) => id !== decision.id)));
      return;
    }
    if (chosen.length >= capacity.remaining) {
      setRefusal(true);
      return;
    }
    setSelected((previous) => new Set(previous).add(decision.id));
  };

  const add = async () => {
    setError(null);
    const plan = planAddOperations({
      draft,
      decisions: chosen.map((decision) => ({ id: decision.id, triggerObjectType: decision.triggerObjectType })),
    });
    if (plan.refused.length > 0) {
      setRefusal(plan.refused.some((entry) => entry.reason === 'capacity'));
      setError(t('tracfin:draft.operations.picker.refused'));
      return;
    }
    if (plan.ops.length === 0) return;
    setBusy(true);
    try {
      const result = await editor.applyStructural(plan.ops);
      if (!result.ok) {
        setError(result.error.message ?? t('tracfin:draft.operations.picker.add_failed'));
        return;
      }
      setSelected(new Set());
      onAdded(plan);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="large">
        <Modal.Title>{t('tracfin:draft.operations.picker.title')}</Modal.Title>
        <div className="flex flex-col gap-sm p-md">
          <p className="text-grey-secondary text-s">{t('tracfin:draft.operations.picker.intro')}</p>
          <p className="text-s">
            {t('tracfin:draft.operations.picker.capacity', {
              count: capacity.count,
              max: capacity.max,
              remaining: capacity.remaining,
            })}
          </p>
          {atCapacity ? (
            <p role="alert" className="text-s text-red-primary">
              {t('tracfin:draft.operations.picker.capacity_refused', { max: capacity.max })}
            </p>
          ) : null}
          {error ? (
            <ErrorBanner>
              <p>{error}</p>
            </ErrorBanner>
          ) : null}

          {listing.isLoading ? (
            <p role="status" className="text-grey-secondary text-s">
              {t('tracfin:draft.operations.picker.loading')}
            </p>
          ) : listing.isError && listing.decisions.length === 0 ? (
            <div role="alert" className="flex flex-col items-start gap-xs">
              <p className="text-s text-red-primary">{t('tracfin:draft.operations.picker.load_failed')}</p>
              <Button variant="secondary" appearance="stroked" size="small" onClick={listing.refetch}>
                {t('tracfin:draft.operations.picker.retry')}
              </Button>
            </div>
          ) : listing.decisions.length === 0 && !listing.hasMore ? (
            <p className="text-grey-secondary text-s">{t('tracfin:draft.operations.picker.empty')}</p>
          ) : (
            <>
              <ul aria-label={t('tracfin:draft.operations.picker.list_aria')} className="flex flex-col gap-sm">
                {listing.decisions.map((decision) => (
                  <DecisionRow
                    key={decision.id}
                    decision={decision}
                    checked={selected.has(decision.id)}
                    alreadySelected={taken.has(decision.id)}
                    hasMapping={snapshotMappingFor(mappings, decision.triggerObjectType) !== null}
                    onToggle={(checked) => toggle(decision, checked)}
                  />
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-sm">
                <p role="status" className="text-grey-secondary text-xs">
                  {listing.hasMore
                    ? t('tracfin:draft.operations.picker.partial', { count: listing.decisions.length })
                    : t('tracfin:draft.operations.picker.end', { count: listing.decisions.length })}
                </p>
                {listing.hasMore ? (
                  <Button
                    variant="secondary"
                    appearance="stroked"
                    size="small"
                    disabled={listing.isLoadingMore}
                    onClick={listing.loadMore}
                  >
                    {listing.isLoadingMore
                      ? t('tracfin:draft.operations.picker.loading_more')
                      : t('tracfin:draft.operations.picker.load_more')}
                  </Button>
                ) : null}
              </div>
              {listing.isError ? (
                <p role="alert" className="text-s text-red-primary">
                  {t('tracfin:draft.operations.picker.load_failed')}
                </p>
              ) : null}
            </>
          )}
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} />
          <Modal.FooterButton
            label={t('tracfin:draft.operations.picker.confirm', { count: chosen.length })}
            disabled={chosen.length === 0 || busy}
            isLoading={busy}
            onClick={() => void add()}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

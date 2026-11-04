import { OutcomeBadge } from '@app-builder/components/Decisions/OutcomeTag';
import type { DetailedCaseDecision } from '@app-builder/models/cases';
import type { TracfinBlock } from '@app-builder/models/tracfin';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { type BlockDiagnostic, useBlockDiagnostics } from '../fields/block-diagnostics';
import { TracfinBlockEditor } from '../fields/TracfinBlockEditor';
import { blockAddress } from '../model/block-address';
import { RemoveBlockButton } from '../persons/RemoveBlockButton';
import { DiagnosticNotice } from '../prefill/DiagnosticNotice';
import { shortDecisionId, summarizeTrigger } from './decision-summary';
import { duplicatePeerPositions } from './duplicates';
import { decisionOfLine, OPERATION_CATALOG_ID, POTENTIAL_DUPLICATE_CODE } from './operations-model';

function DecisionReference({
  line,
  decision,
  listingLoaded,
}: {
  line: TracfinBlock;
  decision: DetailedCaseDecision | undefined;
  listingLoaded: boolean;
}) {
  const { t } = useTranslation(['tracfin']);
  const formatDateTime = useFormatDateTime();
  const decisionId = decisionOfLine(line);

  if (!decisionId) {
    return (
      <div className="flex flex-col gap-2xs">
        <Tag size="xs" color="grey" className="self-start">
          {t('tracfin:draft.operations.line.no_decision')}
        </Tag>
        <p className="text-grey-secondary text-xs">{t('tracfin:draft.operations.line.no_decision_help')}</p>
      </div>
    );
  }

  const historicalType = line.selection?.historical_type;
  const trigger = decision ? summarizeTrigger(decision.triggerObject) : null;
  return (
    <div className="text-s flex min-w-0 flex-wrap items-center gap-x-sm gap-y-2xs" data-decision-id={decisionId}>
      {decision ? (
        <>
          <time dateTime={decision.createdAt} className="font-medium">
            {formatDateTime(decision.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
          </time>
          <span>
            {decision.scenario.name} · v{decision.scenario.version}
          </span>
          <OutcomeBadge outcome={decision.outcome} />
        </>
      ) : (
        <span className="font-medium">
          {t('tracfin:draft.operations.line.decision_id', { id: shortDecisionId(decisionId) })}
        </span>
      )}
      {historicalType ? (
        <span>
          {t('tracfin:draft.operations.picker.historical_type')} : <span className="font-mono">{historicalType}</span>
        </span>
      ) : null}
      {trigger?.objectId ? (
        <span>
          {t('tracfin:draft.operations.picker.object')} :{' '}
          <span className="font-mono break-all">{trigger.objectId}</span>
        </span>
      ) : null}
      {!decision && listingLoaded ? (
        <span className="text-grey-secondary text-xs">{t('tracfin:draft.operations.line.not_in_loaded_pages')}</span>
      ) : null}
    </div>
  );
}

/** The duplicate warning: the diagnostic is the backend's, the line numbers only say where the twins are. */
function DuplicateNotice({
  diagnostic,
  line,
  lines,
}: {
  diagnostic: BlockDiagnostic;
  line: TracfinBlock;
  lines: readonly TracfinBlock[];
}) {
  const { t } = useTranslation(['tracfin']);
  const peers = duplicatePeerPositions(diagnostic, line, lines);
  return (
    <div
      role="note"
      data-diagnostic-code={diagnostic.code}
      className="text-s flex min-w-0 flex-wrap items-center gap-xs text-orange-primary"
    >
      <Tag size="xs" color="orange">
        {t('tracfin:draft.operations.line.duplicate_tag')}
      </Tag>
      <span>
        {peers.length > 0
          ? t('tracfin:draft.operations.line.duplicate_with', { positions: peers.join(', ') })
          : t('tracfin:draft.operations.line.duplicate_generic')}
      </span>
      {diagnostic.stale ? (
        <Tag size="xs" color="grey">
          {t('tracfin:draft.prefill.stale_tag')}
        </Tag>
      ) : null}
    </div>
  );
}

/**
 * One principal operation: the decision it records, the warning when another selected decision
 * records the same historical object (separate lines, amounts never summed), the generic editor for
 * its fields, and its removal.
 */
export function OperationLineCard({
  line,
  index,
  lines,
  decision,
  listingLoaded,
}: {
  line: TracfinBlock;
  /** 1-based position among the lines. */
  index: number;
  lines: readonly TracfinBlock[];
  decision: DetailedCaseDecision | undefined;
  listingLoaded: boolean;
}) {
  const { t } = useTranslation(['tracfin']);
  const blockDiagnostics = useBlockDiagnostics(line.id).filter((diagnostic) => !diagnostic.field?.field_id);
  const title = t('tracfin:draft.operations.principal.line', { index });

  return (
    <section
      aria-label={title}
      data-block-id={line.id}
      className="border-grey-border bg-surface-card flex min-w-0 flex-col gap-md rounded-lg border p-md"
    >
      <header className="flex items-start justify-between gap-sm">
        <div className="flex min-w-0 flex-col gap-xs">
          <h4 className="text-default font-semibold">{title}</h4>
          <DecisionReference line={line} decision={decision} listingLoaded={listingLoaded} />
        </div>
        <RemoveBlockButton
          blockId={line.id}
          title={title}
          description={t('tracfin:draft.operations.line.remove_description')}
        />
      </header>
      {blockDiagnostics.map((diagnostic, position) =>
        diagnostic.code === POTENTIAL_DUPLICATE_CODE ? (
          <DuplicateNotice key={`${diagnostic.code}-${position}`} diagnostic={diagnostic} line={line} lines={lines} />
        ) : (
          <DiagnosticNotice key={`${diagnostic.code}-${position}`} diagnostic={diagnostic} />
        ),
      )}
      <TracfinBlockEditor address={blockAddress(line.id)} catalogId={OPERATION_CATALOG_ID} showDiagnostics={false} />
    </section>
  );
}

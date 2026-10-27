import type { TracfinBlock } from '@app-builder/models/tracfin';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { blockLabel, fieldLabel } from '../fields/labels';
import { personDisplayName } from '../persons/display-name';
import {
  type BlockUnit,
  groupDiagnostics,
  isErrorSeverity,
  type ReviewBlockGroup,
  type ReviewDiagnostic,
  type ReviewItem,
} from './diagnostic-model';
import { useReviewDiagnosticText } from './diagnostic-text';
import { useTracfinFocus } from './TracfinFocusContext';

/** « Jean Dupont », « Pièce n° 2 », « Opération principale n° 1 »: the thing the block of a group belongs to. */
function useUnitCaption() {
  const { t } = useTranslation(['tracfin']);
  return (unit: BlockUnit): string => {
    switch (unit.kind) {
      case 'person':
        return personDisplayName(unit.block as TracfinBlock, unit.personKind) ?? t('tracfin:draft.persons.unnamed');
      case 'piece':
        return t('tracfin:draft.pieces.card.aria', { index: unit.position });
      case 'operation':
        return t(
          unit.ongoing ? 'tracfin:draft.review.groups.operation_ongoing' : 'tracfin:draft.operations.principal.line',
          { index: unit.position },
        );
    }
  };
}

function useGroupTitle() {
  const { t } = useTranslation(['tracfin']);
  const { catalogIndex } = useTracfinDraftEditorContext();
  const unitCaption = useUnitCaption();
  return (group: ReviewBlockGroup): string => {
    const catalogField = group.catalogId ? catalogIndex.field(group.catalogId) : undefined;
    const label = catalogField
      ? catalogField.kind === 'block'
        ? blockLabel(t, catalogField)
        : fieldLabel(t, catalogField)
      : t('tracfin:draft.review.groups.unknown_block');
    const unit = group.unit ? unitCaption(group.unit) : null;
    // A person's own block reads as the person; deeper blocks read « Personne — État civil ».
    return unit && unit !== label ? `${unit} — ${label}` : label;
  };
}

function DiagnosticRow({ item }: { item: ReviewItem }) {
  const { t } = useTranslation(['tracfin']);
  const { catalogIndex } = useTracfinDraftEditorContext();
  const { goTo } = useTracfinFocus();
  const text = useReviewDiagnosticText()(item.diagnostic);
  const { diagnostic, target } = item;
  const catalogField = diagnostic.field?.field_id ? catalogIndex.field(diagnostic.field.field_id) : undefined;
  const error = isErrorSeverity(diagnostic.severity);

  const body = (
    <span className="flex min-w-0 flex-1 flex-col gap-2xs text-start">
      <span className="flex flex-wrap items-center gap-xs">
        <Tag size="xs" color={error ? 'red' : 'orange'}>
          {t(error ? 'tracfin:draft.review.severity.error' : 'tracfin:draft.review.severity.warning')}
        </Tag>
        {catalogField ? <span className="text-s font-medium">{fieldLabel(t, catalogField)}</span> : null}
        {diagnostic.stale ? (
          <Tag size="xs" color="grey">
            {t('tracfin:draft.prefill.stale_tag')}
          </Tag>
        ) : null}
      </span>
      <span className="text-s">{text}</span>
      <code className="text-grey-secondary font-mono text-xs">{diagnostic.code}</code>
    </span>
  );

  if (!target) {
    return (
      <li data-diagnostic-code={diagnostic.code} className="border-grey-border flex rounded-md border p-sm">
        {body}
      </li>
    );
  }
  return (
    <li data-diagnostic-code={diagnostic.code}>
      <button
        type="button"
        className="border-grey-border hover:bg-grey-background-light flex w-full items-start gap-sm rounded-md border p-sm text-start"
        aria-label={t('tracfin:draft.review.diagnostic_go', {
          field: catalogField ? fieldLabel(t, catalogField) : (diagnostic.field?.field_id ?? diagnostic.code),
          message: text,
        })}
        onClick={() => goTo(target)}
      >
        {body}
        <Icon icon="arrow-right" className="text-grey-secondary mt-xs size-4 shrink-0 rtl:rotate-180" aria-hidden />
      </button>
    </li>
  );
}

/**
 * Diagnostics by section, then by block, errors first; each one with a target is a button that opens
 * the section and brings the block, field and occurrence on screen. Those that name no block or no
 * section are listed apart, in a general group.
 */
export function DiagnosticsList({ diagnostics }: { diagnostics: readonly ReviewDiagnostic[] }) {
  const { t } = useTranslation(['tracfin']);
  const { draft } = useTracfinDraftEditorContext();
  const groupTitle = useGroupTitle();
  const groups = groupDiagnostics({ diagnostics, root: draft.document.root });

  if (diagnostics.length === 0) return null;
  return (
    <div className="flex flex-col gap-md">
      <p className="text-s text-grey-secondary" data-testid="diagnostic-counts">
        {t('tracfin:draft.review.counts', { errors: groups.counts.errors, warnings: groups.counts.warnings })}
      </p>
      {groups.sections.map(({ section, blocks }) => (
        <section
          key={section}
          aria-label={t(`tracfin:draft.sections.${section}`)}
          className="flex min-w-0 flex-col gap-sm"
        >
          <h4 className="text-default font-semibold">{t(`tracfin:draft.sections.${section}`)}</h4>
          {blocks.map((group) => (
            <div key={group.key} className="flex min-w-0 flex-col gap-xs">
              <h5 className="text-s text-grey-secondary font-medium">{groupTitle(group)}</h5>
              <ul className="flex flex-col gap-xs">
                {group.items.map((item, index) => (
                  <DiagnosticRow key={`${item.diagnostic.code}-${index}`} item={item} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
      {groups.general.length > 0 ? (
        <section aria-label={t('tracfin:draft.review.groups.general')} className="flex min-w-0 flex-col gap-sm">
          <h4 className="text-default font-semibold">{t('tracfin:draft.review.groups.general')}</h4>
          <p className="text-grey-secondary text-xs">{t('tracfin:draft.review.groups.general_help')}</p>
          <ul className="flex flex-col gap-xs">
            {groups.general.map((item, index) => (
              <DiagnosticRow key={`${item.diagnostic.code}-${index}`} item={item} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

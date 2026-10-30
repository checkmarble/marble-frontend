import { CalloutV2 } from '@app-builder/components/Callout';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { ErrorBanner } from '../Settings/ErrorBanner';
import { useTracfinDraftEditorContext } from './editor/TracfinDraftEditorContext';
import { fieldLabel } from './fields/labels';
import type { StructuralOp } from './model/build-patch';
import { type ConflictItem, localStateOfEdit } from './model/conflict';
import { type PendingEdit } from './model/pending-edits';
import { sectionOfCatalogId } from './model/sections';
import { StateText } from './StateText';

function useEditLabel() {
  const { t } = useTranslation(['tracfin']);
  const { catalogIndex } = useTracfinDraftEditorContext();
  return (edit: PendingEdit) => {
    const field = catalogIndex.field(edit.fieldId);
    const section = sectionOfCatalogId(edit.fieldId);
    return {
      field: field ? fieldLabel(t, field) : edit.fieldId,
      section: section ? t(`tracfin:draft.sections.${section}`) : null,
    };
  };
}

/** Pending edits with a way to drop each one: what the analyst may give up one by one after a refusal. */
function EditList({ edits, actionLabel }: { edits: readonly PendingEdit[]; actionLabel: string }) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const describe = useEditLabel();
  return (
    <ul className="flex flex-col gap-xs" aria-label={t('tracfin:draft.pending_list')}>
      {edits.map((edit) => {
        const { field, section } = describe(edit);
        return (
          <li key={edit.key} className="flex flex-wrap items-center gap-sm">
            <span className="font-medium">{field}</span>
            {section ? <span className="text-grey-secondary text-xs">({section})</span> : null}
            <StateText state={localStateOfEdit(edit)} />
            <Button
              variant="secondary"
              appearance="link"
              size="small"
              aria-label={`${actionLabel} ${field}`}
              onClick={() => editor.discard(edit.key)}
            >
              {actionLabel}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

/** « Ajout d'un bloc (Personne physique) »...: what a structural change would do, in words. */
function useOpLabel() {
  const { t } = useTranslation(['tracfin']);
  const { catalogIndex } = useTracfinDraftEditorContext();
  return (op: StructuralOp): string => {
    if (op.type === 'add_block') {
      const field = catalogIndex.field(op.catalogId);
      return t('tracfin:draft.failed_changes.op.add_block', { block: field ? fieldLabel(t, field) : op.catalogId });
    }
    return t(`tracfin:draft.failed_changes.op.${op.type}`);
  };
}

function FailedChangesList({ changes }: { changes: readonly StructuralOp[] }) {
  const { t } = useTranslation(['tracfin']);
  const label = useOpLabel();
  return (
    <ul className="flex flex-col gap-xs" aria-label={t('tracfin:draft.failed_changes.list')}>
      {changes.map((op, index) => (
        <li key={index}>{label(op)}</li>
      ))}
    </ul>
  );
}

/**
 * Structural changes that failed and still wait. After a conflict they are listed with the comparison
 * (they will not be re-applied); otherwise « Réessayer » sends them again. The analyst can give them up.
 */
function FailedChangesNotice({ withRetry }: { withRetry: boolean }) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  if (editor.failedChanges.length === 0) return null;
  return (
    <ErrorBanner>
      <p className="font-semibold">{t('tracfin:draft.failed_changes.title', { count: editor.failedChanges.length })}</p>
      <p>
        {editor.status === 'conflict'
          ? t('tracfin:draft.failed_changes.description_conflict')
          : t('tracfin:draft.failed_changes.description')}
      </p>
      <FailedChangesList changes={editor.failedChanges} />
      <div className="flex flex-wrap gap-sm">
        {withRetry ? (
          <Button variant="secondary" appearance="stroked" onClick={() => void editor.retry()}>
            {t('tracfin:draft.errors.retry')}
          </Button>
        ) : null}
        <Button variant="secondary" appearance="link" onClick={editor.discardFailedChanges}>
          {t('tracfin:draft.failed_changes.discard')}
        </Button>
      </div>
    </ErrorBanner>
  );
}

function ComparisonTable({ items }: { items: ConflictItem[] }) {
  const { t } = useTranslation(['tracfin']);
  const describe = useEditLabel();
  if (items.length === 0) return <p className="text-s">{t('tracfin:draft.conflict.nothing_pending')}</p>;
  return (
    <table className="text-s w-full border-collapse text-start">
      <thead>
        <tr className="text-grey-secondary text-xs">
          <th className="p-xs text-start font-medium">{t('tracfin:draft.conflict.field')}</th>
          <th className="p-xs text-start font-medium">{t('tracfin:draft.conflict.server')}</th>
          <th className="p-xs text-start font-medium">{t('tracfin:draft.conflict.local')}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const { field, section } = describe(item.edit);
          return (
            <tr key={item.edit.key} className="border-grey-border border-t align-top">
              <td className="p-xs">
                <span className="font-medium">{field}</span>
                {section ? <span className="text-grey-secondary block text-xs">{section}</span> : null}
              </td>
              <td className="p-xs">
                {item.status === 'orphan' ? (
                  <span className="text-red-primary text-xs">{t('tracfin:draft.conflict.gone')}</span>
                ) : (
                  <StateText state={item.server} />
                )}
              </td>
              <td className="p-xs">
                <StateText state={item.local} />
                {item.status === 'identical' ? (
                  <span className="text-grey-secondary block text-xs">{t('tracfin:draft.conflict.already_there')}</span>
                ) : null}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** « Le brouillon a été modifié ailleurs »: the server version against the local edits, and the two ways out. */
function ConflictNotice() {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const { comparison } = editor;

  return (
    <ErrorBanner>
      <p className="font-semibold">{t('tracfin:draft.conflict.title')}</p>
      <p>{t('tracfin:draft.conflict.description')}</p>
      {comparison === null || comparison.status === 'failed' ? (
        <>
          {comparison?.status === 'failed' ? <p>{t('tracfin:draft.conflict.reload_failed')}</p> : null}
          <div className="flex flex-wrap gap-sm">
            <Button variant="secondary" appearance="stroked" onClick={() => void editor.reloadAndCompare()}>
              {t('tracfin:draft.conflict.reload')}
            </Button>
            <Button variant="secondary" appearance="link" onClick={editor.discardAll}>
              {t('tracfin:draft.conflict.discard')}
            </Button>
          </div>
        </>
      ) : comparison.status === 'loading' ? (
        <p role="status">{t('tracfin:draft.conflict.loading')}</p>
      ) : (
        <div className="flex flex-col gap-sm">
          <p className="font-medium">
            {t('tracfin:draft.conflict.server_revision', { revision: comparison.server.revision })}
          </p>
          <ComparisonTable items={comparison.items} />
          <div className="flex flex-wrap gap-sm">
            <Button variant="primary" onClick={() => void editor.reapply()}>
              {t('tracfin:draft.conflict.reapply')}
            </Button>
            <Button variant="secondary" appearance="stroked" onClick={editor.discardAll}>
              {t('tracfin:draft.conflict.discard')}
            </Button>
          </div>
          <p className="text-xs">{t('tracfin:draft.conflict.reapply_help')}</p>
        </div>
      )}
    </ErrorBanner>
  );
}

/** What went wrong with the last save, and what can be done: the edits are always kept. */
export function DraftNotices() {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const { failure } = editor;
  const orphaned = editor.pendingEdits.filter((edit) => edit.orphaned);
  const sendable = editor.pendingEdits.filter((edit) => !edit.orphaned);

  return (
    <>
      {failure?.kind === 'conflict' ? <ConflictNotice /> : null}

      {/* Their own banner carries « Réessayer » when no other banner does. */}
      <FailedChangesNotice withRetry={failure === null || failure.kind === 'unresolved'} />

      {failure?.kind === 'unresolved' ? (
        <ErrorBanner>
          <p className="font-semibold">{t('tracfin:draft.errors.unresolved.title')}</p>
          <p>{t('tracfin:draft.errors.unresolved.description', { count: failure.count })}</p>
        </ErrorBanner>
      ) : null}

      {failure?.kind === 'invalid' ? (
        <ErrorBanner>
          <p className="font-semibold">{t('tracfin:draft.errors.invalid.title')}</p>
          <p>{t('tracfin:draft.errors.invalid.description')}</p>
          {failure.message ? <p className="font-mono text-xs">{failure.message}</p> : null}
          <EditList edits={sendable} actionLabel={t('tracfin:draft.errors.discard')} />
          <Button variant="secondary" appearance="stroked" className="self-start" onClick={() => void editor.retry()}>
            {t('tracfin:draft.errors.retry')}
          </Button>
        </ErrorBanner>
      ) : null}

      {failure?.kind === 'too_large' ? (
        <ErrorBanner>
          <p>{t('tracfin:draft.errors.too_large')}</p>
        </ErrorBanner>
      ) : null}

      {failure?.kind === 'unavailable' ? (
        <ErrorBanner>
          <p className="font-semibold">{t('tracfin:draft.errors.unavailable.title')}</p>
          <p>{t('tracfin:draft.errors.unavailable.description')}</p>
          {failure.message ? <p className="font-mono text-xs">{failure.message}</p> : null}
          <Button variant="secondary" appearance="stroked" className="self-start" onClick={() => void editor.retry()}>
            {t('tracfin:draft.errors.retry')}
          </Button>
        </ErrorBanner>
      ) : null}

      {failure?.kind === 'rejected' ? (
        <ErrorBanner>
          <p className="font-semibold">{t('tracfin:draft.errors.rejected.title')}</p>
          {failure.message ? <p className="font-mono text-xs">{failure.message}</p> : null}
          <Button variant="secondary" appearance="stroked" className="self-start" onClick={() => void editor.retry()}>
            {t('tracfin:draft.errors.retry')}
          </Button>
        </ErrorBanner>
      ) : null}

      {orphaned.length > 0 ? (
        <CalloutV2 role="alert" className="items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-xs">
            <p className="font-semibold">{t('tracfin:draft.orphaned.title')}</p>
            <p>{t('tracfin:draft.orphaned.description')}</p>
            <EditList edits={orphaned} actionLabel={t('tracfin:draft.errors.discard')} />
          </div>
        </CalloutV2>
      ) : null}
    </>
  );
}

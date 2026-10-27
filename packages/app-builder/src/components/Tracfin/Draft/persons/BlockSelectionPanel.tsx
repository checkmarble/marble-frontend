import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { ConfirmDialog } from '../ConfirmDialog';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { useBlockDiagnostics } from '../fields/block-diagnostics';
import type { TracfinBlockExtrasProps } from '../fields/block-extras';
import { isSelectionDiagnostic } from './diagnostics';
import { personContaining, personRoot } from './document';
import { isSupportCatalogId } from './person-kinds';
import { SelectionSummary } from './SelectionSummary';
import { draftMappings, mappingsOwnedBy } from './selection-model';
import { TracfinSelectionEditor } from './TracfinSelectionEditor';

/**
 * What a block says about client data, shown at the top of the block: the record it is attached to
 * (the path of its selection), « Choisir dans la base client » when the configuration has mappings
 * for it, and the diagnostics of the last prefill with what to do about them (choose a new
 * selection, or remove the block). A block no mapping targets and no diagnostic concerns shows nothing.
 */
export function BlockSelectionPanel({ address, catalogId }: TracfinBlockExtrasProps) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const block = editor.blockAt(address);
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);

  const mappings = useMemo(
    () => mappingsOwnedBy(draftMappings(editor.draft), editor.catalogIndex, catalogId),
    [editor.draft, editor.catalogIndex, catalogId],
  );
  const diagnostics = useBlockDiagnostics(block?.id).filter((diagnostic) => isSelectionDiagnostic(diagnostic.code));

  if (!block?.selection && mappings.length === 0 && diagnostics.length === 0) return null;

  // A support is read from the record its person is attached to.
  const holder = isSupportCatalogId(catalogId)
    ? personContaining(editor.draft.document.root, address.kind === 'block' ? address.id : address.anchorId)
    : null;
  const fixedRoot = holder ? (personRoot(holder.block) ?? undefined) : undefined;

  return (
    <section
      aria-label={t('tracfin:draft.persons.selection.title')}
      className="border-grey-border bg-grey-background flex min-w-0 flex-col gap-xs rounded-md border p-sm"
    >
      <p className="text-s font-medium">{t('tracfin:draft.persons.selection.title')}</p>
      {block?.selection ? (
        <SelectionSummary selection={block.selection} />
      ) : mappings.length > 0 ? (
        <p className="text-grey-secondary text-xs">{t('tracfin:draft.persons.selection.none')}</p>
      ) : null}

      {diagnostics.map((diagnostic, index) => (
        <div key={`${diagnostic.code}-${index}`} role="alert" className="flex flex-col gap-xs">
          <p className="text-s text-orange-primary">
            {t(`tracfin:draft.persons.diagnostics.${diagnostic.code}`, { defaultValue: diagnostic.message })}
          </p>
          <div className="flex flex-wrap gap-sm">
            <Button variant="secondary" appearance="stroked" size="small" onClick={() => setEditing(true)}>
              {t('tracfin:draft.persons.diagnostics.reselect')}
            </Button>
            {block ? (
              <Button variant="secondary" appearance="stroked" size="small" onClick={() => setRemoving(true)}>
                {t('tracfin:draft.persons.diagnostics.remove')}
              </Button>
            ) : null}
          </div>
        </div>
      ))}

      {editing ? (
        <TracfinSelectionEditor
          save={(selection) => editor.setSelection(address, selection)}
          mappings={mappings}
          current={block?.selection}
          fixedRoot={fixedRoot}
          onDone={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      ) : mappings.length > 0 || block?.selection ? (
        <Button
          variant="secondary"
          appearance="stroked"
          size="small"
          className="self-start"
          onClick={() => setEditing(true)}
        >
          {block?.selection ? t('tracfin:draft.persons.selection.change') : t('tracfin:draft.persons.selection.choose')}
        </Button>
      ) : null}

      <ConfirmDialog
        open={removing}
        onOpenChange={setRemoving}
        title={t('tracfin:draft.persons.diagnostics.remove_title')}
        description={t('tracfin:draft.persons.diagnostics.remove_description')}
        confirmLabel={t('tracfin:draft.remove_block.confirm')}
        destructive
        onConfirm={() => block && void editor.removeBlock(block.id)}
      />
    </section>
  );
}

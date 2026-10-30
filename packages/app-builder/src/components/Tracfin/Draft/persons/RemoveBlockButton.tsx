import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ConfirmDialog } from '../ConfirmDialog';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';

/** Removes a block (and everything in it) after a confirmation that says what the removal does. */
export function RemoveBlockButton({
  blockId,
  title,
  description,
}: {
  blockId: string;
  /** The name of what is removed, for the dialog title. */
  title: string;
  /** Replaces the generic consequence when there is something more to say (the person is referenced elsewhere). */
  description?: string;
}) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="secondary"
        appearance="link"
        size="small"
        aria-label={t('tracfin:draft.persons.remove_aria', { name: title })}
        onClick={() => setOpen(true)}
      >
        <Icon icon="delete" className="size-4" />
        {t('tracfin:draft.remove_block.action')}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t('tracfin:draft.remove_block.title', { block: title })}
        description={description ?? t('tracfin:draft.remove_block.description')}
        confirmLabel={t('tracfin:draft.remove_block.confirm')}
        destructive
        onConfirm={() => void editor.removeBlock(blockId)}
      />
    </>
  );
}

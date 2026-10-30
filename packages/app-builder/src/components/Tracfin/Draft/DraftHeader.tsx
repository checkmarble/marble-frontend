import { useTranslation } from 'react-i18next';
import { Button, cn, Typo } from 'ui-design-system';
import { useTracfinDraftEditorContext } from './editor/TracfinDraftEditorContext';
import { PrefillButton } from './prefill/PrefillButton';

function SaveState() {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();

  if (editor.status === 'conflict') {
    return <span className="text-red-primary text-s font-medium">{t('tracfin:draft.save_state.conflict')}</span>;
  }
  if (editor.status === 'failed') {
    return (
      <Button variant="secondary" appearance="link" className="text-red-primary" onClick={() => void editor.retry()}>
        {t('tracfin:draft.save_state.failed')}
      </Button>
    );
  }
  const text =
    editor.status === 'saving'
      ? t('tracfin:draft.save_state.saving')
      : editor.pendingCount > 0
        ? t('tracfin:draft.save_state.unsaved', { count: editor.pendingCount })
        : t('tracfin:draft.save_state.saved', { revision: editor.draft.revision });
  return (
    <span
      role="status"
      className={cn('text-s font-medium', editor.pendingCount > 0 ? 'text-orange-primary' : 'text-grey-secondary')}
    >
      {text}
    </span>
  );
}

/** Title, save state and « Enregistrer ». */
export function DraftHeader() {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  return (
    <div className="flex flex-wrap items-start justify-between gap-md">
      <div className="flex flex-col gap-xs">
        <Typo as="h1" variant="title1">
          {t('tracfin:draft.title')}
        </Typo>
        <p className="text-s text-grey-secondary">{t('tracfin:draft.description')}</p>
      </div>
      <div className="flex items-center gap-sm">
        <SaveState />
        <PrefillButton />
        <Button
          variant="primary"
          disabled={editor.status === 'saving' || editor.status === 'conflict' || editor.pendingCount === 0}
          onClick={() => void editor.flush()}
        >
          {t('tracfin:draft.save')}
        </Button>
      </div>
    </div>
  );
}

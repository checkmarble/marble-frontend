import { useBlocker } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';
import { useTracfinDraftEditorContext } from './editor/TracfinDraftEditorContext';

/**
 * Warns before the analyst leaves the page (another route, a reload, closing the tab) with edits that
 * are not saved. Moving between the sections only changes the search params, never the pathname.
 */
export function LeaveGuard() {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const pending = useRef(false);
  pending.current = editor.hasPendingChanges;
  const [saving, setSaving] = useState(false);

  const blocker = useBlocker({
    shouldBlockFn: ({ current, next }) => pending.current && current.pathname !== next.pathname,
    enableBeforeUnload: () => pending.current,
    withResolver: true,
  });

  return (
    <Modal.Root open={blocker.status === 'blocked'} onOpenChange={(open) => !open && blocker.reset?.()}>
      <Modal.Content size="small">
        <Modal.Title>{t('tracfin:draft.leave.title')}</Modal.Title>
        <Modal.Description className="text-s p-md">
          {t('tracfin:draft.leave.description', { count: editor.pendingCount })}
        </Modal.Description>
        <Modal.Footer>
          <Modal.FooterButton
            label={t('tracfin:draft.leave.stay')}
            onClick={() => blocker.reset?.()}
            variant="secondary"
          />
          <Modal.FooterButton
            label={t('tracfin:draft.leave.discard')}
            variant="destructive"
            onClick={() => blocker.proceed?.()}
          />
          <Modal.FooterButton
            label={t('tracfin:draft.leave.save')}
            isLoading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                const result = await editor.flush();
                if (result.ok && !pending.current) blocker.proceed?.();
                else blocker.reset?.();
              } finally {
                setSaving(false);
              }
            }}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

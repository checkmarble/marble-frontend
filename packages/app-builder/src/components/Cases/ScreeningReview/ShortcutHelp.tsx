import { useTranslation } from 'react-i18next';
import { Kbd, Modal } from 'ui-design-system';
import { useScreeningReviewShortcutList } from './shortcuts';

export function ShortcutHelp({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation(['cases', 'common']);
  const shortcuts = useScreeningReviewShortcutList();
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="small">
        <Modal.Title>{t('cases:screening_review.shortcuts.title')}</Modal.Title>
        <Modal.Description className="px-md text-grey-secondary">
          {t('cases:screening_review.shortcuts.description')}
        </Modal.Description>
        {[...new Set(shortcuts.map((shortcut) => shortcut.group))].map((group) => (
          <section key={group} className="p-md">
            <h3 className="mb-sm font-medium">{group}</h3>
            <dl className="flex flex-col gap-sm">
              {shortcuts
                .filter((shortcut) => shortcut.group === group)
                .map((shortcut) => (
                  <div key={shortcut.id} className="flex items-center justify-between gap-md">
                    <dt>{shortcut.name}</dt>
                    <dd>
                      <Kbd dir="ltr" className="rounded border border-grey-border px-sm py-xs font-mono text-s">
                        {shortcut.keys}
                      </Kbd>
                    </dd>
                  </div>
                ))}
            </dl>
          </section>
        ))}
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:close')} />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

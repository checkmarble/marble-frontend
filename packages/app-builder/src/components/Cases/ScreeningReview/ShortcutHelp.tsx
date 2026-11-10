import { useTranslation } from 'react-i18next';
import { Kbd, type KbdProps, Modal, Typo } from 'ui-design-system';
import { SCREENING_REVIEW_SHORTCUT_HELP, type ShortcutHotkey, useShortcutKeyLabels } from './shortcuts';

export function ShortcutKeys({
  hotkeys,
  variant = 'default',
}: {
  hotkeys: readonly ShortcutHotkey[];
  variant?: KbdProps['variant'];
}) {
  const keyLabels = useShortcutKeyLabels();
  return (
    <span dir="ltr" className="inline-flex items-center gap-xs">
      {hotkeys.map((hotkey) => {
        const labels = keyLabels(hotkey);
        return (
          <span key={labels.join('+')} className="inline-flex items-center gap-2xs">
            {labels.map((label) => (
              <Kbd key={label} variant={variant}>
                {label}
              </Kbd>
            ))}
          </span>
        );
      })}
    </span>
  );
}

export function ShortcutHelp({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation(['cases']);
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="small" aria-describedby={undefined}>
        <Modal.Title asChild>
          <Typo variant="title2">{t('cases:screening_review.shortcuts.title')}</Typo>
        </Modal.Title>
        <div className="flex flex-col gap-md p-md">
          {SCREENING_REVIEW_SHORTCUT_HELP.map(({ group, rows }) => (
            <section key={group} className="flex flex-col gap-xs">
              <Typo as="h3" variant="subtitle2" className="text-2xs tracking-wide text-grey-secondary uppercase">
                {t(`cases:screening_review.shortcuts.groups.${group}`)}
              </Typo>
              <dl className="flex flex-col gap-xs">
                {rows.map(({ name, hotkeys }) => (
                  <div key={name} className="flex items-center justify-between gap-md text-small">
                    <dt>{t(`cases:screening_review.shortcuts.${name}`)}</dt>
                    <dd className="shrink-0">
                      <ShortcutKeys hotkeys={hotkeys} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
        <Modal.Footer className="justify-start">
          <Modal.FooterButton
            isCloseButton
            variant="primary"
            label={t('cases:screening_review.shortcuts.back_to_review')}
          >
            <ShortcutKeys hotkeys={['Escape']} variant="small" />
          </Modal.FooterButton>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

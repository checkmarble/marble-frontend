import { formatDateTimeWithoutPresets } from '@app-builder/utils/format';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { ConfirmDialog } from './ConfirmDialog';
import { useTracfinDraftEditorContext } from './editor/TracfinDraftEditorContext';

/**
 * The configuration copied into the draft when it was created (organisation, contact...). Refreshing
 * copies it again and marks every value « à revoir »: it is confirmed first.
 */
export function ConfigurationCard() {
  const { t, i18n } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const [confirming, setConfirming] = useState(false);
  const { configuration } = editor.draft;

  return (
    <section
      aria-label={t('tracfin:draft.configuration.title')}
      className="border-grey-border bg-surface-card flex flex-wrap items-center justify-between gap-md rounded-lg border p-md"
    >
      <div className="flex flex-col gap-2xs">
        <h2 className="text-s font-semibold">{t('tracfin:draft.configuration.title')}</h2>
        <p className="text-grey-secondary text-xs">
          {configuration.revision === 0
            ? t('tracfin:draft.configuration.none')
            : t('tracfin:draft.configuration.copied', {
                revision: configuration.revision,
                date: formatDateTimeWithoutPresets(configuration.updated_at, {
                  language: i18n.language,
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }),
              })}
        </p>
      </div>
      <Button variant="secondary" appearance="stroked" onClick={() => setConfirming(true)}>
        {t('tracfin:draft.configuration.refresh')}
      </Button>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t('tracfin:draft.configuration.refresh_title')}
        description={t('tracfin:draft.configuration.refresh_description')}
        confirmLabel={t('tracfin:draft.configuration.refresh_confirm')}
        onConfirm={() => void editor.refreshConfiguration()}
      />
    </section>
  );
}

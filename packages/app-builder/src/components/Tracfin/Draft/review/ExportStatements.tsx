import type { TracfinExport } from '@app-builder/models/tracfin';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { internalChecksStatus } from './review-layers';

/**
 * The three states an export can be in, kept apart on purpose:
 * 1. the XML exists (« XML exporté »),
 * 2. what the internal checks said of it (never « validé », never « conforme »),
 * 3. whether it was handed to ERMES (it was not, and nobody checked that ERMES accepts it).
 */
export function ExportStatements({ tracfinExport }: { tracfinExport: TracfinExport }) {
  const { t } = useTranslation(['tracfin']);
  const formatDateTime = useFormatDateTime();
  const validation = tracfinExport.validation;
  const status = internalChecksStatus(validation);
  const errors = (validation.diagnostics ?? []).filter((diagnostic) => diagnostic.severity === 'error').length;

  return (
    <ul className="text-s flex flex-col gap-xs" aria-label={t('tracfin:draft.review.statements.label')}>
      <li>
        <strong>
          {t('tracfin:draft.review.statements.exported', {
            date: formatDateTime(tracfinExport.created_at, { dateStyle: 'short', timeStyle: 'short' }),
            revision: tracfinExport.draft_revision,
          })}
        </strong>
      </li>
      <li>{t(`tracfin:draft.review.statements.internal.${status}`, { count: errors })}</li>
      <li>{t('tracfin:draft.review.statements.not_transmitted')}</li>
    </ul>
  );
}

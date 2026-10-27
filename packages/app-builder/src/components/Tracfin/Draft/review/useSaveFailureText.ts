import type { TracfinApiError } from '@app-builder/models/tracfin';
import { useTranslation } from 'react-i18next';

/** Why the unsent edits could not be saved before a check or an export, in French. The action did not run. */
export function useSaveFailureText() {
  const { t } = useTranslation(['tracfin']);
  return (error: TracfinApiError, action: 'validation' | 'export'): string =>
    error.kind === 'conflict'
      ? t(`tracfin:draft.review.save_failed.conflict_${action}`)
      : t(`tracfin:draft.review.save_failed.other_${action}`);
}

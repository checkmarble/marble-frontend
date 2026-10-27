import { TRACFIN_MAX_PIECES } from '@app-builder/models/tracfin';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { ErrorBanner } from '../../Settings/ErrorBanner';
import type { AddPieceError } from './use-add-piece';

/**
 * Why a file did not become a piece. For a server refusal (403, 404, 413, 400, 409) nothing was applied
 * and the other unsent edits are still pending; the text says so.
 */
export function AddPieceErrorBanner({ error, onDismiss }: { error: AddPieceError; onDismiss: () => void }) {
  const { t } = useTranslation(['tracfin']);
  const name = error.file.fileName;
  return (
    <ErrorBanner>
      <p className="font-semibold">
        {t(`tracfin:draft.pieces.errors.${error.reason}`, { name, max: TRACFIN_MAX_PIECES })}
      </p>
      {error.reason === 'invalid' && error.message ? <p className="font-mono text-xs">{error.message}</p> : null}
      {['forbidden', 'not_found', 'too_large', 'invalid'].includes(error.reason) ? (
        <p className="text-xs">{t('tracfin:draft.pieces.errors.nothing_changed')}</p>
      ) : null}
      <Button variant="secondary" appearance="stroked" size="small" className="self-start" onClick={onDismiss}>
        {t('tracfin:draft.pieces.errors.dismiss')}
      </Button>
    </ErrorBanner>
  );
}

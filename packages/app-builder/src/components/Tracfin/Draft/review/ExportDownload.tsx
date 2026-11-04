import type { TracfinExport } from '@app-builder/models/tracfin';
import type { TracfinDownloadFailure } from '@app-builder/services/tracfin/download-export';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ErrorBanner } from '../../Settings/ErrorBanner';
import { useExportDownload } from './use-export-download';

function useFailureText() {
  const { t, i18n } = useTranslation(['tracfin']);
  const number = (value: number) => new Intl.NumberFormat(i18n.language).format(value);
  return (failure: TracfinDownloadFailure): string => {
    switch (failure.kind) {
      case 'truncated':
        return t('tracfin:draft.review.download.failed.truncated', {
          received: number(failure.received),
          expected: number(failure.expected),
        });
      case 'hash_mismatch':
        return t('tracfin:draft.review.download.failed.hash_mismatch');
      case 'auth':
        return t('tracfin:draft.review.download.failed.auth');
      case 'http':
        return t('tracfin:draft.review.download.failed.http', { status: failure.status });
      case 'unexpected_content':
        return t('tracfin:draft.review.download.failed.unexpected_content', {
          contentType: failure.contentType ?? '?',
        });
      case 'network':
        return t('tracfin:draft.review.download.failed.network');
      case 'save_failed':
        return t('tracfin:draft.review.download.failed.save_failed');
      case 'invalid_download_url':
        return t('tracfin:draft.review.download.failed.invalid_download_url');
    }
  };
}

/**
 * « Télécharger le XML » with the integrity checks of the download service. Success is only claimed
 * for a complete body (size checked, and the SHA-256 when the browser can compute it); every failure
 * says that nothing was saved, and « Réessayer » downloads the same export again.
 */
export function ExportDownload({ tracfinExport, caseId }: { tracfinExport: TracfinExport; caseId: string }) {
  const { t } = useTranslation(['tracfin']);
  const failureText = useFailureText();
  const { state, download } = useExportDownload(tracfinExport, caseId);
  const downloading = state.kind === 'downloading';

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex flex-wrap items-center gap-sm">
        <Button variant="secondary" appearance="stroked" disabled={downloading} onClick={() => void download()}>
          <Icon icon="download" className="size-4" />
          {t('tracfin:draft.review.download.action')}
        </Button>
        {downloading ? (
          <span role="status" className="text-s text-grey-secondary">
            {t('tracfin:draft.review.download.downloading')}
          </span>
        ) : null}
      </div>

      {state.kind === 'done' ? (
        <div role="status" className="text-s flex flex-wrap items-center gap-x-sm gap-y-2xs">
          <span>{t('tracfin:draft.review.download.done')}</span>
          <span>{t('tracfin:draft.review.download.size_verified')}</span>
          <span>
            {state.result.sha256Verified
              ? t('tracfin:draft.review.download.hash_verified')
              : t('tracfin:draft.review.download.hash_not_verified')}
          </span>
        </div>
      ) : null}

      {state.kind === 'failed' ? (
        <ErrorBanner>
          <p className="font-semibold">{failureText(state.failure)}</p>
          {state.failure.kind === 'http' && state.failure.message ? (
            <p className="font-mono text-xs break-words">{state.failure.message}</p>
          ) : null}
          <p className="text-xs">{t('tracfin:draft.review.download.nothing_saved')}</p>
          <div className="flex flex-wrap items-center gap-sm">
            {state.failure.kind === 'auth' ? (
              <a
                href="/sign-in"
                target="_blank"
                rel="noreferrer"
                className="text-s text-purple-primary font-medium underline"
              >
                {t('tracfin:draft.review.download.sign_in')}
              </a>
            ) : null}
            <Button variant="secondary" appearance="stroked" size="small" onClick={() => void download()}>
              {t('tracfin:draft.review.download.retry')}
            </Button>
          </div>
        </ErrorBanner>
      ) : null}
    </div>
  );
}

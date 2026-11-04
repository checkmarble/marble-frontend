import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { describeConfigurationErrorCode } from './configuration-error-text';
import type { TracfinSaveFailure } from './configuration-errors';
import { ErrorBanner } from './ErrorBanner';

type SaveFailureBannerProps = {
  failure: TracfinSaveFailure;
  /** Codes the page could not attach to a mapping or a setting. */
  general: { code: string; fieldId: string | null }[];
  isReloading: boolean;
  reloadFailed: boolean;
  /** A comparison with the server version is already on screen. */
  comparing: boolean;
  onReload: () => void;
};

export function SaveFailureBanner({
  failure,
  general,
  isReloading,
  reloadFailed,
  comparing,
  onReload,
}: SaveFailureBannerProps) {
  const { t } = useTranslation(['tracfin']);

  switch (failure.kind) {
    case 'conflict':
      return (
        <ErrorBanner>
          <p className="font-semibold">{t('tracfin:settings.errors.conflict.title')}</p>
          <p>{t('tracfin:settings.errors.conflict.description')}</p>
          {reloadFailed ? <p>{t('tracfin:settings.errors.conflict.reload_failed')}</p> : null}
          {comparing ? null : (
            <Button
              variant="secondary"
              appearance="stroked"
              className="self-start"
              disabled={isReloading}
              onClick={onReload}
            >
              {t('tracfin:settings.errors.conflict.reload')}
            </Button>
          )}
        </ErrorBanner>
      );
    case 'invalid':
      return (
        <ErrorBanner>
          <p className="font-semibold">{t('tracfin:settings.errors.invalid.title')}</p>
          <p>{t('tracfin:settings.errors.invalid.description')}</p>
          {general.length > 0 ? (
            <ul className="list-disc ps-md" aria-label={t('tracfin:settings.errors.general')}>
              {general.map((error, index) => (
                <li key={`${error.code}-${error.fieldId ?? ''}-${index}`}>
                  {describeConfigurationErrorCode(t, error.code)}
                  {error.fieldId ? <span className="font-mono text-xs"> ({error.fieldId})</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </ErrorBanner>
      );
    case 'rejected':
      return (
        <ErrorBanner>
          <p className="font-semibold">{t('tracfin:settings.errors.rejected.title')}</p>
          <p>{t('tracfin:settings.errors.rejected.description')}</p>
          {failure.message ? <p className="font-mono text-xs">{failure.message}</p> : null}
        </ErrorBanner>
      );
    case 'forbidden':
      return (
        <ErrorBanner>
          <p>{t('tracfin:settings.errors.forbidden')}</p>
        </ErrorBanner>
      );
    case 'too_large':
      return (
        <ErrorBanner>
          <p>{t('tracfin:settings.errors.too_large')}</p>
        </ErrorBanner>
      );
    case 'unavailable':
      return (
        <ErrorBanner>
          <p className="font-semibold">{t('tracfin:settings.errors.unavailable')}</p>
          {failure.message ? <p className="font-mono text-xs">{failure.message}</p> : null}
        </ErrorBanner>
      );
  }
}

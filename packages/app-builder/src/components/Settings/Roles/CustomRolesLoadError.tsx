import { useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';

export function CustomRolesLoadError() {
  const { t } = useTranslation(['settings']);
  const router = useRouter();

  return (
    <div role="alert" className="flex items-center gap-sm">
      <span>{t('settings:custom_roles.load_error')}</span>
      <Button variant="secondary" appearance="stroked" onClick={() => void router.invalidate()}>
        {t('settings:custom_roles.retry')}
      </Button>
    </div>
  );
}

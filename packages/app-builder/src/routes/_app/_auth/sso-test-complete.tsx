import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { SSO_TEST_CHANNEL } from '@app-builder/components/Settings/Sso/use-sso-test-sign-in';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Typo } from 'ui-design-system';

// Popup landing page of the SSO test sign-in: it tells the settings page the code is stored, then closes itself.
export const Route = createFileRoute('/_app/_auth/sso-test-complete')({
  staticData: {
    i18n: authI18n,
  },
  component: SsoTestComplete,
});

function SsoTestComplete() {
  const { t } = useTranslation(['auth']);

  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(SSO_TEST_CHANNEL);
      channel.postMessage({ type: 'done' });
      channel.close();
    }
    window.close();
  }, []);

  return (
    <Typo variant="title2" className="text-center">
      {t('auth:sso_test_complete')}
    </Typo>
  );
}

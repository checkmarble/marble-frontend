import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { CtaClassName } from 'ui-design-system';
import { ExternalLink } from '../ExternalLink';

export function SignInFirstConnection({ showAskDemoButton }: { showAskDemoButton?: boolean }) {
  const { t } = useTranslation(['auth']);

  return (
    <>
      <Link className={CtaClassName({ variant: 'secondary' })} to="/sign-up">
        {t('auth:sign_up.set_password')}
      </Link>
      {showAskDemoButton ? (
        <ExternalLink
          className={CtaClassName({ variant: 'secondary' })}
          href="https://www.checkmarble.com/demo-fraud"
        >
          {t('auth:sign_up.no_account')}
        </ExternalLink>
      ) : null}
    </>
  );
}

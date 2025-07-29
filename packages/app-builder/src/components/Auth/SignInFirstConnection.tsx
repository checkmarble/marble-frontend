import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { CtaClassName } from 'ui-design-system';
import { ExternalLink } from '../ExternalLink';

export function SignInFirstConnection({
  isSignInHomepage,
  showAskDemoButton,
}: {
  isSignInHomepage: boolean;
  showAskDemoButton?: boolean;
}) {
  const { t } = useTranslation(['auth']);

  return (
    <>
      <Link className={CtaClassName({ variant: 'secondary' })} to={getRoute('/create-password')}>
        {t(
          isSignInHomepage
            ? 'auth:sign_up.set_password_sign_in'
            : 'auth:sign_up.set_password_sign_in_email',
        )}
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

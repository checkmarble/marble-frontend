import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { CtaV2ClassName } from 'ui-design-system';

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
      <Link
        className={CtaV2ClassName({
          variant: 'secondary',
          size: 'large',
          className: 'w-full justify-center text-center h-auto min-h-10 py-sm',
        })}
        to="/create-password"
      >
        {t(isSignInHomepage ? 'auth:sign_up.set_password_sign_in' : 'auth:sign_up.set_password_sign_in_email')}
      </Link>
      {showAskDemoButton ? (
        <a
          className={CtaV2ClassName({
            variant: 'secondary',
            size: 'large',
            className: 'w-full justify-center text-center h-auto min-h-10 py-sm',
          })}
          href="https://www.checkmarble.com/demo-fraud"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('auth:sign_up.no_account')}
        </a>
      ) : null}
    </>
  );
}

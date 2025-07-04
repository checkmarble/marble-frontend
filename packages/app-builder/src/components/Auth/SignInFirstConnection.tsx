import { Link } from '@remix-run/react';
import { CtaClassName } from 'ui-design-system';
import { ExternalLink } from '../ExternalLink';

export function SignInFirstConnection({ showAskDemoButton }: { showAskDemoButton?: boolean }) {
  const isMarbleSaaS = true;

  return (
    <>
      <Link className={CtaClassName({ variant: 'secondary' })} to="/sign-up">
        I have an account, set my password
      </Link>
      {showAskDemoButton && isMarbleSaaS ? (
        <ExternalLink
          className={CtaClassName({ variant: 'secondary' })}
          href="https://www.checkmarble.com/demo-fraud"
        >
          I don't have an account
        </ExternalLink>
      ) : null}
    </>
  );
}

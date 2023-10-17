import {
  Decisions,
  type DecisionsLinkProps,
  ErrorComponent,
} from '@app-builder/components';
import { DecisionsPage } from '@app-builder/components/Decisions';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { Decision } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['navigation'] satisfies Namespace,
};

const LINKS: DecisionsLinkProps[] = [
  {
    labelTKey: 'navigation:decisions.decisions',
    to: getRoute('/decisions/last-decisions'),
    Icon: Decision,
  },
  {
    labelTKey: 'navigation:decisions.scheduledExecution',
    to: getRoute('/decisions/scheduled-executions'),
    Icon: Decision,
  },
];

export default function DecisionsLayout() {
  const { t } = useTranslation(handle.i18n);

  return (
    <DecisionsPage.Container>
      <DecisionsPage.Header>
        <Decision className="mr-2" height="24px" width="24px" />
        {t('navigation:decisions')}
      </DecisionsPage.Header>

      <DecisionsPage.Content scrollable={false}>
        <Decisions.Nav>
          {LINKS.map((linkProps) => (
            <li key={linkProps.labelTKey}>
              <Decisions.Link {...linkProps} />
            </li>
          ))}
        </Decisions.Nav>
        <Outlet />
      </DecisionsPage.Content>
    </DecisionsPage.Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  return <ErrorComponent error={error} />;
}

import {
  Decisions,
  type DecisionsLinkProps,
  ErrorComponent,
  Page,
} from '@app-builder/components';
import { Outlet, useRouteError } from '@remix-run/react';
import { Decision as DecisionIcon } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';

import { DecisionsRightPanel } from '../ressources/decisions/decision-detail.$decisionId';

export const handle = {
  i18n: ['decisions', 'scheduledExecution', 'navigation'] satisfies Namespace,
};

const LINKS: DecisionsLinkProps[] = [
  {
    labelTKey: 'navigation:decisions.decisions',
    to: './last-decisions',
    Icon: DecisionIcon,
  },
  {
    labelTKey: 'navigation:decisions.scheduledExecution',
    to: './scheduled-executions',
    Icon: DecisionIcon,
  },
];

export default function DecisionsPage() {
  const { t } = useTranslation(['navigation']);

  return (
    <Page.Container>
      <Page.Header>
        <DecisionIcon className="mr-2" height="24px" width="24px" />
        {t('navigation:decisions')}
      </Page.Header>

      <Page.Header className="border-b-0">
        <Decisions.Nav>
          {LINKS.map((linkProps) => (
            <li key={linkProps.labelTKey}>
              <Decisions.Link {...linkProps} />
            </li>
          ))}
        </Decisions.Nav>
      </Page.Header>

      <DecisionsRightPanel.Root>
        <Page.Content scrollable={false}>
          <Outlet />
        </Page.Content>
      </DecisionsRightPanel.Root>
    </Page.Container>
  );
}

export function ErrorBoundary() {
  return <ErrorComponent error={useRouteError()} />;
}

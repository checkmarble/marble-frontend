import { DecisionsRightPanel } from '@app-builder/routes/ressources/decisions/decision-detail.$decisionId';
import { getRoute } from '@app-builder/utils/routes';
import { useLocation } from '@remix-run/react';

import { Page, type PageContentProps } from '../Page';

function DecisionsPageContent({ children, ...props }: PageContentProps) {
  const location = useLocation();

  if (location.pathname === getRoute('/decisions/last-decisions')) {
    return (
      <DecisionsRightPanel.Root className="overflow-hidden">
        <Page.Content {...props}>{children}</Page.Content>
      </DecisionsRightPanel.Root>
    );
  }
  return <Page.Content {...props}>{children}</Page.Content>;
}

export const DecisionsPage = {
  Container: Page.Container,
  Header: Page.Header,
  BackButton: Page.BackButton,
  Content: DecisionsPageContent,
};

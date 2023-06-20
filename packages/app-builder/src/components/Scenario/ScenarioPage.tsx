import { Page, type PageContentProps } from '../Page';
import { ScenarioRightPanel } from './ScenarioRightPanel';

function ScenarioPageContent({ children, ...props }: PageContentProps) {
  return (
    <ScenarioRightPanel.Root className="overflow-hidden">
      <Page.Content {...props}>{children}</Page.Content>
    </ScenarioRightPanel.Root>
  );
}

export const ScenarioPage = {
  Container: Page.Container,
  Header: Page.Header,
  BackButton: Page.BackButton,
  Content: ScenarioPageContent,
};

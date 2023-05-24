import { Page } from '../Page';
import { ScenarioRightPanel } from './ScenarioRightPanel';

function ScenarioPageContent({
  children,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <ScenarioRightPanel.Root>
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

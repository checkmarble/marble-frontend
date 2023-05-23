import { Page } from '../Page';
import { ScenarioRightPannel } from './ScenarioRightPannel';

function ScenarioPageContent({
  children,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <ScenarioRightPannel.Root>
      <Page.Content {...props}>{children}</Page.Content>
    </ScenarioRightPannel.Root>
  );
}

export const ScenarioPage = {
  Container: Page.Container,
  Header: Page.Header,
  BackButton: Page.BackButton,
  Content: ScenarioPageContent,
};

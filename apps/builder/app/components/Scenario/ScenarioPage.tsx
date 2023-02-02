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
    <div className="relative h-full w-full">
      <ScenarioRightPannel.Provider>
        <Page.Content {...props}>{children}</Page.Content>
      </ScenarioRightPannel.Provider>
    </div>
  );
}

export const ScenarioPage = {
  Container: Page.Container,
  Header: Page.Header,
  BackButton: Page.BackButton,
  Content: ScenarioPageContent,
};

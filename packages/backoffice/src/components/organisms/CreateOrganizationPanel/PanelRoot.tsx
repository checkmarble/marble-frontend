import { Panel } from 'ui-design-system';

export const PanelRoot = ({ children }: { children: React.ReactNode }) => {
  return (
    <Panel.Container size="medium">
      <Panel.Content>
        <Panel.Header>Create a new organization</Panel.Header>
        <div>{children}</div>
      </Panel.Content>
    </Panel.Container>
  );
};

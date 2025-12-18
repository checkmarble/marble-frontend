import { PanelContainer, PanelContent, PanelHeader } from 'ui-design-system';

export const PanelRoot = ({ children }: { children: React.ReactNode }) => {
  return (
    <PanelContainer size="xxl">
      <PanelHeader>Create a new organization</PanelHeader>
      <PanelContent>{children}</PanelContent>
    </PanelContainer>
  );
};

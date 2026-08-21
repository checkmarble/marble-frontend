import { useState } from 'react';
import { match } from 'ts-pattern';
import { Panel } from 'ui-design-system';
import { ChoiceStep } from './ChoiceStep';
import { ImportFlow } from './ImportFlow';
import { OrganizationCreationFlow } from './types';

export const CreateOrganizationPanel = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [flow, setFlow] = useState<OrganizationCreationFlow | null>(null);
  const handleChooseFlow = (choice: OrganizationCreationFlow) => {
    setFlow(choice);
  };

  const handleOnOpenChange = (open: boolean) => {
    if (!open) {
      setFlow(null);
    }
    onOpenChange(open);
  };

  return (
    <Panel.Root open={open} onOpenChange={handleOnOpenChange}>
      <Panel.Container size="medium">
        <Panel.Content>
          <Panel.Header>Create a new organization</Panel.Header>
          <div>
            {match(flow)
              .with(null, () => <ChoiceStep onChooseFlow={handleChooseFlow} />)
              .with({ type: 'import' }, ({ data }) => <ImportFlow data={data} />)
              .exhaustive()}
          </div>
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
};

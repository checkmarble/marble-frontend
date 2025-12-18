import { useState } from 'react';
import { match } from 'ts-pattern';
import { ChoiceStep } from './ChoiceStep';
import { ImportFlow } from './ImportFlow';
import { PanelRoot } from './PanelRoot';
import { OrganizationCreationFlow } from './types';

export const CreateOrganizationPanel = () => {
  const [flow, setFlow] = useState<OrganizationCreationFlow | null>(null);
  const handleChooseFlow = (choice: OrganizationCreationFlow) => {
    setFlow(choice);
  };

  return (
    <PanelRoot>
      {match(flow)
        .with(null, () => <ChoiceStep onChooseFlow={handleChooseFlow} />)
        .with({ type: 'import' }, ({ data }) => <ImportFlow data={data} />)
        .with({ type: 'template' }, ({ data }) => <></>)
        .exhaustive()}
    </PanelRoot>
  );
};

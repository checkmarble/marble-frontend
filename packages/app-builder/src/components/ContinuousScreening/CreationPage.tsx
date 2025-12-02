import { BreadCrumbs } from '../Breadcrumbs';
import { Page } from '../Page';
import { CreationStepperSharp } from './context/CreationStepper';
import { CreationContent } from './creation/Content';
import { Stepper } from './creation/Stepper';

export const CreationPage = ({ name, description }: { name: string; description: string }) => {
  const creationStepper = CreationStepperSharp.createSharp({ name, description });

  return (
    <CreationStepperSharp.Provider value={creationStepper}>
      <Page.Main>
        <Page.Header className="justify-between">
          <BreadCrumbs />
          <Stepper />
        </Page.Header>
        <Page.Container>
          <Page.ContentV2>
            <CreationContent />
          </Page.ContentV2>
        </Page.Container>
      </Page.Main>
    </CreationStepperSharp.Provider>
  );
};

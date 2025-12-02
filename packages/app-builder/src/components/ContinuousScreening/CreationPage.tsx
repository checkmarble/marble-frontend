import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { PrevalidationCreateContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { useCreateContinuousScreeningConfigurationMutation } from '@app-builder/queries/continuous-screening/create-configuration';
import { useCallbackRef } from '@marble/shared';
import { BreadCrumbs } from '../Breadcrumbs';
import { Page } from '../Page';
import { ContinuousScreeningCreationStepper } from './context/CreationStepper';
import { CreationContent } from './creation/Content';
import { Stepper } from './creation/Stepper';

export const CreationPage = ({ name, description }: { name: string; description: string }) => {
  const revalidate = useLoaderRevalidator();
  const createConfigurationMutation = useCreateContinuousScreeningConfigurationMutation();
  const handleSubmit = useCallbackRef((value: PrevalidationCreateContinuousScreeningConfig) => {
    createConfigurationMutation.mutateAsync(value).then((_) => {
      revalidate();
    });
  });
  const creationStepper = ContinuousScreeningCreationStepper.createSharp(
    {
      mappingConfigs: [],
      matchThreshold: 70,
      matchLimit: 10,
      inboxId: null,
      inboxName: null,
      datasets: {},
      name,
      description,
    },
    handleSubmit,
  );

  return (
    <ContinuousScreeningCreationStepper.Provider value={creationStepper}>
      <Page.Main>
        <Page.Header className="justify-between">
          <BreadCrumbs />
          <Stepper />
        </Page.Header>
        <Page.Container>
          <Page.ContentV2 paddingLess>
            <CreationContent />
          </Page.ContentV2>
        </Page.Container>
      </Page.Main>
    </ContinuousScreeningCreationStepper.Provider>
  );
};

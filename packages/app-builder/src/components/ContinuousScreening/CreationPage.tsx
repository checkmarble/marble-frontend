import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { PrevalidationCreateContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { useCreateContinuousScreeningConfigurationMutation } from '@app-builder/queries/continuous-screening/create-configuration';
import { useCallbackRef } from '@marble/shared';
import { useTranslation } from 'react-i18next';
import { BreadCrumbs } from '../Breadcrumbs';
import { Page } from '../Page';
import { ContinuousScreeningConfigurationStepper } from './context/CreationStepper';
import { CreationContent } from './form/Content';
import { Stepper } from './form/Stepper';

export const CreationPage = ({ name, description }: { name: string; description: string }) => {
  const { t } = useTranslation(['continuousScreening']);
  const revalidate = useLoaderRevalidator();
  const createConfigurationMutation = useCreateContinuousScreeningConfigurationMutation();
  const handleSubmit = useCallbackRef((value: PrevalidationCreateContinuousScreeningConfig) => {
    createConfigurationMutation.mutateAsync(value).then((_) => {
      revalidate();
    });
  });
  const creationStepper = ContinuousScreeningConfigurationStepper.createSharp(
    'create',
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
    { initialStep: 1 },
  );

  return (
    <ContinuousScreeningConfigurationStepper.Provider value={creationStepper}>
      <Page.Main>
        <Page.Header className="justify-between">
          <BreadCrumbs />
          <Stepper fromZero getStepLabel={(stepName) => t(`continuousScreening:creation.stepper.${stepName}`)} />
        </Page.Header>
        <Page.Container>
          <Page.ContentV2 paddingLess>
            <CreationContent />
          </Page.ContentV2>
        </Page.Container>
      </Page.Main>
    </ContinuousScreeningConfigurationStepper.Provider>
  );
};

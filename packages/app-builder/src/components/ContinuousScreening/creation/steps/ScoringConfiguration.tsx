import { Callout } from '@app-builder/components/Callout';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { computed } from '@preact/signals-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ContinuousScreeningCreationStepper } from '../../context/CreationStepper';
import { Field } from '../../shared/Field';

export const ScoringConfiguration = () => {
  const { t } = useTranslation(['continuousScreening']);
  const matchThreshold = ContinuousScreeningCreationStepper.select((state) => state.data.$matchThreshold);
  const matchLimit = ContinuousScreeningCreationStepper.select((state) => state.data.$matchLimit);
  // const algorithm = CreationStepperSharp.select((state) => state.value.$algorithm);

  return (
    <div className="flex flex-col gap-v2-md">
      <Callout bordered className="bg-white">
        {t('continuousScreening:creation.scoringConfiguration.callout')}
      </Callout>
      <Field
        title={t('continuousScreening:creation.scoringConfiguration.matchThreshold.title')}
        description={t('continuousScreening:creation.scoringConfiguration.matchThreshold.subtitle')}
        callout={t('continuousScreening:creation.scoringConfiguration.matchThreshold.callout')}
      >
        <Input
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={matchThreshold.value}
          onChange={(e) => (matchThreshold.value = e.target.valueAsNumber)}
        />
        <span>%</span>
      </Field>
      <Field
        title={t('continuousScreening:creation.scoringConfiguration.matchLimit.title')}
        description={t('continuousScreening:creation.scoringConfiguration.matchLimit.subtitle')}
        callout={t('continuousScreening:creation.scoringConfiguration.matchLimit.callout')}
      >
        <Input type="number" value={matchLimit.value} onChange={(e) => (matchLimit.value = e.target.valueAsNumber)} />
        <span>hits maximum</span>
      </Field>
      <div className="grid grid-cols-1 gap-v2-md">
        {/* <Field title="Algorithme de scoring" description="Une description pour l'algorithme de scoring.">
          <MenuCommand.Menu>
            <MenuCommand.Trigger>
              <MenuCommand.SelectButton>{algorithm.value}</MenuCommand.SelectButton>
            </MenuCommand.Trigger>
            <MenuCommand.Content side="bottom" align="start" sideOffset={4}>
              <MenuCommand.List>
                <MenuCommand.Item value="default">Default</MenuCommand.Item>
                <MenuCommand.Item value="custom">Custom</MenuCommand.Item>
              </MenuCommand.List>
            </MenuCommand.Content>
          </MenuCommand.Menu>
          <Tooltip.Default delayDuration={200} content="Une description pour l'algorithme de scoring.">
            <Icon icon="tip" className="size-4 shrink-0 cursor-pointer text-purple-65" />
          </Tooltip.Default>
        </Field> */}
        <Field
          title={t('continuousScreening:creation.scoringConfiguration.alertAutomation.title')}
          description={t('continuousScreening:creation.scoringConfiguration.alertAutomation.subtitle')}
        >
          <InboxSelector />
        </Field>
      </div>
    </div>
  );
};

const InboxSelector = () => {
  const { t } = useTranslation(['continuousScreening']);
  const [isOpen, setIsOpen] = useState(false);
  const inboxesQuery = useGetInboxesQuery();
  const creationStepper = ContinuousScreeningCreationStepper.useSharp();
  const inboxId = ContinuousScreeningCreationStepper.select((state) => state.data.$inboxId);
  const inboxName = ContinuousScreeningCreationStepper.select((state) => state.data.$inboxName);

  const currentInboxName = computed(() => {
    return inboxesQuery.data?.inboxes.find((inbox) => inbox.id === inboxId.value)?.name;
  });

  const handleInboxSelect = (inboxId: string) => {
    creationStepper.update((state) => {
      if (state.data.inboxName !== null) {
        state.data.inboxName = null;
      }
      state.data.inboxId = inboxId;
    });
  };

  return (
    <>
      <MenuCommand.Menu open={isOpen} onOpenChange={setIsOpen}>
        <MenuCommand.Trigger>
          <MenuCommand.SelectButton disabled={!inboxesQuery.isSuccess}>
            {currentInboxName.value ??
              t('continuousScreening:creation.scoringConfiguration.alertAutomation.placeholder')}
          </MenuCommand.SelectButton>
        </MenuCommand.Trigger>
        <MenuCommand.Content side="bottom" align="start" sideOffset={4}>
          {inboxesQuery.isSuccess ? (
            <MenuCommand.List>
              {inboxesQuery.data.inboxes.map((inbox) => (
                <MenuCommand.Item onSelect={() => handleInboxSelect(inbox.id)} key={inbox.id} value={inbox.id}>
                  <span>{inbox.name}</span>
                  {inbox.id === inboxId.value ? <Icon icon="tick" className="size-4" /> : null}
                </MenuCommand.Item>
              ))}
            </MenuCommand.List>
          ) : null}
        </MenuCommand.Content>
      </MenuCommand.Menu>

      <span>{t('continuousScreening:creation.scoringConfiguration.alertAutomation.create_new_inbox')}</span>
      <Input
        type="text"
        value={inboxName.value ?? ''}
        onChange={(e) => {
          creationStepper.update((state) => {
            if (state.data.inboxId !== null) {
              state.data.inboxId = null;
            }
            state.data.inboxName = e.target.value.length > 0 ? e.target.value : null;
          });
        }}
      />
    </>
  );
};

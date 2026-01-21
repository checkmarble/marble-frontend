import { Callout } from '@app-builder/components/Callout';
import { Spinner } from '@app-builder/components/Spinner';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2, Input, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ContinuousScreeningCreationStepper } from '../../context/CreationStepper';
import { Field } from '../../shared/Field';

export const ScoringConfiguration = () => {
  const { t } = useTranslation(['continuousScreening']);
  const matchThreshold = ContinuousScreeningCreationStepper.select((state) => state.data.$matchThreshold);
  const matchLimit = ContinuousScreeningCreationStepper.select((state) => state.data.$matchLimit);

  return (
    <div className="flex flex-col gap-v2-md">
      <Callout bordered className="bg-surface-card mx-v2-md">
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
        <span>{t('continuousScreening:creation.scoringConfiguration.matchLimit.text')}</span>
      </Field>
      <div className="grid grid-cols-1 gap-v2-md">
        <Field
          required
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
  const { t } = useTranslation(['common', 'continuousScreening']);
  const [isOpen, setIsOpen] = useState(false);
  const inboxesQuery = useGetInboxesQuery();
  const creationStepper = ContinuousScreeningCreationStepper.useSharp();
  const inboxId = ContinuousScreeningCreationStepper.select((state) => state.data.$inboxId);
  const inboxName = ContinuousScreeningCreationStepper.select((state) => state.data.$inboxName);

  const handleInboxSelect = (inboxId: string) => {
    creationStepper.update((state) => {
      if (state.data.inboxName !== null) {
        state.data.inboxName = null;
      }
      state.data.inboxId = inboxId;
    });
  };

  return match(inboxesQuery)
    .with({ isPending: true }, () => (
      <div>
        <Spinner className="size-6" />
      </div>
    ))
    .with({ isError: true }, () => (
      <div className="flex gap-v2-md items-center">
        <div className="">{t('common:generic_fetch_data_error')}</div>
        <ButtonV2 variant="secondary" onClick={() => inboxesQuery.refetch()}>
          {t('common:retry')}
        </ButtonV2>
      </div>
    ))
    .with({ isSuccess: true }, ({ data }) => {
      const inboxes = data?.inboxes ?? [];
      const currentInboxName = inboxes.find((inbox) => inbox.id === inboxId.value)?.name;

      return (
        <>
          <MenuCommand.Menu open={isOpen} onOpenChange={setIsOpen}>
            <MenuCommand.Trigger>
              <MenuCommand.SelectButton disabled={!inboxesQuery.isSuccess}>
                {currentInboxName ? (
                  currentInboxName
                ) : (
                  <span className="text-grey-placeholder">
                    {t('continuousScreening:creation.scoringConfiguration.alertAutomation.placeholder')}
                  </span>
                )}
              </MenuCommand.SelectButton>
            </MenuCommand.Trigger>
            <MenuCommand.Content side="bottom" align="start" sideOffset={4}>
              <MenuCommand.List>
                {inboxes.map((inbox) => (
                  <MenuCommand.Item onSelect={() => handleInboxSelect(inbox.id)} key={inbox.id} value={inbox.id}>
                    <span>{inbox.name}</span>
                    {inbox.id === inboxId.value ? <Icon icon="tick" className="size-4" /> : null}
                  </MenuCommand.Item>
                ))}
              </MenuCommand.List>
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
    })
    .exhaustive();
};

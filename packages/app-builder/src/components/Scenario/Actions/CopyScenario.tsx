import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useCopyScenarioMutation } from '@app-builder/queries/scenarios/copy-scenario';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { z } from 'zod/v4';

const copyScenarioFormSchema = z.object({
  name: z.string(),
});

export function CopyScenario({
  children,
  scenarioId,
  scenarioName,
}: {
  children: React.ReactElement;
  scenarioId: string;
  scenarioName: string;
}) {
  return (
    <Modal.Root>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <CopyScenarioContent scenarioId={scenarioId} scenarioName={scenarioName} />
      </Modal.Content>
    </Modal.Root>
  );
}

function CopyScenarioContent({ scenarioId, scenarioName }: { scenarioId: string; scenarioName: string }) {
  const { t } = useTranslation(['scenarios', 'common']);
  const copyScenarioMutation = useCopyScenarioMutation();

  const form = useForm({
    defaultValues: {
      name: '',
    },
    onSubmit: async ({ value }) => {
      await copyScenarioMutation.mutateAsync({
        scenarioId,
        name: value.name || t('scenarios:copy_scenario.name_placeholder', { name: scenarioName }),
      });
    },
    validators: {
      onSubmitAsync: copyScenarioFormSchema,
    },
  });

  return (
    <form onSubmit={handleSubmit(form)}>
      <Modal.Title>{t('scenarios:copy_scenario.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <p className="text-s text-grey-secondary">{t('scenarios:copy_scenario.description', { name: scenarioName })}</p>
        <form.Field name="name">
          {(field) => (
            <div className="group flex w-full flex-col gap-2">
              <FormLabel name={field.name}>{t('scenarios:copy_scenario.name')}</FormLabel>
              <FormInput
                type="text"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                valid={field.state.meta.errors.length === 0}
                placeholder={t('scenarios:copy_scenario.name_placeholder', { name: scenarioName })}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
      </div>
      <Modal.Footer>
        <Modal.Close asChild>
          <Button className="flex-1" variant="secondary" appearance="stroked">
            {t('common:cancel')}
          </Button>
        </Modal.Close>
        <Button className="flex-1" variant="primary" type="submit">
          {t('scenarios:copy_scenario.button')}
        </Button>
      </Modal.Footer>
    </form>
  );
}

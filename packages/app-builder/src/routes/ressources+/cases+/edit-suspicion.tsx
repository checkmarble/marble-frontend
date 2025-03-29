import { casesI18n } from '@app-builder/components/Cases/cases-i18n';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { match } from 'ts-pattern';
import { Button, cn, MenuCommand } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: [...casesI18n, 'common'] satisfies Namespace,
};

const schema = z.object({
  suspicion: z.enum(['none', 'requested', 'reported']),
  caseId: z.string(),
});

type EditSuspicionForm = z.infer<typeof schema>;

const getSuspicionIconAndText = (suspicion: EditSuspicionForm['suspicion']) => (
  <span className="inline-flex w-full items-center gap-2">
    <Icon
      icon={match<EditSuspicionForm['suspicion'], IconName>(suspicion)
        .with('none', () => 'empty-flag')
        .with('requested', () => 'half-flag')
        .with('reported', () => 'full-flag')
        .exhaustive()}
      className={cn('size-5', {
        'text-grey-50': suspicion === 'none',
        'text-yellow-50': suspicion === 'requested',
        'text-red-47': suspicion === 'reported',
      })}
    />
    <span className="text-s font-medium">
      {match(suspicion)
        .with('none', () => 'None')
        .with('requested', () => 'Request a Suspicious Activity Report')
        .with('reported', () => 'Suspicious Activity report submitted')
        .exhaustive()}
    </span>
  </span>
);

export const EditCaseSuspicion = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: { caseId: id, suspicion: 'none' } as EditSuspicionForm,
    validators: {
      onChange: schema,
      onBlur: schema,
      onSubmit: schema,
    },
  });

  return (
    <form.Field name="suspicion">
      {(field) => (
        <div className="flex w-full gap-1">
          <div className="flex items-center gap-2">
            {getSuspicionIconAndText(field.state.value)}
            <MenuCommand.Menu open={open} onOpenChange={setOpen}>
              <MenuCommand.Trigger>
                <Button className="w-fit p-0.5" variant="secondary" size="icon">
                  <Icon icon="edit-square" className="text-grey-50 size-4" />
                </Button>
              </MenuCommand.Trigger>
              <MenuCommand.Content className="mt-2 min-w-[400px]">
                <MenuCommand.List>
                  {(['none', 'requested', 'reported'] as const).map((suspicion) => (
                    <MenuCommand.Item
                      key={suspicion}
                      className="cursor-pointer"
                      onSelect={() => {
                        field.handleChange(suspicion);
                        form.handleSubmit();
                      }}
                    >
                      <span className="inline-flex w-full justify-between">
                        {getSuspicionIconAndText(suspicion)}
                        {suspicion === field.state.value ? (
                          <Icon icon="tick" className="text-purple-65 size-6" />
                        ) : null}
                      </span>
                    </MenuCommand.Item>
                  ))}
                </MenuCommand.List>
              </MenuCommand.Content>
            </MenuCommand.Menu>
          </div>
          <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
        </div>
      )}
    </form.Field>
  );
};

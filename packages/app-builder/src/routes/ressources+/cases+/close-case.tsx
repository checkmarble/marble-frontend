import { casesI18n } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { FormTextArea } from '@app-builder/components/Form/Tanstack/FormTextArea';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, cn, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: [...casesI18n, 'common'] satisfies Namespace,
};

const statuses = ['false-positive', 'valuable-alert', 'confirmed-risk'] as const;

type Status = (typeof statuses)[number];

const schema = z.object({
  caseId: z.string(),
  status: z.enum(statuses),
  comment: z.string(),
});

type Schema = z.infer<typeof schema>;

export const CloseCase = ({ id }: { id: string }) => {
  const { t } = useTranslation(handle.i18n);

  const form = useForm({
    defaultValues: { caseId: id, status: 'false-positive', comment: '' } as Schema,
    validators: {
      onChange: schema,
      onBlur: schema,
      onSubmit: schema,
    },
  });

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button variant="primary" size="medium" className="flex-1 first-letter:capitalize">
          <Icon icon="save" className="size-5" />
          Close case
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>Close case</Modal.Title>
        <form onSubmit={handleSubmit(form)} className="flex flex-col gap-8 p-8">
          <form.Field name="status">
            {(field) => (
              <div className="flex flex-col gap-2">
                <FormLabel name={field.name}>Choose a status</FormLabel>
                <RadioGroup
                  name={field.name}
                  onValueChange={(v) => field.handleChange(v as Status)}
                  onBlur={field.handleBlur}
                  className="flex items-center gap-1"
                >
                  {statuses.map((s) => {
                    return (
                      <RadioGroupItem
                        key={s}
                        value={s}
                        className="border-grey-90 data-[state=checked]:border-purple-60 flex items-center justify-center rounded-[20px] border bg-transparent p-1.5"
                      >
                        <span
                          className={cn('rounded-[20px] px-2 py-[3px] text-xs', {
                            'bg-red-95 text-red-47': s === 'confirmed-risk',
                            'bg-grey-95 text-grey-50': s === 'false-positive',
                            'bg-yellow-90 text-yellow-50': s === 'valuable-alert',
                          })}
                        >
                          {match(s)
                            .with('confirmed-risk', () => 'Confirmed risk')
                            .with('valuable-alert', () => 'Valuable alert')
                            .with('false-positive', () => 'False positive')
                            .exhaustive()}
                        </span>
                      </RadioGroupItem>
                    );
                  })}
                </RadioGroup>
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
          <form.Field name="comment">
            {(field) => (
              <div className="flex flex-col gap-2">
                <FormLabel name={field.name}>Add a comment</FormLabel>
                <FormTextArea
                  name={field.name}
                  defaultValue={field.state.value}
                  placeholder="Input your comment here"
                  valid={field.state.meta.errors.length === 0}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
          <div className="flex w-full flex-row gap-2">
            <Modal.Close asChild>
              <Button variant="secondary" type="button" className="flex-1 first-letter:capitalize">
                {t('common:cancel')}
              </Button>
            </Modal.Close>

            <Button type="submit" className="flex-1 first-letter:capitalize">
              Close
            </Button>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};

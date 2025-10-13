import { casesI18n } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { FormTextArea } from '@app-builder/components/Form/Tanstack/FormTextArea';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type FinalOutcome, finalOutcomes } from '@app-builder/models/cases';
import {
  CloseCasePayload,
  closeCasePayloadSchema,
  useCloseCaseMutation,
} from '@app-builder/queries/cases/close-case';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, ButtonV2, cn, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const CloseCase = ({ id }: { id: string }) => {
  const { t } = useTranslation(casesI18n);
  const closeCaseMutation = useCloseCaseMutation();
  const revalidate = useLoaderRevalidator();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      caseId: id,
      comment: '',
      outcome: undefined,
    } as CloseCasePayload,
    onSubmit: ({ value }) => {
      closeCaseMutation.mutateAsync(value).then((res) => {
        if (res.success) {
          setOpen(false);
        }
        revalidate();
      });
    },
    validators: {
      onSubmit: closeCasePayloadSchema,
    },
  });

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <ButtonV2 variant="primary" className="flex-1 first-letter:capitalize">
          <Icon icon="save" className="size-3.5" />
          {t('cases:case.close')}
        </ButtonV2>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('cases:case.close')}</Modal.Title>
        <form onSubmit={handleSubmit(form)} className="flex flex-col gap-8 p-8">
          <form.Field
            name="outcome"
            validators={{
              onChange: closeCasePayloadSchema.shape.outcome,
              onBlur: closeCasePayloadSchema.shape.outcome,
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-2">
                {/* TODO: translation keys */}
                <FormLabel name={field.name}>Choose a status</FormLabel>
                <RadioGroup
                  name={field.name}
                  onValueChange={(v) => field.handleChange(v as FinalOutcome)}
                  onBlur={field.handleBlur}
                  className="flex items-center gap-1"
                >
                  {finalOutcomes.map((s) => {
                    return (
                      <RadioGroupItem
                        key={s}
                        value={s}
                        className="border-grey-90 data-[state=checked]:border-purple-60 flex items-center justify-center rounded-[20px] border bg-transparent p-1.5"
                      >
                        <span
                          className={cn('rounded-[20px] px-2 py-[3px] text-xs', {
                            'bg-red-95 text-red-47': s === 'confirmed_risk',
                            'bg-grey-95 text-grey-50': s === 'false_positive',
                            'bg-yellow-90 text-yellow-50': s === 'valuable_alert',
                          })}
                        >
                          {match(s)
                            .with('confirmed_risk', () => 'Confirmed risk')
                            .with('valuable_alert', () => 'Valuable alert')
                            .with('false_positive', () => 'False positive')
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
          <form.Field
            name="comment"
            validators={{
              onChange: closeCasePayloadSchema.shape.comment,
              onBlur: closeCasePayloadSchema.shape.comment,
            }}
          >
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

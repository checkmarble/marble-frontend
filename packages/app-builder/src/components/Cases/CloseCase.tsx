import { casesI18n } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { type FinalOutcome, finalOutcomes } from '@app-builder/models/cases';
import { CloseCasePayload, closeCasePayloadSchema, useCloseCaseMutation } from '@app-builder/queries/cases/close-case';
import { getFieldErrors, handleSubmit, submitOnCtrlEnter } from '@app-builder/utils/form';
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, cn, Modal, TextArea } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const CloseCase = ({
  id,
  disabled,
  withoutOutcome,
}: {
  id: string;
  disabled?: boolean;
  withoutOutcome?: boolean;
}) => {
  const { t } = useTranslation([...casesI18n, 'common']);
  const closeCaseMutation = useCloseCaseMutation();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      caseId: id,
      comment: '',
      outcome: undefined,
    } as CloseCasePayload,
    onSubmit: async ({ value }) => {
      try {
        await closeCaseMutation.mutateAsync(value);
        setOpen(false);
        router.invalidate();
      } catch {
        toast.error(t('common:errors.unknown'));
      }
    },
    validators: {
      onSubmit: closeCasePayloadSchema,
    },
  });

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button variant="primary" className="flex-1 first-letter:capitalize" disabled={disabled}>
          <Icon icon="save" className="size-3.5" />
          {t('cases:case.close')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('cases:case.close')}</Modal.Title>
        <form onSubmit={handleSubmit(form)}>
          <div className="flex flex-col gap-xl p-xl">
            {!withoutOutcome ? (
              <form.Field
                name="outcome"
                validators={{
                  onChange: closeCasePayloadSchema.shape.outcome,
                  onBlur: closeCasePayloadSchema.shape.outcome,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-sm">
                    <label htmlFor={field.name}>{t('cases:case.close.choose_outcome')}</label>
                    <RadioGroup
                      name={field.name}
                      onValueChange={(v) => field.handleChange(v as FinalOutcome)}
                      onBlur={field.handleBlur}
                      className="flex items-center gap-xs rtl:flex-row-reverse"
                    >
                      {finalOutcomes.map((s) => {
                        return (
                          <RadioGroupItem
                            key={s}
                            value={s}
                            className="border-grey-border data-[state=checked]:border-purple-hover flex items-center justify-center rounded-[20px] border bg-transparent p-xs"
                          >
                            <span
                              className={cn('rounded-full border px-sm py-2xs text-xs', {
                                'border-red-primary text-red-primary': s === 'confirmed_risk',
                                'border-green-secondary text-green-secondary': s === 'false_positive',
                                'border-orange-primary text-orange-primary': s === 'valuable_alert',
                              })}
                            >
                              {match(s)
                                .with('confirmed_risk', () => t('cases:case.outcome.confirmed_risk'))
                                .with('valuable_alert', () => t('cases:case.outcome.valuable_alert'))
                                .with('false_positive', () => t('cases:case.outcome.false_positive'))
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
            ) : null}
            <form.Field
              name="comment"
              validators={{
                onChange: closeCasePayloadSchema.shape.comment,
                onBlur: closeCasePayloadSchema.shape.comment,
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-sm">
                  <TextArea
                    id={field.name}
                    name={field.name}
                    defaultValue={field.state.value}
                    placeholder={t('cases:case.close.add_comment_placeholder')}
                    aria-invalid={field.state.meta.errors.length > 0 || undefined}
                    borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onKeyDown={submitOnCtrlEnter}
                  />
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
          </div>
          <Modal.Footer>
            <Modal.FooterButton isCloseButton label={t('common:cancel')} />
            <Modal.FooterButton label={t('common:validate')} type="submit" />
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};

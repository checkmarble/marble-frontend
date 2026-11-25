import { Callout, casesI18n } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { OpenCasePayload, openCasePayloadSchema, useOpenCaseMutation } from '@app-builder/queries/cases/open-case';
import { getFieldErrors, handleSubmit, submitOnCtrlEnter } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Modal, TextArea } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const OpenCase = ({ id }: { id: string }) => {
  const { t } = useTranslation([...casesI18n, 'common']);
  const openCaseMutation = useOpenCaseMutation();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: { caseId: id, comment: '' } as OpenCasePayload,
    onSubmit: async ({ value }) => {
      try {
        await openCaseMutation.mutateAsync(value);
        setOpen(false);
        router.invalidate();
      } catch {
        toast.error(t('common:errors.unknown'));
      }
    },
    validators: {
      onSubmit: openCasePayloadSchema,
    },
  });

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button variant="primary" className="flex-1 first-letter:capitalize">
          <Icon icon="save" className="size-3.5" />
          {t('cases:case.reopen')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('cases:case.reopen')}</Modal.Title>
        <form onSubmit={handleSubmit(form)}>
          <div className="flex flex-col gap-xl p-xl">
            <Callout>{t('cases:reopen-case.modal.callout')}</Callout>
            <form.Field
              name="comment"
              validators={{
                onChange: openCasePayloadSchema.shape.comment,
                onBlur: openCasePayloadSchema.shape.comment,
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-sm">
                  <label htmlFor={field.name}>Add a comment</label>
                  <TextArea
                    id={field.name}
                    name={field.name}
                    defaultValue={field.state.value}
                    placeholder="Input your comment here"
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
            <Modal.FooterButton label={t('cases:reopen-case.modal.submit-button.label')} type="submit" />
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};

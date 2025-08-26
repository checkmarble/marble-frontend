import { Callout, casesI18n } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { FormTextArea } from '@app-builder/components/Form/Tanstack/FormTextArea';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  OpenCasePayload,
  openCasePayloadSchema,
  useOpenCaseMutation,
} from '@app-builder/queries/cases/open-case';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonV2, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const OpenCase = ({ id }: { id: string }) => {
  const { t } = useTranslation(casesI18n);
  const openCaseMutation = useOpenCaseMutation();
  const revalide = useLoaderRevalidator();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: { caseId: id, comment: '' } as OpenCasePayload,
    onSubmit: ({ value }) => {
      openCaseMutation.mutateAsync(value).then((res) => {
        if (res.success) {
          setOpen(false);
        }
        revalide();
      });
    },
    validators: {
      onSubmit: openCasePayloadSchema,
    },
  });

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <ButtonV2 variant="primary" className="flex-1 first-letter:capitalize">
          <Icon icon="save" className="size-3.5" />
          {t('cases:case.reopen')}
        </ButtonV2>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('cases:case.reopen')}</Modal.Title>
        <form onSubmit={handleSubmit(form)} className="flex flex-col gap-8 p-8">
          <Callout>Are you sure you want to re-open the case ?</Callout>
          <form.Field
            name="comment"
            validators={{
              onChange: openCasePayloadSchema.shape.comment,
              onBlur: openCasePayloadSchema.shape.comment,
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
          <div className="flex w-full flex-row gap-2 justify-around">
            <Modal.Close asChild>
              <Button variant="secondary" className="flex-1 first-letter:capitalize">
                {t('common:cancel')}
              </Button>
            </Modal.Close>

            <Button type="submit" className="flex-1 first-letter:capitalize">
              Re-Open
            </Button>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};

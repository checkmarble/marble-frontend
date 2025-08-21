import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useCreateAnnotationMutation } from '@app-builder/queries/annotations/create-annotation';
import { createCommentAnnotationSchema } from '@app-builder/schemas/annotations';
import { handleSubmit } from '@app-builder/utils/form';
import { useCallbackRef } from '@marble/shared';
import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

type ClientCommentFormProps = {
  caseId: string;
  tableName: string;
  objectId: string;
  className?: string;
  onAnnotateSuccess?: () => void;
};

export function ClientCommentForm({
  caseId,
  tableName,
  objectId,
  className,
  onAnnotateSuccess: onAnnotateSuccessProps,
}: ClientCommentFormProps) {
  const { t } = useTranslation(['common', 'cases']);
  const createAnnotationMutation = useCreateAnnotationMutation();
  const onAnnotateSuccess = useCallbackRef(onAnnotateSuccessProps);
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      caseId,
      tableName,
      objectId,
      type: 'comment' as const,
      payload: {
        text: '',
      },
    } as z.infer<typeof createCommentAnnotationSchema>,
    validators: {
      onSubmit: createCommentAnnotationSchema,
    },
    onSubmit({ value }) {
      createAnnotationMutation.mutateAsync(value).then((result) => {
        revalidate();
        if (result.success) {
          form.setFieldValue('payload.text', '');
          onAnnotateSuccess();
        }
      });
    },
  });

  useEffect(() => {
    form.validate('mount');
  }, [form]);

  return (
    <form
      onSubmit={handleSubmit(form)}
      className={cn('flex justify-between rounded-lg px-4 py-3', className)}
    >
      <form.Field
        name="payload.text"
        validators={{
          onChange: createCommentAnnotationSchema._def.right.shape.payload.shape.text,
          onBlur: createCommentAnnotationSchema._def.right.shape.payload.shape.text,
        }}
      >
        {(field) => (
          <div className="flex grow flex-col gap-1">
            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              name={field.name}
              placeholder={t('cases:case_detail.add_a_comment.placeholder')}
              className="form-textarea text-s max-h-40 w-full resize-none overflow-y-scroll border-none bg-transparent outline-hidden"
            />
          </div>
        )}
      </form.Field>
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            size="icon"
            variant="primary"
            className="shrink-0"
            disabled={!canSubmit || isSubmitting}
          >
            <Icon
              icon={isSubmitting ? 'spinner' : 'send'}
              className={clsx('size-4', { 'animate-spin': isSubmitting })}
            />
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

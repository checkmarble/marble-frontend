import { casesI18n } from '@app-builder/components';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useFormDropzone } from '@app-builder/hooks/useFormDropzone';
import {
  AddCommentPayload,
  addCommentPayloadSchema,
  useAddCommentMutation,
} from '@app-builder/queries/cases/add-comment';
import { handleSubmit, submitOnCtrlEnter } from '@app-builder/utils/form';
import { useForm, useStore } from '@tanstack/react-form';
import { toggle } from 'radash';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function AddComment({ caseId }: { caseId: string }) {
  const { t } = useTranslation([...casesI18n, 'common']);
  const addCommentMutation = useAddCommentMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: { caseId, comment: '', files: [] } as AddCommentPayload,
    onSubmit: ({ value }) => {
      addCommentMutation
        .mutateAsync(value)
        .then(() => {
          form.reset();
          form.validate('mount');
          revalidate();
        })
        .catch(() => {
          toast.error(t('common:errors.unknown'));
        });
    },
    validators: {
      onSubmit: addCommentPayloadSchema,
    },
  });

  const { getInputProps, getRootProps } = useFormDropzone({
    onDrop: (acceptedFiles) => {
      form.setFieldValue('files', (prev) => [...prev, ...acceptedFiles]);
      form.validate('change');
    },
  });
  const hasContent = useStore(form.store, (s) => s.values.comment.length > 0);

  return (
    <form onSubmit={handleSubmit(form)} className="bg-surface-elevated border-grey-border gap-md border-t p-md">
      <div
        className="grid grid-cols-[auto_1fr_auto] gap-sm items-start group/comment-form"
        data-has-content={hasContent}
      >
        <form.Field name="files">
          {(field) => (
            <div>
              <input {...getInputProps()} />
              <div className="flex items-center gap-sm invisible group-focus-within/comment-form:visible group-data-[has-content='true']/comment-form:visible">
                <Button type="button" variant="secondary" mode="icon" {...getRootProps()}>
                  <Icon icon="attachment" className="text-grey-secondary size-3.5" />
                </Button>
                {field.state.value.map((file) => (
                  <div
                    key={file.name}
                    className="border-grey-border flex items-center gap-xs rounded-sm border px-2xs.5 py-0.5"
                  >
                    <span className="text-xs font-medium">{file.name}</span>
                    <Icon
                      icon="cross"
                      className="text-grey-secondary hover:text-grey-primary size-4 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        field.handleChange((prev) => toggle(prev, file));
                        form.validate('change');
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </form.Field>
        <form.Field name="comment">
          {(field) => (
            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              onBlur={field.handleBlur}
              onKeyDown={submitOnCtrlEnter}
              name={field.name}
              placeholder={t('cases:case_detail.add_a_comment.placeholder')}
              className="form-textarea text-s w-full resize-none border-none bg-transparent outline-hidden"
            />
          )}
        </form.Field>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitSuccessful]}>
          {([canSubmit, isSubmitSuccessful]) => (
            <Button
              type="submit"
              variant="primary"
              mode="icon"
              aria-label={t('cases:case_detail.add_a_comment.post')}
              disabled={!canSubmit || isSubmitSuccessful}
              className="invisible group-focus-within/comment-form:visible group-data-[has-content='true']/comment-form:visible"
            >
              {isSubmitSuccessful ? (
                <Icon icon="spinner" className="size-3.5 animate-spin" />
              ) : (
                <Icon icon="send" className="size-3.5" />
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

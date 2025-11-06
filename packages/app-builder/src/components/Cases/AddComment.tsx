import { casesI18n } from '@app-builder/components';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useFormDropzone } from '@app-builder/hooks/useFormDropzone';
import {
  AddCommentPayload,
  addCommentPayloadSchema,
  useAddCommentMutation,
} from '@app-builder/queries/cases/add-comment';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { toggle } from 'radash';
import { useTranslation } from 'react-i18next';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function AddComment({ caseId }: { caseId: string }) {
  const { t } = useTranslation(casesI18n);
  const addCommentMutation = useAddCommentMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: { caseId, comment: '', files: [] } as AddCommentPayload,
    onSubmit: ({ value }) => {
      addCommentMutation.mutateAsync(value).then((res) => {
        if (res.success) {
          form.reset();
          form.validate('mount');
        }
        revalidate();
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

  return (
    <form onSubmit={handleSubmit(form)} className="border-grey-90 flex grow items-end gap-4 border-t p-4">
      <div className="flex grow flex-col items-start gap-2.5">
        <form.Field name="comment">
          {(field) => (
            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              onBlur={field.handleBlur}
              name={field.name}
              placeholder={t('cases:case_detail.add_a_comment.placeholder')}
              className="form-textarea text-s w-full resize-none border-none bg-transparent outline-hidden"
            />
          )}
        </form.Field>
        <form.Field name="files">
          {(field) => (
            <div>
              <input {...getInputProps()} />
              <div className="flex items-center gap-2">
                <ButtonV2 type="button" variant="secondary" mode="icon" {...getRootProps()}>
                  <Icon icon="attachment" className="text-grey-50 size-3.5" />
                </ButtonV2>
                {field.state.value.map((file) => (
                  <div
                    key={file.name}
                    className="border-grey-90 flex items-center gap-1 rounded-sm border px-1.5 py-0.5"
                  >
                    <span className="text-xs font-medium">{file.name}</span>
                    <Icon
                      icon="cross"
                      className="text-grey-50 hover:text-grey-00 size-4 cursor-pointer"
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
      </div>
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitSuccessful]}>
        {([canSubmit, isSubmitSuccessful]) => (
          <ButtonV2
            type="submit"
            variant="primary"
            mode="icon"
            aria-label={t('cases:case_detail.add_a_comment.post')}
            disabled={!canSubmit || isSubmitSuccessful}
          >
            {isSubmitSuccessful ? (
              <Icon icon="spinner" className="size-3.5 animate-spin" />
            ) : (
              <Icon icon="send" className="size-3.5" />
            )}
          </ButtonV2>
        )}
      </form.Subscribe>
    </form>
  );
}

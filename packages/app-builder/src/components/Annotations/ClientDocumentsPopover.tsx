import { AnnotationFileDownload } from '@app-builder/components/Annotations/FileDownload';
import { RemoveFileAnnotation } from '@app-builder/components/Annotations/RemoveFileAnnotation';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useFormDropzone } from '@app-builder/hooks/useFormDropzone';
import { type FileAnnotation } from '@app-builder/models';
import { useCreateAnnotationMutation } from '@app-builder/queries/annotations/create-annotation';
import { createFileAnnotationSchema } from '@app-builder/schemas/annotations';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import { toggle } from 'radash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

type ClientDocumentsPopoverProps = {
  caseId: string;
  tableName: string;
  objectId: string;
  documents: FileAnnotation[];
  onAnnotateSuccess?: () => void;
};

export function ClientDocumentsPopover({
  caseId,
  tableName,
  objectId,
  documents,
  onAnnotateSuccess,
}: ClientDocumentsPopoverProps) {
  const { t } = useTranslation(['cases', 'common']);
  const createAnnotationMutation = useCreateAnnotationMutation();
  const [annotationToDelete, setAnnotationToDelete] = useState<FileAnnotation | null>(null);
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      caseId,
      tableName,
      objectId,
      type: 'file',
      payload: {
        files: [],
      },
    } as z.infer<typeof createFileAnnotationSchema>,
    validators: {
      onSubmit: createFileAnnotationSchema,
    },
    onSubmit({ value }) {
      createAnnotationMutation.mutateAsync(value).then((result) => {
        revalidate();
        if (result.success) {
          form.setFieldValue('payload.files', []);
          onAnnotateSuccess?.();
        }
      });
    },
  });

  useEffect(() => {
    form.validate('mount');
  }, [form]);

  const { getInputProps, getRootProps } = useFormDropzone({
    onDrop: (acceptedFiles) => {
      form.setFieldValue('payload.files', (prev) => [...prev, ...acceptedFiles]);
      form.validate('change');
    },
  });

  return (
    <>
      <form onSubmit={handleSubmit(form)}>
        <form.Field
          name="payload.files"
          validators={{
            onChange: createFileAnnotationSchema._def.right.shape.payload.shape.files,
            onBlur: createFileAnnotationSchema._def.right.shape.payload.shape.files,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2 px-4 py-3">
              <input {...getInputProps()} />
              <button
                type="button"
                className="flex items-center justify-between gap-9 text-left"
                {...getRootProps()}
              >
                <div className="flex flex-col">
                  <div className="text-r flex items-center gap-2">
                    {t('cases:annotations.documents.add_file')}
                  </div>
                  <span className="text-grey-50">
                    {t('cases:annotations.documents.upload_file')}: jpg, png, pdf, zip, doc, docx,
                    xls, xlsx
                  </span>
                </div>
                <Icon icon="upload" className="size-5 shrink-0" />
              </button>
              {field.state.value.length > 0 ? (
                <div className="flex items-center justify-between gap-9">
                  <div className="flex items-center gap-1">
                    {field.state.value.map((file) => (
                      <div
                        key={file.name}
                        className="border-grey-90 flex max-w-24 items-center gap-1 rounded border px-1.5 py-0.5"
                      >
                        <span className="truncate text-xs font-medium">{file.name}</span>
                        <Icon
                          icon="cross"
                          className="text-grey-50 hover:text-grey-00 size-5 shrink-0 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            field.handleChange((prev) => toggle(prev, file));
                            form.validate('change');
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                    {([canSubmit, isSubmitting]) => (
                      <Button
                        type="submit"
                        size="icon"
                        variant="primary"
                        disabled={!canSubmit || isSubmitting}
                      >
                        <Icon
                          icon={isSubmitting ? 'spinner' : 'send'}
                          className={clsx('size-4', { 'animate-spin': isSubmitting })}
                        />
                      </Button>
                    )}
                  </form.Subscribe>
                </div>
              ) : null}
            </div>
          )}
        </form.Field>
      </form>
      {documents.length > 0 ? (
        <>
          <div className="bg-grey-90 h-px w-full" />
          <div className="flex flex-col gap-1 overflow-y-scroll px-2 py-1">
            {documents.map((document) => {
              const files = document.payload.files;

              return (
                <div key={document.id} className="flex flex-col">
                  <div className="has-[button[data-delete]:hover]:bg-red-95 relative z-0 flex flex-col rounded">
                    {files.map((file, idx) => (
                      <div
                        key={file.id}
                        className="z-10 grid grid-cols-[auto_1fr_auto_20px] gap-2 p-2"
                      >
                        <Icon icon="attachment" className="text-grey-50 size-5" />
                        <span className="truncate">{file.filename}</span>
                        <AnnotationFileDownload annotationId={document.id} fileId={file.id} />
                        {idx === 0 ? (
                          <button
                            data-delete
                            className="size-5"
                            onClick={() => setAnnotationToDelete(document)}
                          >
                            <Icon icon="delete" className="text-red-47 size-5" />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
      {annotationToDelete ? (
        <RemoveFileAnnotation
          annotation={annotationToDelete}
          onClose={() => setAnnotationToDelete(null)}
          onDelete={() => {
            onAnnotateSuccess?.();
          }}
        />
      ) : null}
    </>
  );
}

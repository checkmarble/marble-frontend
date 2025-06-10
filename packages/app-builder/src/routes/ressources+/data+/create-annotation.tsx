import { AnnotationFileDownload } from '@app-builder/components/Annotations/FileDownload';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB,
  useFormDropzone,
} from '@app-builder/hooks/useFormDropzone';
import { type FileAnnotation } from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';
import { getServerEnv } from '@app-builder/utils/environment';
import { getClientAnnotationFileUploadEndpoint } from '@app-builder/utils/files';
import { handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { useCallbackRef } from '@marble/shared';
import {
  type ActionFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { redirect, useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import { decode } from 'decode-formdata';
import { type GroupedAnnotations } from 'marble-api';
import { serialize } from 'object-to-formdata';
import { toggle, tryit } from 'radash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isDeepEqual } from 'remeda';
import { match } from 'ts-pattern';
import { Button, cn, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

import { RemoveFileAnnotation } from './delete-annotation.$annotationId';

const baseCreateAnnotationSchema = z.object({
  tableName: z.string(),
  objectId: z.string(),
});

const createTagAnnotationSchema = z.intersection(
  baseCreateAnnotationSchema,
  z.object({
    type: z.literal('tag'),
    payload: z.object({
      addedTags: z.array(z.string().uuid()).optional(),
      removedAnnotations: z.array(z.string().uuid()).optional(),
    }),
  }),
);

const tagAnnotationFormSchema = z.intersection(
  baseCreateAnnotationSchema,
  z.object({
    type: z.literal('tag'),
    payload: z.object({
      tags: z.array(z.string()),
    }),
  }),
);

const createFileAnnotationSchema = z.intersection(
  baseCreateAnnotationSchema,
  z.object({
    type: z.literal('file'),
    payload: z.object({
      files: z.array(z.instanceof(File)).min(1),
    }),
  }),
);

const createCommentAnnotationSchema = z.intersection(
  baseCreateAnnotationSchema,
  z.object({
    type: z.literal('comment'),
    payload: z.object({
      text: z.string().nonempty(),
    }),
  }),
);

const createAnnotationSchema = z.union([
  createTagAnnotationSchema,
  createFileAnnotationSchema,
  createCommentAnnotationSchema,
]);

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
    authSessionService: { getSession: getAuthSession },
  } = initServerServices(request);

  const [err, raw] = await tryit(unstable_parseMultipartFormData)(
    request,
    unstable_createMemoryUploadHandler({
      maxPartSize: MAX_FILE_SIZE,
    }),
  );

  const [t, session, authSession, { dataModelRepository }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    getAuthSession(request),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  if (err) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:max_size_exceeded', { size: MAX_FILE_SIZE_MB }),
    });

    return Response.json(
      { success: false, errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }

  const token = authSession.get('authToken')?.access_token;
  if (!token) {
    return redirect(getRoute('/sign-in'));
  }

  const { data, success, error } = createAnnotationSchema.safeParse(
    decode(raw, {
      arrays: ['payload.files', 'payload.addedTags', 'payload.removedAnnotations'],
    }),
  );

  if (!success) {
    console.log(error.flatten());
    return Response.json({ success, errors: error.flatten() });
  }

  return match(data)
    .with({ type: 'comment' }, async ({ payload: { text }, ...data }) => {
      await dataModelRepository.createAnnotation(data.tableName, data.objectId, {
        type: 'comment',
        payload: {
          text,
        },
      });

      return Response.json(
        { success: true },
        { headers: { 'Set-Cookie': await commitSession(session) } },
      );
    })
    .with(
      { type: 'tag' },
      async ({ payload: { addedTags = [], removedAnnotations = [] }, ...data }) => {
        const promises: Promise<Response | void>[] = [
          ...addedTags.map((tagAdded) =>
            dataModelRepository.createAnnotation(data.tableName, data.objectId, {
              type: 'tag',
              payload: {
                tagId: tagAdded,
              },
            }),
          ),
          ...removedAnnotations.map((annotationId) =>
            dataModelRepository.deleteAnnotation(annotationId),
          ),
        ];

        await Promise.all(promises);

        return Response.json(
          { success: true },
          { headers: { 'Set-Cookie': await commitSession(session) } },
        );
      },
    )
    .with({ type: 'file' }, async ({ payload: { files }, ...data }) => {
      const promises: Promise<Response>[] = [];

      if (files.length > 0) {
        const body = new FormData();
        body.append('caption', 'Hello world');
        files.forEach((file) => {
          body.append('files[]', file);
        });

        promises.push(
          fetch(
            `${getServerEnv('MARBLE_API_URL_SERVER')}${getClientAnnotationFileUploadEndpoint(data.tableName, data.objectId)}`,
            { method: 'POST', body, headers: { Authorization: `Bearer ${token}` } },
          ),
        );
      }

      await Promise.all(promises);

      return Response.json(
        { success: true },
        { headers: { 'Set-Cookie': await commitSession(session) } },
      );
    })
    .exhaustive();
}

type ClientCommentFormProps = {
  tableName: string;
  objectId: string;
  className?: string;
  onAnnotateSuccess?: () => void;
};

export function ClientCommentForm({
  tableName,
  objectId,
  className,
  onAnnotateSuccess: onAnnotateSuccessProps,
}: ClientCommentFormProps) {
  const { t } = useTranslation(['common', 'cases']);
  const fetcher = useFetcher<typeof action>({ key: `comment_${tableName}_${objectId}` });
  const onAnnotateSuccess = useCallbackRef(onAnnotateSuccessProps);
  const form = useForm({
    defaultValues: {
      tableName,
      objectId,
      type: 'comment' as const,
      payload: {
        text: '',
      },
    },
    validators: {
      onChange: createCommentAnnotationSchema,
      onSubmit: createCommentAnnotationSchema,
    },
    onSubmit({ value }) {
      fetcher.submit(serialize(value, { dotsForObjectNotation: true }), {
        method: 'POST',
        action: getRoute('/ressources/data/create-annotation'),
        encType: 'multipart/form-data',
      });
    },
  });

  useEffect(() => {
    form.validate('mount');
  }, [form]);

  useEffect(() => {
    if (fetcher) {
      form.setFieldValue('payload.text', '');
      onAnnotateSuccess?.();
    }
  }, [onAnnotateSuccess, fetcher, form]);

  return (
    <form
      onSubmit={handleSubmit(form)}
      className={cn('flex justify-between rounded-lg px-4 py-3', className)}
    >
      <form.Field name="payload.text">
        {(field) => (
          <div className="flex grow flex-col gap-1">
            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              name={field.name}
              placeholder={t('cases:case_detail.add_a_comment.placeholder')}
              className="form-textarea text-s max-h-40 w-full resize-none overflow-y-scroll border-none bg-transparent outline-none"
            />
          </div>
        )}
      </form.Field>
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" size="icon" variant="primary" disabled={!canSubmit || isSubmitting}>
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

type ClientDocumentsPopoverProps = {
  tableName: string;
  objectId: string;
  documents: FileAnnotation[];
  onAnnotateSuccess?: () => void;
};

export function ClientDocumentsPopover({
  tableName,
  objectId,
  documents,
  onAnnotateSuccess,
}: ClientDocumentsPopoverProps) {
  const { t } = useTranslation(['cases', 'common']);
  const fetcher = useFetcher<typeof action>({ key: `file_${tableName}_${objectId}` });
  const [annotationToDelete, setAnnotationToDelete] = useState<FileAnnotation | null>(null);

  const form = useForm({
    defaultValues: {
      tableName,
      objectId,
      type: 'file',
      payload: {
        files: [],
      },
    } as z.infer<typeof createFileAnnotationSchema>,
    validators: {
      onChange: createFileAnnotationSchema,
      onSubmit: createFileAnnotationSchema,
    },
    onSubmit({ value }) {
      fetcher.submit(serialize(value, { dotsForObjectNotation: true, indices: true }), {
        method: 'POST',
        action: getRoute('/ressources/data/create-annotation'),
        encType: 'multipart/form-data',
      });
    },
  });

  useEffect(() => {
    form.validate('mount');
  }, [form]);

  useEffect(() => {
    if (fetcher) {
      form.setFieldValue('payload.files', []);
      onAnnotateSuccess?.();
    }
  }, [onAnnotateSuccess, fetcher, form]);

  const { getInputProps, getRootProps } = useFormDropzone({
    onDrop: (acceptedFiles) => {
      form.setFieldValue('payload.files', (prev) => [...prev, ...acceptedFiles]);
      form.validate('change');
    },
  });

  return (
    <>
      <form onSubmit={handleSubmit(form)}>
        <form.Field name="payload.files">
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

type ClientTagsEditSelectProps = {
  tableName: string;
  objectId: string;
  annotations: GroupedAnnotations['tags'];
  onAnnotateSuccess?: () => void;
};

const TagPreview = ({ name }: { name: string }) => (
  <div className="bg-purple-96 flex size-fit flex-row items-center gap-2 rounded-full px-2 py-[3px]">
    <span className="text-purple-65 text-xs font-normal">{name}</span>
  </div>
);

export function ClientTagsEditSelect({
  tableName,
  objectId,
  annotations,
  onAnnotateSuccess,
}: ClientTagsEditSelectProps) {
  const { t } = useTranslation(['cases', 'common']);
  const { orgObjectTags } = useOrganizationObjectTags();
  const fetcher = useFetcher<typeof action>({ key: 'tags_${tableName}_${objectId}' });
  const tags = annotations.map((annotation) => annotation.payload.tag_id);
  const form = useForm({
    defaultValues: {
      tableName,
      objectId,
      type: 'tag',
      payload: {
        tags,
      },
    } as z.infer<typeof tagAnnotationFormSchema>,
    validators: {
      onChange: tagAnnotationFormSchema,
      onSubmit: tagAnnotationFormSchema,
    },
    onSubmit({ value }) {
      const addedTags = value.payload.tags.filter((t) => !tags.includes(t));
      const removedAnnotations = annotations.filter((annotation) => {
        return !value.payload.tags.includes(annotation.payload.tag_id);
      });

      fetcher.submit(
        serialize(
          {
            tableName,
            objectId,
            type: 'tag',
            payload: {
              addedTags,
              removedAnnotations: removedAnnotations.map((annotation) => annotation.id),
            },
          },
          { dotsForObjectNotation: true, indices: true },
        ),
        {
          method: 'POST',
          action: getRoute('/ressources/data/create-annotation'),
          encType: 'multipart/form-data',
        },
      );
    },
  });

  useEffect(() => {
    if (fetcher.data.success) {
      onAnnotateSuccess?.();
    }
  }, [onAnnotateSuccess, fetcher, form]);

  return (
    <form onSubmit={handleSubmit(form)}>
      <form.Field name="payload.tags">
        {(field) => (
          <MenuCommand.List>
            {orgObjectTags.map((tag) => (
              <MenuCommand.Item
                key={tag.id}
                value={tag.id}
                onSelect={() => field.handleChange((prev) => toggle(prev, tag.id))}
              >
                <TagPreview name={tag.name} />
                {field.state.value.includes(tag.id) ? (
                  <Icon icon="tick" className="text-purple-65 size-5" />
                ) : null}
              </MenuCommand.Item>
            ))}
            <MenuCommand.Empty>
              <div className="text-center">{t('cases:case_detail.add_a_tag.empty')}</div>
            </MenuCommand.Empty>
          </MenuCommand.List>
        )}
      </form.Field>
      <form.Subscribe
        selector={(state) => [isDeepEqual(state.values.payload.tags, tags), state.isSubmitting]}
      >
        {([isDefaultValue, isSubmitting]) =>
          !isDefaultValue ? (
            <div className="border-grey-90 flex justify-end gap-2 overflow-x-auto border-t p-2">
              <MenuCommand.HeadlessItem>
                {isSubmitting ? (
                  <Button size="icon" type="submit" disabled>
                    <Icon icon="spinner" className="size-4 animate-spin" />
                  </Button>
                ) : (
                  <Button size="small" type="submit">
                    Confirm
                  </Button>
                )}
              </MenuCommand.HeadlessItem>
            </div>
          ) : null
        }
      </form.Subscribe>
    </form>
  );
}

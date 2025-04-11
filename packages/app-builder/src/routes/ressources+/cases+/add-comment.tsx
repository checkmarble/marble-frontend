import { casesI18n } from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { initServerServices } from '@app-builder/services/init.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getCaseFileUploadEndpointById } from '@app-builder/utils/files';
import { handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { redirect, useFetcher } from '@remix-run/react';
import { Dict } from '@swan-io/boxed';
import { useForm } from '@tanstack/react-form';
import { decode } from 'decode-formdata';
import { serialize } from 'object-to-formdata';
import { toggle } from 'radash';
import { useEffect } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import { useTranslation } from 'react-i18next';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const schema = z.object({
  caseId: z.string().nonempty(),
  comment: z.string().nonempty(),
  files: z.array(z.instanceof(File)),
});

type CaseCommentForm = z.infer<typeof schema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
    authSessionService: { getSession: getAuthSession },
  } = initServerServices(request);

  const [t, session, authSession, raw, { cases }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    getAuthSession(request),
    request.formData(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const token = authSession.get('authToken')?.access_token;

  if (!token) return redirect(getRoute('/sign-in'));

  const { data, success, error } = schema.safeParse(decode(raw, { arrays: ['files'] }));

  if (!success) return Response.json({ success, errors: error.flatten() });

  try {
    const promises = [];

    if (data.comment !== '') {
      promises.push(cases.addComment({ caseId: data.caseId, body: { comment: data.comment } }));
    }

    if (data.files.length > 0) {
      const body = new FormData();
      data.files.forEach((file) => {
        body.append('file[]', file);
      });

      promises.push(
        fetch(
          `${getServerEnv('MARBLE_API_URL_SERVER')}${getCaseFileUploadEndpointById(data.caseId)}`,
          { method: 'POST', body, headers: { Authorization: `Bearer ${token}` } },
        ),
      );
    }

    await Promise.all(promises);

    return Response.json(
      { success, errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: t('common:errors.unknown'),
    });

    return Response.json(
      { success: false, errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}

export function AddComment({ caseId }: { caseId: string }) {
  const { t } = useTranslation(casesI18n);
  const { data, submit } = useFetcher<typeof action>();
  const lastData = data as
    | {
        success: boolean;
        errors?: z.typeToFlattenedError<CaseCommentForm>;
      }
    | undefined;

  const form = useForm({
    defaultValues: { caseId, comment: '', files: [] } as CaseCommentForm,
    onSubmit: ({ value }) => {
      submit(serialize(value, { indices: true }), {
        method: 'POST',
        action: getRoute('/ressources/cases/add-comment'),
        encType: 'multipart/form-data',
      });
    },
    validators: {
      onBlur: schema,
      onSubmit: schema,
    },
  });

  useEffect(() => {
    if (lastData?.success) form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastData]);

  const { getInputProps, getRootProps } = useDropzone({
    onDrop: (acceptedFiles) => form.setFieldValue('files', (prev) => [...prev, ...acceptedFiles]),
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.openxmlformats-officedocument.*': ['.docx', '.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/*': ['.csv', '.txt'],
    },
    multiple: true,
    maxSize: MAX_FILE_SIZE,
  });

  if (!form.state.isTouched && lastData?.success === false && lastData?.errors) {
    Dict.entries(lastData.errors.fieldErrors).forEach(([field, errors]) =>
      form.setFieldMeta(field, (prev) => ({
        ...prev,
        errors: errors ?? [],
      })),
    );
  }

  return (
    <form
      onSubmit={handleSubmit(form)}
      className="border-grey-90 flex grow items-end gap-4 border-t p-4"
    >
      <div className="flex grow flex-col items-start gap-2.5">
        <form.Field name="comment">
          {(field) => (
            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              onBlur={field.handleBlur}
              name={field.name}
              placeholder={t('cases:case_detail.add_a_comment.placeholder')}
              className={cn(
                'form-textarea text-s w-full resize-none border-none bg-transparent outline-none',
                { 'placeholder:text-red-47': field.state.meta.errors.length !== 0 },
              )}
            />
          )}
        </form.Field>
        <form.Field name="files">
          {(field) => (
            <div>
              <input {...getInputProps()} />
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" size="icon" {...getRootProps()}>
                  <Icon icon="attachment" className="text-grey-50 size-5" />
                </Button>
                {field.state.value.map((file) => (
                  <div
                    key={file.name}
                    className="border-grey-90 flex items-center gap-1 rounded border px-1.5 py-0.5"
                  >
                    <span className="text-xs font-medium">{file.name}</span>
                    <Icon
                      icon="cross"
                      className="text-grey-50 hover:text-grey-00 size-4 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        field.handleChange((prev) => toggle(prev, file));
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </form.Field>
      </div>
      <Button
        type="submit"
        variant="primary"
        size="medium"
        aria-label={t('cases:case_detail.add_a_comment.post')}
      >
        <Icon icon="send" className="size-5" />
      </Button>
    </form>
  );
}

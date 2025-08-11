import { casesI18n } from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB,
  useFormDropzone,
} from '@app-builder/hooks/useFormDropzone';
import { initServerServices } from '@app-builder/services/init.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getCaseFileUploadEndpoint } from '@app-builder/utils/files';
import { handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import {
  type ActionFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { redirect, useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { decode } from 'decode-formdata';
import { serialize } from 'object-to-formdata';
import { toggle, tryit } from 'radash';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

const schema = z
  .object({
    caseId: z.uuid().nonempty(),
    comment: z.string(),
    files: z.array(z.instanceof(File)),
  })
  .refine((data) => data.comment.trim() !== '' || data.files.length > 0);

type CaseCommentForm = z.infer<typeof schema>;

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

  const [t, session, authSession, { cases }] = await Promise.all([
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

  if (!token) return redirect(getRoute('/sign-in'));

  const { data, success, error } = schema.safeParse(decode(raw, { arrays: ['files'] }));

  if (!success) return Response.json({ success, errors: z.treeifyError(error) });

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
        fetch(`${getServerEnv('MARBLE_API_URL_SERVER')}${getCaseFileUploadEndpoint(data.caseId)}`, {
          method: 'POST',
          body,
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
    }

    await Promise.all(promises);

    return Response.json(
      { success, errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  } catch (_error) {
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
        errors?: ReturnType<z.ZodError<z.output<typeof schema>>['flatten']>;
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
      onSubmit: schema,
    },
  });

  useEffect(() => {
    if (lastData?.success) {
      form.reset();
      form.validate('mount');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastData]);

  const { getInputProps, getRootProps } = useFormDropzone({
    onDrop: (acceptedFiles) => {
      form.setFieldValue('files', (prev) => [...prev, ...acceptedFiles]);
      form.validate('change');
    },
  });

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
              className="form-textarea text-s w-full resize-none border-none bg-transparent outline-none"
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
          <Button
            type="submit"
            variant="primary"
            size="medium"
            aria-label={t('cases:case_detail.add_a_comment.post')}
            disabled={!canSubmit || isSubmitSuccessful}
          >
            {isSubmitSuccessful ? (
              <Icon icon="spinner" className="size-5 animate-spin" />
            ) : (
              <Icon icon="send" className="size-5" />
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

import { Callout } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  type SuspiciousActivityReport,
  type SuspiciousActivityReportStatus,
  suspiciousActivityReportStatuses,
} from '@app-builder/models/cases';
import { initServerServices } from '@app-builder/services/init.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { getCaseSuspiciousActivityReportFileUploadEndpointById } from '@app-builder/utils/files';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { decode } from 'decode-formdata';
import { serialize } from 'object-to-formdata';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import { match } from 'ts-pattern';
import { Button, cn, MenuCommand, Modal } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';
import { z } from 'zod';

const schema = z.object({
  status: z.union([
    ...(suspiciousActivityReportStatuses.map((s) => z.literal(s)) as [
      z.ZodLiteral<SuspiciousActivityReportStatus>,
      z.ZodLiteral<SuspiciousActivityReportStatus>,
      ...z.ZodLiteral<SuspiciousActivityReportStatus>[],
    ]),
    z.literal('none'),
  ]),
  file: z.instanceof(File).optional(),
  caseId: z.string(),
  reportId: z.string().optional(),
});

type EditSuspicionForm = z.infer<typeof schema>;

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

  const { data, success, error } = schema.safeParse(decode(raw));

  if (!success) return Response.json({ success, errors: error.flatten() });

  console.log('Data', data);

  try {
    const promises = [];

    if (data.status !== 'none') {
      if (data.reportId) {
        promises.push(
          cases.updateSuspiciousActivityReport({
            caseId: data.caseId,
            reportId: data.reportId,
            body: { status: data.status },
          }),
        );
      } else {
        promises.push(
          cases.createSuspiciousActivityReport({
            caseId: data.caseId,
            body: { status: data.status },
          }),
        );
      }
    } else if (data.reportId) {
      promises.push(
        cases.deleteSuspiciousActivityReport({
          caseId: data.caseId,
          reportId: data.reportId,
        }),
      );
    }

    console.log('Promises', promises);

    if (data.file && data.reportId) {
      const path = getCaseSuspiciousActivityReportFileUploadEndpointById(
        data.caseId,
        data.reportId,
      );
      const body = new FormData();
      body.append('file', data.file);

      promises.push(
        fetch(new URL(path, getServerEnv('MARBLE_API_URL_SERVER')), {
          method: 'POST',
          body,
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
    }

    await Promise.allSettled(promises);

    return Response.json({ success, errors: [] });
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

const getSuspicionIconAndText = (suspicion: EditSuspicionForm['status']) => (
  <span className="inline-flex w-full items-center gap-2">
    <Icon
      icon={match<EditSuspicionForm['status'], IconName>(suspicion)
        .with('none', () => 'empty-flag')
        .with('pending', () => 'half-flag')
        .with('completed', () => 'full-flag')
        .exhaustive()}
      className={cn('size-5', {
        'text-grey-50': suspicion === 'none',
        'text-yellow-50': suspicion === 'pending',
        'text-red-47': suspicion === 'completed',
      })}
    />
    <span className="text-s font-medium">
      {match(suspicion)
        .with('none', () => 'None')
        .with('pending', () => 'Request a Suspicious Activity Report')
        .with('completed', () => 'Suspicious Activity report submitted')
        .exhaustive()}
    </span>
  </span>
);

export const EditCaseSuspicion = ({
  id,
  reports,
}: {
  id: string;
  reports: SuspiciousActivityReport[];
}) => {
  const [open, setOpen] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);
  const { data, submit } = useFetcher<typeof action>();
  const lastData = data as
    | {
        success: boolean;
        errors?: z.typeToFlattenedError<EditSuspicionForm>;
      }
    | undefined;

  const form = useForm({
    onSubmit: ({ value }) => {
      submit(serialize(value), {
        method: 'POST',
        action: getRoute('/ressources/cases/edit-suspicion'),
        encType: 'multipart/form-data',
      });
    },
    defaultValues: {
      caseId: id,
      status: reports[0] ? reports[0].status : 'none',
      reportId: reports[0]?.id,
    } as EditSuspicionForm,
    validators: {
      onChange: schema,
      onBlur: schema,
      onSubmit: schema,
    },
  });

  useEffect(() => {
    if (lastData?.success) {
      setOpenReportModal(false);
    }
  }, [lastData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (file) => form.setFieldValue('file', file[0]),
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.openxmlformats-officedocument.*': ['.docx', '.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/*': ['.csv', '.txt'],
    },
    multiple: false,
    maxSize: 1024 * 1024 * 5, // 5MB
  });

  return (
    <form.Field name="status">
      {(field) => (
        <div className="flex w-full gap-1">
          <div className="flex items-center gap-2">
            {getSuspicionIconAndText(field.state.value)}
            <MenuCommand.Menu open={open} onOpenChange={setOpen}>
              <MenuCommand.Trigger>
                <Button className="w-fit p-0.5" variant="secondary" size="icon">
                  <Icon icon="edit-square" className="text-grey-50 size-4" />
                </Button>
              </MenuCommand.Trigger>
              <MenuCommand.Content className="mt-2 min-w-[400px]">
                <MenuCommand.List>
                  {(['none', 'pending', 'completed'] as const).map((status) => (
                    <MenuCommand.Item
                      key={status}
                      className="cursor-pointer"
                      onSelect={() => {
                        if (status === 'none' || status === 'pending') {
                          field.handleChange(status);
                          form.handleSubmit();
                        } else {
                          setOpenReportModal(true);
                        }
                      }}
                    >
                      <span className="inline-flex w-full justify-between">
                        {getSuspicionIconAndText(status)}
                        {status === field.state.value ? (
                          <Icon icon="tick" className="text-purple-65 size-6" />
                        ) : null}
                      </span>
                    </MenuCommand.Item>
                  ))}
                </MenuCommand.List>
              </MenuCommand.Content>
            </MenuCommand.Menu>
          </div>
          <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
          <Modal.Root open={openReportModal} onOpenChange={setOpenReportModal}>
            <Modal.Content>
              <Modal.Title>Suspicious activity report submitted</Modal.Title>
              <div className="flex flex-col gap-8 p-8">
                <Callout>Please add the suspicious transaction report document below.</Callout>
                <div
                  {...getRootProps()}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded border-2 border-dashed p-6',
                    isDragActive ? 'bg-purple-96 border-purple-82 opacity-90' : 'border-grey-50',
                  )}
                >
                  <input {...getInputProps()} />
                  <p className="text-r flex flex-col gap-6 text-center">
                    <span className="text-grey-00">Drop your suspicious activity report here.</span>
                    <span className="text-grey-50 inline-flex flex-col">
                      <span>The following extensions are supported:</span>
                      <span>jpg, png, pdf, zip, doc, docx, xls, xIsx</span>
                    </span>
                  </p>
                  <span className="text-grey-50 text-r">or</span>
                  <Button>
                    <Icon icon="plus" className="size-6" />
                    Pick a file
                  </Button>
                </div>
                <form className="flex w-full flex-row gap-2" onSubmit={handleSubmit(form)}>
                  <Button
                    variant="secondary"
                    type="button"
                    className="flex-1 first-letter:capitalize"
                    onClick={() => {
                      field.handleChange('completed');
                      form.handleSubmit();
                    }}
                  >
                    I&apos;ll add it later
                  </Button>

                  <Button type="submit" className="flex-1 first-letter:capitalize">
                    Add a file
                  </Button>
                </form>
              </div>
            </Modal.Content>
          </Modal.Root>
        </div>
      )}
    </form.Field>
  );
};

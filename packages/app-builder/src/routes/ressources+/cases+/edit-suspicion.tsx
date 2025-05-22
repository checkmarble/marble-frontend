import { Callout, casesI18n } from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  type SuspiciousActivityReport,
  type SuspiciousActivityReportStatus,
  suspiciousActivityReportStatuses,
} from '@app-builder/models/cases';
import {
  AlreadyDownloadingError,
  AuthRequestError,
  useDownloadFile,
} from '@app-builder/services/DownloadFilesService';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import {
  type ActionFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm, useStore } from '@tanstack/react-form';
import { decode } from 'decode-formdata';
import { serialize } from 'object-to-formdata';
import { tryit } from 'radash';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { match } from 'ts-pattern';
import { Button, cn, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

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
  } = initServerServices(request);

  const [err, raw] = await tryit(unstable_parseMultipartFormData)(
    request,
    unstable_createMemoryUploadHandler({
      maxPartSize: MAX_FILE_SIZE,
    }),
  );

  const [t, session, { cases }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
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

  const { data, success, error } = schema.safeParse(decode(raw));

  if (!success) return Response.json({ success, errors: error.flatten() });

  try {
    let sar: SuspiciousActivityReport | undefined = undefined;

    if (data.reportId && data.status === 'none') {
      await cases.deleteSuspiciousActivityReport({
        caseId: data.caseId,
        reportId: data.reportId,
      });
    } else if (data.reportId && data.status !== 'none') {
      sar = await cases.updateSuspiciousActivityReport({
        caseId: data.caseId,
        reportId: data.reportId,
        body: {
          status: data.status,
          ...(data.file && { file: data.file }),
        },
      });
    } else if (!data.reportId && data.status !== 'none') {
      sar = await cases.createSuspiciousActivityReport({
        caseId: data.caseId,
        body: {
          status: data.status,
          ...(data.file && { file: data.file }),
        },
      });
    } else {
      throw new Error('Should not happen');
    }

    return Response.json({ success, errors: [], data: sar });
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: t('common:errors.unknown'),
    });

    return Response.json(
      { success: false, errors: [(error as Error).message] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}

export const ReportFile = ({
  name,
  caseId,
  reportId,
}: {
  name: string;
  caseId: string;
  reportId: string;
}) => {
  const { t } = useTranslation(casesI18n);
  const { downloadCaseFile, downloadingCaseFile } = useDownloadFile(
    `/cases/${caseId}/sar/${reportId}/download`,
    {
      onError: (e) => {
        if (e instanceof AlreadyDownloadingError) {
          // Already downloading, do nothing
          return;
        } else if (e instanceof AuthRequestError) {
          toast.error(t('cases:case.file.errors.downloading_link.auth_error'));
        } else {
          toast.error(t('cases:case.file.errors.downloading_link.unknown'));
        }
      },
    },
  );

  return (
    <Button
      variant="secondary"
      size="xs"
      onClick={() => {
        void downloadCaseFile();
      }}
      disabled={downloadingCaseFile}
    >
      <Icon
        icon={downloadingCaseFile ? 'spinner' : 'download'}
        className={cn('size-3.5', { 'animate-spin': downloadingCaseFile })}
      />
      {name}
    </Button>
  );
};

export const EditCaseSuspicion = ({
  id,
  reports,
}: {
  id: string;
  reports: SuspiciousActivityReport[];
}) => {
  const { t } = useTranslation();
  const [openReportModal, setOpenReportModal] = useState(false);
  const initialStatus = reports[0] ? reports[0]?.status : 'none';
  const [isCompleted, setIsCompleted] = useState(initialStatus === 'completed');
  const { data, submit } = useFetcher<typeof action>();
  const lastData = data as
    | {
        success: boolean;
        errors?: z.typeToFlattenedError<EditSuspicionForm>;
        data?: SuspiciousActivityReport;
      }
    | undefined;

  const form = useForm({
    onSubmit: ({ value }) => {
      submit(serialize(value), {
        method: 'POST',
        action: getRoute('/ressources/cases/edit-suspicion'),
        encType: 'multipart/form-data',
      });
      setIsCompleted(value.status === 'completed');
    },
    defaultValues: {
      caseId: id,
      status: initialStatus,
      reportId: lastData?.data?.id ?? reports[0]?.id,
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
      form.setFieldValue('reportId', lastData.data?.id);
    }
  }, [form, lastData]);

  const reportFile = useStore(form.store, (state) => state.values.file);

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
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <form.Field name="status">
      {(field) => (
        <div className="flex w-full gap-1">
          <div className="flex items-center gap-2">
            {match(field.state.value)
              .with('none', () => (
                <div className="flex items-center gap-2">
                  <span>{t('cases:sar.action.mark_as')}</span>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => {
                      field.handleChange('pending');
                      form.handleSubmit();
                    }}
                  >
                    <Icon icon="half-flag" className="size-3.5 text-orange-50" />
                    {t('cases:sar.status.pending')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => {
                      setOpenReportModal(true);
                    }}
                  >
                    <Icon icon="full-flag" className="text-red-47 size-3.5" />
                    {t('cases:sar.status.completed')}
                  </Button>
                </div>
              ))
              .with('pending', () => (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Icon icon="half-flag" className="size-3.5 text-orange-50" />
                    <span className="text-xs font-medium">{t('cases:sar.status.pending')}</span>
                  </span>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => {
                      setOpenReportModal(true);
                    }}
                  >
                    <Icon icon="full-flag" className="text-red-47 size-3.5" />
                    {t('cases:sar.action.mark_as_completed')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => {
                      field.handleChange('none');
                      form.setFieldValue('reportId', reports[0]?.id ?? lastData?.data?.id);
                      form.handleSubmit();
                    }}
                  >
                    <Icon icon="cross" className="text-grey-50 size-4" />
                  </Button>
                </div>
              ))
              .with('completed', () => (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Icon icon="full-flag" className="text-red-47 size-3.5" />
                    <span className="text-xs font-medium">{t('cases:sar.status.completed')}</span>
                  </span>
                  {reports[0]?.hasFile ? (
                    <ClientOnly>
                      {() => (
                        <ReportFile
                          name={t('cases:sar.action.download')}
                          caseId={id}
                          reportId={reports[0]!.id}
                        />
                      )}
                    </ClientOnly>
                  ) : (
                    <Button variant="secondary" size="xs" onClick={() => setOpenReportModal(true)}>
                      <Icon icon="attachment" className="size-3.5" />
                      {t('cases:sar.action.upload')}
                    </Button>
                  )}
                </div>
              ))
              .exhaustive()}
          </div>
          <Modal.Root open={openReportModal} onOpenChange={setOpenReportModal}>
            <Modal.Content>
              <Modal.Title>
                {!isCompleted
                  ? t('cases:sar.modale.title')
                  : t('cases:sar.modale.title_choose_file')}
              </Modal.Title>
              <div className="flex flex-col gap-8 p-8">
                {isCompleted ? <Callout>{t('cases:sar.modale.callout')}</Callout> : null}
                <div
                  {...getRootProps()}
                  className={cn(
                    'flex flex-col items-center justify-center gap-6 rounded border-2 border-dashed p-6',
                    isDragActive ? 'bg-purple-96 border-purple-82 opacity-90' : 'border-grey-50',
                  )}
                >
                  <input {...getInputProps()} />
                  <p className="text-r flex flex-col gap-1 text-center">
                    <span className="text-grey-00">{t('cases:sar.modale.heading')}</span>
                    <span className="text-grey-50 inline-flex flex-col">
                      <span>{t('cases:sar.modale.supported_extensions')}</span>
                      <span>{t('cases:drop_file_accepted_types')}</span>
                    </span>
                  </p>
                  <span className="text-grey-50 text-r">or</span>
                  <Button>
                    <Icon icon="plus" className="size-6" />
                    {t('cases:sar.modale.cta_choose_file')}
                  </Button>
                  {reportFile ? (
                    <span className="border-grey-90 flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium">
                      {reportFile.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => form.setFieldValue('file', undefined)}
                      >
                        <Icon icon="cross" className="text-grey-00 size-4" />
                      </Button>
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-row gap-2">
                  <Modal.Close asChild>
                    <Button variant="secondary" className="basis-1/2">
                      {t('common:cancel')}
                    </Button>
                  </Modal.Close>
                  <Button
                    type="submit"
                    className="basis-1/2 first-letter:capitalize"
                    disabled={isCompleted ? reportFile === undefined : null}
                    // I want to do isCompleted && reportFile === undefined ! Now ts complains
                    onClick={() => {
                      field.handleChange('completed');
                      form.handleSubmit();
                    }}
                  >
                    {isCompleted
                      ? t('cases:sar.modale.save')
                      : reportFile
                        ? t('cases:sar.modale.confirm_with_file')
                        : t('cases:sar.modale.confirm_without_file')}
                  </Button>
                </div>
              </div>
            </Modal.Content>
          </Modal.Root>
        </div>
      )}
    </form.Field>
  );
};

import { Callout, casesI18n } from '@app-builder/components';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useFormDropzone } from '@app-builder/hooks/useFormDropzone';
import { type SuspiciousActivityReport } from '@app-builder/models/cases';
import {
  EditSuspicionPayload,
  editSuspicionPayloadSchema,
  useEditSuspicionMutation,
} from '@app-builder/queries/cases/edit-suspicion';
import {
  AlreadyDownloadingError,
  AuthRequestError,
  useDownloadFile,
} from '@app-builder/services/DownloadFilesService';
import { getRoute } from '@app-builder/utils/routes';
import { useForm, useStore } from '@tanstack/react-form';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { match } from 'ts-pattern';
import { Button, cn, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

type EditCaseSuspicionProps = {
  id: string;
  reports: SuspiciousActivityReport[];
};

export const EditCaseSuspicion = ({ id, reports }: EditCaseSuspicionProps) => {
  const { t } = useTranslation();
  const [openReportModal, setOpenReportModal] = useState(false);
  const initialStatus = reports[0] ? reports[0]?.status : 'none';
  const [isCompleted, setIsCompleted] = useState(initialStatus === 'completed');
  const editSuspicionMutation = useEditSuspicionMutation();
  const revalidate = useLoaderRevalidator();
  const lastData = editSuspicionMutation.data;

  const form = useForm({
    onSubmit: ({ value }) => {
      editSuspicionMutation.mutateAsync(value).then((res) => {
        console.log(res);
        if (res.success) {
          setOpenReportModal(false);
          form.setFieldValue('reportId', res.data?.id);
          setIsCompleted(res.data?.status === 'completed');
        }
        revalidate();
      });
    },
    defaultValues: {
      caseId: id,
      status: initialStatus,
      reportId: lastData?.data?.id ?? reports[0]?.id,
    } as EditSuspicionPayload,
    validators: {
      onSubmit: editSuspicionPayloadSchema,
    },
  });

  const reportFile = useStore(form.store, (state) => state.values.file);

  const { getRootProps, getInputProps, isDragActive } = useFormDropzone({
    multiple: false,
    onDrop: (acceptedFiles) => {
      form.setFieldValue('file', acceptedFiles[0]);
      form.validate('change');
    },
  });

  return (
    <form.Field
      name="status"
      validators={{
        onBlur: editSuspicionPayloadSchema.shape.status,
        onChange: editSuspicionPayloadSchema.shape.status,
      }}
    >
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
                    'flex flex-col items-center justify-center gap-6 rounded-sm border-2 border-dashed p-6',
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
                    <span className="border-grey-90 flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs font-medium">
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
                    // eslint-disable-next-line react/jsx-no-leaked-render
                    disabled={isCompleted && reportFile === undefined}
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

type ReportFileProps = {
  name: string;
  caseId: string;
  reportId: string;
};

const ReportFile = ({ name, caseId, reportId }: ReportFileProps) => {
  const { t } = useTranslation(casesI18n);
  const downloadEndpoint = getRoute('/ressources/cases/sar/download/:caseId/:reportId', {
    caseId,
    reportId,
  });
  const { downloadCaseFile, downloadingCaseFile } = useDownloadFile(downloadEndpoint, {
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
  });

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

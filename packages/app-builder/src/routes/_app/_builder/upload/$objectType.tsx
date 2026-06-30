import { Page, Paper } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { LoadingIcon } from '@app-builder/components/Spinner';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type TableModel } from '@app-builder/models';
import { useUploadTableQuery } from '@app-builder/queries/data/upload-table';
import { useUploadIngestionData } from '@app-builder/queries/upload-ingestion-data';
import { ingestingDataByCsvDocHref } from '@app-builder/services/documentation-href';
import { isIngestDataAvailable } from '@app-builder/services/feature-access';
import { formatNumber, useFormatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { REQUEST_TIMEOUT } from '@app-builder/utils/http/http-status-codes';
import { useQueryClient } from '@tanstack/react-query';
import { ClientOnly, createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type Namespace, type ParseKeys } from 'i18next';
import { type UploadLog } from 'marble-api';
import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Modal, Table, useVirtualTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

const MAX_FILE_SIZE_MB = 32;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const uploadLoader = createServerFn()
  .middleware([authMiddleware])
  .validator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function uploadLoader({ data, context }) {
    const { user, apiClient, dataModelRepository } = context.authInfo;

    if (!isIngestDataAvailable(user)) {
      throw redirect({ to: '/data' });
    }

    const objectType = data?.params?.['objectType'];
    if (!objectType) {
      throw redirect({ to: '/data' });
    }

    const dataModel = await dataModelRepository.getDataModel();
    const table = dataModel.find((t) => t.name === objectType);
    if (!table) {
      throw redirect({ to: '/data' });
    }

    const uploadLogs = await apiClient.getIngestionUploadLogs(objectType);

    return { objectType, table, uploadLogs };
  });

export const Route = createFileRoute('/_app/_builder/upload/$objectType')({
  staticData: {
    i18n: ['common', 'upload'] satisfies Namespace,
  },
  loader: ({ params }) => uploadLoader({ data: { params } }),
  component: Upload,
});

type ModalContent = {
  message: string;
  success: boolean;
  error?: string;
};

const UploadForm = ({ objectType, onSuccess }: { objectType: string; onSuccess?: () => void }) => {
  const { t } = useTranslation(['common', 'upload']);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>({
    message: '',
    success: true,
  });
  const uploadIngestionData = useUploadIngestionData(objectType);

  const computeModalMessage = useCallback(
    ({
      success,
      linesProcessed,
      errorMessage,
    }: {
      success: boolean;
      linesProcessed?: number;
      errorMessage?: string;
    }) => {
      if (success) {
        setModalContent({
          message: t('upload:success_message', {
            replace: { linesProcessed, objectType },
          }),
          success: true,
        });
      } else {
        setModalContent({
          message: t('upload:failure_message'),
          error: errorMessage,
          success: false,
        });
      }
    },
    [objectType, t],
  );

  const onDrop = async (acceptedFiles: File[]) => {
    if (!R.hasAtLeast(acceptedFiles, 1)) {
      return;
    }
    const file = acceptedFiles[0];
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadIngestionData.mutateAsync(formData);
      if (!response.ok) {
        setIsModalOpen(true);
        let errorMessage: string | undefined;
        if (response.status === REQUEST_TIMEOUT) {
          errorMessage = t('upload:errors.request_timeout');
        } else {
          errorMessage = (await response.text()).trim();
        }

        computeModalMessage({
          success: false,
          errorMessage: errorMessage ?? t('common:global_error'),
        });
        return;
      }

      const uploadLog = (await response.json()) as UploadLog;
      setIsModalOpen(true);

      computeModalMessage({
        success: true,
        linesProcessed: uploadLog.lines_processed,
      });
      onSuccess?.();
    } catch (error) {
      setIsModalOpen(true);
      computeModalMessage({
        success: false,
        errorMessage: error instanceof Error ? error.message : t('common:global_error'),
      });
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      void onDrop(acceptedFiles);
    },
    accept: { 'text/*': ['.csv'] },
    multiple: false,
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={clsx(
          'text-s flex h-60 flex-col items-center justify-center gap-md rounded-sm border-2 border-dashed',
          isDragActive ? 'bg-purple-background border-purple-disabled opacity-90' : 'border-grey-placeholder',
        )}
      >
        <input {...getInputProps()} />
        {loading ? <Loading className="border-none" /> : null}
        {!loading ? (
          <>
            <p>{t('upload:drop_file_cta')}</p>
            <p className="text-grey-secondary uppercase">{t('common:or')}</p>
            <Button variant="primary">
              <Icon icon="plus" className="size-5" />
              {t('upload:pick_file_cta')}
            </Button>
          </>
        ) : null}
      </div>
      <ResultModal
        isOpen={isModalOpen}
        modalContent={modalContent}
        objectType={objectType}
        onOpenChange={() => setIsModalOpen(!isModalOpen)}
      />
    </>
  );
};

const ResultModal = ({
  onOpenChange,
  isOpen,
  modalContent,
  objectType,
}: {
  onOpenChange: () => void;
  isOpen: boolean;
  modalContent: ModalContent;
  objectType: string;
}) => {
  const { t } = useTranslation(['common', 'upload']);
  const icon = modalContent.success ? 'tick' : 'cross';

  const errorMessage = (errorString?: string): string | undefined => {
    if (errorString) {
      try {
        const error = JSON.parse(errorString);
        if ('message' in error) return error.message;
      } catch (_error) {
        return errorString;
      }
    }
    return errorString;
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={onOpenChange}>
      <Modal.Content>
        <div className="bg-surface-card text-s flex flex-col items-center gap-lg p-lg">
          <Icon
            icon={icon}
            className={clsx(
              'size-[108px] rounded-full border-8',
              modalContent.success
                ? 'bg-purple-background border-transparent text-purple-primary'
                : 'bg-red-background border-transparent text-red-primary',
            )}
          />
          <div className="flex flex-col items-center gap-sm">
            <p className="text-l font-semibold">{t('upload:results')}</p>
            <p>{modalContent.message}</p>
            {!modalContent.success ? (
              <>
                <p className="first-letter:capitalize">{errorMessage(modalContent.error)}</p>
                <p className="mt-lg">
                  {t('upload:failure_additional_message', {
                    replace: { objectType },
                  })}
                </p>
              </>
            ) : null}
          </div>
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton variant="secondary" label={t('common:understand')} leadingIcon="tick" />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

const columnHelper = createColumnHelper<UploadLog>();

const PastUploads = ({
  uploadLogs,
  onRefresh,
  isFetching,
}: {
  uploadLogs: UploadLog[];
  onRefresh: () => void;
  isFetching: boolean;
}) => {
  const { t } = useTranslation(['upload']);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.started_at, {
        id: 'upload.started_at',
        header: t('upload:started_at'),
        size: 200,
        cell: ({ getValue }) => {
          const dateTime = getValue();
          return (
            <time dateTime={dateTime}>{formatDateTime(dateTime, { dateStyle: 'short', timeStyle: 'short' })}</time>
          );
        },
      }),
      columnHelper.accessor((row) => row.finished_at, {
        id: 'upload.finished_at',
        header: t('upload:finished_at'),
        size: 200,
        cell: ({ getValue }) => {
          const dateTime = getValue();
          if (!dateTime) return '';
          return (
            <time dateTime={dateTime}>{formatDateTime(dateTime, { dateStyle: 'short', timeStyle: 'short' })}</time>
          );
        },
      }),
      columnHelper.accessor((row) => row.lines_processed, {
        id: 'upload.lines_processed',
        cell: ({ getValue }) => <span>{formatNumber(getValue(), { language })}</span>,
        header: t('upload:lines_processed'),
        size: 200,
      }),
      columnHelper.accessor((row) => row.num_rows_ingested, {
        id: 'upload.num_rows_ingested',
        cell: ({ getValue }) => <span>{formatNumber(getValue(), { language })}</span>,
        header: t('upload:num_rows_ingested'),
        size: 200,
      }),
      columnHelper.accessor((row) => row.status, {
        id: 'upload.status',
        cell: ({ getValue }) => (
          <div className="flex flex-row items-center gap-sm">
            {getStatusIcon(getValue())}
            <p className="capitalize">{t(getStatusTKey(getValue()))}</p>
          </div>
        ),
        header: t('upload:upload_status'),
        size: 200,
      }),
    ],
    [formatDateTime, language, t],
  );

  const { getBodyProps, getContainerProps, table, rows } = useVirtualTable({
    data: uploadLogs,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Paper.Container className="bg-surface-card mb-2xl w-full">
      <div className="flex items-center justify-between">
        <Paper.Title>{t('upload:past_uploads')}</Paper.Title>
        <Button
          variant="secondary"
          size="small"
          onClick={onRefresh}
          disabled={isFetching}
          aria-label={t('upload:refresh')}
        >
          <LoadingIcon icon="restart-alt" loading={isFetching} className="size-4" />
        </Button>
      </div>
      <Table.Container {...getContainerProps()} className="max-h-96">
        <Table.Header headerGroups={table.getHeaderGroups()} />
        <Table.Body {...getBodyProps()}>
          {rows.map((row) => (
            <Table.Row key={row.id} row={row} />
          ))}
        </Table.Body>
      </Table.Container>
    </Paper.Container>
  );
};

const getStatusIcon = (status: string) => {
  if (status === 'success') {
    return <Icon icon="tick" className="text-green-primary size-6" />;
  }
  if (status === 'failure') {
    return <Icon icon="cross" className="text-red-primary size-6" />;
  }
  return <Icon icon="restart-alt" className="text-grey-secondary size-6" />;
};

const getStatusTKey = (status: string): ParseKeys<['upload']> => {
  if (status === 'success') {
    return 'upload:status_success';
  }
  if (status === 'failure') {
    return 'upload:status_failure';
  }
  if (status === 'processing') {
    return 'upload:status_processing';
  }
  return 'upload:status_pending';
};

function Upload() {
  const { t } = useTranslation(['common', 'upload']);
  const { objectType, table, uploadLogs: initialUploadLogs } = Route.useLoaderData();
  const queryClient = useQueryClient();
  const { data: uploadLogs = initialUploadLogs, refetch, isFetching } = useUploadTableQuery(objectType, true);

  const handleUploadSuccess = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['ingestion', 'upload-logs', objectType] });
  }, [queryClient, objectType]);

  const handleRefresh = useCallback(() => {
    void refetch().then((result) => {
      if (result.isError) toast.error(t('common:errors.unknown'));
    });
  }, [refetch, t]);

  return (
    <Page.Main>
      <Page.Header>
        <Icon icon="upload" className="me-sm size-6" />
        {t('upload:upload_cta', { replace: { objectType } })}
      </Page.Header>
      <Page.Container>
        <Page.Description>
          <p className="whitespace-pre-wrap">
            <Trans
              t={t}
              i18nKey="upload:upload_callout_1"
              components={{
                DocLink: <ExternalLink href={ingestingDataByCsvDocHref} />,
              }}
              values={{ objectType }}
            />
            <br />
            {t('upload:upload_callout_2')}
          </p>
        </Page.Description>
        <Page.Content>
          <div className="flex">
            <ClientOnly fallback={<LoadingButton />}>
              <a
                href={generateCsvTemplateLink(table)}
                download={`${objectType}_template.csv`}
                className={clsx(
                  'text-s flex flex-row items-center justify-center gap-xs rounded-sm border border-solid px-sm py-xs font-semibold outline-hidden',
                  'hover:bg-grey-background active:bg-grey-border bg-surface-card border-grey-border text-grey-primary disabled:text-grey-secondary disabled:border-grey-background disabled:bg-grey-background focus:border-purple-primary',
                )}
              >
                <Icon icon="download" className="me-sm size-6" />
                {t('upload:download_template_cta')}
              </a>
            </ClientOnly>
          </div>
          <ClientOnly fallback={<Loading />}>
            <UploadForm objectType={objectType} onSuccess={handleUploadSuccess} />
          </ClientOnly>
          {uploadLogs.length > 0 ? (
            <PastUploads uploadLogs={uploadLogs} onRefresh={handleRefresh} isFetching={isFetching} />
          ) : null}
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

const Loading = ({ className }: { className?: string }) => {
  const { t } = useTranslation(['common']);
  return (
    <div
      className={clsx(
        className,
        'border-grey-placeholder flex h-60 flex-col items-center justify-center gap-md rounded-sm border-2 border-dashed',
      )}
    >
      {t('common:loading')}
    </div>
  );
};

const LoadingButton = () => {
  const { t } = useTranslation(['upload']);
  return (
    <Button variant="secondary" className="cursor-wait">
      <Icon icon="helpcenter" className="me-sm size-5" />
      {t('upload:download_template_cta')}
    </Button>
  );
};

const generateCsvTemplateLink = (table: TableModel): string => {
  const csvContent = table.fields.map((field) => field.name).join(',') + '\n';
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' });
  return URL.createObjectURL(blob);
};

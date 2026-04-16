import { type TableModel } from '@app-builder/models';
import { useUploadIngestionData } from '@app-builder/queries/upload-ingestion-data';
import { formatNumber, useFormatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { REQUEST_TIMEOUT } from '@app-builder/utils/http/http-status-codes';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type ParseKeys } from 'i18next';
import { type UploadLog } from 'marble-api';
import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Modal, Table, useVirtualTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const MAX_FILE_SIZE_MB = 32;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export const generateCsvTemplateLink = (table: TableModel): string => {
  const csvContent = table.fields.map((field) => field.name).join(',') + '\n';
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' });
  return URL.createObjectURL(blob);
};

export const getStatusIcon = (status: string) => {
  if (status === 'success') {
    return <Icon icon="tick" className="text-green-primary size-6" />;
  }
  if (status === 'failure') {
    return <Icon icon="cross" className="text-red-primary size-6" />;
  }
  return <Icon icon="restart-alt" className="text-grey-secondary size-6" />;
};

export const getStatusTKey = (status: string): ParseKeys<['upload']> => {
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

type ModalContent = {
  message: string;
  success: boolean;
  error?: string;
};

export const ResultModal = ({
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
  const { t } = useTranslation(['upload', 'common']);
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
        <div className="bg-surface-card text-s flex flex-col items-center gap-6 p-6">
          <Icon
            icon={icon}
            className={clsx(
              'size-[108px] rounded-full border-8',
              modalContent.success
                ? 'bg-purple-background border-transparent text-purple-primary'
                : 'bg-red-background border-transparent text-red-primary',
            )}
          />
          <div className="flex flex-col items-center gap-2">
            <p className="text-l font-semibold">{t('upload:results')}</p>
            <p>{modalContent.message}</p>
            {!modalContent.success ? (
              <>
                <p className="first-letter:capitalize">{errorMessage(modalContent.error)}</p>
                <p className="mt-6">
                  {t('upload:failure_additional_message', {
                    replace: { objectType },
                  })}
                </p>
              </>
            ) : null}
          </div>
        </div>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button variant="primary">
              <Icon icon="tick" className="size-5" />
              {t('common:understand')}
            </Button>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export const UploadForm = ({
  objectType,
  onSuccess,
}: {
  objectType: string;
  onSuccess: (uploadLog: UploadLog) => void;
}) => {
  const { t } = useTranslation(['upload', 'common']);
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
      onSuccess(uploadLog);
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
          'text-s flex h-60 flex-col items-center justify-center gap-4 rounded-sm border-2 border-dashed',
          isDragActive ? 'bg-purple-background border-purple-disabled opacity-90' : 'border-grey-placeholder',
        )}
      >
        <input {...getInputProps()} />
        {loading ? <UploadFormLoading className="border-none" /> : null}
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

export const UploadFormLoading = ({ className }: { className?: string }) => {
  const { t } = useTranslation(['common']);
  return (
    <div
      className={clsx(
        className,
        'border-grey-placeholder flex h-60 flex-col items-center justify-center gap-4 rounded-sm border-2 border-dashed',
      )}
    >
      {t('common:loading')}
    </div>
  );
};

const columnHelper = createColumnHelper<UploadLog>();

export const PastUploads = ({ uploadLogs }: { uploadLogs: UploadLog[] }) => {
  const { t } = useTranslation(['upload']);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.started_at, {
        id: 'upload.started_at',
        header: t('upload:started_at'),
        size: 160,
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
        size: 160,
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
        size: 130,
      }),
      columnHelper.accessor((row) => row.num_rows_ingested, {
        id: 'upload.num_rows_ingested',
        cell: ({ getValue }) => <span>{formatNumber(getValue(), { language })}</span>,
        header: t('upload:num_rows_ingested'),
        size: 130,
      }),
      columnHelper.accessor((row) => row.status, {
        id: 'upload.status',
        cell: ({ getValue }) => (
          <div className="flex flex-row items-center gap-2">
            {getStatusIcon(getValue())}
            <p className="capitalize">{t(getStatusTKey(getValue()))}</p>
          </div>
        ),
        header: t('upload:upload_status'),
        size: 130,
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
    <Table.Container {...getContainerProps()} className="max-h-96">
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => (
          <Table.Row key={row.id} row={row} />
        ))}
      </Table.Body>
    </Table.Container>
  );
};

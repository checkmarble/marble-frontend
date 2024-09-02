import { Callout, Page, Paper } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { type TableModel } from '@app-builder/models';
import { useBackendInfo } from '@app-builder/services/auth/auth.client';
import { ingestingDataByCsvDocHref } from '@app-builder/services/documentation-href';
import { clientServices } from '@app-builder/services/init.client';
import { serverServices } from '@app-builder/services/init.server';
import {
  formatDateTime,
  formatNumber,
  useFormatLanguage,
} from '@app-builder/utils/format';
import { REQUEST_TIMEOUT } from '@app-builder/utils/http/http-status-codes';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type Namespace, type ParseKeys } from 'i18next';
import { type UploadLog } from 'marble-api';
import { useCallback, useMemo, useState } from 'react';
import * as reactDropzone from 'react-dropzone';
const { useDropzone } = reactDropzone;
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { ClientOnly } from 'remix-utils/client-only';
import { Button, Modal, Table, useVirtualTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'upload'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;
  const { apiClient, user, dataModelRepository } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });
  const isIngestDataAvailable =
    featureAccessService.isIngestDataAvailable(user);
  if (!isIngestDataAvailable) {
    return redirect(getRoute('/data'));
  }

  const objectType = params['objectType'];
  if (!objectType) {
    return redirect(getRoute('/data'));
  }

  const dataModel = await dataModelRepository.getDataModel();
  const table = dataModel.find((table) => table.name == objectType);
  if (!table) {
    return redirect(getRoute('/data'));
  }

  const uploadLogs = await apiClient.getIngestionUploadLogs(objectType);

  return json({ objectType, table, uploadLogs });
}

type ModalContent = {
  message: string;
  success: boolean;
  error?: string;
};

const UploadForm = ({ objectType }: { objectType: string }) => {
  const { t } = useTranslation(handle.i18n);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>({
    message: '',
    success: true,
  });
  const revalidator = useRevalidator();

  const { getAccessToken, backendUrl } = useBackendInfo(
    clientServices.authenticationClientService,
  );

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

      const tokenResponse = await getAccessToken();
      if (!tokenResponse.success) {
        setIsModalOpen(true);
        computeModalMessage({
          success: false,
          errorMessage: t('common:errors.firebase_auth_error'),
        });
        return;
      }

      const response = await fetch(
        `${backendUrl}/ingestion/${objectType}/batch`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
          },
        },
      );
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
      revalidator.revalidate();
    } catch (error) {
      setIsModalOpen(true);
      computeModalMessage({
        success: false,
        errorMessage:
          error instanceof Error ? error.message : t('common:global_error'),
      });
    } finally {
      setLoading(false);
    }
    return;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      void onDrop(acceptedFiles);
    },
    accept: { 'text/*': ['.csv'] },
    multiple: false,
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={clsx(
          'text-s flex h-60 flex-col items-center justify-center gap-4 rounded border-2 border-dashed',
          isDragActive
            ? 'bg-purple-10 border-purple-50 opacity-90'
            : 'border-grey-50',
        )}
      >
        <input {...getInputProps()} />
        {loading ? <Loading className="border-none" /> : null}
        {!loading ? (
          <>
            <p>{t('upload:drop_file_cta')}</p>
            <p className="text-grey-25 uppercase">{t('common:or')}</p>
            <Button>
              <Icon icon="plus" className="size-6" />
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
  const { t } = useTranslation(handle.i18n);
  const icon = modalContent.success ? 'tick' : 'cross';

  return (
    <Modal.Root open={isOpen} onOpenChange={onOpenChange}>
      <Modal.Content>
        <div className="bg-grey-00 text-s flex flex-col items-center gap-6 p-6">
          <Icon
            icon={icon}
            className={clsx(
              'size-[108px] rounded-full border-8',
              modalContent.success
                ? 'bg-purple-10 border-purple-10 text-purple-100'
                : 'bg-red-10 border-red-10 text-red-100',
            )}
          />
          <div className="flex flex-col items-center gap-2">
            <p className="text-l font-semibold">{t('upload:results')}</p>
            <p>{modalContent.message}</p>
            {!modalContent.success ? (
              <>
                <p>{modalContent.error}</p>
                <p className="mt-6">
                  {t('upload:failure_additional_message', {
                    replace: { objectType },
                  })}
                </p>
              </>
            ) : null}
          </div>
          <Modal.Close asChild>
            <div className="flex justify-center">
              <Button>
                <Icon icon="tick" className="size-6" />
                {t('common:understand')}
              </Button>
            </div>
          </Modal.Close>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
};

const columnHelper = createColumnHelper<UploadLog>();

const PastUploads = ({ uploadLogs }: { uploadLogs: UploadLog[] }) => {
  const { t } = useTranslation(handle.i18n);
  const language = useFormatLanguage();

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.started_at, {
        id: 'upload.started_at',
        header: t('upload:started_at'),
        size: 200,
        cell: ({ getValue }) => {
          const dateTime = getValue();
          return (
            <time dateTime={dateTime}>
              {formatDateTime(dateTime, { language })}
            </time>
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
            <time dateTime={dateTime}>
              {formatDateTime(dateTime, { language })}
            </time>
          );
        },
      }),
      columnHelper.accessor((row) => row.lines_processed, {
        id: 'upload.lines_processed',
        cell: ({ getValue }) => (
          <span>{formatNumber(getValue(), { language })}</span>
        ),
        header: t('upload:lines_processed'),
        size: 200,
      }),
      columnHelper.accessor((row) => row.num_rows_ingested, {
        id: 'upload.num_rows_ingested',
        cell: ({ getValue }) => (
          <span>{formatNumber(getValue(), { language })}</span>
        ),
        header: t('upload:num_rows_ingested'),
        size: 200,
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
        size: 200,
      }),
    ],
    [language, t],
  );

  const { getBodyProps, getContainerProps, table, rows } = useVirtualTable({
    data: uploadLogs,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Paper.Container className="bg-grey-00 mb-10 w-full">
      <Paper.Title> {t('upload:past_uploads')} </Paper.Title>
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
    return <Icon icon="tick" className="size-6 text-green-100" />;
  }
  if (status === 'failure') {
    return <Icon icon="cross" className="size-6 text-red-100" />;
  }
  return <Icon icon="restart-alt" className="text-grey-50 size-6" />;
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

export default function Upload() {
  const { t } = useTranslation(handle.i18n);
  const { objectType, table, uploadLogs } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header>
        <Icon icon="upload" className="mr-2 size-6" />
        {t('upload:upload_cta', { replace: { objectType } })}
      </Page.Header>
      <Page.Content>
        <Callout className="whitespace-normal" variant="outlined">
          <div className="leading-8">
            <p className="whitespace-pre text-wrap">
              <Trans
                t={t}
                i18nKey="upload:upload_callout_1"
                components={{
                  DocLink: <ExternalLink href={ingestingDataByCsvDocHref} />,
                }}
                values={{ objectType }}
              />
            </p>
            <p>{t('upload:upload_callout_2')}</p>
          </div>
        </Callout>
        <div className="flex">
          <ClientOnly fallback={<LoadingButton />}>
            {() => (
              <a
                href={generateCsvTemplateLink(table)}
                download={`${objectType}_template.csv`}
                className={clsx(
                  'text-s flex flex-row items-center justify-center gap-1 rounded border border-solid px-4 py-2 font-semibold outline-none',
                  'hover:bg-grey-05 active:bg-grey-10 bg-grey-00 border-grey-10 text-grey-100 disabled:text-grey-50 disabled:border-grey-05 disabled:bg-grey-05 focus:border-purple-100',
                )}
              >
                <Icon icon="download" className="mr-2 size-6" />
                {t('upload:download_template_cta')}
              </a>
            )}
          </ClientOnly>
        </div>
        <ClientOnly fallback={<Loading />}>
          {() => <UploadForm objectType={objectType} />}
        </ClientOnly>
        {uploadLogs.length > 0 ? <PastUploads uploadLogs={uploadLogs} /> : null}
      </Page.Content>
    </Page.Container>
  );
}

const Loading = ({ className }: { className?: string }) => {
  const { t } = useTranslation(handle.i18n);
  return (
    <div
      className={clsx(
        className,
        'border-grey-50 flex h-60 flex-col items-center justify-center gap-4 rounded border-2 border-dashed',
      )}
    >
      {t('common:loading')}
    </div>
  );
};

const LoadingButton = () => {
  const { t } = useTranslation(handle.i18n);
  return (
    <Button variant="secondary" className="cursor-wait">
      <Icon icon="helpcenter" className="mr-2 size-6" />
      {t('upload:download_template_cta')}
    </Button>
  );
};

const generateCsvTemplateLink = (table: TableModel): string => {
  const csvContent = table.fields.map((field) => field.name).join(',') + '\n';
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' });
  return URL.createObjectURL(blob);
};

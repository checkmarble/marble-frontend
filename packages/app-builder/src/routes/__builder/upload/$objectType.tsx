import { Callout, Page, Paper } from '@app-builder/components';
import { useBackendInfo } from '@app-builder/services/auth/auth.client';
import { clientServices } from '@app-builder/services/init.client';
import { serverServices } from '@app-builder/services/init.server';
import { formatCreatedAt } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { type UploadLog } from '@marble-api';
import { json, type LoaderArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type ColumnDef, getCoreRowModel } from '@tanstack/react-table';
import { Button, Modal, Table, useVirtualTable } from '@ui-design-system';
import {
  Cross,
  Help as HelpIcon,
  Plus as PlusIcon,
  RestartAlt,
  Tick,
} from '@ui-icons';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils';

export const handle = {
  i18n: ['common', 'upload'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient, user, dataModelRepository } =
    await authService.isAuthenticated(request, {
      failureRedirect: '/login',
    });

  if (!user.permissions.canIngestData) {
    return redirect(getRoute('/data'));
  }

  const objectType = params['objectType'];
  if (!objectType) {
    return redirect(getRoute('/data'));
  }

  const dataModel = await dataModelRepository.getDataModel();
  if (!dataModel.map((table) => table.name).includes(objectType)) {
    return redirect(getRoute('/data'));
  }

  const uploadLogs = await apiClient.getIngestionUploadLogs(objectType);

  return json({ objectType, uploadLogs });
}

type ModalContent = {
  message: string;
  success: boolean;
};

const UploadForm = ({ objectType }: { objectType: string }) => {
  const { t } = useTranslation(handle.i18n);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>({
    message: '',
    success: true,
  });

  const { accessToken, backendUrl } = useBackendInfo(
    clientServices.authenticationClientService
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
          message: t('upload:success_message', { replace: { linesProcessed } }),
          success: true,
        });
      } else {
        setModalContent({
          message: t('upload:failure_message', { replace: { errorMessage } }),
          success: false,
        });
      }
    },
    [t]
  );

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length < 1) {
      return;
    }
    const file = acceptedFiles[0];
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${backendUrl}/ingestion/${objectType}/batch`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${await accessToken()}`,
          },
        }
      );
      if (!response.ok) {
        const errorMessage = await response.text();
        setIsModalOpen(true);
        computeModalMessage({
          success: false,
          errorMessage: !errorMessage.trim()
            ? t('common:global_error')
            : errorMessage.trim(),
        });
        return;
      }

      const uploadLog = (await response.json()) as UploadLog;
      setIsModalOpen(true);

      computeModalMessage({
        success: true,
        linesProcessed: uploadLog.lines_processed,
      });
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
    accept: { string: ['.csv'] },
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
            : 'border-grey-50'
        )}
      >
        <input {...getInputProps()} />
        {loading && <Loading />}
        {!loading && (
          <>
            <p>{t('upload:drop_file_cta')}</p>
            <p className="text-grey-25 uppercase">{t('common:or')}</p>
            <Button>
              <PlusIcon height="24px" width="24px" />
              {t('upload:pick_file_cta')}
            </Button>
          </>
        )}
      </div>
      <ResultModal
        isOpen={isModalOpen}
        modalContent={modalContent}
        onOpenChange={() => setIsModalOpen(!isModalOpen)}
      />
    </>
  );
};

const ResultModal = ({
  onOpenChange,
  isOpen,
  modalContent,
}: {
  onOpenChange: () => void;
  isOpen: boolean;
  modalContent: ModalContent;
}) => {
  const { t } = useTranslation(handle.i18n);
  const Icon = modalContent.success ? Tick : Cross;

  return (
    <Modal.Root open={isOpen} onOpenChange={onOpenChange}>
      <Modal.Content>
        <div className="bg-grey-00 text-s flex flex-col items-center gap-8 p-8">
          <Icon
            width="108px"
            height="108px"
            className={clsx(
              'rounded-full border-8',
              modalContent.success
                ? 'bg-purple-10 border-purple-10 text-purple-100'
                : 'bg-red-10 border-red-10 text-red-100'
            )}
          />
          <div className="flex flex-col items-center gap-2">
            <p className="text-l font-semibold">{t('upload:results')}</p>
            <p>{modalContent.message}</p>
            {!modalContent.success && (
              <p className="mt-6">{t('upload:failure_additional_message')}</p>
            )}
          </div>
          <Modal.Close asChild>
            <div className="flex justify-center">
              <Button>
                <Tick height="24px" width="24px" />
                {t('common:understand')}
              </Button>
            </div>
          </Modal.Close>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
};

const PastUploads = ({ uploadLogs }: { uploadLogs: UploadLog[] }) => {
  const { t, i18n } = useTranslation(handle.i18n);
  const getStatusIcon = useCallback((status: string) => {
    if (status === 'success') {
      return <Tick className="text-green-100" height="24px" width="24px" />;
    }
    return <RestartAlt className="text-grey-50" height="24px" width="24px" />;
  }, []);
  const getStatusMessage = useCallback(
    (status: string) => {
      if (status === 'success') {
        return t('upload:status_success');
      }
      return t('upload:status_pending');
    },
    [t]
  );

  const columns = useMemo<ColumnDef<UploadLog>[]>(
    () => [
      {
        id: 'upload.started_at',
        accessorFn: (row) => formatCreatedAt(i18n.language, row.started_at),
        header: t('upload:started_at'),
        size: 200,
      },
      {
        id: 'upload.finished_at',
        accessorFn: (row) =>
          row.finished_at
            ? formatCreatedAt(i18n.language, row.finished_at)
            : '',
        header: t('upload:finished_at'),
        size: 200,
      },
      {
        id: 'upload.lines_processed',
        accessorFn: (row) => row.lines_processed,
        header: t('upload:lines_processed'),
        size: 200,
      },
      {
        id: 'upload.status',
        accessorFn: (row) => row.status,
        cell: ({ getValue }) => (
          <div className="flex flex-row items-center gap-2">
            {getStatusIcon(getValue<string>())}
            <p className="capitalize">{getStatusMessage(getValue<string>())}</p>
          </div>
        ),
        header: t('upload:upload_status'),
        size: 200,
      },
    ],
    [getStatusIcon, getStatusMessage, i18n.language, t]
  );

  const { getBodyProps, getContainerProps, table, rows } = useVirtualTable({
    data: uploadLogs,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Paper.Container className="mb-10 w-full">
      <Paper.Title> {t('upload:past_uploads')} </Paper.Title>
      <Table.Container {...getContainerProps()}>
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

export default function Upload() {
  const { t } = useTranslation(handle.i18n);
  const { objectType, uploadLogs } = useLoaderData<typeof loader>();

  // const downloadTemplateCsv = () => {
  //   alert('I wil download your template, i promise');
  // };

  return (
    <Page.Container>
      <Page.Header>
        <HelpIcon className="mr-2" height="24px" width="24px" />
        {t('upload:upload_cta', { replace: { objectType } })}
      </Page.Header>
      <Page.Content>
        <Callout className="whitespace-normal">
          <div className="leading-8">
            <p>{t('upload:upload_callout_1')}</p>
            <p>{t('upload:upload_callout_2')}</p>
          </div>
        </Callout>
        {/* <div>
          <Button variant="secondary" onClick={downloadTemplateCsv}>
            <HelpIcon className="mr-2" height="24px" width="24px" />
            {t('upload:download_template_cta')}
          </Button>
        </div> */}
        <ClientOnly fallback={<Loading />}>
          {() => <UploadForm objectType={objectType} />}
        </ClientOnly>
        {uploadLogs && <PastUploads uploadLogs={uploadLogs} />}
      </Page.Content>
    </Page.Container>
  );
}

const Loading = () => {
  const { t } = useTranslation(handle.i18n);
  return (
    <div className="border-grey-50 flex h-60 flex-col items-center justify-center gap-4 rounded border-2 border-dashed">
      {t('common:loading')}
    </div>
  );
};

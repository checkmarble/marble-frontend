import {
  AlreadyDownloadingError,
  AuthRequestError,
  useDownloadCaseFiles,
} from '@app-builder/services/DownloadCaseFilesService';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { type CaseFile } from 'marble-api';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { last } from 'remeda';
import { ClientOnly } from 'remix-utils/client-only';
import { Button, Collapsible, Table, useVirtualTable } from 'ui-design-system';

import { casesI18n } from './cases-i18n';

export function CaseFiles({ files }: { files: CaseFile[] }) {
  const { t } = useTranslation(casesI18n);

  return (
    <Collapsible.Container className="bg-grey-00">
      <Collapsible.Title>
        <div className="flex flex-1 items-center justify-between">
          <span className="text-grey-100 text-m font-bold capitalize">
            {t('cases:case.files')}
          </span>
          <span className="text-grey-25 text-xs font-normal capitalize">
            {t('cases:case_detail.files_count', {
              count: files.length,
            })}
          </span>
        </div>
      </Collapsible.Title>
      <Collapsible.Content>
        <FilesList files={files} />
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

const columnHelper = createColumnHelper<CaseFile>();

function FilesList({ files }: { files: CaseFile[] }) {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();

  const columns = useMemo(() => {
    const columns = [
      columnHelper.accessor((row) => row.file_name, {
        id: 'file_name',
        header: t('cases:case.file.name'),
        size: 120,
      }),
      columnHelper.accessor((row) => row.file_name, {
        id: 'extension',
        size: 40,
        header: t('cases:case.file.extension'),
        cell: ({ getValue }) => {
          return last(getValue().split('.'))?.toUpperCase();
        },
      }),
      columnHelper.accessor((row) => row.created_at, {
        id: 'created_at',
        header: t('cases:case.file.added_date'),
        size: 40,
        cell: ({ getValue }) => {
          const dateTime = getValue();
          return (
            <time dateTime={dateTime}>
              {formatDateTime(dateTime, { language, timeStyle: undefined })}
            </time>
          );
        },
      }),
      columnHelper.accessor((row) => row.id, {
        id: 'link',
        header: t('cases:case.file.download'),
        size: 40,
        cell: ({ getValue }) => {
          return <FileLink caseFileId={getValue()} />;
        },
      }),
    ];
    return columns;
  }, [language, t]);

  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: files,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Table.Container {...getContainerProps()} className="bg-grey-00 max-h-96">
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => {
          return <Table.Row key={row.id} tabIndex={0} row={row} />;
        })}
      </Table.Body>
    </Table.Container>
  );
}

function FileLink({ caseFileId }: { caseFileId: string }) {
  const { downloadCaseFile, downloadingCaseFile } = useDownloadCaseFiles(
    caseFileId,
    {
      onError: (e) => {
        if (e instanceof AlreadyDownloadingError) {
          // Already downloading, do nothing
          return;
        } else if (e instanceof AuthRequestError) {
          toast.error(
            t('cases:case.file.errors.downloading_decisions_link.auth_error'),
          );
        } else {
          toast.error(
            t('cases:case.file.errors.downloading_decisions_link.unknown'),
          );
        }
      },
    },
  );
  const { t } = useTranslation(casesI18n);

  return (
    <ClientOnly>
      {() => (
        <Button
          variant="secondary"
          onClick={() => {
            void downloadCaseFile();
          }}
          name="download"
          disabled={downloadingCaseFile}
        >
          {downloadingCaseFile
            ? t('cases:case.file.downloading')
            : t('cases:case.file.download')}
        </Button>
      )}
    </ClientOnly>
  );
}

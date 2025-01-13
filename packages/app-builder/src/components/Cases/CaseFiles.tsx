import { type CaseFile } from '@app-builder/models/cases';
import {
  AlreadyDownloadingError,
  AuthRequestError,
  useDownloadCaseFiles,
} from '@app-builder/services/DownloadCaseFilesService';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { ClientOnly } from 'remix-utils/client-only';
import { Button, Table, useVirtualTable } from 'ui-design-system';

import { casesI18n } from './cases-i18n';

const columnHelper = createColumnHelper<CaseFile>();

export function FilesList({ files }: { files: CaseFile[] }) {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();

  const columns = useMemo(() => {
    const columns = [
      columnHelper.accessor((row) => row.fileName, {
        id: 'file_name',
        header: t('cases:case.file.name'),
        size: 100,
      }),
      columnHelper.accessor((row) => row.fileName, {
        id: 'extension',
        size: 40,
        header: t('cases:case.file.extension'),
        cell: ({ getValue }) => {
          return R.last(getValue().split('.'))?.toUpperCase();
        },
      }),
      columnHelper.accessor((row) => row.createdAt, {
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
    <Table.Container {...getContainerProps()} className="bg-grey-100 max-h-96">
      <Table.Header headerGroups={table.getHeaderGroups()} />
      <Table.Body {...getBodyProps()}>
        {rows.map((row) => {
          return <Table.Row key={row.id} row={row} />;
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
          toast.error(t('cases:case.file.errors.downloading_link.auth_error'));
        } else {
          toast.error(t('cases:case.file.errors.downloading_link.unknown'));
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

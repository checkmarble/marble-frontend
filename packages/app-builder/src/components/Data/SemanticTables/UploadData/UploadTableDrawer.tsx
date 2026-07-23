import { ExternalLink } from '@app-builder/components/ExternalLink';
import { Panel } from '@app-builder/components/Panel';
import { LoadingIcon } from '@app-builder/components/Spinner';
import { type TableModel } from '@app-builder/models';
import { useUploadTableQuery } from '@app-builder/queries/data/upload-table';
import { ingestingDataByCsvDocHref } from '@app-builder/services/documentation-href';
import { useQueryClient } from '@tanstack/react-query';
import { type UploadLog } from 'marble-api';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { generateCsvTemplateLink, PastUploads, UploadForm } from './UploadIngestionComponents';

export function UploadTableDrawer({
  open,
  onClose,
  tableName,
  tableModel,
}: {
  open: boolean;
  onClose: () => void;
  tableName: string;
  tableModel: TableModel;
}) {
  const { t } = useTranslation(['data', 'upload', 'common']);
  const queryClient = useQueryClient();
  const uploadLogsQuery = useUploadTableQuery(tableName, open, { refetchInterval: 1_000 });

  const handleUploadSuccess = (_uploadLog: UploadLog) => {
    queryClient.invalidateQueries({ queryKey: ['ingestion', 'upload-logs', tableName] });
  };

  const handleRefresh = () => {
    uploadLogsQuery.refetch().then((result) => {
      if (result.isError) toast.error(t('common:errors.unknown'));
    });
  };

  if (!open) return null;

  const uploadLogs = uploadLogsQuery.data ?? [];

  return (
    <Panel.Root
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          onClose();
        }
      }}
    >
      <Panel.Container size="medium">
        <Panel.Content>
          <Panel.Header>
            <div className="flex shrink-0 items-center gap-md">
              <Icon icon="upload" className="size-5" />
              <Typo variant="subtitle1">{t('upload:upload_cta', { replace: { objectType: tableName } })}</Typo>
              <Tag color="grey">{tableName}</Tag>
            </div>
          </Panel.Header>

          <div className="flex flex-col gap-lg">
            <p className="text-s whitespace-pre-wrap text-grey-secondary">
              <Trans
                t={t}
                i18nKey="upload:upload_callout_1"
                components={{
                  DocLink: <ExternalLink href={ingestingDataByCsvDocHref} />,
                }}
                values={{ objectType: tableName }}
              />
              <br />
              {t('upload:upload_callout_2')}
            </p>

            <div className="flex">
              <a
                href={generateCsvTemplateLink(tableModel)}
                download={`${tableName}_template.csv`}
                className="text-s flex flex-row items-center justify-center gap-xs rounded-sm border border-solid px-sm py-xs font-semibold outline-hidden hover:bg-grey-background active:bg-grey-border bg-surface-card border-grey-border text-grey-primary disabled:text-grey-secondary disabled:border-grey-background disabled:bg-grey-background focus:border-purple-primary"
              >
                <Icon icon="download" className="me-sm size-6" />
                {t('upload:download_template_cta')}
              </a>
            </div>

            <UploadForm objectType={tableName} onSuccess={handleUploadSuccess} />

            {uploadLogs.length > 0 ? (
              <div className="flex flex-col gap-sm">
                <div className="flex items-center justify-between">
                  <Typo variant="subtitle2">{t('upload:past_uploads')}</Typo>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleRefresh}
                    disabled={uploadLogsQuery.isFetching}
                    aria-label={t('upload:refresh')}
                  >
                    <LoadingIcon icon="restart-alt" loading={uploadLogsQuery.isFetching} className="size-4" />
                  </Button>
                </div>
                <PastUploads uploadLogs={uploadLogs} />
              </div>
            ) : null}
          </div>
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}

import { ExternalLink } from '@app-builder/components/ExternalLink';
import { type TableModel } from '@app-builder/models';
import { ingestingDataByCsvDocHref } from '@app-builder/services/documentation-href';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type UploadLog } from 'marble-api';
import { Trans, useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
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
  const uploadLogsQuery = useQuery({
    queryKey: ['ingestion', 'upload-logs', tableName],
    queryFn: async () => {
      const response = await fetch(
        getRoute('/ressources/ingestion/upload-logs/:objectType', { objectType: tableName }),
      );
      return response.json() as Promise<UploadLog[]>;
    },
    enabled: open,
  });

  const handleUploadSuccess = (_uploadLog: UploadLog) => {
    queryClient.invalidateQueries({ queryKey: ['ingestion', 'upload-logs', tableName] });
  };

  if (!open) return null;

  const uploadLogs = uploadLogsQuery.data ?? [];

  return (
    <>
      {/* Backdrop */}
      <div className="animate-overlay-show bg-grey-primary/20 fixed inset-0 z-40 backdrop-blur-xs" onClick={onClose} />
      {/* Drawer panel */}
      <aside className="animate-slideRightAndFadeIn fixed right-0 top-0 z-50 h-full w-[max(900px,50vw)] border-l border-grey-border shadow-lg">
        <div className="bg-surface-card flex h-full flex-col overflow-hidden">
          <header className="flex shrink-0 items-center gap-v2-md border-b border-grey-border p-v2-lg">
            <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-grey-border">
              <Icon icon="x" className="size-5" />
            </button>
            <Icon icon="upload" className="size-5" />
            <h3 className="text-l font-semibold">{t('upload:upload_cta', { replace: { objectType: tableName } })}</h3>
            <Tag color="grey">{tableName}</Tag>
          </header>

          <div className="flex-1 overflow-y-auto p-v2-lg">
            <div className="flex flex-col gap-v2-lg">
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
                  className="text-s flex flex-row items-center justify-center gap-1 rounded-sm border border-solid px-4 py-2 font-semibold outline-hidden hover:bg-grey-background active:bg-grey-border bg-surface-card border-grey-border text-grey-primary disabled:text-grey-secondary disabled:border-grey-background disabled:bg-grey-background focus:border-purple-primary"
                >
                  <Icon icon="download" className="me-2 size-6" />
                  {t('upload:download_template_cta')}
                </a>
              </div>

              <UploadForm objectType={tableName} onSuccess={handleUploadSuccess} />

              {uploadLogs.length > 0 ? (
                <div className="flex flex-col gap-v2-sm">
                  <h4 className="text-m font-semibold">{t('upload:past_uploads')}</h4>
                  <PastUploads uploadLogs={uploadLogs} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

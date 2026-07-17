import { ExternalLink } from '@app-builder/components/ExternalLink';
import { ContinuousScreeningConfiguration } from '@app-builder/queries/continuous-screening/configurations';
import { useUploadTableQuery } from '@app-builder/queries/data/upload-table';
import { ingestingDataByCsvDocHref } from '@app-builder/services/documentation-href';
import { useFormatDateTime } from '@app-builder/utils/format';
import { UploadLog } from 'marble-api';
import { type MouseEvent, type SyntheticEvent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Card, MenuCommand, Tag, TagProps, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { UploadForm } from '../Data/SemanticTables/UploadData/UploadIngestionComponents';
import { Panel } from '../Panel';

export function PanelAddCsv({ configuration }: { configuration: ContinuousScreeningConfiguration }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState<string | null>(null);
  const { t } = useTranslation(['continuousScreening', 'upload']);

  const objectTypes = configuration.objectTypes;

  const openPanelForObjectType = (objectType: string) => {
    setSelectedObjectType(objectType);
    setPanelOpen(true);
  };

  const handlePanelOpenChange = (open: boolean) => {
    setPanelOpen(open);
    if (!open) {
      setSelectedObjectType(null);
    }
  };

  const handleAddClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (objectTypes.length === 1) {
      openPanelForObjectType(objectTypes[0]!);
    }
  };

  const stopRowInteraction = (e: SyntheticEvent) => {
    e.stopPropagation();
  };

  const handleUploadSuccess = (uploadLog: UploadLog) => {
    console.log(uploadLog);
  };

  return (
    <div onClick={stopRowInteraction} onPointerDown={stopRowInteraction}>
      {objectTypes.length > 1 ? (
        <MenuCommand.Menu open={menuOpen} onOpenChange={setMenuOpen}>
          <MenuCommand.Trigger>
            <Button variant="primary" appearance="stroked" onClick={(e) => e.stopPropagation()}>
              <Icon icon="plus" className="size-4" />
              {t('continuousScreening:configurations.csv.button.addCsv')}
            </Button>
          </MenuCommand.Trigger>
          <MenuCommand.Content align="end" sideOffset={4}>
            <MenuCommand.List>
              {objectTypes.map((objectType) => (
                <MenuCommand.Item
                  key={objectType}
                  value={objectType}
                  onSelect={() => {
                    setMenuOpen(false);
                    openPanelForObjectType(objectType);
                  }}
                >
                  {objectType}
                </MenuCommand.Item>
              ))}
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      ) : (
        <Button variant="primary" appearance="stroked" onClick={handleAddClick}>
          <Icon icon="plus" className="size-4" />
          {t('continuousScreening:configurations.csv.button.addCsv')}
        </Button>
      )}

      <Panel.Root open={panelOpen} onOpenChange={handlePanelOpenChange}>
        <Panel.Container>
          <Panel.Content>
            <Panel.Header>
              {t('continuousScreening:configurations.csv.button.title', {
                objectType: selectedObjectType,
              })}
            </Panel.Header>
            <div className="space-y-md">
              <p className="text-s whitespace-pre-wrap text-grey-secondary">
                <Trans
                  t={t}
                  i18nKey="upload:upload_callout_1"
                  components={{
                    DocLink: <ExternalLink href={ingestingDataByCsvDocHref} />,
                  }}
                  values={{ objectType: selectedObjectType }}
                />
                <br />
                {t('upload:upload_callout_2')}
              </p>

              {selectedObjectType ? (
                <UploadForm objectType={selectedObjectType} onSuccess={handleUploadSuccess} />
              ) : null}
            </div>
            {selectedObjectType ? <PastUploads objectType={selectedObjectType} /> : null}
          </Panel.Content>
        </Panel.Container>
      </Panel.Root>
    </div>
  );
}

function PastUploads({ objectType }: { objectType: string }) {
  const { t } = useTranslation('upload');
  const formatDateTime = useFormatDateTime();

  const uploadLogsQuery = useUploadTableQuery(objectType, true, {
    refetchInterval: 1_000,
  });

  return (
    <div className="mt-2xl flex flex-col gap-sm">
      <Typo variant="subtitle1">{t('upload:past_uploads')}</Typo>
      {Array.isArray(uploadLogsQuery?.data) &&
        uploadLogsQuery.data.map((uploadLog) => (
          <Card key={uploadLog.started_at} className="p-md">
            <div className="flex items-center justify-between">
              <div className="space-y-xs ">
                <p className="font-semibold text-sm">
                  {uploadLog.finished_at
                    ? t('upload:uploaded_at_date', {
                        date: formatDateUpload(uploadLog.finished_at, formatDateTime),
                      })
                    : t('upload:started_at_date', {
                        date: formatDateUpload(uploadLog.started_at, formatDateTime),
                      })}
                </p>
                <p className="text-sm text-grey-secondary">
                  {t('upload:record_vs_ingested', {
                    linesProcessed: uploadLog.lines_processed,
                    total: uploadLog.num_rows_ingested,
                  })}
                </p>
              </div>
              <TagStatus status={uploadLog.status} />
            </div>
          </Card>
        ))}
    </div>
  );
}

function TagStatus({ status }: { status: UploadLog['status'] }) {
  const { t } = useTranslation(['upload']);
  const color = match(status)
    .with('pending', 'progressing', () => 'yellow' as TagProps['color'])
    .with('success', () => 'green' as TagProps['color'])
    .with('failure', () => 'red' as TagProps['color'])
    .otherwise(() => 'grey' as TagProps['color']);
  const text = t(`upload:status_${status}`);
  return <Tag color={color}>{text}</Tag>;
}

function formatDateUpload(date: string, formatDateTime: ReturnType<typeof useFormatDateTime>) {
  const hour = formatDateTime(date, { hour: 'numeric', minute: 'numeric' });
  const shortDate = formatDateTime(date, { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${hour} - ${shortDate}`;
}
